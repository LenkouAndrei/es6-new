//key AIzaSyAbQGcqh6QVnNY5fgsY3GnvdhpxXEhoNNs
const searchButton = document.getElementById('button-search');
searchButton.addEventListener('click', find);

const searchInput = document.getElementById('search-string');
let mainURL;
let answer;
let videoIdArray = [];
let videoConfigArray = [];

class VideoConfig {
    constructor(option) {
        this.height = option.height;
        this.width = option.width;
        this.image = option.image;
        this.title = option.title;
        this.author = option.author;
        this.duration = option.duration;
        this.rating = option.rating;
    }
}

function makeSearchRequest(query) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        mainURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${query}&key=AIzaSyAbQGcqh6QVnNY5fgsY3GnvdhpxXEhoNNs`;
        xhr.open('GET', mainURL, true);
        xhr.onload = function() {
            if (this.status == 200) {
                resolve(this.responseText);
            } else {
                let error = new Error(this.statusText);
                error.code = this.status;
                reject(error);
            }
        };
        xhr.onerror = function() {
            reject(new Error("Network Error"));
        };
        xhr.send();
    });
}

function makeVideoRequest(videoId) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        mainURL = `https://www.googleapis.com/youtube/v3/videos?part=snippet%2Cstatistics%2CcontentDetails&id=${videoId}&key=AIzaSyAbQGcqh6QVnNY5fgsY3GnvdhpxXEhoNNs`;
        xhr.open('GET', mainURL, true);
        xhr.onload = function() {
            if (this.status == 200) {
                resolve(this.responseText);
            } else {
                let error = new Error(this.statusText);
                error.code = this.status;
                reject(error);
            }
        };
        xhr.onerror = function() {
            reject(new Error("Network Error"));
        };
        xhr.send();
    });
}

function transformTime(duration) {
    return duration.slice(2,-1).split('M').join(':').split('H').join(':');
}

function configurateVideo(parsedResponse) {
    const videoOptions = {};
    parsedResponse['items'].forEach(item => {
        videoOptions.height = item.snippet.thumbnails.high.height;
        videoOptions.width = item.snippet.thumbnails.high.width;
        videoOptions.image = item.snippet.thumbnails.high.url;
        videoOptions.title = item.snippet.title;
        videoOptions.author = item.snippet.channelTitle;
        videoOptions.duration = transformTime(item.contentDetails.duration);
        videoOptions.rating = {
            like: item.statistics.likeCount,
            dislike: item.statistics.dislikeCount,
        };
    });
    return new VideoConfig(videoOptions);
}

function completeVideoIdArray(response) {
    videoIdArray = [...videoIdArray, ...JSON.parse(response)['items'].map(item => item.id.videoId)];
    return videoIdArray.filter(item => item != null);
}

function createDOMElement(videoConfigArray) {
    return videoConfigArray.map(videoConfig => {
        const divImage = document.createElement('div');
        const img = document.createElement('img');
        const h3 = document.createElement('h3');
        const spanAuthor = document.createElement('span');
        const spanDuration = document.createElement('span');
        const spanLike = document.createElement('span');
        const spanDislike = document.createElement('span');
        const spanRating = document.createElement('span');
        const figure = document.createElement('figure');
        const figcaption = document.createElement('figcaption');

        img.style.width = videoConfig.width;
        img.style.height = videoConfig.height;
        img.setAttribute('src',videoConfig.image);

        divImage.classList.add('relative', 'container');
        divImage.appendChild(img);

        spanDuration.innerHTML = videoConfig.duration;
        spanDuration.classList.add('absolute');
        divImage.appendChild(spanDuration);
        figure.appendChild(divImage);

        h3.innerHTML = videoConfig.title;
        figcaption.appendChild(h3);
        figcaption.classList.add('discription');

        spanAuthor.innerHTML = videoConfig.author;
        spanAuthor.classList.add('author');
        figcaption.appendChild(spanAuthor);

        spanLike.innerHTML = videoConfig.rating.like;
        spanDislike.innerHTML = videoConfig.rating.dislike;

        spanRating.classList.add('rating');
        spanRating.appendChild(spanLike);
        spanRating.appendChild(spanDislike);
        figcaption.appendChild(spanRating);

        figure.classList.add('grid');
        figure.appendChild(figcaption);
        return figure;
    })
}

function addToDom(DOMElementsArray) {
    const section = document.querySelector('.section-content');
    const divSliderContainer = document.createElement('div');
    const divButtonContainer = document.createElement('div');
    const button = document.createElement('button');
    button.innerHTML = 'Prev.';
    const button2 = document.createElement('button');
    button2.innerHTML = 'Next';
    DOMElementsArray.forEach((element, index) => {
        divSliderContainer.appendChild(element);
        element.position = {
            gridColumnStart: index + 1,
            gridColumnEnd: index + 2,
        };
        element.style.cssText = `grid-column: ${element.position.gridColumnStart}/${element.position.gridColumnEnd}`;
    });
    divSliderContainer.classList.add('slider-container', 'grid');
    section.appendChild(divSliderContainer);

    divButtonContainer.appendChild(button);
    divButtonContainer.appendChild(button2);
    section.appendChild(divButtonContainer);
}

function find(event) {
    event.preventDefault();
    const defaultTextValue = 'Nothing! At all!';
    let query = searchInput.value || defaultTextValue;
    videoIdArray = [];
    makeSearchRequest(query)
    .then(
        response => Promise.all(completeVideoIdArray(response).map(item => makeVideoRequest(item))),
        error => console.log(`Rejected: ${error}`)
    )
    .then(
        response => response.map(singleResponse => configurateVideo(JSON.parse(singleResponse))),
    )
    .then(
        response => createDOMElement(response),
    )
    .then(
        response => addToDom(response),
    );
};
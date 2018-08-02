//key AIzaSyAbQGcqh6QVnNY5fgsY3GnvdhpxXEhoNNs
const searchButton = document.getElementById('button-search');
searchButton.addEventListener('click', find);

const searchInput = document.getElementById('search-string');

function find(event) {
    event.preventDefault();
    const defaultTextValue = 'Nothing! At all!';
    const outputText = searchInput.value || defaultTextValue;
    console.log(outputText);
};

function start() {
    // Initializes the client with the API key and the Translate API.
    gapi.client.init({
        'apiKey': 'YAIzaSyAbQGcqh6QVnNY5fgsY3GnvdhpxXEhoNNs',
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/translate/v2/rest'],
    }).then(function() {
        // 3. Initialize and make the API request.
        return gapi.client.people.people.get({
            'resourceName': 'people/me',
            'requestMask.includeField': 'person.names'
        });
    }).then(function(response) {
        console.log(response.result.data.translations[0].translatedText);
    }, function(reason) {
        console.log('Error: ',reason);
    });
};

// Loads the JavaScript client library and invokes `start` afterwards.
gapi.load('client', start);
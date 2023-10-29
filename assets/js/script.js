import routes from '../../src/routes.mjs';

window.addEventListener('load', function handleWindowLoad(event) {
    // routes.navigateTo('open-file');

    fetch('/tests/json/giant.json', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function handleFetchResponse(response) {
        return response.json();
    }).then(function handleFetchData(data) {
        routes.navigateTo('view-file-content', {
            fileName: 'giant.json',
            fileData: data
        });
    }).catch(function handleFetchError(error) {
        console.error(error);
    });

    // DEBUG
    // routes.navigateTo('view-file-content', {
    //     fileName: 'test.json',
    //     fileData: '{"name": "John Doe", "age": 30, "cars": ["Ford", "BMW", "Fiat"]}'
    // });
});
import routes from '../../src/routes.mjs';

window.addEventListener('load', function handleWindowLoad(event) {
    routes.navigateTo('open-file');

    // DEBUG
    // routes.navigateTo('view-file-content', {
    //     fileName: 'test.json',
    //     fileData: '{"name": "John Doe", "age": 30, "cars": ["Ford", "BMW", "Fiat"]}'
    // });
});
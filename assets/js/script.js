import routes from '../../src/routes.mjs';

window.addEventListener('load', function handleWindowLoad(event) {
    routes.navigateTo('open-file');
});
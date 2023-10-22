import { FileReaderFacade } from '../helpers.mjs';
import routes from '../routes.mjs';

function onInit() {
    const fileReader = new FileReaderFacade();

    const $fileInput = document.getElementById('file-input');

    $fileInput.addEventListener('change', async function handleChangeFileInput(event) {
        try {
            const file = event.target.files[0];
            const fileName = file.name;
            const fileData = await fileReader.readAsTextAsync(file);
            routes.navigateTo('view-file-content', { fileName, fileData });
        } catch (error) {
            console.error(error);
        }
    });    
}

function onRender() {
    
}

export default {
    onInit,
    onRender
};
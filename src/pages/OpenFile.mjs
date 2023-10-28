import { FileReaderFacade } from '../helpers.mjs';
import routes from '../routes.mjs';

function onInit() {
    const fileReader = new FileReaderFacade();

    const $fileInput = document.getElementById('file-input');

    const $output = document.getElementById('output');

    const setOutput = (text, type) => {
        $output.innerHTML = text;
        $output.setAttribute('data-type', type || 'default');
    };

    $fileInput.addEventListener('change', async function handleChangeFileInput(event) {
        try {
            setOutput('Loading file...');
            const file = event.target.files[0];
            const fileName = file.name;
            const fileRawData = await fileReader.readAsTextAsync(file);
            const fileData = JSON.parse(fileRawData);
            routes.navigateTo('view-file-content', { fileName, fileData });
        } catch (error) {
            if (error instanceof SyntaxError) {
                setOutput('Invalid file. Please load a valid JSON file.', 'error');
                return;
            }
            setOutput(error.message, 'error');
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
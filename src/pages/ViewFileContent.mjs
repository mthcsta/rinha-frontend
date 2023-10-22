function onInit() {

}

function onRender(data) {
    const $fileName = this.querySelector('#file-name');
    const $fileContent = this.querySelector('#file-content');

    // Exibe o nome do arquivo
    $fileName.innerText = data.fileName;

    const json = JSON.parse(data.fileData);

    const jsonThreeViewer = new JSONThreeViewer($fileContent, {
        data: json
    });
}

export default {
    onInit,
    onRender
};
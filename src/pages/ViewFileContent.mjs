let jsonThreeViewer = null;

function onInit() {
    const $fileContent = this.querySelector('#file-content');

    const $wrapperFile = this.querySelector('#wrapper-file');
    const $wrapperSearch = this.querySelector('#wrapper-search');
    const $searchButton = this.querySelector('#search-button');
    const $searchInput = this.querySelector('#search-input');
    const $searchResult = this.querySelector('#search-result');

    jsonThreeViewer = new JSONThreeViewer($fileContent, {
        data: [],
    });

    jsonThreeViewer.extensions.search({
        input: $searchInput,
        content: $searchResult,
        wrapper: $wrapperSearch,
    });

    $searchButton.addEventListener('click', () => {
        $wrapperSearch.classList.remove('hidden');
        $searchInput.focus();
    });
}

function onRender(data) {
    const $fileName = this.querySelector('#file-name');

    // Exibe o nome do arquivo
    $fileName.innerText = data.fileName;

    jsonThreeViewer.updateData(data.fileData);
}

export default {
    onInit,
    onRender
};
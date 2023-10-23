let jsonThreeViewer = null;

function onInit() {
    const $wrapperFile = this.querySelector('#wrapper-file');
    const $wrapperSearch = this.querySelector('#wrapper-search');
    const $searchButton = this.querySelector('#search-button');
    const $searchInput = this.querySelector('#search-input');
    const $searchResult = this.querySelector('#search-result');

    $searchButton.addEventListener('click', () => {
        $wrapperSearch.classList.remove('hidden');
        $searchInput.focus();
    });

    $searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Escape') {
            $wrapperSearch.classList.add('hidden');
        }
        const search = event.target.value;
        const $list = $searchResult.querySelector('ul');
        $list.innerHTML = '';

        if (search.length === 0) {
            return;
        }

        const founds = jsonThreeViewer.search(search);

        $list.innerHTML = (founds.map((found) => {
            const data = jsonThreeViewer.data();
            const renderFound = [...found.path].reverse().reduce((html, path) => {
                const pathData = data[path];
                const $ul = document.createElement('ul');
                $ul.classList.add('children', 'json-three-viewer');
                if (Array.isArray(pathData)) {
                    $ul.classList.add('key-array');
                } else if (typeof pathData === 'object' && pathData !== null) {
                    $ul.classList.add('key-object');
                } else {
                    $ul.classList.add('key-value');
                }
                const $li = document.createElement('li');
                $li.classList.add('item');
                const $key = document.createElement('span');
                $key.classList.add('key');
                $key.innerText = path + ': ';
                const $value = document.createElement('span');
                $value.classList.add('value');
                $value.append(html);
                $li.append($key, $value)
                $ul.appendChild($li);
                return $ul;
            }, found.value).outerHTML;

            return `<li class="search-result-item">
                <div class="three-location">${found.path.join('.')}</div>
                <div class="search-result-value">${renderFound}</div>
            </li>`;
        })).join('');
        
    });

}

function onRender(data) {
    const $fileName = this.querySelector('#file-name');
    const $fileContent = this.querySelector('#file-content');

    // Exibe o nome do arquivo
    $fileName.innerText = data.fileName;

    const json = JSON.parse(data.fileData);

    jsonThreeViewer = new JSONThreeViewer($fileContent, {
        data: json
    });
}

export default {
    onInit,
    onRender
};
JSONThreeViewer.prototype.extensions.search = function (opts) {
    this.search.self = this;
    this.search.Options(opts);
    this.search.addEventListenerSearchInput();
    return this;
};

JSONThreeViewer.prototype.extensions.search.Options = function (opts) {
    this.$input = opts.input;
    this.$content = opts.content;
    this.$wrapper = opts.wrapper;
};

JSONThreeViewer.prototype.extensions.search.addEventListenerSearchInput = function () {
    let timeout = null;
    this.$input.addEventListener('keyup', (event) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        if (event.key === 'Escape') {
            this.$wrapper.classList.add('hidden');
        }
        timeout = setTimeout(this.handleSearch.bind(this, event), 350);
    });
};

JSONThreeViewer.prototype.extensions.search.handleSearch = function (event) {
    const search = event.target.value;
    const $list = this.$content.querySelector('ul');
    $list.innerHTML = '';
    if (search.length === 0) {
        return;
    }
    const founds = this.filter(search);
    this.render($list, founds);    
};

JSONThreeViewer.prototype.extensions.search.filterNode = function (data, text, path) {
    const found = [];
    for (let key in data) {
        if (key.indexOf(text) !== -1 || (typeof data[key] === 'string' && data[key].indexOf(text) !== -1)) {
            found.push({key, value: data[key], path: path.concat([key])});
        } else if (typeof data[key] === 'object' && data[key] !== null) {
            found.push(...this.filterNode(data[key], text, [...path, key]));
        }
    }
    return found;
};

JSONThreeViewer.prototype.extensions.search.filter = function (text) {
    return this.filterNode(this.self.JSONThreeViewer.data(), text, []);
};

JSONThreeViewer.prototype.extensions.search.render = function ($root, founds) {
    $root.innerHTML = (founds.map((found) => {
        const data = this.self.JSONThreeViewer.data();
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
};
JSONThreeViewer.prototype.extensions.search = function (opts) {
    this.search.self = this;
    this.search.elementsRender = new (this.search.ElementsRender.bind(this))();
    this.search.Options(opts);
    this.search.addEventListenerSearchInput();
    return this;
};

JSONThreeViewer.prototype.extensions.search.Options = function (opts) {
    this.limitRender = opts.limitRender || 10;
    this.limitToSearch = opts.limitToSearch || (this.limitRender * 10);
    this.threeLocationSepparator = opts.threeLocationSepparator || '.';
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
    this.render($list, founds.slice(0, this.limitRender), founds.length);    
};

JSONThreeViewer.prototype.extensions.search.filterNode = function (data, text, path, foundTotal) {
    let found = [];
    const entries = Object.entries(data);
    let index = 0;
    do {
        const [key, value] = entries[index];

        if (key.indexOf(text) !== -1 || (typeof value === 'string' && value.indexOf(text) !== -1)) {
            foundTotal.found++;
            found.push({key, value: value, path: path.concat([key])});
        } else if (typeof value === 'object' && value !== null) {
            found.push(...this.filterNode(value, text, path.concat([key]), foundTotal));
        };

        index++;
    } while (foundTotal.found < (this.limitToSearch) && entries.length > index);
    return found;
};

JSONThreeViewer.prototype.extensions.search.filter = function (text) {
    return this.filterNode(this.self.JSONThreeViewer.data(), text, [], {found: 0});
};

JSONThreeViewer.prototype.extensions.search.render = function ($root, founds, total) {
    if (total === 0) {
        this.elementsRender.clearTextElement($root);
        this.elementsRender.appendChild($root, this.elementsRender.createSearchResultNotFound());
        return;
    }
    const data = this.self.JSONThreeViewer.data();
    this.elementsRender.clearTextElement($root);
    this.elementsRender.appendChild($root, this.elementsRender.createSearchResultToMany(total, this.limitRender, this.limitToSearch - 1));
    this.elementsRender.append($root, ...founds.map(this.renderFoundItem.bind(this, data)));
};

JSONThreeViewer.prototype.extensions.search.renderFoundValue = function (value) {
    switch (this.self.JSONThreeViewer.getValueType(value)) {
        case 'array':
            if (value.length > 0) {
                return '[...]';
            }
            return '[]';
        case 'object':
            if (Object.keys(value).length > 0) {
                return '{...}';
            }
            return '{}';
        default:
            return value;
    }
};

JSONThreeViewer.prototype.extensions.search.renderFoundItem = function (data, found) {
    const foundValue = this.renderFoundValue(found.value);
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
    }, foundValue);

    const $searchResultItem = this.elementsRender.createSearchResultItem();
    const $threeLocation = this.elementsRender.createThreeLocation(found.path.join(this.threeLocationSepparator));
    const $searchResultValue = this.elementsRender.createSearchResultValue(renderFound);
    this.elementsRender.append($searchResultItem, $threeLocation, $searchResultValue);

    return $searchResultItem;
};

JSONThreeViewer.prototype.extensions.search.ElementsRender = function () {
    this.createSearchResultNotFound = function () {
        const $div = document.createElement('div');
        $div.classList.add('search-result-not-found');
        $div.innerText = 'No results found';
        return $div;
    };
    this.createSearchResultToMany = function (total, limitRender, limitToSearchMinusOne) {
        const $div = document.createElement('div');
        $div.classList.add('search-result-to-many');
        const totalFound = total > limitToSearchMinusOne ? `+${limitToSearchMinusOne}` : total;
        $div.innerText = `Showing ${limitRender} of ${totalFound} results (Search limited to find ${totalFound} results)`;
        return $div;
    };
    this.createSearchResultItem = function () {
        const $li = document.createElement('li');
        $li.classList.add('search-result-item');
        return $li;
    };
    this.createThreeLocation = function (path) {
        const $div = document.createElement('div');
        $div.classList.add('three-location');
        $div.innerText = path;
        return $div;
    };
    this.createSearchResultValue = function (value) {
        const $div = document.createElement('div');
        $div.classList.add('search-result-value');
        $div.append(value);
        return $div;
    };
    this.clearTextElement = function ($node) {
        $node.innerHTML = '';
    };
    this.append = function ($node, ...$elements) {
        $node.append(...$elements);
    };
    this.appendChild = function ($node, $element) {
        $node.appendChild($element);
    };
    return this;
};
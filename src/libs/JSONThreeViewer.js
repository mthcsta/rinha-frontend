function JSONThreeViewer($root, opts = {}) {
    if (!('data' in opts)) {
        throw new Error('data is required!');
    }
    if (!('maxPerRender' in opts) || opts.maxPerRender < 1) {
        opts.maxPerRender = 10;
    }

    this.$root = $root;
    this.data = () => opts.data;
    this.options = () => opts;

    this.lazyRender = new JSONThreeViewer.prototype.LazyRender();

    this.chunksRender = JSONThreeViewer.prototype.chunksRender.bind(this);

    this.renderChilds = JSONThreeViewer.prototype.renderChilds.bind(this);

    const $parent = document.createElement('ul');

    $parent.classList.add('root', 'json-three-viewer');

    this.renderChilds(this.data(), $parent, 0);

    this.$root.appendChild($parent);
    
    return this;
}

JSONThreeViewer.prototype.chunksRender = function (data, level) {
    const keys = Object.keys(data);
    const options = this.options();
    const totalChunks = Math.ceil(keys.length / options.maxPerRender);
    const createDocumentFragment = this.createDocumentFragment.bind(this, data, keys, level);
    
    return {
        needIterator: totalChunks > 1,
        totalChunks,
        renderIterator: function*() {
            let chunk = 0;
            for (chunk = 0; chunk < totalChunks - 1; chunk++) {
                const chunkStart = chunk * options.maxPerRender;
                yield createDocumentFragment(chunkStart, options.maxPerRender);
            }

            // The last chunk has a different length
            // So we need to create after the loop with default length
            const lastChunkStart = chunk * options.maxPerRender;
            const lastChunkLength = keys.length - lastChunkStart;
            yield createDocumentFragment(lastChunkStart, lastChunkLength);        
        },
        render: function() {
            return createDocumentFragment(0, keys.length);
        }
    } 
}

JSONThreeViewer.prototype.renderChilds = function (data, $parent, level) {
    const chunkCall = this.chunksRender(data, level);

    if (!chunkCall.needIterator) {
        $parent.appendChild(chunkCall.render());
        return;
    }

    const iterator = chunkCall.renderIterator();
    $parent.appendChild(iterator.next().value);
    this.lazyRender.register($parent, () => {
        const chunk = iterator.next();
        if (chunk.done) {
            return false;
        }
        $parent.appendChild(chunk.value);
        return true;
    });
};

JSONThreeViewer.prototype.LazyRender = function () {
    /**
     * @type {Map<HTMLElement, Function>}
     */
    const lazyRender = new Map();

    this.observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const $lastElementChild = entry.target;
                const $parent = $lastElementChild.parentNode;
                const parentLazyRender = lazyRender.get($parent);
                const hasNext = parentLazyRender();

                observer.unobserve($lastElementChild);

                if (hasNext) {
                    observer.observe($parent.lastElementChild);
                    return;
                }

                lazyRender.delete($parent);
            }
        });
    });

    this.register = ($parent, callable) => {
        lazyRender.set($parent, callable);
        this.observer.observe($parent.lastElementChild);
    };

    return this;
}

JSONThreeViewer.prototype.createDocumentFragment = function (data, keys, level, indexStart = 0, indexToIterate = 1) {
    const $documentFragment = document.createDocumentFragment();
    for (let elementRender = 0; elementRender < indexToIterate; elementRender++) {
        const index = indexStart + elementRender;
        const jsonKey = keys[index];

        const $item = document.createElement('li');
        $item.classList.add('item');
        $item.classList.add('level-' + level);

        const $key = document.createElement('span');
        $key.classList.add('key');
        if (Array.isArray(data)) {
            $key.classList.add('key-numeral');
        }
        $key.innerText = jsonKey + ': ';

        const $value = document.createElement('span');
        $value.classList.add('value');

        const value = data[jsonKey];

        if (Array.isArray(value)) {
            if (value.length > 0) {
                const $children = document.createElement('ul');
                $children.classList.add('children');
                $item.classList.add('key-array');
                this.renderChilds(value, $children, level + 1);
                $value.appendChild($children);
            } else {
                $value.innerText = '[]';
            }
        } else if (typeof value === 'object' && value !== null) {
            if (Object.keys(value).length > 0) {
                const $children = document.createElement('ul');
                $children.classList.add('children');
                $item.classList.add('key-object');
                this.renderChilds(value, $children, level + 1);
                $value.appendChild($children);
            } else {
                $value.innerText = '{}';
            }
        } else {
            if (typeof value === 'string') {
                $value.classList.add('value-string');
            } else if (typeof value === 'number') {
                $value.classList.add('value-number');
            } else if (typeof value === 'boolean') {
                $value.classList.add('value-boolean');
            }
            $value.innerText = value;
        }

        $item.append($key, $value);

        $documentFragment.appendChild($item);
    }
    return $documentFragment;    
}

JSONThreeViewer.prototype.search = function (text) {
    const filterNode = (data, path) => {
        const found = [];
        for (let key in data) {
            if (key.indexOf(text) !== -1 || (typeof data[key] === 'string' && data[key].indexOf(text) !== -1)) {
                found.push({key, value: data[key], path: path.concat([key])});
            } else if (typeof data[key] === 'object' && data[key] !== null) {
                found.push(...filterNode(data[key], [...path, key]));
            }
        }
        return found;
    }

    return filterNode(this.data(), []);
};
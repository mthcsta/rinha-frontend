function JSONThreeViewer($root, opts = {}) {
    JSONThreeViewer.Options(opts);
    this.$root = $root;
    this.opts = opts;
    this.data = () => this.opts.data;
    this.options = () => this.opts;
    this.lazyRender = new JSONThreeViewer.prototype.LazyRender();
    this.elementsRender = new JSONThreeViewer.prototype.ElementsRender();
    this.extensions.JSONThreeViewer = this;
    this.construct(this.data());
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

JSONThreeViewer.prototype.renderChilds = function ($parent, data, level) {
    const chunkCall = this.chunksRender(data, level);
    if (!chunkCall.needIterator) {
        this.elementsRender.appendChild($parent, chunkCall.render());
        return;
    }
    const iterator = chunkCall.renderIterator();
    this.elementsRender.appendChild($parent, iterator.next().value);
    this.lazyRender.register($parent, () => {
        const chunk = iterator.next();
        if (!chunk.done) {
            this.elementsRender.appendChild($parent, chunk.value);
        }
        return chunk.done;
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

JSONThreeViewer.prototype.getValueType = function (value) {
    if (Array.isArray(value)) {
        return 'array';
    }
    if (typeof value === 'object') {
        if (value === null) {
            return 'null';
        }
        return 'object';
    }
    return typeof value;
};

JSONThreeViewer.prototype.fillValue = function ($value, value, valueType, level) {
    switch (valueType) {
        case 'array':
            if (value.length > 0) {
                const $children = this.elementsRender.createChildren();
                this.renderChilds($children, value, level + 1);
                this.elementsRender.appendChild($value, $children);
            } else {
                this.elementsRender.innerText($value, '[]');
            }            
            break;
        case 'object':
            if (Object.keys(value).length > 0) {
                const $children = this.elementsRender.createChildren();
                this.renderChilds($children, value, level + 1);
                this.elementsRender.appendChild($value, $children);
            } else {
                this.elementsRender.innerText($value, '{}');
            }
            break;
        default:
            this.elementsRender.innerText($value, value);
            break;
    }
};

JSONThreeViewer.prototype.createDocumentFragment = function (data, keys, level, indexStart = 0, indexToIterate = 1) {
    const $documentFragment = this.elementsRender.createDocumentFragment();
    const lastIndex = indexStart + indexToIterate;
    for (let index = indexStart; index < lastIndex; index++) {
        const jsonKey = keys[index];
        const value = data[jsonKey];
        const valueType = this.getValueType(value);

        const $item = this.elementsRender.createItem(level, valueType);
        const $key = this.elementsRender.createKey(jsonKey, data, level);
        const $value = this.elementsRender.createValue();

        this.fillValue($value, value, valueType, level);
        this.elementsRender.append($item, $key, $value);
        this.elementsRender.appendChild($documentFragment, $item);
    }
    return $documentFragment;    
}

JSONThreeViewer.Options = function (opts) {
    if (!('data' in opts)) {
        throw new Error('data is required!');
    }

    if (!('maxPerRender' in opts) || opts.maxPerRender < 1) {
        opts.maxPerRender = 10;
    }
}

JSONThreeViewer.prototype.construct = function (data) {
    this.opts.data = data;
    const $parent = this.elementsRender.createRoot();
    this.renderChilds($parent, this.data(), 0);
    this.$root.appendChild($parent);
}

JSONThreeViewer.prototype.destroy = function () {
    this.lazyRender.observer.disconnect();
    this.$root.innerHTML = '';
}

JSONThreeViewer.prototype.updateData = function (data) {
    this.destroy();
    this.construct(data);
}

JSONThreeViewer.prototype.ElementsRender = function () {
    this.createRoot = function () {
        const $root = document.createElement('ul');
        $root.classList.add('root', 'json-three-viewer');
        return $root;
    }
    this.createItem = function (level, valueType) {
        const $item = document.createElement('li');
        $item.classList.add('item');
        $item.classList.add('level-' + level);
        $item.classList.add('value-type-' + valueType);
        $item.setAttribute('tabindex', 0);
        return $item;
    }
    this.createKey = function (jsonKey, data, level, valueType) {
        const $key = document.createElement('span');
        $key.classList.add('key');
        if (Array.isArray(data)) {
            $key.classList.add('key-numeral');
        }
        $key.innerText = jsonKey + ': ';
        $key.classList.add('value-type-' + valueType);
        return $key;
    }
    this.createValue = function (value) {
        const $value = document.createElement('span');
        $value.classList.add('value');

        return $value;
    };
    this.createChildren = function () {
        const $children = document.createElement('ul');
        $children.classList.add('children');
        return $children;
    };
    this.createDocumentFragment = function () {
        return document.createDocumentFragment();
    }
    this.appendChild = function ($parent, $child) {
        $parent.appendChild($child);
    }
    this.append = function ($parent, ...$child) {
        $parent.append(...$child);
    }
    this.innerText = function ($element, text) {
        $element.innerText = text;
    };
    return this;
};

JSONThreeViewer.prototype.extensions = {};
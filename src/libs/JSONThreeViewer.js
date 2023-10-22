function JSONThreeViewer($root, opts = {}) {
    if (!('data' in opts)) {
        throw new Error('data is required!');
    }
    if (!('maxPerRender' in opts) || opts.maxPerRender < 1) {
        opts.maxPerRender = 10;
    }

    this.$root = $root;
    this.options = opts;
    this.data = () => opts.data;

    /**
     * @type {Map<HTMLElement, Function>}
     */
    const lazyRender = new Map();

    const iObserver = new IntersectionObserver((entries, observer) => {
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

    function *chunksRender(data, level) {
        const keys = Object.keys(data);
        const totalChunks = Math.ceil(keys.length / opts.maxPerRender);

        yield totalChunks > 1;

        for (let chunk = 0; chunk < totalChunks; chunk++) {
            const $chunk = document.createDocumentFragment();
            for (let elementRender = 0; elementRender < opts.maxPerRender; elementRender++) {
                const index = chunk * opts.maxPerRender + elementRender;
                if (index >= keys.length) {
                    break;
                }
                const jsonKey = keys[index];

                const $item = document.createElement('li');
                $item.classList.add('item');
        
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
                        renderChilds(value, $children, level + 1);
                        $value.appendChild($children);
                    } else {
                        $value.innerText = '[]';
                    }
                } else if (typeof value === 'object' && value !== null) {
                    if (Object.keys(value).length > 0) {
                        const $children = document.createElement('ul');
                        $children.classList.add('children');
                        $item.classList.add('key-object');
                        renderChilds(value, $children, level + 1);
                        $value.appendChild($children);
                    } else {
                        $value.innerText = '{}';
                    }
                } else {
                    $value.innerText = value;
                }
        
                $item.appendChild($key);
                $item.appendChild($value);

                $chunk.appendChild($item);
            }
            yield $chunk;
        }        
    }

    const renderChilds = (data, $parent, level) => {
        const chunkCall = chunksRender(data, level);
        const hasMoreThanOneChunk = chunkCall.next().value;
        const chunk = chunkCall.next().value;
        $parent.appendChild(chunk);
        if (hasMoreThanOneChunk) {
            lazyRender.set($parent, () => {
                const chunk = chunkCall.next();
                if (chunk.done) {
                    return false;
                }
                $parent.appendChild(chunk.value);
                return true;
            });
            iObserver.observe($parent.lastElementChild);
        }
    };

    const $parent = document.createElement('ul');
    $parent.classList.add('root');

    renderChilds(opts.data, $parent, 0);

    $root.appendChild($parent);
    
    return this;
}
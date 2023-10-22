export function FileReaderFacade() {
    const reader = new FileReader();
    return {
        async readAsTextAsync(file) {
            return new Promise((resolve, reject) => {
                reader.onload = function (event) {
                    resolve(event.target.result);
                };

                reader.onerror = function (event) {
                    reject("File could not be read! Code " + event.target.error.code);
                };

                reader.readAsText(file);
            });
        }
    };
}

export function PageNavigate(pages, prefix = '') {
    const $pages = document.getElementsByClassName('pages');

    const mountPageName = page => page == '' ? page : `${prefix}-${page}`;

    const pagesInitiated = new Set();

    return {
        navigateTo(page, data) {
            const $pageWrapper = document.getElementById(mountPageName(page));
            if (!$pageWrapper) {
                throw new Error(`Page ${page} not found!`);
            }
            Array.from($pages).forEach($page => $page.classList.remove('active'));
            $pageWrapper.classList.add('active');
            const pageModule = pages.get(page);
            if (!pagesInitiated.has(page)) {
                pageModule.onInit.bind($pageWrapper)();
                pagesInitiated.add(page);
            }
            pageModule.onRender.bind($pageWrapper)(data);
        }
    };
}
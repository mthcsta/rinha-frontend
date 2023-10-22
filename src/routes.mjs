import { PageNavigate } from './helpers.mjs';
import ViewFileContent from './pages/ViewFileContent.mjs';
import OpenFile from './pages/OpenFile.mjs';

const routes = new Map([
    ['open-file', OpenFile],
    ['view-file-content', ViewFileContent]
]);

const pageNavigate = new PageNavigate(routes, 'page');

export default pageNavigate;
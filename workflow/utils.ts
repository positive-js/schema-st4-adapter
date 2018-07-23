import * as path from 'path';


function getExtension(pathToFile) {
    return path.extname(pathToFile).toLocaleLowerCase().slice(1);
}

function getPath(pathToFile) {
    return path.dirname(pathToFile);
}

function getFileName(pathToFile) {
    return path.basename(pathToFile);
}

export { getPath, getExtension, getFileName };

"use strict";
exports.__esModule = true;
var path = require("path");
function getExtension(pathToFile) {
    return path.extname(pathToFile).toLocaleLowerCase().slice(1);
}
exports.getExtension = getExtension;
function getPath(pathToFile) {
    return path.dirname(pathToFile);
}
exports.getPath = getPath;
function getFileName(pathToFile) {
    return path.basename(pathToFile);
}
exports.getFileName = getFileName;

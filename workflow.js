"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var xmldom = require("xmldom");
var adapter_1 = require("./adapter");
var dom = xmldom.DOMParser;
function getExtension(filename) {
    return path.extname(filename).toLocaleLowerCase().slice(1);
}
function getAdapter(options) {
    var extension = getExtension(options.sourceFile);
    switch (extension) {
        case 'xml':
            return new adapter_1.AdapterXML2JSON(options);
        case 'xls':
            return new adapter_1.AdapterXLS2JSON(options);
        default:
            throw new Error('Adapter not found for selected file');
    }
}
var registerWorkflow = function (win) {
    electron_1.ipcMain.on('client.select-source', function (event) {
        var paths = electron_1.dialog.showOpenDialog(win, {
            filters: [
                {
                    name: 'Exported XML or XLS files',
                    extensions: ['xml', 'xls']
                }
            ],
            properties: [
                'openFile'
            ]
        });
        if (paths && paths.length > 0) {
            var sourceFile = paths[0];
            var extension = getExtension(sourceFile);
            var adapter = getAdapter({ sourceFile: sourceFile });
            event.sender.send('electron.source-loaded', { sourceFile: sourceFile, extension: extension });
            if (extension === 'xml') {
                var languages = adapter.getLanguages();
                event.sender.send('electron.languages-loaded', languages);
            }
            if (extension === 'xls') {
                var products = adapter.getProducts();
                event.sender.send('electron.products-loaded', products);
            }
        }
    });
    electron_1.ipcMain.on('client.select-target', function (event) {
        var pathToTargetFile = electron_1.dialog.showSaveDialog(win, {
            filters: [
                {
                    name: 'JSON файлы',
                    extensions: ['json']
                }
            ]
        });
        if (pathToTargetFile) {
            event.sender.send('electron.target-loaded', pathToTargetFile);
        }
    });
    electron_1.ipcMain.on('client.select-language', function (event, xmlFile, language) {
        var adapter = getAdapter({ sourceFile: xmlFile, language: language });
        var products = adapter.getProducts();
        event.sender.send('electron.products-loaded', products);
    });
    electron_1.ipcMain.on('client.unload', function (_event, options) {
        try {
            var adapter = getAdapter(options);
            adapter.unload();
            electron_1.dialog.showMessageBox(win, {
                type: 'info',
                title: 'Success',
                message: 'The file was successfully converted!',
                buttons: ['OK']
            });
        }
        catch (e) {
            electron_1.dialog.showMessageBox(win, {
                type: 'error',
                title: 'Error',
                message: "An error occurred while converting the file: " + e.message,
                buttons: ['Close']
            });
        }
    });
    electron_1.ipcMain.on('client.synchronize', function (_event, options) {
        try {
            var adapter = getAdapter(options);
            adapter.synchronize();
            electron_1.dialog.showMessageBox(win, {
                type: 'info',
                title: 'Success',
                message: 'The file was successfully converted!',
                buttons: ['OK']
            });
        }
        catch (e) {
            electron_1.dialog.showMessageBox(win, {
                type: 'error',
                title: 'Error',
                message: "An error occurred while converting the file: " + e.message,
                buttons: ['Close']
            });
        }
    });
};
exports.registerWorkflow = registerWorkflow;

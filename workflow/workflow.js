"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var _ = require("lodash"); // tslint:disable-line import-blacklist
var adapters_1 = require("../adapters");
var constants_1 = require("./constants");
var utils_1 = require("./utils");
function getAdapter(options) {
    var extensionSource = options.sourceFile ? utils_1.getExtension(options.sourceFile) : undefined;
    var extensionTarget = options.targetFile ? utils_1.getExtension(options.targetFile) : undefined;
    if (extensionSource === adapters_1.FileTypeEnum.XML && (extensionTarget === adapters_1.FileTypeEnum.JSON || !extensionTarget)) {
        return new adapters_1.AdapterXML2JSON(options);
    }
    if (extensionSource === adapters_1.FileTypeEnum.XLS && (extensionTarget === adapters_1.FileTypeEnum.JSON || !extensionTarget)) {
        return new adapters_1.AdapterXLS2JSON(options);
    }
    if (extensionTarget === adapters_1.FileTypeEnum.XML && (extensionSource === adapters_1.FileTypeEnum.JSON || !extensionSource)) {
        return new adapters_1.AdapterJSON2XML(options);
    }
    if (extensionTarget === adapters_1.FileTypeEnum.XLS && (extensionSource === adapters_1.FileTypeEnum.JSON || !extensionSource)) {
        return new adapters_1.AdapterJSON2XLS(options);
    }
    var extensionsExportedFromSchemaST4 = [adapters_1.FileTypeEnum.XML, adapters_1.FileTypeEnum.XLS];
    if (_.indexOf(extensionsExportedFromSchemaST4, extensionSource) !== -1
        && _.indexOf(extensionsExportedFromSchemaST4, extensionTarget)) {
        throw new Error('Probably both file are sources!');
    }
    throw new Error('Adapter not found!');
}
function getDialogFilter(side, options) {
    var extensionSource = options.sourceFile ? utils_1.getExtension(options.sourceFile) : undefined;
    var extensionTarget = options.targetFile ? utils_1.getExtension(options.targetFile) : undefined;
    if (side === constants_1.OperationSideEnum.SOURCE) {
        if (extensionTarget === adapters_1.FileTypeEnum.XML || extensionTarget === adapters_1.FileTypeEnum.XLS) {
            return constants_1.DIALOG_FILTERS.ONLY_JSON;
        }
    }
    if (side === constants_1.OperationSideEnum.TARGET) {
        if (extensionSource === adapters_1.FileTypeEnum.XML || extensionSource === adapters_1.FileTypeEnum.XLS) {
            return constants_1.DIALOG_FILTERS.ONLY_JSON;
        }
    }
    return constants_1.DIALOG_FILTERS.ALL;
}
// tslint:disable-next-line max-func-body-length
var registerWorkflow = function (win) {
    electron_1.ipcMain.on('client.replace.select-source', function (event, options) {
        if (!options.sourceFile) {
            var paths = electron_1.dialog.showOpenDialog(win, {
                filters: [
                    getDialogFilter(constants_1.OperationSideEnum.SOURCE, options)
                ],
                properties: [
                    'openFile'
                ]
            });
            if (paths && paths.length > 0) {
                options.sourceFile = paths[0];
            }
        }
        if (options.sourceFile) {
            var extension = utils_1.getExtension(options.sourceFile);
            var pathToSourceFile = utils_1.getPath(options.sourceFile);
            var name_1 = utils_1.getFileName(options.sourceFile);
            var adapter = getAdapter(options);
            event.sender.send('electron.source-loaded', {
                fullPath: options.sourceFile,
                path: pathToSourceFile,
                extension: extension,
                name: name_1
            });
            if (!adapter) {
                return;
            }
            if (extension === adapters_1.FileTypeEnum.XML || extension === adapters_1.FileTypeEnum.XLS) {
                var languages = adapter.getLanguages();
                var products = adapter.getProducts();
                event.sender.send('electron.source.options-loaded', {
                    languages: languages,
                    products: products
                });
            }
        }
    });
    electron_1.ipcMain.on('client.replace.select-target', function (event, options) {
        if (!options.targetFile) {
            options.targetFile = electron_1.dialog.showSaveDialog(win, {
                filters: [
                    getDialogFilter(constants_1.OperationSideEnum.TARGET, options)
                ]
            });
        }
        if (options.targetFile) {
            var extension = utils_1.getExtension(options.targetFile);
            var pathToTargetFile = utils_1.getPath(options.targetFile);
            var name_2 = utils_1.getFileName(options.targetFile);
            var adapter = getAdapter(options);
            event.sender.send('electron.target-loaded', {
                fullPath: options.targetFile,
                path: pathToTargetFile,
                extension: extension,
                name: name_2
            });
            if (!adapter) {
                return;
            }
            if (extension === adapters_1.FileTypeEnum.XML || extension === adapters_1.FileTypeEnum.XLS) {
                var languages = adapter.getLanguages();
                var products = adapter.getProducts();
                event.sender.send('electron.target.options-loaded', {
                    languages: languages,
                    products: products
                });
            }
        }
    });
    electron_1.ipcMain.on('client.replace.get-available-languages', function (event, options) {
        var adapter = getAdapter(options);
        var languages = adapter.getAvailableLanguages(options.products);
        event.sender.send('electron.replace.available-languages', languages);
    });
    electron_1.ipcMain.on('client.replace.convert', function (event, options) {
        try {
            var adapter = getAdapter(options);
            adapter.convert();
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

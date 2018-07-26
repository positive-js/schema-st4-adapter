"use strict";
exports.__esModule = true;
// tslint:disable underscore-consistent-invocation
var electron_1 = require("electron");
var _ = require("lodash"); // tslint:disable-line import-blacklist
var path = require("path");
var url = require("url");
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
        && _.indexOf(extensionsExportedFromSchemaST4, extensionTarget) !== -1) {
        throw new Error('Probably both file are sources!');
    }
    // throw new Error('Adapter not found!');
}
function getDialogFilter(operation, side, options) {
    var extensionSource = options.sourceFile ? utils_1.getExtension(options.sourceFile) : undefined;
    var extensionTarget = options.targetFile ? utils_1.getExtension(options.targetFile) : undefined;
    if (operation === adapters_1.OperationType.REPLACEMENT) {
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
    }
    if (operation === adapters_1.OperationType.SYNCHRONIZATION) {
        if ((side === constants_1.OperationSideEnum.SOURCE && extensionTarget === adapters_1.FileTypeEnum.XLS) ||
            (side === constants_1.OperationSideEnum.TARGET && extensionSource === adapters_1.FileTypeEnum.XLS)) {
            return constants_1.DIALOG_FILTERS.ONLY_JSON;
        }
        if ((side === constants_1.OperationSideEnum.SOURCE && extensionTarget === adapters_1.FileTypeEnum.JSON) ||
            (side === constants_1.OperationSideEnum.TARGET && extensionSource === adapters_1.FileTypeEnum.JSON)) {
            return constants_1.DIALOG_FILTERS.ONLY_XLS;
        }
        return constants_1.DIALOG_FILTERS.ALL_FOR_SYNCHRONIZATION;
    }
    return constants_1.DIALOG_FILTERS.ALL;
}
// tslint:disable-next-line max-func-body-length
var registerWorkflow = function (win) {
    electron_1.ipcMain.on('client.replacement.select-source', function (event, options) {
        if (!options.sourceFile) {
            var paths = electron_1.dialog.showOpenDialog(win, {
                filters: [
                    getDialogFilter(adapters_1.OperationType.REPLACEMENT, constants_1.OperationSideEnum.SOURCE, options)
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
    electron_1.ipcMain.on('client.replacement.select-target', function (event, options) {
        if (!options.targetFile) {
            options.targetFile = electron_1.dialog.showSaveDialog(win, {
                filters: [
                    getDialogFilter(adapters_1.OperationType.REPLACEMENT, constants_1.OperationSideEnum.TARGET, options)
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
    electron_1.ipcMain.on('client.synchronization.select-source', function (event, options) {
        if (!options.sourceFile) {
            var paths = electron_1.dialog.showOpenDialog(win, {
                filters: [
                    getDialogFilter(adapters_1.OperationType.SYNCHRONIZATION, constants_1.OperationSideEnum.SOURCE, options)
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
            var name_3 = utils_1.getFileName(options.sourceFile);
            var adapter = getAdapter(options);
            event.sender.send('electron.source-loaded', {
                fullPath: options.sourceFile,
                path: pathToSourceFile,
                extension: extension,
                name: name_3
            });
            if (!adapter) {
                return;
            }
            if (extension === adapters_1.FileTypeEnum.XLS) {
                var languages = adapter.getLanguages();
                var products = adapter.getProducts();
                event.sender.send('electron.source.options-loaded', {
                    languages: languages,
                    products: products
                });
            }
        }
    });
    electron_1.ipcMain.on('client.synchronization.select-target', function (event, options) {
        if (!options.targetFile) {
            var paths = electron_1.dialog.showOpenDialog(win, {
                filters: [
                    getDialogFilter(adapters_1.OperationType.SYNCHRONIZATION, constants_1.OperationSideEnum.TARGET, options)
                ]
            });
            if (paths && paths.length > 0) {
                options.targetFile = paths[0];
            }
        }
        if (options.targetFile) {
            var extension = utils_1.getExtension(options.targetFile);
            var pathToTargetFile = utils_1.getPath(options.targetFile);
            var name_4 = utils_1.getFileName(options.targetFile);
            var adapter = getAdapter(options);
            event.sender.send('electron.target-loaded', {
                fullPath: options.targetFile,
                path: pathToTargetFile,
                extension: extension,
                name: name_4
            });
            if (!adapter) {
                return;
            }
            if (extension === adapters_1.FileTypeEnum.XLS) {
                var languages = adapter.getLanguages();
                var products = adapter.getProducts();
                event.sender.send('electron.target.options-loaded', {
                    languages: languages,
                    products: products
                });
            }
        }
    });
    electron_1.ipcMain.on('client.get-available-languages', function (event, options) {
        var adapter = getAdapter(options);
        var languages = adapter.getAvailableLanguages(options.products);
        event.sender.send('electron.available-languages', languages);
    });
    electron_1.ipcMain.on('client.convert', function (event, options) {
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
    var sharedDiffsData;
    var windowDiff;
    var windowNewProduct;
    electron_1.ipcMain.on('client.synchronize', function (event, options) {
        try {
            var adapter = getAdapter(options);
            var diffs = adapter.getDiffs();
            if (!diffs) {
                electron_1.dialog.showMessageBox(win, {
                    type: 'info',
                    title: 'Success',
                    message: 'Source and target are already synchronized!',
                    buttons: ['OK']
                });
                return;
            }
            windowDiff = new electron_1.BrowserWindow({ parent: win, modal: true, show: false, frame: false });
            windowDiff.loadURL(url.format({
                pathname: path.join(__dirname, '../dist/index.html'),
                protocol: 'file:',
                slashes: true,
                hash: 'diffs'
            }));
            sharedDiffsData = {
                options: options,
                resources: diffs
            };
            windowDiff.once('ready-to-show', function () {
                windowDiff.show();
            });
        }
        catch (e) {
            electron_1.dialog.showMessageBox(win, {
                type: 'error',
                title: 'Error',
                message: "An error occurred while synchronization the file: " + e.message,
                buttons: ['Close']
            });
        }
    });
    electron_1.ipcMain.on('client.diffs.get-resources', function (event) {
        event.sender.send('electron.diffs.resources', sharedDiffsData);
    });
    electron_1.ipcMain.on('client.diffs.apply', function (event, keys) {
        try {
            var adapter = getAdapter(sharedDiffsData.options);
            var result = adapter.synchronize(keys);
            if (result === true) {
                windowDiff.close();
                sharedDiffsData = undefined;
                electron_1.dialog.showMessageBox(win, {
                    type: 'info',
                    title: 'Success',
                    message: 'The file was successfully converted!',
                    buttons: ['OK']
                });
            }
        }
        catch (e) {
            electron_1.dialog.showMessageBox(win, {
                type: 'error',
                title: 'Error',
                message: "An error occurred while synchronization the file: " + e.message,
                buttons: ['Close']
            });
        }
    });
    electron_1.ipcMain.on('client.diffs.cancel', function (event, keys) {
        windowDiff.close();
        sharedDiffsData = undefined;
    });
    electron_1.ipcMain.on('client.diffs.add-to-new-product', function (event, keys) {
        try {
            var adapter = getAdapter(sharedDiffsData.options);
            var extensionTarget = utils_1.getExtension(sharedDiffsData.options.targetFile);
            if (extensionTarget === adapters_1.FileTypeEnum.JSON) {
                if (adapter.takeOut) {
                    adapter.takeOut(keys);
                }
            }
            if (extensionTarget === adapters_1.FileTypeEnum.XLS) {
                windowNewProduct = new electron_1.BrowserWindow({ parent: windowDiff, modal: true, show: false, frame: false });
                windowNewProduct.loadURL(url.format({
                    pathname: path.join(__dirname, '../dist/index.html'),
                    protocol: 'file:',
                    slashes: true,
                    hash: 'new-product'
                }));
                sharedDiffsData.keys = keys;
                windowNewProduct.once('ready-to-show', function () {
                    windowDiff.show();
                });
            }
        }
        catch (e) {
            electron_1.dialog.showMessageBox(win, {
                type: 'error',
                title: 'Error',
                message: "An error occurred while take out the file: " + e.message,
                buttons: ['Close']
            });
        }
    });
};
exports.registerWorkflow = registerWorkflow;

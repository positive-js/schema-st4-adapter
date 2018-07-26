// tslint:disable underscore-consistent-invocation
import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as _ from 'lodash'; // tslint:disable-line import-blacklist
import * as path from 'path';
import * as url from 'url';


import {
    AdapterXLS2JSON,
    AdapterXML2JSON,
    IAdapter,
    IAdapterOptions,
    FileTypeEnum,
    AdapterJSON2XML,
    AdapterJSON2XLS, OperationType
} from '../adapters';

import { DIALOG_FILTERS, OperationSideEnum } from './constants';
import { getExtension, getFileName, getPath } from './utils';


function getAdapter(options: IAdapterOptions): IAdapter {
    const extensionSource = options.sourceFile ? getExtension(options.sourceFile) : undefined;
    const extensionTarget = options.targetFile ? getExtension(options.targetFile) : undefined;

    if (extensionSource === FileTypeEnum.XML && (extensionTarget === FileTypeEnum.JSON || !extensionTarget)) {
        return new AdapterXML2JSON(options);
    }

    if (extensionSource === FileTypeEnum.XLS && (extensionTarget === FileTypeEnum.JSON || !extensionTarget)) {
        return new AdapterXLS2JSON(options);
    }

    if (extensionTarget === FileTypeEnum.XML && (extensionSource === FileTypeEnum.JSON || !extensionSource)) {
        return new AdapterJSON2XML(options);
    }

    if (extensionTarget === FileTypeEnum.XLS && (extensionSource === FileTypeEnum.JSON || !extensionSource)) {
        return new AdapterJSON2XLS(options);
    }

    const extensionsExportedFromSchemaST4: string[] = [FileTypeEnum.XML, FileTypeEnum.XLS];

    if (_.indexOf(extensionsExportedFromSchemaST4, extensionSource) !== -1
        && _.indexOf(extensionsExportedFromSchemaST4, extensionTarget) !== -1) {
        throw new Error('Probably both file are sources!');
    }

    // throw new Error('Adapter not found!');
}

function getDialogFilter(operation: OperationType, side: OperationSideEnum, options: IAdapterOptions): any {
    const extensionSource = options.sourceFile ? getExtension(options.sourceFile) : undefined;
    const extensionTarget = options.targetFile ? getExtension(options.targetFile) : undefined;

    if (operation === OperationType.REPLACEMENT) {
        if (side === OperationSideEnum.SOURCE) {
            if (extensionTarget === FileTypeEnum.XML || extensionTarget === FileTypeEnum.XLS) {
                return DIALOG_FILTERS.ONLY_JSON;
            }
        }

        if (side === OperationSideEnum.TARGET) {
            if (extensionSource === FileTypeEnum.XML || extensionSource === FileTypeEnum.XLS) {
                return DIALOG_FILTERS.ONLY_JSON;
            }
        }
    }

    if (operation === OperationType.SYNCHRONIZATION) {
        if ((side === OperationSideEnum.SOURCE && extensionTarget === FileTypeEnum.XLS) ||
            (side === OperationSideEnum.TARGET && extensionSource === FileTypeEnum.XLS)) {
            return DIALOG_FILTERS.ONLY_JSON;
        }

        if ((side === OperationSideEnum.SOURCE && extensionTarget === FileTypeEnum.JSON) ||
            (side === OperationSideEnum.TARGET && extensionSource === FileTypeEnum.JSON)) {
            return DIALOG_FILTERS.ONLY_XLS;
        }

        return DIALOG_FILTERS.ALL_FOR_SYNCHRONIZATION;
    }

    return DIALOG_FILTERS.ALL;
}

// tslint:disable-next-line max-func-body-length
const registerWorkflow = (win) => {
    ipcMain.on('client.replacement.select-source', (event, options: IAdapterOptions) => {
        if (!options.sourceFile) {
            const paths = dialog.showOpenDialog(
                win,
                {
                    filters: [
                        getDialogFilter(OperationType.REPLACEMENT, OperationSideEnum.SOURCE, options)
                    ],
                    properties: [
                        'openFile'
                    ]
                }
            );

            if (paths && paths.length > 0) {
                options.sourceFile = paths[0];
            }
        }

        if (options.sourceFile) {
            const extension = getExtension(options.sourceFile);
            const pathToSourceFile = getPath(options.sourceFile);
            const name = getFileName(options.sourceFile);
            const adapter: IAdapter = getAdapter(options);

            event.sender.send('electron.source-loaded', {
                fullPath: options.sourceFile,
                path: pathToSourceFile,
                extension,
                name
            });

            if (!adapter) {
                return;
            }

            if (extension === FileTypeEnum.XML || extension === FileTypeEnum.XLS) {
                const languages = adapter.getLanguages();
                const products = adapter.getProducts();

                event.sender.send('electron.source.options-loaded', {
                    languages,
                    products
                });
            }
        }
    });

    ipcMain.on('client.replacement.select-target', (event, options: IAdapterOptions) => {
        if (!options.targetFile) {
            options.targetFile = dialog.showSaveDialog(
                win,
                {
                    filters: [
                        getDialogFilter(OperationType.REPLACEMENT, OperationSideEnum.TARGET, options)
                    ]
                }
            );
        }

        if (options.targetFile) {
            const extension = getExtension(options.targetFile);
            const pathToTargetFile = getPath(options.targetFile);
            const name = getFileName(options.targetFile);
            const adapter = getAdapter(options);

            event.sender.send('electron.target-loaded', {
                fullPath: options.targetFile,
                path: pathToTargetFile,
                extension,
                name
            });

            if (!adapter) {
                return;
            }

            if (extension === FileTypeEnum.XML || extension === FileTypeEnum.XLS) {
                const languages = adapter.getLanguages();
                const products = adapter.getProducts();

                event.sender.send('electron.target.options-loaded', {
                    languages,
                    products
                });
            }
        }
    });

    ipcMain.on('client.synchronization.select-source', (event, options: IAdapterOptions) => {
        if (!options.sourceFile) {
            const paths = dialog.showOpenDialog(
                win,
                {
                    filters: [
                        getDialogFilter(OperationType.SYNCHRONIZATION, OperationSideEnum.SOURCE, options)
                    ],
                    properties: [
                        'openFile'
                    ]
                }
            );

            if (paths && paths.length > 0) {
                options.sourceFile = paths[0];
            }
        }

        if (options.sourceFile) {
            const extension = getExtension(options.sourceFile);
            const pathToSourceFile = getPath(options.sourceFile);
            const name = getFileName(options.sourceFile);
            const adapter: IAdapter = getAdapter(options);

            event.sender.send('electron.source-loaded', {
                fullPath: options.sourceFile,
                path: pathToSourceFile,
                extension,
                name
            });

            if (!adapter) {
                return;
            }

            if (extension === FileTypeEnum.XLS) {
                const languages = adapter.getLanguages();
                const products = adapter.getProducts();

                event.sender.send('electron.source.options-loaded', {
                    languages,
                    products
                });
            }
        }
    });

    ipcMain.on('client.synchronization.select-target', (event, options: IAdapterOptions) => {
        if (!options.targetFile) {
            const paths = dialog.showOpenDialog(
                win,
                {
                    filters: [
                        getDialogFilter(OperationType.SYNCHRONIZATION, OperationSideEnum.TARGET, options)
                    ]
                }
            );

            if (paths && paths.length > 0) {
                options.targetFile = paths[0];
            }
        }

        if (options.targetFile) {
            const extension = getExtension(options.targetFile);
            const pathToTargetFile = getPath(options.targetFile);
            const name = getFileName(options.targetFile);
            const adapter = getAdapter(options);

            event.sender.send('electron.target-loaded', {
                fullPath: options.targetFile,
                path: pathToTargetFile,
                extension,
                name
            });

            if (!adapter) {
                return;
            }

            if (extension === FileTypeEnum.XLS) {
                const languages = adapter.getLanguages();
                const products = adapter.getProducts();

                event.sender.send('electron.target.options-loaded', {
                    languages,
                    products
                });
            }
        }
    });

    ipcMain.on('client.get-available-languages', (event, options: IAdapterOptions) => {
        const adapter = getAdapter(options);
        const languages = adapter.getAvailableLanguages(options.products);

        event.sender.send('electron.available-languages', languages);
    });

    ipcMain.on('client.convert', (event, options: IAdapterOptions) => {
        try {
            const adapter: IAdapter = getAdapter(options);

            adapter.convert();

            dialog.showMessageBox(win, {
                type: 'info',
                title: 'Success',
                message: 'The file was successfully converted!',
                buttons: ['OK']
            });
        } catch (e) {
            dialog.showMessageBox(win, {
                type: 'error',
                title: 'Error',
                message: `An error occurred while converting the file: ${e.message}`,
                buttons: ['Close']
            });
        }
    });

    let sharedDiffsData;
    let windowDiff;
    let windowNewProduct;

    ipcMain.on('client.synchronize', (event, options: IAdapterOptions) => {
        try {
            const adapter: IAdapter = getAdapter(options);

            const diffs = adapter.getDiffs();

            if (!diffs) {
                dialog.showMessageBox(win, {
                    type: 'info',
                    title: 'Success',
                    message: 'Source and target are already synchronized!',
                    buttons: ['OK']
                });

                return;
            }

            windowDiff = new BrowserWindow({parent: win, modal: true, show: false, frame: false});

            windowDiff.loadURL(url.format({
                pathname: path.join(__dirname, '../dist/index.html'),
                protocol: 'file:',
                slashes: true,
                hash: 'diffs'
            }));

            sharedDiffsData = {
                options,
                resources: diffs
            };

            windowDiff.once('ready-to-show', () => {
                windowDiff.show();
            });
        } catch (e) {
            dialog.showMessageBox(win, {
                type: 'error',
                title: 'Error',
                message: `An error occurred while synchronization the file: ${e.message}`,
                buttons: ['Close']
            });
        }
    });

    ipcMain.on('client.diffs.get-resources', (event) => {
        event.sender.send('electron.diffs.resources', sharedDiffsData);
    });

    ipcMain.on('client.diffs.apply', (event, keys: any) => {
        try {
            const adapter: IAdapter = getAdapter(sharedDiffsData.options);

            const result = adapter.synchronize(keys);

            if (result === true) {
                windowDiff.close();
                sharedDiffsData = undefined;

                dialog.showMessageBox(win, {
                    type: 'info',
                    title: 'Success',
                    message: 'The file was successfully synchronized!',
                    buttons: ['OK']
                });
            }
        } catch (e) {
            dialog.showMessageBox(win, {
                type: 'error',
                title: 'Error',
                message: `An error occurred while synchronization the file: ${e.message}`,
                buttons: ['Close']
            });
        }
    });

    ipcMain.on('client.diffs.cancel', () => {
        windowDiff.close();
        sharedDiffsData = undefined;
    });

    ipcMain.on('client.diffs.add-to-new-product.cancel', () => {
        windowNewProduct.close();
    });

    ipcMain.on('client.diffs.add-to-new-product', (event, keys: any) => {
        try {
            const extensionTarget = getExtension(sharedDiffsData.options.targetFile);

            if (extensionTarget === FileTypeEnum.XLS) {
                windowNewProduct = new BrowserWindow({parent: windowDiff, modal: true, show: false, frame: false});

                windowNewProduct.loadURL(url.format({
                    pathname: path.join(__dirname, '../dist/index.html'),
                    protocol: 'file:',
                    slashes: true,
                    hash: 'new-product'
                }));

                sharedDiffsData.keys = keys;

                windowNewProduct.once('ready-to-show', () => {
                    windowNewProduct.show();
                });
            }

        } catch (e) {
            dialog.showMessageBox(win, {
                type: 'error',
                title: 'Error',
                message: `An error occurred while take out the file: ${e.message}`,
                buttons: ['Close']
            });
        }
    });

    ipcMain.on('client.diffs.add-to-new-product.apply', (event, keys: any, newProductName?) => {
        try {
            const adapter: IAdapter = getAdapter(sharedDiffsData.options);
            const extensionTarget = getExtension(sharedDiffsData.options.targetFile);

            let result;

            if (extensionTarget === FileTypeEnum.JSON) {
                const  filename = dialog.showSaveDialog(
                    win,
                    {
                        filters: [
                            DIALOG_FILTERS.ONLY_JSON
                        ]
                    }
                );

                result = adapter.takeOut(keys, filename);
            }

            if (newProductName && keys && adapter.takeOut) {
                result = adapter.takeOut(keys, newProductName);
            }

            if (result === true) {
                if (windowNewProduct) {
                    windowNewProduct.close();
                }

                dialog.showMessageBox(win, {
                    type: 'info',
                    title: 'Success',
                    message: 'The file was saved successfully!',
                    buttons: ['OK']
                });
            }

        } catch (e) {
            dialog.showMessageBox(win, {
                type: 'error',
                title: 'Error',
                message: `An error occurred while take out the file: ${e.message}`,
                buttons: ['Close']
            });
        }
    });

};

export { registerWorkflow };

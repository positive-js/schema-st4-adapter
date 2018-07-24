import { ipcMain, dialog } from 'electron';
import * as _ from 'lodash'; // tslint:disable-line import-blacklist

import {
    AdapterXLS2JSON,
    AdapterXML2JSON,
    IAdapter,
    IAdapterOptions,
    FileTypeEnum,
    AdapterJSON2XML,
    AdapterJSON2XLS
} from '../adapters';

import { DIALOG_FILTERS, OperationSideEnum } from './constants';
import { getExtension, getFileName, getPath } from './utils';


function getAdapter(options: IAdapterOptions): IAdapter {
    const extensionSource = options.sourceFile ? getExtension(options.sourceFile) : undefined;
    const extensionTarget = options.targetFile ? getExtension(options.targetFile) : undefined;

    if (extensionSource === FileTypeEnum.XML && (extensionTarget === FileTypeEnum.JSON || !extensionTarget )) {
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

    const extensionsExportedFromSchemaST4: string[] = [ FileTypeEnum.XML, FileTypeEnum.XLS ];

    if (_.indexOf(extensionsExportedFromSchemaST4, extensionSource) !== -1
        && _.indexOf(extensionsExportedFromSchemaST4, extensionTarget)) {
        throw new Error('Probably both file are sources!');
    }

    throw new Error('Adapter not found!');
}

function getDialogFilter(side: OperationSideEnum, options: IAdapterOptions): any {
    const extensionSource = options.sourceFile ? getExtension(options.sourceFile) : undefined;
    const extensionTarget = options.targetFile ? getExtension(options.targetFile) : undefined;

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

    return DIALOG_FILTERS.ALL;
}

// tslint:disable-next-line max-func-body-length
const registerWorkflow = (win) => {
    ipcMain.on('client.select-source', (event, options: IAdapterOptions) => {
        if (!options.sourceFile) {
            const paths = dialog.showOpenDialog(
                win,
                {
                    filters: [
                        getDialogFilter(OperationSideEnum.SOURCE, options)
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

    ipcMain.on('client.select-target', (event, options: IAdapterOptions) => {
        if (!options.targetFile) {
            options.targetFile = dialog.showSaveDialog(
                win,
                {
                    filters: [
                        getDialogFilter(OperationSideEnum.TARGET, options)
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
};

export { registerWorkflow };

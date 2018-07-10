import { ipcMain, dialog } from 'electron';

import * as path from 'path';
import * as xmldom from 'xmldom';

import { AdapterXLS2JSON, AdapterXML2JSON, IAdapter, IAdapterOptions } from './adapter';


const dom = xmldom.DOMParser;


function getExtension(filename) {
    return path.extname(filename).toLocaleLowerCase().slice(1);
}

function getAdapter(options) {
    const extension = getExtension(options.sourceFile);

    switch (extension) {
        case 'xml':
            return new AdapterXML2JSON(options);
        case 'xls':
            return new AdapterXLS2JSON(options);
        default:
            throw new Error('Adapter not found for selected file');
    }
}

const registerWorkflow = (win) => {
    ipcMain.on('client.select-source', (event) => {
        const paths = dialog.showOpenDialog(
            win,
            {
                filters: [
                    {
                        name: 'Exported XML or XLS files',
                        extensions: ['xml', 'xls']
                    }
                ],
                properties: [
                    'openFile'
                ]
            }
        );

        if (paths && paths.length > 0) {
            const sourceFile = paths[0];
            const extension = getExtension(sourceFile);
            const adapter: IAdapter = getAdapter({ sourceFile });

            event.sender.send('electron.source-loaded', { sourceFile, extension });

            if (extension === 'xml') {
                const languages = adapter.getLanguages();
                event.sender.send('electron.languages-loaded', languages);
            }

            if (extension === 'xls') {
                const products = adapter.getProducts();

                event.sender.send('electron.products-loaded', products);
            }

        }
    });

    ipcMain.on('client.select-target', (event) => {
        const pathToTargetFile = dialog.showSaveDialog(
            win,
            {
                filters: [
                    {
                        name: 'JSON файлы',
                        extensions: ['json']
                    }
                ]
            }
        );

        if (pathToTargetFile) {
            event.sender.send('electron.target-loaded', pathToTargetFile);
        }
    });


    ipcMain.on('client.select-language', (event, xmlFile, language) => {
        const adapter: IAdapter = getAdapter({ sourceFile: xmlFile, language });
        const products = adapter.getProducts();

        event.sender.send('electron.products-loaded', products);
    });

    ipcMain.on('client.unload', (_event, options: IAdapterOptions) => {
        try {
            const adapter: IAdapter = getAdapter(options);

            adapter.unload();

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

    ipcMain.on('client.synchronize', (_event, options: IAdapterOptions) => {
        try {
            const adapter: IAdapter = getAdapter(options);

            adapter.synchronize();

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

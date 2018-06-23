import { ipcMain, dialog } from 'electron';
import * as fs from 'fs';

import * as xmldom from 'xmldom';
import * as xpath from 'xpath';

import { runToJSON } from './run-to-json';
import { runToXML } from './run-to-xml';


const dom = xmldom.DOMParser;


function getLanguages(pathToXMLFile) {
    const xml = fs.readFileSync(pathToXMLFile, 'utf8');
    const document = new dom().parseFromString(xml);
    // tslint:disable-next-line no-http-string
    const select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node' });
    const languages = select('//n:Data-Variables.XML/n:Value/@n:Aspect', document);

    return languages.map((attribute: any) => attribute.value);
}

function getProducts(pathToXMLFile, language) {
    const xml = fs.readFileSync(pathToXMLFile, 'utf8');
    const document = new dom().parseFromString(xml);
    // tslint:disable-next-line no-http-string
    const select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node' });
    const products = select(`//n:Data-Variables.XML/n:Value[@n:Aspect="${language}"]/n:Entry/variables/h/e/text()`,
        document);

    return products.map((text: any) => text.data);
}

const registerWorkflow = (win) => {
    ipcMain.on('client.select-source', (event) => {
        const paths = dialog.showOpenDialog(
            win,
            {
                filters: [
                    {
                        name: 'Exported XML files',
                        extensions: ['xml']
                    }
                    // {
                    //     name: 'Exported XLS files',
                    //     extensions: ['xls']
                    // }
                ],
                properties: [
                    'openFile'
                ]
            }
        );

        if (paths && paths.length > 0) {
            const languages = getLanguages(paths[0]);
            event.sender.send('electron.source-loaded', paths[0]);
            event.sender.send('electron.languages-loaded', languages);
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
        const products = getProducts(xmlFile, language);
        event.sender.send('electron.products-loaded', products);
    });

    ipcMain.on('client.unload', (_event, options) => {
        try {
            runToJSON(options);

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

    ipcMain.on('client.synchronize', (_event, options) => {
        try {
            runToXML(options);

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

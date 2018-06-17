import { app, BrowserWindow, screen, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import * as xpath from 'xpath';
import * as xmldom from 'xmldom';
import { runToJSON } from './run-to-json';
import { runToXML } from './run-to-xml';

const dom = xmldom.DOMParser;

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

try {
    require('dotenv').config();
} catch {
    console.log('asar');
}

function createWindow() {

    const electronScreen = screen;
    const size = electronScreen.getPrimaryDisplay().workAreaSize;

    // Create the browser window.
    win = new BrowserWindow({
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        icon: path.join(__dirname, './dist/favicon.png')
    });

    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(`${__dirname}/node_modules/electron`)
        });
        win.loadURL('http://localhost:4200');
    } else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }

    // win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}

try {

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', createWindow);

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });

} catch (e) {
    // Catch Error
    // throw e;
}

function getLanguages(pathToXMLFile) {
    const xml = fs.readFileSync(pathToXMLFile, 'utf8');
    const document = new dom().parseFromString(xml);
    const select = xpath.useNamespaces({ 'n': "http://www.schema.de/2004/ST4/XmlImportExport/Node" });
    const languages = select('//n:Data-Variables.XML/n:Value/@n:Aspect', document);

    return languages.map((attribute: any) => attribute.value);
}

function getProducts(pathToXMLFile, language) {
    const xml = fs.readFileSync(pathToXMLFile, 'utf8');
    const document = new dom().parseFromString(xml);
    const select = xpath.useNamespaces({ 'n': "http://www.schema.de/2004/ST4/XmlImportExport/Node" });
    const products = select(`//n:Data-Variables.XML/n:Value[@n:Aspect="${language}"]/n:Entry/variables/h/e/text()`, document);

    return products.map((text: any) => text.data);
}

// let options;
let type;

ipcMain.on('client.select-type', (_event, selectedType) => {
    type = selectedType;
});

ipcMain.on('client.select-xml', (event) => {
    const paths = dialog.showOpenDialog(
        win,
        {
            filters: [
                {
                    name: 'Экспортированные XML файлы',
                    extensions: ['xml']
                }
            ],
            properties: [
                'openFile',
            ]
        }
    );

    if (paths && paths.length > 0) {
        const languages = getLanguages(paths[0]);
        event.sender.send('electron.xml-loaded', paths[0]);
        event.sender.send('electron.languages-loaded', languages);
    }
});

ipcMain.on('client.select-json', (event) => {
    const paths = dialog.showOpenDialog(
        win,
        {
            filters: [
                {
                    name: 'JSON файлы',
                    extensions: ['json']
                }
            ],
            properties: [
                'openFile',
            ]
        }
    );

    if (paths && paths.length > 0) {
        event.sender.send('electron.json-loaded', paths[0]);
    }
});


ipcMain.on('client.select-language', (event, xmlFile, language) => {
    const products = getProducts(xmlFile, language);
    event.sender.send('electron.products-loaded', products);
});

ipcMain.on('client.convert-to-json', (_event, options) => {
    const paths = dialog.showOpenDialog(
        win,
        {   
            properties: [
                'openDirectory'
            ]
        }
    );

    if (paths && paths.length > 0) {
        options.output = paths[0];

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
    }
});

ipcMain.on('client.convert-from-json', (_event, options) => {
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
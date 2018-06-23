"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var fs = require("fs");
var xmldom = require("xmldom");
var xpath = require("xpath");
var run_to_json_1 = require("./run-to-json");
var run_to_xml_1 = require("./run-to-xml");
var dom = xmldom.DOMParser;
function getLanguages(pathToXMLFile) {
    var xml = fs.readFileSync(pathToXMLFile, 'utf8');
    var document = new dom().parseFromString(xml);
    // tslint:disable-next-line no-http-string
    var select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node' });
    var languages = select('//n:Data-Variables.XML/n:Value/@n:Aspect', document);
    return languages.map(function (attribute) { return attribute.value; });
}
function getProducts(pathToXMLFile, language) {
    var xml = fs.readFileSync(pathToXMLFile, 'utf8');
    var document = new dom().parseFromString(xml);
    // tslint:disable-next-line no-http-string
    var select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node' });
    var products = select("//n:Data-Variables.XML/n:Value[@n:Aspect=\"" + language + "\"]/n:Entry/variables/h/e/text()", document);
    return products.map(function (text) { return text.data; });
}
var registerWorkflow = function (win) {
    electron_1.ipcMain.on('client.select-source', function (event) {
        var paths = electron_1.dialog.showOpenDialog(win, {
            filters: [
                {
                    name: 'Экспортированные XML файлы',
                    extensions: ['xml']
                },
                {
                    name: 'Экспортированные XLS файлы',
                    extensions: ['xls']
                }
            ],
            properties: [
                'openFile'
            ]
        });
        if (paths && paths.length > 0) {
            var languages = getLanguages(paths[0]);
            event.sender.send('electron.source-loaded', paths[0]);
            event.sender.send('electron.languages-loaded', languages);
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
        var products = getProducts(xmlFile, language);
        event.sender.send('electron.products-loaded', products);
    });
    electron_1.ipcMain.on('client.unload', function (_event, options) {
        try {
            run_to_json_1.runToJSON(options);
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
            run_to_xml_1.runToXML(options);
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

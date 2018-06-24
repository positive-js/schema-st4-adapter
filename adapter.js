"use strict";
exports.__esModule = true;
var fs = require("fs");
var HtmlEntitities = require("html-entities");
var _ = require("lodash");
var xml2js = require("xml2js");
var xmldom = require("xmldom");
var xpath = require("xpath");
var XLSX = require("xlsx");
var KEY_ATTRIBUTES = '$';
var KEY_VALUE = '_';
var ASPECT_ATTR = 'n:Aspect';
var XIE_TAG = 'd:xie';
var SYSTEM_FOLDER_TAG = 'n:SystemFolder';
var FOLDER_TAG = 'n:Folder';
var VARIABLE_FOLDER_TAG = 'n:VariableFolder';
var VARIABLE_NODE_TAG = 'n:VariableNode';
var DATA_VARIABLES_XML_TAG = 'n:Data-Variables.XML';
var DATA_VARIABLES_LAYOUT_TAG = 'n:Data-Variables.Layout';
var VALUE_TAG = 'n:Value';
var ENTRY_TAG = 'n:Entry';
var HEADER_TAG = 'h';
var TERM_TAG = 't';
var ELEMENT_TAG = 'e';
var ROW_TAG = 'r';
var COUNT_SPACES_INDENT_JSON = 4;
var AdapterXML2JSON = /** @class */ (function () {
    function AdapterXML2JSON(options) {
        this.options = options;
        this.entities = new HtmlEntitities.XmlEntities();
        this.dom = xmldom.DOMParser;
    }
    AdapterXML2JSON.prototype.unload = function () {
        var _this = this;
        this.validation();
        var xml = fs.readFileSync(this.options.sourceFile, 'utf8');
        var document = new this.dom().parseFromString(xml);
        // tslint:disable-next-line no-http-string
        var select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node' });
        var language = this.options.language;
        var products = select("//n:Data-Variables.XML/n:Value[@n:Aspect=\"" + language + "\"]/n:Entry/variables/h/e/text()", document);
        var indexColumnProduct = _.findIndex(products, function (product) { return product.data === _this.options.product; });
        var isProductFound = indexColumnProduct !== -1;
        if (isProductFound) {
            var rows = select("//n:Data-Variables.XML/n:Value[@n:Aspect=\"" + language + "\"]/n:Entry/variables/r", document);
            var data_1 = {};
            _.forEach(rows, function (row) {
                var key = select('t/text()', row);
                var value = select("e[position()=" + (indexColumnProduct + 1) + "]/text()", row);
                var resultKey = key[0] ? _this.entities.decode(key[0].data) : '';
                data_1[resultKey.toUpperCase()] = value[0] ? value[0].data : '';
            });
            var contentFile = JSON.stringify(data_1, null, COUNT_SPACES_INDENT_JSON);
            fs.writeFileSync(this.options.targetFile, contentFile, { encoding: 'utf8' });
        }
        else {
            throw new Error("Pointed product not found in selected language " + language);
        }
    };
    AdapterXML2JSON.prototype.synchronize = function () {
        var _this = this;
        this.validation();
        var json = fs.readFileSync(this.options.targetFile, 'utf8');
        var dataJSON = JSON.parse(json);
        var parser = new xml2js.Parser();
        var xml = fs.readFileSync(this.options.sourceFile);
        parser.parseString(xml, function (err, data) {
            if (err) {
                throw err;
            }
            var folder = data[XIE_TAG][SYSTEM_FOLDER_TAG][0][FOLDER_TAG];
            var lastVariableFolder = _this.getLastVariableFolder(folder);
            var variableNode = lastVariableFolder[0][VARIABLE_NODE_TAG];
            var dataVariablesXML = variableNode[0][DATA_VARIABLES_XML_TAG];
            var dataVariablesLayout = variableNode[0][DATA_VARIABLES_LAYOUT_TAG];
            var values = dataVariablesXML[0][VALUE_TAG];
            var selectedLanguage = _.find(values, function (value) {
                return value[KEY_ATTRIBUTES][ASPECT_ATTR] === _this.options.language;
            });
            var variables = selectedLanguage[ENTRY_TAG][0].variables;
            var products = variables[0][HEADER_TAG];
            var rows = variables[0][ROW_TAG];
            var indexSelectedProduct = _.findIndex(products, function (product) {
                return product[ELEMENT_TAG][0][KEY_VALUE] === _this.options.product;
            });
            var keys = _.keys(dataJSON);
            // skip removed
            rows = _.filter(rows, function (row) {
                return _.has(dataJSON, row[TERM_TAG][0][KEY_VALUE]);
            });
            var maxRowId = _this.getLastRowId(rows);
            // changing existing and adding new
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                var row = _this.getRowByKey(rows, key);
                if (row) {
                    row[ELEMENT_TAG][indexSelectedProduct][KEY_VALUE] = dataJSON[key];
                }
                else {
                    // add new translation key to rows
                    var newRow = (_a = {},
                        _a[KEY_ATTRIBUTES] = {
                            id: ++maxRowId
                        },
                        _a[TERM_TAG] = [(_b = {},
                                _b[KEY_VALUE] = key,
                                _b)],
                        _a[ELEMENT_TAG] = _.fill(Array(products.length), {}),
                        _a);
                    newRow[ELEMENT_TAG][indexSelectedProduct][KEY_VALUE] = dataJSON[key];
                    rows.push(newRow);
                    // add to layout
                    var entryLayout = dataVariablesLayout[0][ENTRY_TAG];
                    var rowsInfo = entryLayout[0].variablesLayout[0].rowInfo[0].row;
                    var newRowInfo = (_c = {},
                        _c[KEY_ATTRIBUTES] = {
                            id: maxRowId
                        },
                        _c);
                    rowsInfo.push(newRowInfo);
                }
            }
            variables[0][ROW_TAG] = rows;
            var builder = new xml2js.Builder();
            var newXML = builder.buildObject(data);
            fs.writeFileSync(_this.options.sourceFile, newXML);
            var _a, _b, _c;
        });
    };
    AdapterXML2JSON.prototype.getLanguages = function () {
        var xml = fs.readFileSync(this.options.sourceFile, 'utf8');
        var document = new this.dom().parseFromString(xml);
        // tslint:disable-next-line no-http-string
        var select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node' });
        var languages = select('//n:Data-Variables.XML/n:Value/@n:Aspect', document);
        return languages.map(function (attribute) { return attribute.value; });
    };
    AdapterXML2JSON.prototype.getProducts = function () {
        var xml = fs.readFileSync(this.options.sourceFile, 'utf8');
        var document = new this.dom().parseFromString(xml);
        // tslint:disable-next-line no-http-string
        var select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node' });
        var products = select("//n:Data-Variables.XML/n:Value[@n:Aspect=\"" + this.options.language + "\"]/n:Entry/variables/h/e/text()", document);
        return products.map(function (text) { return text.data; });
    };
    AdapterXML2JSON.prototype.validation = function () {
        if (!this.options.targetFile || !this.options.sourceFile) {
            throw new Error('Path to source file or target file are not defined');
        }
        if (!this.options.product) {
            throw new Error('Product is not defined');
        }
        if (!this.options.language) {
            throw new Error('Language is not defined');
        }
    };
    AdapterXML2JSON.prototype.getLastVariableFolder = function (folder) {
        if (folder[0]) {
            var variableFolder = folder[0][VARIABLE_FOLDER_TAG];
            if (variableFolder) {
                return this.getLastVariableFolder(variableFolder);
            }
            else {
                return folder;
            }
        }
        else {
            throw new Error('Not found folder');
        }
    };
    AdapterXML2JSON.prototype.getRowByKey = function (rows, key) {
        return _.find(rows, function (row) {
            return row[TERM_TAG][0][KEY_VALUE] === key;
        });
    };
    AdapterXML2JSON.prototype.getLastRowId = function (rows) {
        var baseDecimal = 10;
        return _.max(_.map(rows, function (row) { return _.parseInt(row[KEY_ATTRIBUTES].id, baseDecimal); }));
    };
    return AdapterXML2JSON;
}());
exports.AdapterXML2JSON = AdapterXML2JSON;
var AdapterXLS2JSON = /** @class */ (function () {
    function AdapterXLS2JSON(options) {
        this.options = options;
    }
    AdapterXLS2JSON.prototype.unload = function () {
        var _this = this;
        var workbook = XLSX.readFile(this.options.sourceFile);
        var worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        var worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);
        console.log(worksheetJSON);
        var data = _.reduce(worksheetJSON, function (resources, current) {
            resources[current.__EMPTY] = current[_this.options.product];
            return resources;
        }, {});
        console.log(data);
        var contentFile = JSON.stringify(data, null, COUNT_SPACES_INDENT_JSON);
        fs.writeFileSync(this.options.targetFile, contentFile, { encoding: 'utf8' });
    };
    AdapterXLS2JSON.prototype.synchronize = function () {
        var json = fs.readFileSync(this.options.targetFile, 'utf8');
        var dataJSON = JSON.parse(json);
        var data = _.map(_.keys(dataJSON), function (key) {
            return [
                key,
                dataJSON[key]
            ];
        });
        // manual format header
        data.unshift([undefined, this.options.product]);
        var worksheet = XLSX.utils.aoa_to_sheet(data);
        var workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet);
        XLSX.writeFile(workbook, this.options.sourceFile);
    };
    AdapterXLS2JSON.prototype.getLanguages = function () {
        throw new Error('Not supported operation');
    };
    AdapterXLS2JSON.prototype.getProducts = function () {
        var workbook = XLSX.readFile(this.options.sourceFile);
        var worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        var worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);
        return _.filter(_.keys(worksheetJSON[0]), function (column) { return column !== '__EMPTY'; });
    };
    return AdapterXLS2JSON;
}());
exports.AdapterXLS2JSON = AdapterXLS2JSON;

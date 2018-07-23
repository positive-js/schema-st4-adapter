"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
// tslint:disable underscore-consistent-invocation
var fs = require("fs");
var _ = require("lodash"); // tslint:disable-line import-blacklist
var xml2js = require("xml2js");
var workflow_1 = require("../workflow");
var BaseAdapterXML_1 = require("./BaseAdapterXML");
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
var AdapterJSON2XML = /** @class */ (function (_super) {
    __extends(AdapterJSON2XML, _super);
    function AdapterJSON2XML(options) {
        var _this = _super.call(this, options, workflow_1.OperationSideEnum.TARGET) || this;
        _this.options = options;
        return _this;
    }
    AdapterJSON2XML.prototype.convert = function () {
        var _this = this;
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
                return value[KEY_ATTRIBUTES][ASPECT_ATTR] === _this.options.languages[0];
            });
            var variables = selectedLanguage[ENTRY_TAG][0].variables;
            var products = variables[0][HEADER_TAG];
            var rows = variables[0][ROW_TAG];
            var indexSelectedProduct = _.findIndex(products, function (product) {
                return product[ELEMENT_TAG][0][KEY_VALUE] === _this.options.products[0];
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
    AdapterJSON2XML.prototype.synchronize = function () {
        //
    };
    AdapterJSON2XML.prototype.getLastVariableFolder = function (folder) {
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
    AdapterJSON2XML.prototype.getRowByKey = function (rows, key) {
        return _.find(rows, function (row) {
            return row[TERM_TAG][0][KEY_VALUE] === key;
        });
    };
    AdapterJSON2XML.prototype.getLastRowId = function (rows) {
        var baseDecimal = 10;
        return _.max(_.map(rows, function (row) { return _.parseInt(row[KEY_ATTRIBUTES].id, baseDecimal); }));
    };
    return AdapterJSON2XML;
}(BaseAdapterXML_1.BaseAdapterXML));
exports.AdapterJSON2XML = AdapterJSON2XML;

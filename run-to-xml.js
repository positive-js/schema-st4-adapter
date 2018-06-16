"use strict";
exports.__esModule = true;
var fs = require("fs");
var _ = require("lodash");
var xml2js = require("xml2js");
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
var DATA_VARIABLES_TRANS_CHECKOUT_TAG = 'n:Data-Variables.trans.CheckOut';
var VALUE_TAG = 'n:Value';
var ENTRY_TAG = 'n:Entry';
var HEADER_TAG = 'h';
var TERM_TAG = 't';
var ELEMENT_TAG = 'e';
var ROW_TAG = 'r';
function validation(options) {
    if (!options.input || !options.output) {
        throw new Error('Path to input JSON file or output XML file are not defined');
    }
    if (!options.product) {
        throw new Error('Product is not defined');
    }
    if (!options.languages) {
        throw new Error('Languages is not defined');
    }
}
function getLastVariableFolder(folder) {
    if (folder[0]) {
        var variableFolder = folder[0][VARIABLE_FOLDER_TAG];
        if (variableFolder) {
            return getLastVariableFolder(variableFolder);
        }
        else {
            return folder;
        }
    }
    else {
        throw new Error('Not found folder');
    }
}
function getRowByKey(rows, key) {
    return _.find(rows, function (row) {
        return row[TERM_TAG][0][KEY_VALUE] === key;
    });
}
function getLastRowId(rows) {
    return _.max(_.map(rows, function (row) { return _.parseInt(row[KEY_ATTRIBUTES].id, 10); }));
}
var runToXML = function (options) {
    validation(options);
    var json = fs.readFileSync(options.input, 'utf8');
    var dataJSON = JSON.parse(json);
    var parser = new xml2js.Parser();
    var xml = fs.readFileSync(options.output);
    parser.parseString(xml, function (err, data) {
        if (err) {
            throw err;
        }
        var folder = data[XIE_TAG][SYSTEM_FOLDER_TAG][0][FOLDER_TAG];
        var lastVariableFolder = getLastVariableFolder(folder);
        var variableNode = lastVariableFolder[0][VARIABLE_NODE_TAG];
        var dataVariablesXML = variableNode[0][DATA_VARIABLES_XML_TAG];
        var dataVariablesLayout = variableNode[0][DATA_VARIABLES_LAYOUT_TAG];
        var dataVariableCheckout = variableNode[0][DATA_VARIABLES_TRANS_CHECKOUT_TAG];
        var values = dataVariablesXML[0][VALUE_TAG];
        var selectedLanguage = _.find(values, function (value) {
            return value[KEY_ATTRIBUTES][ASPECT_ATTR] === options.languages[0];
        });
        var variables = selectedLanguage[ENTRY_TAG][0].variables;
        var products = variables[0][HEADER_TAG];
        var rows = variables[0][ROW_TAG];
        var indexSelectedProduct = _.findIndex(products, function (product) {
            return product[ELEMENT_TAG][0][KEY_VALUE] === options.product;
        });
        var keys = _.keys(dataJSON);
        // skip removed
        rows = _.filter(rows, function (row) {
            return _.has(dataJSON, row[TERM_TAG][0][KEY_VALUE]);
        });
        var maxRowId = getLastRowId(rows);
        // changing existing and adding new
        for (var _i = 0, _a = _.keys(dataJSON); _i < _a.length; _i++) {
            var key = _a[_i];
            var row = getRowByKey(rows, key);
            if (row) {
                row[ELEMENT_TAG][indexSelectedProduct][KEY_VALUE] = dataJSON[key];
            }
            else {
                // add new translation key to rows
                var newRow = (_b = {},
                    _b[KEY_ATTRIBUTES] = {
                        id: ++maxRowId
                    },
                    _b[TERM_TAG] = [(_c = {},
                            _c[KEY_VALUE] = key,
                            _c)],
                    _b[ELEMENT_TAG] = _.fill(Array(products.length), {}),
                    _b);
                newRow[ELEMENT_TAG][indexSelectedProduct][KEY_VALUE] = dataJSON[key];
                rows.push(newRow);
                // add to layout
                var entryLayout = dataVariablesLayout[0][ENTRY_TAG];
                var rowsInfo = entryLayout[0].variablesLayout[0].rowInfo[0].row;
                var newRowInfo = (_d = {},
                    _d[KEY_ATTRIBUTES] = {
                        id: maxRowId
                    },
                    _d);
                rowsInfo.push(newRowInfo);
            }
        }
        variables[0][ROW_TAG] = rows;
        var builder = new xml2js.Builder();
        var newXML = builder.buildObject(data);
        fs.writeFileSync(options.output, newXML);
        var _b, _c, _d;
    });
};
exports.runToXML = runToXML;

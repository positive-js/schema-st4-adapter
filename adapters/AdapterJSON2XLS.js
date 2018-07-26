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
var XLSX = require("xlsx");
var workflow_1 = require("../workflow");
var BaseAdapterXLS_1 = require("./BaseAdapterXLS");
var AdapterJSON2XLS = /** @class */ (function (_super) {
    __extends(AdapterJSON2XLS, _super);
    function AdapterJSON2XLS(options) {
        var _this = _super.call(this, options, workflow_1.OperationSideEnum.TARGET) || this;
        _this.options = options;
        return _this;
    }
    AdapterJSON2XLS.prototype.convert = function () {
        var json = fs.readFileSync(this.options.targetFile, 'utf8');
        var dataJSON = JSON.parse(json);
        var data = _.map(_.keys(dataJSON), function (key) {
            return [
                key,
                dataJSON[key]
            ];
        });
        // manual format header
        data.unshift([undefined, this.options.products[0]]);
        var worksheet = XLSX.utils.aoa_to_sheet(data);
        var workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet);
        XLSX.writeFile(workbook, this.options.sourceFile);
    };
    AdapterJSON2XLS.prototype.getDiffs = function () {
        var workbook = XLSX.readFile(this.options.targetFile);
        var worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        var worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);
        var product = this.options.products[0];
        var resourcesXLS = _.reduce(worksheetJSON, function (resources, current) {
            resources[current.__EMPTY] = current[product];
            return resources;
        }, {});
        var keysXLS = _.keys(resourcesXLS);
        var resourcesJSON = JSON.parse(fs.readFileSync(this.options.sourceFile, { encoding: 'utf8' }));
        var keysJSON = _.keys(resourcesJSON);
        var replaced = _.filter(_.intersection(keysXLS, keysJSON), function (key) { return resourcesJSON[key] != resourcesXLS[key]; });
        var missed = _.difference(keysXLS, keysJSON);
        var added = _.difference(keysJSON, keysXLS);
        return replaced.concat(missed, added).length > 0
            ? {
                replaced: {
                    fromSource: _.pick(resourcesJSON, replaced),
                    toTarget: _.pick(resourcesXLS, replaced)
                },
                added: _.pick(resourcesJSON, added),
                missed: _.pick(resourcesXLS, missed)
            }
            : null;
    };
    AdapterJSON2XLS.prototype.synchronize = function (keys) {
        if (keys === void 0) { keys = {}; }
        var workbook = XLSX.readFile(this.options.targetFile);
        var worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        var worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);
        var product = this.options.products[0];
        var keysXLS = _.map(worksheetJSON, function (row) { return row.__EMPTY; });
        var resourcesJSON = JSON.parse(fs.readFileSync(this.options.sourceFile, { encoding: 'utf8' }));
        var keysJSON = _.keys(resourcesJSON);
        var _loop_1 = function (key) {
            var foundRow = _.find(worksheetJSON, function (row) { return row.__EMPTY == key; });
            foundRow[product] = resourcesJSON[key];
        };
        // replaced
        for (var _i = 0, _a = keys.replaced; _i < _a.length; _i++) {
            var key = _a[_i];
            _loop_1(key);
        }
        // added
        for (var _b = 0, _c = keys.added; _b < _c.length; _b++) {
            var key = _c[_b];
            var addedRow = _.zipObject(_.keys(worksheetJSON[0]), []);
            addedRow.__EMPTY = key;
            addedRow[product] = resourcesJSON[key];
            worksheetJSON.push(addedRow);
        }
        // missed
        var allMissed = _.difference(keysXLS, keysJSON);
        var removed = _.difference(allMissed, keys.missed);
        worksheetJSON = _.filter(worksheetJSON, function (row) { return _.indexOf(removed, row.__EMPTY) === -1; });
        var data = [];
        var products = _.filter(_.keys(worksheetJSON[0]), function (key) { return key !== '__EMPTY'; });
        data.push([
            undefined
        ].concat(products));
        var _loop_2 = function (row) {
            data.push([
                row['__EMPTY']
            ].concat(_.map(products, function (product) { return row[product]; })));
        };
        for (var _d = 0, worksheetJSON_1 = worksheetJSON; _d < worksheetJSON_1.length; _d++) {
            var row = worksheetJSON_1[_d];
            _loop_2(row);
        }
        var worksheetNew = XLSX.utils.aoa_to_sheet(data);
        var workbookNew = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbookNew, worksheetNew);
        XLSX.writeFile(workbookNew, this.options.targetFile);
        return true;
    };
    AdapterJSON2XLS.prototype.takeOut = function (keys, newProductName) {
        if (keys === void 0) { keys = {}; }
        var workbook = XLSX.readFile(this.options.targetFile);
        var worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        var worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);
        var product = this.options.products[0];
        var keysXLS = _.map(worksheetJSON, function (row) { return row.__EMPTY; });
        var resourcesJSON = JSON.parse(fs.readFileSync(this.options.sourceFile, { encoding: 'utf8' }));
        var keysJSON = _.keys(resourcesJSON);
        worksheetJSON = _.map(worksheetJSON, function (row) {
            row[newProductName] = '';
            return row;
        });
        var _loop_3 = function (key) {
            var foundRow = _.find(worksheetJSON, function (row) { return row.__EMPTY == key; });
            foundRow[newProductName] = resourcesJSON[key];
        };
        // replaced
        for (var _i = 0, _a = keys.replaced; _i < _a.length; _i++) {
            var key = _a[_i];
            _loop_3(key);
        }
        // added
        for (var _b = 0, _c = keys.added; _b < _c.length; _b++) {
            var key = _c[_b];
            var addedRow = _.zipObject(_.keys(worksheetJSON[0]), []);
            addedRow.__EMPTY = key;
            addedRow[newProductName] = resourcesJSON[key];
            worksheetJSON.push(addedRow);
        }
        // missed
        var allMissed = _.difference(keysXLS, keysJSON);
        var removed = _.difference(allMissed, keys.missed);
        worksheetJSON = _.filter(worksheetJSON, function (row) { return _.indexOf(removed, row.__EMPTY) === -1; });
        var _loop_4 = function (key) {
            var foundRow = _.find(worksheetJSON, function (row) { return row.__EMPTY == key; });
            foundRow[newProductName] = foundRow[product];
        };
        for (var _d = 0, _e = keys.missed; _d < _e.length; _d++) {
            var key = _e[_d];
            _loop_4(key);
        }
        var data = [];
        var products = _.filter(_.keys(worksheetJSON[0]), function (key) { return key !== '__EMPTY'; });
        data.push([
            undefined
        ].concat(products));
        var _loop_5 = function (row) {
            data.push([
                row['__EMPTY']
            ].concat(_.map(products, function (product) { return row[product]; })));
        };
        for (var _f = 0, worksheetJSON_2 = worksheetJSON; _f < worksheetJSON_2.length; _f++) {
            var row = worksheetJSON_2[_f];
            _loop_5(row);
        }
        var worksheetNew = XLSX.utils.aoa_to_sheet(data);
        var workbookNew = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbookNew, worksheetNew);
        XLSX.writeFile(workbookNew, this.options.targetFile);
        return true;
    };
    return AdapterJSON2XLS;
}(BaseAdapterXLS_1.BaseAdapterXLS));
exports.AdapterJSON2XLS = AdapterJSON2XLS;

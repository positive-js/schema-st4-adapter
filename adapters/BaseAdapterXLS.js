"use strict";
exports.__esModule = true;
// tslint:disable underscore-consistent-invocation
var _ = require("lodash"); // tslint:disable-line import-blacklist
var XLSX = require("xlsx");
var workflow_1 = require("../workflow");
var BaseAdapterXLS = /** @class */ (function () {
    function BaseAdapterXLS(options, side) {
        this.options = options;
        this.side = side;
    }
    BaseAdapterXLS.prototype.convert = function () {
        //
    };
    BaseAdapterXLS.prototype.synchronize = function () {
        //
    };
    BaseAdapterXLS.prototype.getDiffs = function () {
        //
    };
    BaseAdapterXLS.prototype.getLanguages = function () {
        return [];
    };
    BaseAdapterXLS.prototype.getProducts = function () {
        var workbook = XLSX.readFile(this.getPathToBaseFile());
        var worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        var worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);
        return _.filter(_.keys(worksheetJSON[0]), function (column) { return column !== '__EMPTY'; });
    };
    BaseAdapterXLS.prototype.getAvailableLanguages = function (products) {
        return this.getLanguages();
    };
    BaseAdapterXLS.prototype.getPathToBaseFile = function () {
        return this.side === workflow_1.OperationSideEnum.SOURCE
            ? this.options.sourceFile
            : this.options.targetFile;
    };
    return BaseAdapterXLS;
}());
exports.BaseAdapterXLS = BaseAdapterXLS;

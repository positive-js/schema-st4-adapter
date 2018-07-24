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
var mkdir = require("mkdirpsync");
var XLSX = require("xlsx");
var workflow_1 = require("../workflow");
var BaseAdapterXLS_1 = require("./BaseAdapterXLS");
var COUNT_SPACES_INDENT_JSON = 4;
var AdapterXLS2JSON = /** @class */ (function (_super) {
    __extends(AdapterXLS2JSON, _super);
    function AdapterXLS2JSON(options) {
        var _this = _super.call(this, options, workflow_1.OperationSideEnum.SOURCE) || this;
        _this.options = options;
        return _this;
    }
    AdapterXLS2JSON.prototype.convert = function () {
        var workbook = XLSX.readFile(this.options.sourceFile);
        var worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        var worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);
        var _loop_1 = function (product) {
            var data = _.reduce(worksheetJSON, function (resources, current) {
                resources[current.__EMPTY] = current[product];
                return resources;
            }, {});
            var contentFile = JSON.stringify(data, null, COUNT_SPACES_INDENT_JSON);
            var basePath = workflow_1.getPath(this_1.options.targetFile) + "/" + product;
            var baseFileName = workflow_1.getFileName(this_1.options.targetFile);
            mkdir(basePath);
            fs.writeFileSync(basePath + "/" + baseFileName, contentFile, { encoding: 'utf8' });
        };
        var this_1 = this;
        for (var _i = 0, _a = this.options.products; _i < _a.length; _i++) {
            var product = _a[_i];
            _loop_1(product);
        }
    };
    AdapterXLS2JSON.prototype.synchronize = function () {
        //
    };
    return AdapterXLS2JSON;
}(BaseAdapterXLS_1.BaseAdapterXLS));
exports.AdapterXLS2JSON = AdapterXLS2JSON;

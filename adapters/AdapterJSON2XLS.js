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
    AdapterJSON2XLS.prototype.synchronize = function () {
        //
    };
    return AdapterJSON2XLS;
}(BaseAdapterXLS_1.BaseAdapterXLS));
exports.AdapterJSON2XLS = AdapterJSON2XLS;

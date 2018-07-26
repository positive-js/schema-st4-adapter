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
    AdapterXLS2JSON.prototype.getDiffs = function () {
        var workbook = XLSX.readFile(this.options.sourceFile);
        var worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        var worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);
        var product = this.options.products[0];
        var resourcesXLS = _.reduce(worksheetJSON, function (resources, current) {
            resources[current.__EMPTY] = current[product];
            return resources;
        }, {});
        var keysXLS = _.keys(resourcesXLS);
        var resourcesJSON = JSON.parse(fs.readFileSync(this.options.targetFile, { encoding: 'utf8' }));
        var keysJSON = _.keys(resourcesJSON);
        var replaced = _.filter(_.intersection(keysXLS, keysJSON), function (key) { return resourcesJSON[key] != resourcesXLS[key]; });
        var added = _.difference(keysXLS, keysJSON);
        var missed = _.difference(keysJSON, keysXLS);
        return replaced.concat(missed, added).length > 0
            ? {
                replaced: {
                    fromSource: _.pick(resourcesXLS, replaced),
                    toTarget: _.pick(resourcesJSON, replaced)
                },
                added: _.pick(resourcesXLS, added),
                missed: _.pick(resourcesJSON, missed)
            }
            : null;
    };
    AdapterXLS2JSON.prototype.synchronize = function (keys) {
        if (keys === void 0) { keys = {}; }
        var workbook = XLSX.readFile(this.options.sourceFile);
        var worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        var worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);
        var product = this.options.products[0];
        var resourcesXLS = _.reduce(worksheetJSON, function (resources, current) {
            resources[current.__EMPTY] = current[product];
            return resources;
        }, {});
        var keysXLS = _.keys(resourcesXLS);
        var resourcesJSON = JSON.parse(fs.readFileSync(this.options.targetFile, { encoding: 'utf8' }));
        var keysJSON = _.keys(resourcesJSON);
        // replaced
        for (var _i = 0, _a = keys.replaced; _i < _a.length; _i++) {
            var key = _a[_i];
            resourcesJSON[key] = resourcesXLS[key];
        }
        // added
        for (var _b = 0, _c = keys.added; _b < _c.length; _b++) {
            var key = _c[_b];
            resourcesJSON[key] = resourcesXLS[key];
        }
        // missed
        var allMissed = _.difference(keysJSON, keysXLS);
        var removed = _.difference(allMissed, keys.missed);
        resourcesJSON = _.omit(resourcesJSON, removed);
        var contentFile = JSON.stringify(resourcesJSON, null, COUNT_SPACES_INDENT_JSON);
        fs.writeFileSync(this.options.targetFile, contentFile, { encoding: 'utf8' });
        return true;
    };
    AdapterXLS2JSON.prototype.takeOut = function (keys, fileName) {
        var workbook = XLSX.readFile(this.options.sourceFile);
        var worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        var worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);
        var product = this.options.products[0];
        var resourcesXLS = _.reduce(worksheetJSON, function (resources, current) {
            resources[current.__EMPTY] = current[product];
            return resources;
        }, {});
        var keysXLS = _.keys(resourcesXLS);
        var resourcesJSON = JSON.parse(fs.readFileSync(this.options.targetFile, { encoding: 'utf8' }));
        var keysJSON = _.keys(resourcesJSON);
        var newJSON = {};
        // replaced
        for (var _i = 0, _a = keys.replaced; _i < _a.length; _i++) {
            var key = _a[_i];
            newJSON[key] = resourcesXLS[key];
        }
        // added
        for (var _b = 0, _c = keys.added; _b < _c.length; _b++) {
            var key = _c[_b];
            newJSON[key] = resourcesXLS[key];
        }
        // missed
        var allMissed = _.difference(keysJSON, keysXLS);
        var removed = _.difference(allMissed, keys.missed);
        resourcesJSON = _.omit(resourcesJSON, removed);
        for (var _d = 0, _e = keys.missed; _d < _e.length; _d++) {
            var key = _e[_d];
            newJSON[key] = resourcesJSON[key];
        }
        var contentFile = JSON.stringify(newJSON, null, COUNT_SPACES_INDENT_JSON);
        fs.writeFileSync(fileName, contentFile, { encoding: 'utf8' });
        return true;
    };
    return AdapterXLS2JSON;
}(BaseAdapterXLS_1.BaseAdapterXLS));
exports.AdapterXLS2JSON = AdapterXLS2JSON;

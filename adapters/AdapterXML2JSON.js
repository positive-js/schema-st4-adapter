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
var HtmlEntitities = require("html-entities");
var _ = require("lodash"); // tslint:disable-line import-blacklist
var mkdir = require("mkdirpsync");
var xpath = require("xpath");
var workflow_1 = require("../workflow");
var BaseAdapterXML_1 = require("./BaseAdapterXML");
var COUNT_SPACES_INDENT_JSON = 4;
var AdapterXML2JSON = /** @class */ (function (_super) {
    __extends(AdapterXML2JSON, _super);
    function AdapterXML2JSON(options) {
        var _this = _super.call(this, options, workflow_1.OperationSideEnum.SOURCE) || this;
        _this.options = options;
        _this.entities = new HtmlEntitities.XmlEntities();
        return _this;
    }
    AdapterXML2JSON.prototype.convert = function () {
        var _this = this;
        var xml = fs.readFileSync(this.options.sourceFile, 'utf8');
        var document = new this.dom().parseFromString(xml);
        // tslint:disable-next-line no-http-string
        var select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node' });
        for (var _i = 0, _a = this.options.languages; _i < _a.length; _i++) {
            var language = _a[_i];
            var _loop_1 = function (product) {
                var foundProducts = select("//n:Data-Variables.XML/n:Value[@n:Aspect=\"" + language + "\"]/" +
                    "n:Entry/variables/h/e/text()", document);
                var indexColumnProduct = _.findIndex(foundProducts, function (item) { return item.data === product; });
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
                    var basePath = workflow_1.getPath(this_1.options.targetFile) + "/" + product + "/" + language;
                    var baseFileName = workflow_1.getFileName(this_1.options.targetFile);
                    mkdir(basePath);
                    fs.writeFileSync(basePath + "/" + baseFileName, contentFile, { encoding: 'utf8' });
                }
                else {
                    throw new Error("Pointed product not found in selected language " + language);
                }
            };
            var this_1 = this;
            for (var _b = 0, _c = this.options.products; _b < _c.length; _b++) {
                var product = _c[_b];
                _loop_1(product);
            }
        }
    };
    AdapterXML2JSON.prototype.synchronize = function () {
        //
    };
    return AdapterXML2JSON;
}(BaseAdapterXML_1.BaseAdapterXML));
exports.AdapterXML2JSON = AdapterXML2JSON;

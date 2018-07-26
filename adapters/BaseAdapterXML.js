"use strict";
exports.__esModule = true;
var fs = require("fs");
var _ = require("lodash"); // tslint:disable-line import-blacklist
var xmldom = require("xmldom");
var xpath = require("xpath");
var workflow_1 = require("../workflow");
var BaseAdapterXML = /** @class */ (function () {
    function BaseAdapterXML(options, side) {
        this.options = options;
        this.side = side;
        this.dom = xmldom.DOMParser;
    }
    BaseAdapterXML.prototype.convert = function () {
        //
    };
    BaseAdapterXML.prototype.synchronize = function () {
        //
    };
    BaseAdapterXML.prototype.getDiffs = function () {
        //
    };
    BaseAdapterXML.prototype.getLanguages = function () {
        var xml = fs.readFileSync(this.getPathToBaseFile(), 'utf8');
        var document = new this.dom().parseFromString(xml);
        // tslint:disable-next-line no-http-string
        var select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node' });
        var languages = select('//n:Data-Variables.XML/n:Value/@n:Aspect', document);
        return languages.map(function (attribute) { return attribute.value; });
    };
    BaseAdapterXML.prototype.getProducts = function () {
        var xml = fs.readFileSync(this.getPathToBaseFile(), 'utf8');
        var document = new this.dom().parseFromString(xml);
        // tslint:disable-next-line no-http-string
        var select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node' });
        return _.uniq(select("//n:Data-Variables.XML/n:Value/n:Entry/variables/h/e/text()", document)
            .map(function (text) { return text.data; }));
    };
    BaseAdapterXML.prototype.getAvailableLanguages = function (products) {
        var xml = fs.readFileSync(this.getPathToBaseFile(), 'utf8');
        var document = new this.dom().parseFromString(xml);
        // tslint:disable-next-line no-http-string
        var select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node' });
        var rawLanguages = [];
        for (var _i = 0, products_1 = products; _i < products_1.length; _i++) {
            var product = products_1[_i];
            var languages = select("//n:Data-Variables.XML/n:Value[.//e=\"" + product + "\"]/@n:Aspect", document);
            rawLanguages = rawLanguages.concat(languages);
        }
        return _.uniq(rawLanguages.map(function (attribute) { return attribute.value; }));
    };
    BaseAdapterXML.prototype.getPathToBaseFile = function () {
        return this.side === workflow_1.OperationSideEnum.SOURCE
            ? this.options.sourceFile
            : this.options.targetFile;
    };
    return BaseAdapterXML;
}());
exports.BaseAdapterXML = BaseAdapterXML;

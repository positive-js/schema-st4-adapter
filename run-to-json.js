"use strict";
exports.__esModule = true;
var xpath = require("xpath");
var xmldom = require("xmldom");
var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var HtmlEntitities = require("html-entities");
var entities = new HtmlEntitities.XmlEntities();
var dom = xmldom.DOMParser;
function mkdirSyncRecursive(directory) {
    var path = directory.replace(/\/$/, '').split('/');
    for (var i = 1; i <= path.length; i++) {
        var segment = path.slice(0, i).join('/');
        if (segment && !fs.existsSync(segment)) {
            fs.mkdirSync(segment);
        }
        ;
    }
}
var runToJSON = function (options) {
    if (!options.input || !options.output) {
        throw new Error('Path to input XML file or output directory are not defined');
    }
    if (!options.product) {
        throw new Error('Product is not defined');
    }
    var xml = fs.readFileSync(options.input, 'utf8');
    var document = new dom().parseFromString(xml);
    var select = xpath.useNamespaces({ 'n': "http://www.schema.de/2004/ST4/XmlImportExport/Node" });
    if (!options.languages || !options.languages.length) {
        var languages = select('//n:Data-Variables.XML/n:Value/@n:Aspect', document);
        options.languages = languages.map(function (attribute) { return attribute.value; });
    }
    _.forEach(options.languages, function (language) {
        var pathToLanguage = path.resolve(options.output) + "/" + language;
        mkdirSyncRecursive(pathToLanguage);
        var products = select("//n:Data-Variables.XML/n:Value[@n:Aspect=\"" + language + "\"]/n:Entry/variables/h/e/text()", document);
        var indexColumnProduct = _.findIndex(products, function (product) { return product.data === options.product; });
        var isProductFound = indexColumnProduct !== -1;
        if (isProductFound) {
            var rows = select("//n:Data-Variables.XML/n:Value[@n:Aspect=\"" + language + "\"]/n:Entry/variables/r", document);
            var data_1 = {};
            _.forEach(rows, function (row) {
                var key = select('t/text()', row);
                var value = select("e[position()=" + (indexColumnProduct + 1) + "]/text()", row);
                var resultKey = key[0] ? entities.decode(key[0].data) : '';
                var resultValue = value[0] ? value[0].data : '';
                data_1[resultKey.toUpperCase()] = resultValue;
            });
            var contentFile = JSON.stringify(data_1, null, 4);
            var fileName = path.basename(options.input, path.extname(options.input));
            var pathToFileLanguage = pathToLanguage + "/" + fileName + ".json";
            fs.writeFileSync(pathToFileLanguage, contentFile, { encoding: 'utf8' });
        }
        else {
            throw new Error("Pointed product not found in selected language " + language);
        }
    });
};
exports.runToJSON = runToJSON;

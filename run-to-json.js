"use strict";
exports.__esModule = true;
var fs = require("fs");
var HtmlEntitities = require("html-entities");
var _ = require("lodash");
var xmldom = require("xmldom");
var xpath = require("xpath");
var entities = new HtmlEntitities.XmlEntities();
var dom = xmldom.DOMParser;
function mkdirSyncRecursive(directory) {
    var location = directory.replace(/\/$/, '').split('/');
    for (var i = 1; i <= location.length; i++) {
        var segment = location.slice(0, i).join('/');
        if (segment && !fs.existsSync(segment)) {
            fs.mkdirSync(segment);
        }
    }
}
var runToJSON = function (options) {
    if (!options.sourceFile || !options.targetFile) {
        throw new Error('Path to source file or target file are not defined');
    }
    if (!options.product) {
        throw new Error('Product is not defined');
    }
    var xml = fs.readFileSync(options.sourceFile, 'utf8');
    var document = new dom().parseFromString(xml);
    // tslint:disable-next-line no-http-string
    var select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node' });
    if (!options.languages || !options.languages.length) {
        var languages = select('//n:Data-Variables.XML/n:Value/@n:Aspect', document);
        options.languages = languages.map(function (attribute) { return attribute.value; });
    }
    _.forEach(options.languages, function (language) {
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
                data_1[resultKey.toUpperCase()] = value[0] ? value[0].data : '';
            });
            var countSpacesInJSON = 4;
            var contentFile = JSON.stringify(data_1, null, countSpacesInJSON);
            // const fileName = path.basename(options.sourceFile, path.extname(options.sourceFile));
            // const pathToFileLanguage = `${pathToLanguage}/${fileName}.json`
            fs.writeFileSync(options.targetFile, contentFile, { encoding: 'utf8' });
        }
        else {
            throw new Error("Pointed product not found in selected language " + language);
        }
    });
};
exports.runToJSON = runToJSON;

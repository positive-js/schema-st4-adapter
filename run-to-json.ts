import * as fs from 'fs';
import * as HtmlEntitities from 'html-entities';
import * as _ from 'lodash';
import * as path from 'path';
import * as xmldom from 'xmldom';
import * as xpath from 'xpath';


const entities = new HtmlEntitities.XmlEntities();
const dom = xmldom.DOMParser;

function mkdirSyncRecursive(directory) {
    const location = directory.replace(/\/$/, '').split('/');

    for (let i = 1; i <= location.length; i++) {
        const segment = location.slice(0, i).join('/');

        if (segment && !fs.existsSync(segment)) {
            fs.mkdirSync(segment);
        }
    }
}

const runToJSON = (options) => {
    if (!options.sourceFile || !options.targetFile) {
        throw new Error('Path to source file or target file are not defined');
    }

    if (!options.product) {
        throw new Error('Product is not defined');
    }

    const xml = fs.readFileSync(options.sourceFile, 'utf8');
    const document = new dom().parseFromString(xml);
    // tslint:disable-next-line no-http-string
    const select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node'});

    if (!options.languages || !options.languages.length) {
        const languages = select('//n:Data-Variables.XML/n:Value/@n:Aspect', document);
        options.languages = languages.map((attribute: any) => attribute.value);
    }

    _.forEach(options.languages, (language) => {
        const products = select(`//n:Data-Variables.XML/n:Value[@n:Aspect="${language}"]/n:Entry/variables/h/e/text()`,
            document);
        const indexColumnProduct = _.findIndex(products, (product) => product.data === options.product);
        const isProductFound = indexColumnProduct !== -1;

        if (isProductFound) {
            const rows = select(`//n:Data-Variables.XML/n:Value[@n:Aspect="${language}"]/n:Entry/variables/r`,
                document);

            const data: any = {};
            _.forEach(rows, (row) => {
                const key: any = select('t/text()', row);
                const value: any = select(`e[position()=${indexColumnProduct + 1}]/text()`, row);
                const resultKey = key[0] ? entities.decode(key[0].data) : '';
                data[resultKey.toUpperCase()] = value[0] ? value[0].data : '';
            });

            const countSpacesInJSON = 4;
            const contentFile = JSON.stringify(data, null, countSpacesInJSON);

            // const fileName = path.basename(options.sourceFile, path.extname(options.sourceFile));
            // const pathToFileLanguage = `${pathToLanguage}/${fileName}.json`
            fs.writeFileSync(options.targetFile, contentFile, { encoding: 'utf8' });

        } else {
            throw new Error(`Pointed product not found in selected language ${language}`);
        }
    });
};

export { runToJSON };

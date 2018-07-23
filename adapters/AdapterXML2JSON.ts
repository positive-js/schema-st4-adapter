// tslint:disable underscore-consistent-invocation
import * as fs from 'fs';
import * as HtmlEntitities from 'html-entities';
import * as _ from 'lodash'; // tslint:disable-line import-blacklist
import * as mkdir from 'mkdirpsync';

import * as xpath from 'xpath';

import { getFileName, getPath, OperationSideEnum } from '../workflow';

import { IAdapter, IAdapterOptions } from './types';
import { BaseAdapterXML } from './BaseAdapterXML';


const COUNT_SPACES_INDENT_JSON = 4;


class AdapterXML2JSON extends BaseAdapterXML implements IAdapter {
    entities: any;

    constructor(protected options: IAdapterOptions) {
        super(options, OperationSideEnum.SOURCE);

        this.entities = new HtmlEntitities.XmlEntities();
    }

    convert() {
        const xml = fs.readFileSync(this.options.sourceFile, 'utf8');
        const document = new this.dom().parseFromString(xml);
        // tslint:disable-next-line no-http-string
        const select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node'});

        for (const language of this.options.languages) {
            for (const product of this.options.products) {
                const foundProducts = select(`//n:Data-Variables.XML/n:Value[@n:Aspect="${language}"]/` +
                    `n:Entry/variables/h/e/text()`, document);
                const indexColumnProduct = _.findIndex(foundProducts, (item) => item.data === product);
                const isProductFound = indexColumnProduct !== -1;

                if (isProductFound) {
                    const rows = select(`//n:Data-Variables.XML/n:Value[@n:Aspect="${language}"]/n:Entry/variables/r`,
                        document);

                    const data: any = {};
                    _.forEach(rows, (row) => {
                        const key: any = select('t/text()', row);
                        const value: any = select(`e[position()=${indexColumnProduct + 1}]/text()`, row);
                        const resultKey = key[0] ? this.entities.decode(key[0].data) : '';
                        data[resultKey.toUpperCase()] = value[0] ? value[0].data : '';
                    });

                    const contentFile = JSON.stringify(data, null, COUNT_SPACES_INDENT_JSON);

                    const basePath = `${getPath(this.options.targetFile)}/${product}/${language}`;
                    const baseFileName = getFileName(this.options.targetFile);

                    mkdir(basePath);
                    fs.writeFileSync(`${basePath}/${baseFileName}`, contentFile, { encoding: 'utf8' });

                } else {
                    throw new Error(`Pointed product not found in selected language ${language}`);
                }
            }
        }

    }

    synchronize() {
        //
    }
}

export { AdapterXML2JSON };

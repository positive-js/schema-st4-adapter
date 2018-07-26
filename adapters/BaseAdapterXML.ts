import * as fs from 'fs';
import * as _ from 'lodash'; // tslint:disable-line import-blacklist
import * as xmldom from 'xmldom';
import * as xpath from 'xpath';

import { OperationSideEnum } from '../workflow';

import { IAdapter, IAdapterOptions } from './types';


class BaseAdapterXML implements IAdapter {
    dom: any = xmldom.DOMParser;

    constructor(protected options: IAdapterOptions, private side: OperationSideEnum) { }

    convert() {
        //
    }

    synchronize() {
        //
    }

    getDiffs() {
        //
    }

    getLanguages(): string[] {
        const xml = fs.readFileSync(this.getPathToBaseFile(), 'utf8');
        const document = new this.dom().parseFromString(xml);
        // tslint:disable-next-line no-http-string
        const select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node' });
        const languages = select('//n:Data-Variables.XML/n:Value/@n:Aspect', document);

        return languages.map((attribute: any) => attribute.value);
    }

    getProducts(): string[] {
        const xml = fs.readFileSync(this.getPathToBaseFile(), 'utf8');
        const document = new this.dom().parseFromString(xml);
        // tslint:disable-next-line no-http-string
        const select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node' });

        return  _.uniq(select(`//n:Data-Variables.XML/n:Value/n:Entry/variables/h/e/text()`, document)
            .map((text: any) => text.data));
    }

    getAvailableLanguages(products: string[]) {
        const xml = fs.readFileSync(this.getPathToBaseFile(), 'utf8');
        const document = new this.dom().parseFromString(xml);
        // tslint:disable-next-line no-http-string
        const select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node' });
        let rawLanguages = [];

        for (const product of products) {
            const languages = select(`//n:Data-Variables.XML/n:Value[.//e="${product}"]/@n:Aspect`, document);

            rawLanguages = [...rawLanguages, ...languages];
        }

        return _.uniq(rawLanguages.map((attribute: any) => attribute.value));
    }

    private getPathToBaseFile() {
        return this.side === OperationSideEnum.SOURCE
            ? this.options.sourceFile
            : this.options.targetFile;
    }
}

export { BaseAdapterXML };

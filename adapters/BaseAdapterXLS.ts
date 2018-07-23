// tslint:disable underscore-consistent-invocation
import * as _ from 'lodash'; // tslint:disable-line import-blacklist
import * as XLSX from 'xlsx';

import { OperationSideEnum } from '../workflow';

import { IAdapter, IAdapterOptions } from './types';


class BaseAdapterXLS implements IAdapter {
    constructor(protected options: IAdapterOptions, private side: OperationSideEnum) {

    }

    convert() {
        //
    }

    synchronize() {
        //
    }

    getLanguages() {
        return [];
    }

    getProducts() {
        const workbook = XLSX.readFile(this.options.sourceFile);
        const worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        const worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);

        return _.filter(_.keys(worksheetJSON[0]), (column) => column !== '__EMPTY');
    }

    getAvailableLanguages(products: string[]) {
        return this.getLanguages();
    }
}

export { BaseAdapterXLS };

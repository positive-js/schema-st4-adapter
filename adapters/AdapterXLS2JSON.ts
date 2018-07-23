// tslint:disable underscore-consistent-invocation
import * as fs from 'fs';
import * as _ from 'lodash'; // tslint:disable-line import-blacklist
import * as mkdir from 'mkdirpsync';
import * as XLSX from 'xlsx';

import { getFileName, getPath, OperationSideEnum } from '../workflow';

import { IAdapter, IAdapterOptions } from './types';
import { BaseAdapterXLS } from './BaseAdapterXLS';


const COUNT_SPACES_INDENT_JSON = 4;


class AdapterXLS2JSON extends BaseAdapterXLS implements IAdapter {
    constructor(protected options: IAdapterOptions) {
        super(options, OperationSideEnum.SOURCE);
    }

    convert() {
        const workbook = XLSX.readFile(this.options.sourceFile);
        const worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        const worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);

        for (const product of this.options.products) {
            const data = _.reduce(worksheetJSON, (resources, current: any) => {
                resources[current.__EMPTY] = current[product];

                return resources;
            }, {});

            const contentFile = JSON.stringify(data, null, COUNT_SPACES_INDENT_JSON);

            const basePath = `${getPath(this.options.targetFile)}/${product}`;
            const baseFileName = getFileName(this.options.targetFile);

            mkdir(basePath);
            fs.writeFileSync(`${basePath}/${baseFileName}`, contentFile, {encoding: 'utf8'});
        }
    }

    synchronize() {
        //
    }
}

export { AdapterXLS2JSON };

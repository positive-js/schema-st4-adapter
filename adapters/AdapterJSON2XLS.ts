// tslint:disable underscore-consistent-invocation
import * as fs from 'fs';
import * as _ from 'lodash'; // tslint:disable-line import-blacklist
import * as XLSX from 'xlsx';

import { OperationSideEnum } from '../workflow';

import { IAdapter, IAdapterOptions } from './types';
import { BaseAdapterXLS } from './BaseAdapterXLS';


class AdapterJSON2XLS extends BaseAdapterXLS implements IAdapter {

    constructor(protected options: IAdapterOptions) {
        super(options, OperationSideEnum.TARGET);
    }

    convert() {
        const json = fs.readFileSync(this.options.targetFile, 'utf8');
        const dataJSON = JSON.parse(json);

        const data = _.map(_.keys(dataJSON), (key) => {
            return [
                key,
                dataJSON[key]
            ];
        });

        // manual format header
        data.unshift([undefined, this.options.products[0]]);

        const worksheet = XLSX.utils.aoa_to_sheet(data);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet);
        XLSX.writeFile(workbook, this.options.sourceFile);
    }

    synchronize() {
        //
    }
}

export { AdapterJSON2XLS };

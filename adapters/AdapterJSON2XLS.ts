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

    getDiffs() {
        const workbook = XLSX.readFile(this.options.targetFile);
        const worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        const worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);

        const product = this.options.products[0];
        const resourcesXLS = _.reduce(worksheetJSON, (resources, current: any) => {
            resources[current.__EMPTY] = current[product];

            return resources;
        }, {});
        const keysXLS = _.keys(resourcesXLS);

        const resourcesJSON = JSON.parse(fs.readFileSync(this.options.sourceFile, { encoding: 'utf8'}));
        const keysJSON = _.keys(resourcesJSON);

        const replaced = _.filter(_.intersection(keysXLS, keysJSON), (key) => resourcesJSON[key] != resourcesXLS[key]);
        const missed = _.difference(keysXLS, keysJSON);
        const added = _.difference(keysJSON, keysXLS);

        return [...replaced, ...missed, ...added].length > 0
            ? {
                replaced: {
                    fromSource: _.pick(resourcesJSON, replaced),
                    toTarget: _.pick(resourcesXLS, replaced)
                },
                added: _.pick(resourcesJSON, added),
                missed: _.pick(resourcesXLS, missed)
            }
            : null;
    }

    synchronize(keys: any = {}) {
        const workbook = XLSX.readFile(this.options.targetFile);
        const worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        const worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);

        const product = this.options.products[0];
        let resourcesXLS = _.reduce(worksheetJSON, (resources, current: any) => {
            resources[current.__EMPTY] = current[product];

            return resources;
        }, {});
        const keysXLS = _.keys(resourcesXLS);

        let resourcesJSON = JSON.parse(fs.readFileSync(this.options.sourceFile, { encoding: 'utf8'}));
        const keysJSON = _.keys(resourcesJSON);

        // replaced
        for (const key of keys.replaced) {
            resourcesXLS[key] = resourcesJSON[key];
        }

        // added
        for(const key of keys.added) {
            resourcesXLS[key] = resourcesJSON[key];
        }

        // missed
        const allMissed = _.difference(keysXLS, keysJSON);
        const removed = _.difference(allMissed, keys.missed);
        resourcesXLS = _.omit(resourcesXLS, removed);

        const data = _.map(_.keys(resourcesXLS), (key) => {
            return [
                key,
                resourcesXLS[key]
            ];
        });

        // manual format header
        data.unshift([undefined, this.options.products[0]]);

        const worksheetNew = XLSX.utils.aoa_to_sheet(data);
        const workbookNew = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbookNew, worksheetNew);
        XLSX.writeFile(workbookNew, this.options.targetFile);

        return true;
    }
}

export { AdapterJSON2XLS };

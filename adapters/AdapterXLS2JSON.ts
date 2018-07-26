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

    getDiffs() {
        const workbook = XLSX.readFile(this.options.sourceFile);
        const worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        const worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);

        const product = this.options.products[0];
        const resourcesXLS = _.reduce(worksheetJSON, (resources, current: any) => {
            resources[current.__EMPTY] = current[product];

            return resources;
        }, {});
        const keysXLS = _.keys(resourcesXLS);

        const resourcesJSON = JSON.parse(fs.readFileSync(this.options.targetFile, { encoding: 'utf8'}));
        const keysJSON = _.keys(resourcesJSON);

        const replaced = _.filter(_.intersection(keysXLS, keysJSON), (key) => resourcesJSON[key] != resourcesXLS[key]);
        const added = _.difference(keysXLS, keysJSON);
        const missed = _.difference(keysJSON, keysXLS);

        return [...replaced, ...missed, ...added].length > 0
            ? {
                replaced: {
                    fromSource: _.pick(resourcesXLS, replaced),
                    toTarget: _.pick(resourcesJSON, replaced)
                },
                added: _.pick(resourcesXLS, added),
                missed: _.pick(resourcesJSON, missed)
            }
            : null;
    }

    synchronize(keys: any = {}) {
        const workbook = XLSX.readFile(this.options.sourceFile);
        const worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        const worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);

        const product = this.options.products[0];
        const resourcesXLS = _.reduce(worksheetJSON, (resources, current: any) => {
            resources[current.__EMPTY] = current[product];

            return resources;
        }, {});
        const keysXLS = _.keys(resourcesXLS);

        let resourcesJSON = JSON.parse(fs.readFileSync(this.options.targetFile, { encoding: 'utf8'}));
        const keysJSON = _.keys(resourcesJSON);

        // replaced
        for (const key of keys.replaced) {
            resourcesJSON[key] = resourcesXLS[key];
        }

        // added
        for(const key of keys.added) {
            resourcesJSON[key] = resourcesXLS[key];
        }

        // missed
        const allMissed = _.difference(keysJSON, keysXLS);
        for(const key of allMissed) {
            const removed = _.difference(allMissed, keys.missed);
            resourcesJSON = _.omit(resourcesJSON, removed);
        }

        const contentFile = JSON.stringify(resourcesJSON, null, COUNT_SPACES_INDENT_JSON);

        fs.writeFileSync(this.options.targetFile, contentFile, {encoding: 'utf8'});

        return true;
    }
}

export { AdapterXLS2JSON };

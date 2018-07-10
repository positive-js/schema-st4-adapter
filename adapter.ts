import * as fs from 'fs';
import * as HtmlEntitities from 'html-entities';
import * as _ from 'lodash';
import * as xml2js from 'xml2js';
import * as xmldom from 'xmldom';
import * as xpath from 'xpath';
import * as XLSX from 'xlsx';


const KEY_ATTRIBUTES = '$';
const KEY_VALUE = '_';
const ASPECT_ATTR = 'n:Aspect';

const XIE_TAG = 'd:xie';
const SYSTEM_FOLDER_TAG = 'n:SystemFolder';
const FOLDER_TAG = 'n:Folder';
const VARIABLE_FOLDER_TAG = 'n:VariableFolder';
const VARIABLE_NODE_TAG = 'n:VariableNode';
const DATA_VARIABLES_XML_TAG = 'n:Data-Variables.XML';
const DATA_VARIABLES_LAYOUT_TAG = 'n:Data-Variables.Layout';
const VALUE_TAG = 'n:Value';
const ENTRY_TAG = 'n:Entry';
const HEADER_TAG = 'h';
const TERM_TAG = 't';
const ELEMENT_TAG = 'e';
const ROW_TAG = 'r';

const COUNT_SPACES_INDENT_JSON = 4;

interface IAdapterOptions {
    sourceFile: string;
    targetFile?: string;
    language?: string;
    product?: string;
}

interface IAdapter {
    unload(): void;

    synchronize(): void;

    getLanguages(): string[];

    getProducts(): string[];
}

class AdapterXML2JSON implements IAdapter {
    entities: any;
    dom: any;

    constructor(private options: IAdapterOptions) {
        this.entities = new HtmlEntitities.XmlEntities();
        this.dom = xmldom.DOMParser;
    }

    unload() {
        this.validation();

        const xml = fs.readFileSync(this.options.sourceFile, 'utf8');
        const document = new this.dom().parseFromString(xml);
        // tslint:disable-next-line no-http-string
        const select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node'});
        const language = this.options.language;

        const products = select(`//n:Data-Variables.XML/n:Value[@n:Aspect="${language}"]/n:Entry/variables/h/e/text()`,
            document);
        const indexColumnProduct = _.findIndex(products, (product) => product.data === this.options.product);
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

            fs.writeFileSync(this.options.targetFile, contentFile, { encoding: 'utf8' });

        } else {
            throw new Error(`Pointed product not found in selected language ${language}`);
        }
    }

    synchronize() {
        this.validation();

        const json = fs.readFileSync(this.options.targetFile, 'utf8');
        const dataJSON = JSON.parse(json);

        const parser = new xml2js.Parser();
        const xml = fs.readFileSync(this.options.sourceFile);

        parser.parseString(xml, (err, data) => {
            if (err) {
                throw err;
            }

            const folder = data[XIE_TAG][SYSTEM_FOLDER_TAG][0][FOLDER_TAG];
            const lastVariableFolder = this.getLastVariableFolder(folder);
            const variableNode = lastVariableFolder[0][VARIABLE_NODE_TAG];
            const dataVariablesXML = variableNode[0][DATA_VARIABLES_XML_TAG];
            const dataVariablesLayout = variableNode[0][DATA_VARIABLES_LAYOUT_TAG];
            const values = dataVariablesXML[0][VALUE_TAG];

            const selectedLanguage = _.find(values, (value) => {
                return value[KEY_ATTRIBUTES][ASPECT_ATTR] === this.options.language;
            });

            const variables = selectedLanguage[ENTRY_TAG][0].variables;
            const products = variables[0][HEADER_TAG];
            let rows = variables[0][ROW_TAG];

            const indexSelectedProduct = _.findIndex(products, (product) => {
                return product[ELEMENT_TAG][0][KEY_VALUE] === this.options.product;
            });

            const keys = _.keys(dataJSON);

            // skip removed
            rows = _.filter(rows, (row) => {
                return _.has(dataJSON, row[TERM_TAG][0][KEY_VALUE]);
            });

            let maxRowId = this.getLastRowId(rows);

            // changing existing and adding new
            for (const key of keys) {
                const row = this.getRowByKey(rows, key);

                if (row) {
                    row[ELEMENT_TAG][indexSelectedProduct][KEY_VALUE] = dataJSON[key];
                } else {
                    // add new translation key to rows
                    const newRow = {
                        [KEY_ATTRIBUTES]: {
                            id: ++maxRowId
                        },
                        [TERM_TAG]: [{
                            [KEY_VALUE]: key
                        }],
                        [ELEMENT_TAG]: _.fill(Array(products.length), {})
                    };
                    newRow[ELEMENT_TAG][indexSelectedProduct][KEY_VALUE] = dataJSON[key];
                    rows.push(newRow);

                    // add to layout
                    const entryLayout = dataVariablesLayout[0][ENTRY_TAG];
                    const rowsInfo = entryLayout[0].variablesLayout[0].rowInfo[0].row;
                    const newRowInfo = {
                        [KEY_ATTRIBUTES]: {
                            id: maxRowId
                        }
                    };
                    rowsInfo.push(newRowInfo);
                }
            }

            variables[0][ROW_TAG] = rows;

            const builder = new xml2js.Builder();
            const newXML = builder.buildObject(data);

            fs.writeFileSync(this.options.sourceFile, newXML);
        });
    }

    getLanguages(): string[] {
        const xml = fs.readFileSync(this.options.sourceFile, 'utf8');
        const document = new this.dom().parseFromString(xml);
        // tslint:disable-next-line no-http-string
        const select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node' });
        const languages = select('//n:Data-Variables.XML/n:Value/@n:Aspect', document);

        return languages.map((attribute: any) => attribute.value);
    }

    getProducts(): string[] {
        const xml = fs.readFileSync(this.options.sourceFile, 'utf8');
        const document = new this.dom().parseFromString(xml);
        // tslint:disable-next-line no-http-string
        const select = xpath.useNamespaces({ n: 'http://www.schema.de/2004/ST4/XmlImportExport/Node' });
        const products = select(`//n:Data-Variables.XML/n:Value[@n:Aspect="${this.options.language}"]/n:Entry/variables/h/e/text()`,
            document);

        return products.map((text: any) => text.data);
    }


    private validation() {
        if (!this.options.targetFile || !this.options.sourceFile) {
            throw new Error('Path to source file or target file are not defined');
        }

        if (!this.options.product) {
            throw new Error('Product is not defined');
        }

        if (!this.options.language) {
            throw new Error('Language is not defined');
        }
    }

    private getLastVariableFolder(folder) {
        if (folder[0]) {
            const variableFolder = folder[0][VARIABLE_FOLDER_TAG];

            if (variableFolder) {
                return this.getLastVariableFolder(variableFolder);
            } else {
                return folder;
            }
        } else {
            throw new Error('Not found folder');
        }
    }

    private getRowByKey(rows, key) {
        return _.find(rows, (row) => {
            return row[TERM_TAG][0][KEY_VALUE] === key;
        });
    }

    private getLastRowId(rows) {
        const baseDecimal = 10;

        return _.max(_.map(rows, (row) => _.parseInt(row[KEY_ATTRIBUTES].id, baseDecimal)));
    }
}

class AdapterXLS2JSON implements IAdapter {
    constructor(private options: IAdapterOptions) {
    }

    unload() {
        const workbook = XLSX.readFile(this.options.sourceFile);
        const worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        const worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);

        const data = _.reduce(worksheetJSON, (resources, current: any) => {
            resources[current.__EMPTY] = current[this.options.product];

            return resources;
        }, {});

        const contentFile = JSON.stringify(data, null, COUNT_SPACES_INDENT_JSON);

        fs.writeFileSync(this.options.targetFile, contentFile, { encoding: 'utf8' });
    }

    synchronize() {
        const json = fs.readFileSync(this.options.targetFile, 'utf8');
        const dataJSON = JSON.parse(json);

        const data = _.map(_.keys(dataJSON), (key) => {
            return [
                key,
                dataJSON[key]
            ];
        });

        // manual format header
        data.unshift([undefined, this.options.product]);

        const worksheet = XLSX.utils.aoa_to_sheet(data);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet);
        XLSX.writeFile(workbook, this.options.sourceFile);
    }

    getLanguages(): string[] {
        throw new Error('Not supported operation');
    }

    getProducts(): string[] {
        const workbook = XLSX.readFile(this.options.sourceFile);
        const worksheetXLSX = workbook.Sheets[workbook.SheetNames[0]];
        const worksheetJSON = XLSX.utils.sheet_to_json(worksheetXLSX);

        return _.filter(_.keys(worksheetJSON[0]), (column) => column !== '__EMPTY');
    }
}

export { IAdapter, AdapterXML2JSON, AdapterXLS2JSON, IAdapterOptions };

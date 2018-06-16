import * as fs from 'fs';
import * as _ from 'lodash';
import * as xml2js from 'xml2js';

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
const DATA_VARIABLES_TRANS_CHECKOUT_TAG = 'n:Data-Variables.trans.CheckOut';
const VALUE_TAG = 'n:Value';
const ENTRY_TAG = 'n:Entry'
const HEADER_TAG = 'h';
const TERM_TAG = 't';
const ELEMENT_TAG = 'e';
const ROW_TAG = 'r';


function validation(options) {
    if (!options.input || !options.output) {
        throw new Error('Path to input JSON file or output XML file are not defined');
    }

    if (!options.product) {
        throw new Error('Product is not defined');
    }

    if (!options.languages) {
        throw new Error('Languages is not defined');
    }
}

function getLastVariableFolder(folder) {
    if (folder[0]) {
        const variableFolder = folder[0][VARIABLE_FOLDER_TAG];

        if(variableFolder) {
            return getLastVariableFolder(variableFolder);
        } else {
            return folder;
        }
    } else {
        throw new Error('Not found folder');
    }
}

function getRowByKey(rows, key) {
    return _.find(rows, (row) => {
        return row[TERM_TAG][0][KEY_VALUE] === key;
    });
}

function getLastRowId(rows) {
   return _.max(_.map(rows, (row) => _.parseInt(row[KEY_ATTRIBUTES].id, 10)));
}

const runToXML = (options) => {
    validation(options);

    const json = fs.readFileSync(options.input, 'utf8');
    const dataJSON = JSON.parse(json);

    var parser = new xml2js.Parser();
    const xml = fs.readFileSync(options.output);

    parser.parseString(xml, (err, data) => {
        if (err) {
            throw err;
        }

        const folder = data[XIE_TAG][SYSTEM_FOLDER_TAG][0][FOLDER_TAG];
        const lastVariableFolder = getLastVariableFolder(folder);
        const variableNode = lastVariableFolder[0][VARIABLE_NODE_TAG];
        const dataVariablesXML = variableNode[0][DATA_VARIABLES_XML_TAG];
        const dataVariablesLayout = variableNode[0][DATA_VARIABLES_LAYOUT_TAG];
        const dataVariableCheckout = variableNode[0][DATA_VARIABLES_TRANS_CHECKOUT_TAG];
        const values = dataVariablesXML[0][VALUE_TAG];

        const selectedLanguage = _.find(values, (value) => {
            return value[KEY_ATTRIBUTES][ASPECT_ATTR] === options.languages[0];
        });

        const variables = selectedLanguage[ENTRY_TAG][0].variables;
        const products = variables[0][HEADER_TAG];
        let rows = variables[0][ROW_TAG];

        const indexSelectedProduct = _.findIndex(products, (product) => {
            return product[ELEMENT_TAG][0][KEY_VALUE] === options.product;
        });

        const keys = _.keys(dataJSON);

        // skip removed
        rows = _.filter(rows, (row) => {
            return _.has(dataJSON, row[TERM_TAG][0][KEY_VALUE]);
        });

        let maxRowId = getLastRowId(rows);
        // changing existing and adding new
        for(const key of _.keys(dataJSON)) {
            const row = getRowByKey(rows, key);

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

        fs.writeFileSync(options.output, newXML);
    });
};

export { runToXML };
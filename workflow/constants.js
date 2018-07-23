"use strict";
exports.__esModule = true;
exports.DIALOG_FILTERS = {
    ALL: {
        name: 'Exported from Schema-ST4 XML/XLS files or JSON files',
        extensions: ['xml', 'xls', 'json']
    },
    ONLY_XML: {
        name: 'Exported from Schema-ST4 XML files',
        extensions: ['xml']
    },
    ONLY_XLS: {
        name: 'Exported from Schema-ST4 XLS files',
        extensions: ['xls']
    },
    ONLY_JSON: {
        name: 'JSON files',
        extensions: ['json']
    }
};
var OperationSideEnum;
(function (OperationSideEnum) {
    OperationSideEnum["SOURCE"] = "source";
    OperationSideEnum["TARGET"] = "target";
})(OperationSideEnum = exports.OperationSideEnum || (exports.OperationSideEnum = {}));

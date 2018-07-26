export const DIALOG_FILTERS = {
    ALL: {
        name: 'Exported from Schema-ST4 XML/XLS files or JSON files',
        extensions: ['xml', 'xls', 'json']
    },

    ALL_FOR_SYNCHRONIZATION: {
        name: 'Exported from Schema-ST4 XLS files or JSON files',
        extensions: ['xls', 'json']
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

export enum OperationSideEnum {
    SOURCE = 'source',
    TARGET = 'target'
}

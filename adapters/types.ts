interface IAdapter {
    convert(): void;

    synchronize(keys?: any): any;

    takeOut?(keys: any, newProductName: string): any;

    getDiffs(): any;

    getLanguages(): string[];

    getProducts(): string[];

    getAvailableLanguages(products: string[]): string[];
}

interface IAdapterOptions {

    sourceFile: string;

    targetFile?: string;

    products?: string[];

    languages?: string[];
}

enum FileTypeEnum {
    XML = 'xml',
    XLS = 'xls',
    JSON = 'json'
}

enum OperationType {
    REPLACEMENT = 'replacement',
    SYNCHRONIZATION = 'synchronization'
}

export { IAdapter, IAdapterOptions, FileTypeEnum, OperationType };

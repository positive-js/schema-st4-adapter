interface IAdapter {
    convert(): void;

    synchronize(): void;

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


export { IAdapter, IAdapterOptions, FileTypeEnum };

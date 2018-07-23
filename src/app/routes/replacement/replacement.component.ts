import { Component, NgZone, OnInit, ViewEncapsulation } from '@angular/core';

import { ElectronService } from '../../providers/electron.service';
import { IAdapterOptions } from '../../../../adapters';


@Component({
    selector: 'app-replacement',
    templateUrl: './replacement.component.html',
    styleUrls: ['./replacement.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'replacement'
    }
})
export class ReplacementComponent implements OnInit {

    source: any;
    sourceOptions: any;
    target: any;
    targetOptions: any;

    availableLanguages: string[];

    selectedProducts: string[];
    selectedLanguages: string[];

    constructor(private electronService: ElectronService, private zone: NgZone) {
    }

    ngOnInit() {
        this.electronService.ipcRenderer.on('electron.source-loaded', (_event, file) => {
            this.zone.run(() => {
                this.source = file;
            });
        });

        this.electronService.ipcRenderer.on('electron.target-loaded', (_event, file) => {
            this.zone.run(() => {
                this.target = file;
            });
        });

        this.electronService.ipcRenderer.on('electron.source.options-loaded', (_event, options) => {
            this.zone.run(() => {
                this.sourceOptions = options;

                if (this.targetOptions) {
                    throw new Error('Both files exported from Schema-ST4. Current conversion not supported!');
                }
            });
        });

        this.electronService.ipcRenderer.on('electron.target.options-loaded', (_event, options) => {
            this.zone.run(() => {
                this.targetOptions = options;

                if (this.sourceOptions) {
                    throw new Error('Both files exported from Schema-ST4. Current conversion not supported!');
                }
            });
        });

        this.electronService.ipcRenderer.on('electron.replace.available-languages', (_event, languages) => {
            this.zone.run(() => {
                this.availableLanguages = languages;
            });
        });


    }

    onSelectSource() {
        const options = this.getAdapterOptions();

        options.sourceFile = null;

        this.electronService.ipcRenderer.send('client.replace.select-source', options);
    }

    onDropSource(file) {
        const options = this.getAdapterOptions();
        if (file) {
            options.sourceFile = file;
        }

        this.electronService.ipcRenderer.send('client.replace.select-source', options);
    }

    onSelectTarget() {
        const options = this.getAdapterOptions();

        options.targetFile = null;

        this.electronService.ipcRenderer.send('client.replace.select-target', options);
    }

    onDropTarget(file) {
        const options = this.getAdapterOptions();
        if (file) {
            options.targetFile = file;
        }

        this.electronService.ipcRenderer.send('client.replace.select-target', options);
    }

    canConvert() {
        const options: IAdapterOptions = this.getAdapterOptions();
        const allLanguages = this.getLanguages();
        const allProducts = this.getProducts();

        console.log('all', allLanguages, allProducts);

        return options.sourceFile && options.targetFile &&
            (allLanguages.length > 0 && options.languages && options.languages.length > 0
                || allLanguages.length === 0) &&
            (allProducts.length > 0 && options.products && options.products.length > 0
                || allProducts.length === 0);
    }

    convert() {
        this.electronService.ipcRenderer.send('client.replace.convert', this.getAdapterOptions());
    }

    onResetSource() {
        this.source = null;
        this.sourceOptions = null;
    }

    onResetTarget() {
        this.target = null;
        this.targetOptions = null;
    }

    onChangeSourceProducts(products) {
        this.sourceOptions.selectedProducts = products;

        this.electronService.ipcRenderer.send('client.replace.get-available-languages', this.getAdapterOptions());
    }

    onChangeSourceLanguages(languages) {
        this.sourceOptions.selectedLanguages = languages;
    }

    onChangeTargetProducts(products) {
        this.targetOptions.selectedProducts = products;

        this.electronService.ipcRenderer.send('client.replace.get-available-languages', this.getAdapterOptions());
    }

    onChangeTargetLanguages(languages) {
        this.targetOptions.selectedLanguages = languages;
    }

    private getLanguages() {
        if (this.sourceOptions) {
            return this.sourceOptions.languages;
        }

        if (!this.sourceOptions && this.targetOptions) {
            return this.targetOptions.languages;
        }

        return [];
    }

    private getProducts() {
        if (this.sourceOptions) {
            return this.sourceOptions.products;
        }

        if (!this.sourceOptions && this.targetOptions) {
            return this.targetOptions.products;
        }

        return [];
    }

    private getAdapterOptions() {
        const options: any = {
            sourceFile: this.source ? this.source.fullPath : null,
            targetFile: this.target ? this.target.fullPath : null,
            languages: [],
            products: []
        };

        if (this.sourceOptions) {
            options.languages = this.sourceOptions.selectedLanguages;
            options.products = this.sourceOptions.selectedProducts;
        }

        if (!this.sourceOptions && this.targetOptions) {
            options.languages = this.targetOptions.selectedLanguages;
            options.products = this.targetOptions.selectedProducts;
        }

        return options;
    }
}

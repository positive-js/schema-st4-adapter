import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';

import { ElectronService } from '../../providers/electron.service';
import { OperationType } from '../../types';


@Component({
    selector: 'conversion',
    templateUrl: './conversion.component.html',
    styleUrls: ['./conversion.component.scss']
})
export class ConversionComponent implements OnInit {

    @Input()
    operationType: OperationType  = OperationType.REPLACEMENT;

    @Output()
    onChangeOptions: EventEmitter<any> = new EventEmitter<any>();

    source: any;
    sourceOptions: any;
    target: any;
    targetOptions: any;

    availableLanguages: string[];

    constructor(private electronService: ElectronService, private zone: NgZone) {
    }

    ngOnInit() {
        this.electronService.ipcRenderer.on('electron.source-loaded', (_event, file) => {
            this.zone.run(() => {
                this.source = file;

                this.emitOnChangeOptions();
            });
        });

        this.electronService.ipcRenderer.on('electron.target-loaded', (_event, file) => {
            this.zone.run(() => {
                this.target = file;

                this.emitOnChangeOptions();
            });
        });

        this.electronService.ipcRenderer.on('electron.source.options-loaded', (_event, options) => {
            this.zone.run(() => {
                this.sourceOptions = options;

                this.emitOnChangeOptions();

                if (this.targetOptions) {
                    throw new Error('Both files exported from Schema-ST4. Current conversion not supported!');
                }
            });
        });

        this.electronService.ipcRenderer.on('electron.target.options-loaded', (_event, options) => {
            this.zone.run(() => {
                this.targetOptions = options;

                this.emitOnChangeOptions();

                if (this.sourceOptions) {
                    throw new Error('Both files exported from Schema-ST4. Current conversion not supported!');
                }
            });
        });

        this.electronService.ipcRenderer.on('electron.available-languages', (_event, languages) => {
            this.zone.run(() => {
                this.availableLanguages = languages;

                this.emitOnChangeOptions();
            });
        });
    }

    onSelectSource() {
        const options = this.getConversionOptions();

        options.sourceFile = null;

        this.electronService.ipcRenderer.send(`client.${this.operationType}.select-source`, options);
    }

    onDropSource(file) {
        const options = this.getConversionOptions();
        if (file) {
            options.sourceFile = file;
        }

        this.electronService.ipcRenderer.send(`client.${this.operationType}.select-source`, options);
    }

    onSelectTarget() {
        const options = this.getConversionOptions();

        options.targetFile = null;

        this.electronService.ipcRenderer.send(`client.${this.operationType}.select-target`, options);
    }

    onDropTarget(file) {
        const options = this.getConversionOptions();
        if (file) {
            options.targetFile = file;
        }

        this.electronService.ipcRenderer.send(`client.${this.operationType}.select-target`, options);
    }

    onResetSource() {
        this.source = null;
        this.sourceOptions = null;

        this.emitOnChangeOptions();
    }

    onResetTarget() {
        this.target = null;
        this.targetOptions = null;

        this.emitOnChangeOptions();
    }

    onChangeSourceProducts(products) {
        this.sourceOptions.selectedProducts = products;

        this.electronService.ipcRenderer.send('client.get-available-languages', this.getConversionOptions());

        this.emitOnChangeOptions();
    }

    onChangeSourceLanguages(languages) {
        this.sourceOptions.selectedLanguages = languages;

        this.emitOnChangeOptions();
    }

    onChangeTargetProducts(products) {
        this.targetOptions.selectedProducts = products;

        this.electronService.ipcRenderer.send('client.get-available-languages', this.getConversionOptions());

        this.emitOnChangeOptions();
    }

    onChangeTargetLanguages(languages) {
        this.targetOptions.selectedLanguages = languages;

        this.emitOnChangeOptions();
    }

    private getConversionOptions() {
        const options: any = {
            sourceFile: this.source ? this.source.fullPath : null,
            targetFile: this.target ? this.target.fullPath : null,
            languages: [],
            products: [],
            availableLanguages: this.availableLanguages
        };

        if (this.sourceOptions) {
            options.languages = this.sourceOptions.selectedLanguages;
            options.products = this.sourceOptions.selectedProducts;
            options.allLanguages = this.sourceOptions.languages;
            options.allProducts = this.sourceOptions.products;
        }

        if (!this.sourceOptions && this.targetOptions) {
            options.languages = this.targetOptions.selectedLanguages;
            options.products = this.targetOptions.selectedProducts;
            options.allLanguages = this.targetOptions.languages;
            options.allProducts = this.targetOptions.products;
        }

        return options;
    }

    private emitOnChangeOptions() {
        const options = this.getConversionOptions();

        this.onChangeOptions.emit(options);
    }
}

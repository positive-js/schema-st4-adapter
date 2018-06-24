import { Component, NgZone, OnInit } from '@angular/core';

import { ElectronService } from '../../providers/electron.service';


enum EXTENSIONS {
    XML = 'xml',
    XLS = 'xls'
}

@Component({
    selector: 'app-conversion',
    templateUrl: './conversion.component.html',
    styleUrls: ['./conversion.component.scss']
})
export class ConversionComponent implements OnInit {
    sourceFile: string;
    targetFile: string;
    languages: string[];
    selectedLanguage: string;
    products: string[];
    selectedProduct: string;
    extension: string;

    constructor(private electronService: ElectronService, private zone: NgZone) { }

    ngOnInit() {
        this.electronService.ipcRenderer.on('electron.languages-loaded', (_event, languages) => {
            this.zone.run(() => {
                this.languages = languages;
            });
        });

        this.electronService.ipcRenderer.on('electron.products-loaded', (_event, products) => {
            this.zone.run(() => {
                this.products = products;
            });
        });

        this.electronService.ipcRenderer.on('electron.source-loaded', (_event, data) => {
            this.zone.run(() => {
                this.sourceFile = data.sourceFile;
                this.extension = data.extension;
                this.reset();
            });
        });

        this.electronService.ipcRenderer.on('electron.target-loaded', (_event, targetFile) => {
            this.zone.run(() => {
                this.targetFile = targetFile;
            });
        });
    }

    selectSourceFile() {
        this.electronService.ipcRenderer.send('client.select-source');
    }

    selectTargetFile() {
        this.electronService.ipcRenderer.send('client.select-target');
    }

    onChangeLanguage() {
        this.electronService.ipcRenderer.send('client.select-language', this.sourceFile, this.selectedLanguage);
    }

    unload() {
        this.electronService.ipcRenderer.send('client.unload', {
            targetFile: this.targetFile,
            sourceFile: this.sourceFile,
            language: this.selectedLanguage,
            product: this.selectedProduct
        });
    }

    synchronize() {
        this.electronService.ipcRenderer.send('client.synchronize', {
            targetFile: this.targetFile,
            sourceFile: this.sourceFile,
            language: this.selectedLanguage,
            product: this.selectedProduct
        });
    }

    canSelectLanguage() {
        return this.extension === EXTENSIONS.XML && this.sourceFile && this.targetFile;
    }

    canSelectProduct() {
        return (this.selectedLanguage && this.extension === EXTENSIONS.XML) ||
            (this.sourceFile && this.extension !== EXTENSIONS.XML);
    }

    canUnloadAndSynchronize() {
        return (this.extension === EXTENSIONS.XML && this.selectedLanguage && this.selectedProduct) ||
            (this.extension === EXTENSIONS.XLS && this.selectedProduct);
    }

    canShowLanguages() {
        return this.extension === EXTENSIONS.XML;
    }

    private reset() {
        this.selectedLanguage = null;
        this.selectedProduct = null;
    }

}

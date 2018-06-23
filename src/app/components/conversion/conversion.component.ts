import { Component, NgZone, OnInit } from '@angular/core';

import { ElectronService } from '../../providers/electron.service';


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

        this.electronService.ipcRenderer.on('electron.source-loaded', (_event, sourceFile) => {
            this.zone.run(() => {
                this.sourceFile = sourceFile;
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

    private reset() {
        this.selectedLanguage = null;
        this.selectedProduct = null;
    }

}

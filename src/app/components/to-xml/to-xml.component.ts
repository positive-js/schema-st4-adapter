import { Component, OnInit, NgZone } from '@angular/core';

import { ElectronService } from '../../providers/electron.service';


@Component({
    selector: 'app-to-xml',
    templateUrl: './to-xml.component.html',
    styleUrls: ['./to-xml.component.scss']
})
export class ToXmlComponent implements OnInit {
    selectedLanguage: string;
    languages: string[];

    selectedProduct: string;
    products: string[];

    xmlFile: string;
    jsonFile: string;

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

        this.electronService.ipcRenderer.on('electron.xml-loaded', (_event, xmlFile) => {
            this.zone.run(() => {
                this.xmlFile = xmlFile;
                this.reset();
            });
        });

        this.electronService.ipcRenderer.on('electron.json-loaded', (_event, jsonFile) => {
            this.zone.run(() => {
                this.jsonFile = jsonFile;
            });
        });
    }

    reset() {
        this.selectedLanguage = null;
        this.selectedProduct = null;
    }

    selectInput() {
        this.electronService.ipcRenderer.send('client.select-json');
    }

    selectOutput() {
        this.electronService.ipcRenderer.send('client.select-xml');
    }

    onChangeLanguage() {
        this.electronService.ipcRenderer.send('client.select-language', this.xmlFile, this.selectedLanguage);
    }

    convertToXML() {
        this.electronService.ipcRenderer.send('client.convert-from-json', {
            input: this.jsonFile,
            output: this.xmlFile,
            languages: [ this.selectedLanguage ],
            product: this.selectedProduct
        });
    }
}

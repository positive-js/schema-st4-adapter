import { Component, OnInit, NgZone } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';

@Component({
    selector: 'app-to-json',
    templateUrl: './to-json.component.html',
    styleUrls: ['./to-json.component.scss']
})
export class ToJsonComponent implements OnInit {
    selectedLanguage: string;
    languages: string[];

    selectedProduct: string;
    products: string[];

    xmlFile: string;

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
            });
        });
    }

    selectInput() {
        this.electronService.ipcRenderer.send('client.select-xml');
    }

    onChangeLanguage() {
        this.electronService.ipcRenderer.send('client.select-language', this.selectedLanguage);
    }

    onChangeProduct() {
        this.electronService.ipcRenderer.send('client.select-product', this.selectedProduct);
    }

    convertToJSON() {
        this.electronService.ipcRenderer.send('client.convert-to-json');
    }
}

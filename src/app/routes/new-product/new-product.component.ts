import { Component, Input, NgZone, OnInit } from '@angular/core';

import { ElectronService } from '../../providers/electron.service';


@Component({
    selector: 'app-new-product',
    templateUrl: './new-product.component.html',
    styleUrls: ['./new-product.component.scss']
})
export class NewProductComponent implements OnInit {

    @Input()
    data: any = {};

    productName: string;


    constructor(private electronService: ElectronService, private zone: NgZone) {
    }

    ngOnInit() {
        this.electronService.ipcRenderer.on('electron.diffs.resources', (_event, data) => {
            this.zone.run(() => {
                this.data = data;
            });
        });

        this.electronService.ipcRenderer.send('client.diffs.get-resources');
    }

    add() {
        this.electronService.ipcRenderer.send('client.diffs.add-to-new-product.apply', this.data.keys, this.productName);
    }

    back() {
        this.electronService.ipcRenderer.send('client.diffs.add-to-new-product.cancel');
    }

    get countResources() {
        return this.data.keys.replaced.length + this.data.keys.added.length + this.data.keys.missed.length;
    }

    get canAdd() {
        return this.productName;
    }
}

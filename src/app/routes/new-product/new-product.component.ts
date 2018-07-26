import { Component, NgZone, OnInit } from '@angular/core';

import { ElectronService } from '../../providers/electron.service';


@Component({
    selector: 'app-new-product',
    templateUrl: './new-product.component.html',
    styleUrls: ['./new-product.component.scss']
})
export class NewProductComponent implements OnInit {

    data: any;

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

    }

    back() {

    }

    get allKeys() {
        return [...this.data.keys.replaced, ...this.data.keys.added, ...this.data.keys.missed];
    }
}

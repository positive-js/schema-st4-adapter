import { Component, NgZone, OnInit } from '@angular/core';
import pickBy from 'lodash-es/pickBy';
import keys from 'lodash-es/keys';

import { ElectronService } from '../../providers/electron.service';
import { FileTypeEnum } from '../../types';


@Component({
    selector: 'diffs-window',
    templateUrl: './diffs-window.component.html',
    styleUrls: ['./diffs-window.component.scss']
})
export class DiffsWindowComponent implements OnInit {

    data: any = {
        options: {},
        resources: {}
    };

    selection: any;
    selectedAllForHeader: boolean;
    indeterminateAllForHeader: boolean;
    selectedAllForContent: boolean;

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

    onChangeSelection(selection) {
        this.selection = selection;
    }

    onChangeSelectedAllFromContent(value) {
        this.selectedAllForHeader = value;
    }

    onChangeIndeterminateFromContent(value) {
        this.indeterminateAllForHeader = value;
    }

    onChangeSelectedAllFromHeader(value) {
        this.selectedAllForContent = value;
    }

    synchronize() {
        const keys = this.getKeys();
        this.electronService.ipcRenderer.send('client.diffs.apply', keys);
    }

    cancel() {
        this.electronService.ipcRenderer.send('client.diffs.cancel');
    }

    addToNewProduct() {
        const keys = this.getKeys();
        this.electronService.ipcRenderer.send('client.diffs.add-to-new-product', keys);
    }

    addToNewFile() {
        const keys = this.getKeys();
        this.electronService.ipcRenderer.send('client.diffs.add-to-new-product.apply', keys);
    }

    canAddToNewProduct() {
        const keys = this.getKeys();

        return keys.replaced && keys.replaced.length > 0 &&
            keys.added && keys.added.length > 0 &&
            keys.missed && keys.missed.length > 0;
    }

    get isXLS() {
        const file = this.data.options.targetFile;
        return file.substr(file.lastIndexOf('.') + 1) === FileTypeEnum.XLS;
    }

    get isJSON() {
        const file = this.data.options.targetFile;
        return file.substr(file.lastIndexOf('.') + 1) === FileTypeEnum.JSON;
    }

    private getKeys() {
        return {
            replaced: keys(pickBy(this.selection.replaced, (value) => value)),
            added: keys(pickBy(this.selection.added, (value) => value)),
            missed: keys(pickBy(this.selection.missed, (value) => value)),
        };
    }
}

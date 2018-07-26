import { Component } from '@angular/core';

import { ElectronService } from '../../providers/electron.service';
import { OperationType } from '../../types';


@Component({
    selector: 'app-synchronization',
    templateUrl: './synchronization.component.html',
    styleUrls: ['./synchronization.component.scss']
})
export class SynchronizationComponent {

    options: any;
    operationTypes: any = OperationType;

    constructor(private electronService: ElectronService) {
    }

    onChangeConversionOptions(options) {
        this.options = options;
    }

    canSynchronize() {
        return this.options && this.options.sourceFile && this.options.targetFile &&
            (this.options.allLanguages.length > 0 && this.options.languages && this.options.languages.length > 0
                || this.options.allLanguages.length === 0) &&
            (this.options.allProducts.length > 0 && this.options.products && this.options.products.length > 0
                || this.options.allProducts.length === 0);
    }

    synchronize() {
        this.electronService.ipcRenderer.send('client.synchronize', this.options);
    }
}

import { Component, ViewEncapsulation } from '@angular/core';

import { ElectronService } from '../../providers/electron.service';


@Component({
    selector: 'app-replacement',
    templateUrl: './replacement.component.html',
    styleUrls: ['./replacement.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'replacement'
    }
})
export class ReplacementComponent {
    options: any;

    constructor(private electronService: ElectronService) {
    }

    onChangeConversionOptions(options) {
        this.options = options;
    }

    canConvert() {
        return this.options && this.options.sourceFile && this.options.targetFile &&
            (this.options.allLanguages.length > 0 && this.options.languages && this.options.languages.length > 0
                || this.options.allLanguages.length === 0) &&
            (this.options.allProducts.length > 0 && this.options.products && this.options.products.length > 0
                || this.options.allProducts.length === 0);
    }

    convert() {
        this.electronService.ipcRenderer.send('client.convert', this.options);
    }
}

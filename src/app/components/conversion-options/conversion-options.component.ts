import filter from 'lodash-es/filter';
import indexOf from 'lodash-es/indexOf';
import keys from 'lodash-es/keys';
import remove from 'lodash-es/remove';

import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';


@Component({
    selector: 'conversion-options',
    templateUrl: './conversion-options.component.html',
    styleUrls: ['./conversion-options.component.scss']
})
export class ConversionOptionsComponent implements OnChanges {
    @Input()
    languages: string[];
    @Input()
    products: string[];
    @Input()
    selectedProducts: string[];
    @Input()
    selectedLanguages: string[];
    @Input()
    availableLanguages: string[];

    @Output()
    onChangeLanguages: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    onChangeProducts: EventEmitter<any> = new EventEmitter<any>();

    _selectedProducts: any = {};
    _selectedLanguages: any = {};

    constructor() {
    }

    ngOnChanges(changes) {
        if (changes.products && Array.isArray(changes.products.currentValue)) {
            if (this.products.length === 1) {
                this._selectedProducts[this.products[0]] = true;
                this.onChangeStateProducts();
            }
        }

        if (changes.languages && Array.isArray(changes.languages.currentValue)) {
            if (this.languages.length === 1) {
                this._selectedLanguages[this.languages[0]] = true;
                this.onChangeStateLanguages();
            }
        }

        if (changes.availableLanguages && Array.isArray(changes.availableLanguages.currentValue)) {
            remove(this._selectedLanguages, (value) => {
                return indexOf(this.availableLanguages, value) === -1;
            });
        }
    }

    onChangeStateLanguages() {
        this.onChangeLanguages.emit(filter(keys(this._selectedLanguages), (key) => this._selectedLanguages[key]));
    }

    onChangeStateProducts() {
        this.onChangeProducts.emit(filter(keys(this._selectedProducts), (key) => this._selectedProducts[key]));
    }

    isLanguageDisabled(language) {
        return indexOf(this.availableLanguages, language) === -1;
    }
}

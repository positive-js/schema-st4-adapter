import { Component, EventEmitter, Input, OnChanges, Output, ViewEncapsulation } from '@angular/core';
import { basename, dirname } from 'path';


@Component({
    selector: 'diffs-header',
    templateUrl: './diffs-header.component.html',
    styleUrls: ['./diffs-header.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'diffs-header'
    }
})
export class DiffsHeaderComponent implements OnChanges {

    @Input()
    sourceFile: string;
    @Input()
    targetFile: string;
    @Input()
    externalSelectedAll: boolean;
    @Input()
    externalIndeterminate: boolean;
    @Input()
    showCheckbox: boolean = true;

    @Output()
    onChangeSelectedAll: EventEmitter<any> = new EventEmitter<any>();

    selectedAll: boolean;


    constructor() {
    }

    ngOnChanges(changes) {
        if (changes.externalSelectedAll) {
            this.selectedAll = this.externalSelectedAll;
        }
    }

    getFileName(path = '') {
        return basename(path);
    }

    getPath(path = '') {
        return dirname(path);
    }

    onChangeState() {
        this.onChangeSelectedAll.emit(this.selectedAll);
    }
}

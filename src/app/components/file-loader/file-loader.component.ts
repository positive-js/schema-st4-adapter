import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';

import { ExtensionsFileEnum } from '../../types';


@Component({
    selector: 'file-loader',
    templateUrl: './file-loader.component.html',
    styleUrls: ['./file-loader.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'file-loader',
        // ondragover: 'return false',
        // ondragleave: 'return false',
        // ondragend: 'return false',
        '(drop)': 'onDrop($event)'
    }
})
export class FileLoaderComponent implements OnInit {
    @Input()
    title: string;

    @Input()
    file: any;


    @Output()
    onSelectFile: EventEmitter<string> = new EventEmitter();

    @Output()
    onDropFile: EventEmitter<string> = new EventEmitter();

    @Output()
    onReset: EventEmitter<string> = new EventEmitter();

    constructor() {
    }

    ngOnInit() {
    }

    get filename() {
        return this.file.name;
    }

    get folder() {
        return this.file.path;
    }

    onDrop(event) {
        event.preventDefault();

        if (event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0];
            const extension = file.substr(file.lastIndexOf('.') + 1);

            if (Object.values(ExtensionsFileEnum).includes(extension)) {
                this.onDropFile.emit(file.path);
            }
        }

        return false;
    }

    selectFile() {
        this.onSelectFile.emit();
    }

    clear() {
        this.onReset.emit(this.file);
    }
}

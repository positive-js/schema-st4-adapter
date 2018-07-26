import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

import { FileTypeEnum } from '../../types';


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
export class FileLoaderComponent {
    @Input()
    header: string;
    @Input()
    file: any;

    @Output()
    onSelectFile: EventEmitter<string> = new EventEmitter();
    @Output()
    onDropFile: EventEmitter<string> = new EventEmitter();
    @Output()
    onReset: EventEmitter<string> = new EventEmitter();

    constructor() {
        //
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
            const extension = file.name.substr(file.name.lastIndexOf('.') + 1);

            if (Object.values(FileTypeEnum).includes(extension)) {
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

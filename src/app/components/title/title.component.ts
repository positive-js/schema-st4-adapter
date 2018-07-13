import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as electron from 'electron';


@Component({
    selector: 'app-title',
    templateUrl: './title.component.html',
    styleUrls: ['./title.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'app-title'
    }
})
export class TitleComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

    close() {
        const currentWindow = electron.remote.getCurrentWindow();
        currentWindow.close();
    }
}

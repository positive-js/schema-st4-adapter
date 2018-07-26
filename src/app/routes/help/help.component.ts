import { Component, OnInit, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'help'
    }
})
export class HelpComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}

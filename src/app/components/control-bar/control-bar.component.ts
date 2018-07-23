import { Component, OnInit, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'control-bar',
    templateUrl: './control-bar.component.html',
    styleUrls: ['./control-bar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'control-bar'
    }
})
export class ControlBarComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}

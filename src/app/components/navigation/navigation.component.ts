import { Component, OnInit, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'navigation'
    }
})

export class NavigationComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}

import { Component, OnInit } from '@angular/core';


@Component({
    selector: 'navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
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

import { Component, OnInit, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'app-recent-actions',
    templateUrl: './recent-actions.component.html',
    styleUrls: ['./recent-actions.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'recent-actions'
    }
})
export class RecentActionsComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}

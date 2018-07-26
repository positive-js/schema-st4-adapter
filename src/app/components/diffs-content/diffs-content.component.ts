import every from 'lodash-es/every';
import keys from 'lodash-es/keys';
import some from 'lodash-es/some';
import mapValues from 'lodash-es/mapValues';

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'diffs-content',
    templateUrl: './diffs-content.component.html',
    styleUrls: ['./diffs-content.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'diffs-content'
    }
})
export class DiffsContentComponent implements OnChanges, OnInit {

    @Input()
    options: any;
    @Input()
    resources: any;

    @Input()
    externalSelectedAll: boolean;

    @Output()
    onChangeSelectedAll: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    onChangeIndeterminate: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    onChangeSelection: EventEmitter<any> = new EventEmitter<any>();


    objectKeys = Object.keys;

    stateReplacedKeys: boolean;
    indeterminateReplacedKeys: boolean;
    stateAddedKeys: boolean;
    indeterminateAddedKeys: boolean;
    stateMissedKeys: boolean;
    indeterminateMissedKeys: boolean;

    replaced: any;
    added: any;
    missed: any;

    constructor() {
    }

    ngOnInit() {

    }

    ngOnChanges(changes: any) {
        if (changes.resources && this.resources) {
            this.initSelection();
        }

        if (changes.externalSelectedAll) {
            this.selectReplaced(this.externalSelectedAll);
            this.selectAdded(this.externalSelectedAll);
            this.selectMissed(this.externalSelectedAll);
        }
    }

    selectReplaced(value = this.stateReplacedKeys) {
        const keysReplaced = keys(this.replaced);
        for (const key of keysReplaced) {
            this.replaced[key] = value;
        }

        this.recalculateStateGrouping();
        this.onChangeSelection.emit(this.getSelection());
    }

    selectMissed(value = this.stateMissedKeys) {
        const keysMissed = keys(this.missed);
        for (const key of keysMissed) {
            this.missed[key] = value;
        }

        this.recalculateStateGrouping();
        this.onChangeSelection.emit(this.getSelection());
    }

    selectAdded(value = this.stateAddedKeys) {
        const keysAdded = keys(this.added);
        for (const key of keysAdded) {
            this.added[key] = value;
        }

        this.recalculateStateGrouping();
        this.onChangeSelection.emit(this.getSelection());
    }

    onChangeItem() {
        this.recalculateStateGrouping();
        this.onChangeSelection.emit(this.getSelection());
    }

    get selectedAll() {
        const values = [
            this.stateReplacedKeys,
            this.stateAddedKeys,
            this.stateMissedKeys
        ];
        return every(values);
    }

    get indeterminate() {
        const indeterminates = [
            some(keys(this.replaced), (key) => this.replaced[key]),
            some(keys(this.added), (key) => this.added[key]),
            some(keys(this.missed), (key) => this.missed[key])
        ];

        return !this.selectedAll && some(indeterminates);
    }

    private  initSelection() {
        const resources = this.resources;
        if (resources.replaced && resources.replaced.fromSource) {
            this.replaced = mapValues(resources.replaced.fromSource, () => false);
        }

        if (resources.added) {
            this.added = mapValues(resources.added, () => false);
        }

        if (resources.missed) {
            this.missed = mapValues(resources.missed, () => false);
        }
    }

    private recalculateStateGrouping() {
        this.stateReplacedKeys = this.replaced && every(keys(this.replaced), (key) => this.replaced[key]);
        this.stateAddedKeys = this.added && every(keys(this.added), (key) => this.added[key]);
        this.stateMissedKeys = this.missed && every(keys(this.missed), (key) => this.missed[key]);

        this.indeterminateReplacedKeys = !this.stateReplacedKeys &&
            some(keys(this.replaced), (key) => this.replaced[key]);
        this.indeterminateAddedKeys = !this.stateAddedKeys &&
            some(keys(this.added), (key) => this.added[key]);
        this.indeterminateMissedKeys = !this.stateMissedKeys &&
            some(keys(this.missed), (key) => this.missed[key]);

        this.onChangeSelectedAll.emit(this.selectedAll);
        this.onChangeIndeterminate.emit(this.indeterminate);
    }

    private getSelection() {
       return {
            selectedAll: this.selectedAll,
            indeterminate: this.indeterminate,
            replaced: this.replaced,
            added: this.added,
            missed: this.missed
        }
    }
}

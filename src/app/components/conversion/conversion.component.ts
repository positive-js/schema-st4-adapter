import { Component, OnInit } from '@angular/core';

import { ElectronService } from '../../providers/electron.service';


enum ConversionType {
    TO_JSON = 'to-json',
    TO_XML = 'to-xml'
}

@Component({
    selector: 'app-conversion',
    templateUrl: './conversion.component.html',
    styleUrls: ['./conversion.component.scss']
})
export class ConversionComponent implements OnInit {
    conversionTypes: any = ConversionType;
    types: any[] = [
        { title: 'To JSON', value: ConversionType.TO_JSON },
        { title: 'To XML', value: ConversionType.TO_XML }
    ];
    selectedType: ConversionType = ConversionType.TO_JSON;

    constructor(private electronService: ElectronService) { }

    ngOnInit() {
        this.selectType(this.types[0].value);
    }

    selectType(selectedType) {
        this.selectedType = selectedType;
    }
}

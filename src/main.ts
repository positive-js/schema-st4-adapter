import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppConfig } from './app/app.config';
import { AppModule } from './app/app.module';


// tslint:disable-next-line blank-lines
if (AppConfig.production) {
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(AppModule, {
        preserveWhitespaces: false
    })
    // tslint:disable-next-line no-console
    .catch((err) => console.error(err));

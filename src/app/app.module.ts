import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { McButtonModule, McCheckboxModule } from '@ptsecurity/mosaic';
// tslint:disable:no-import-side-effect no-implicit-dependencies
import 'reflect-metadata';
import 'zone.js/dist/zone-mix';

import '../polyfills';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ControlBarComponent } from './components/control-bar/control-bar.component';
import { ConversionOptionsComponent } from './components/conversion-options/conversion-options.component';
import { ConversionComponent } from './components/conversion/conversion.component';
import { DiffsContentComponent } from './components/diffs-content/diffs-content.component';
import { DiffsHeaderComponent } from './components/diffs-header/diffs-header.component';
import { FileLoaderComponent } from './components/file-loader/file-loader.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { TitleComponent } from './components/title/title.component';
import { WebviewDirective } from './directives/webview.directive';
import { ElectronService } from './providers/electron.service';
import { DiffsWindowComponent } from './routes/diffs-window/diffs-window.component';
import { GeneralWindowComponent } from './routes/general-window/general-window.component';
import { HelpComponent } from './routes/help/help.component';
import { RecentActionsComponent } from './routes/recent-actions/recent-actions.component';
import { ReplacementComponent } from './routes/replacement/replacement.component';
import { SettingsComponent } from './routes/settings/settings.component';
import { SynchronizationComponent } from './routes/synchronization/synchronization.component';
import { NewProductComponent } from './routes/new-product/new-product.component';


// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
        WebviewDirective,
        NavigationComponent,
        ReplacementComponent,
        SettingsComponent,
        HelpComponent,
        RecentActionsComponent,
        TitleComponent,
        FileLoaderComponent,
        ControlBarComponent,
        ConversionOptionsComponent,
        SynchronizationComponent,
        ConversionComponent,
        GeneralWindowComponent,
        DiffsWindowComponent,
        DiffsHeaderComponent,
        DiffsContentComponent,
        NewProductComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        FlexLayoutModule,
        McButtonModule,
        McCheckboxModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (HttpLoaderFactory),
                deps: [HttpClient]
            }
        })
    ],
    providers: [ElectronService],
    bootstrap: [AppComponent]
})
export class AppModule {
}

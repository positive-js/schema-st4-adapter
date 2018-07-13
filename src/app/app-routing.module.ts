import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConversionComponent } from './routes/conversion/conversion.component';
import { HelpComponent } from './routes/help/help.component';
import { RecentActionsComponent } from './routes/recent-actions/recent-actions.component';
import { ReplacementComponent } from './routes/replacement/replacement.component';
import { SettingsComponent } from './routes/settings/settings.component';


const routes: Routes = [
    {
        path: 'recent-actions',
        component: RecentActionsComponent
    },
    {
        path: 'replace',
        component: ReplacementComponent
    },
    {
        path: 'sync',
        component: ConversionComponent
    },
    {
        path: 'settings',
        component: SettingsComponent
    },
    {
        path: 'help',
        component: HelpComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }

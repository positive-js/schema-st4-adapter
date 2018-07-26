import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DiffsWindowComponent } from './routes/diffs-window/diffs-window.component';
import { GeneralWindowComponent } from './routes/general-window/general-window.component';
import { HelpComponent } from './routes/help/help.component';
import { RecentActionsComponent } from './routes/recent-actions/recent-actions.component';
import { ReplacementComponent } from './routes/replacement/replacement.component';
import { SettingsComponent } from './routes/settings/settings.component';
import { SynchronizationComponent } from './routes/synchronization/synchronization.component';
import { NewProductComponent } from './routes/new-product/new-product.component';


const routes: Routes = [
    {
        path: '',
        redirectTo: 'general',
        pathMatch: 'full'
    },
    {
        path: 'general',
        component: GeneralWindowComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'replace'
            },
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
                component: SynchronizationComponent
            },
            {
                path: 'settings',
                component: SettingsComponent
            },
            {
                path: 'help',
                component: HelpComponent
            }
        ]
    },
    {
        path: 'diffs',
        component: DiffsWindowComponent
    },
    {
        path: 'new-product',
        component: NewProductComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule {
}

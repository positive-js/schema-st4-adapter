import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HelpComponent } from './routes/help/help.component';
import { RecentActionsComponent } from './routes/recent-actions/recent-actions.component';
import { ReplacementComponent } from './routes/replacement/replacement.component';
import { SettingsComponent } from './routes/settings/settings.component';
import { SynchronizationComponent } from './routes/synchronization/synchronization.component';


const routes: Routes = [
    {
        path: '',
        redirectTo: '/replace',
        pathMatch: 'full'
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
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }

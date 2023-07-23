import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TaxSettingsPage } from './tax-settings.page';

const routes: Routes = [
  {
    path: '',
    component: TaxSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TaxSettingsPageRoutingModule {}

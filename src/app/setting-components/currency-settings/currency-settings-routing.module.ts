import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CurrencySettingsPage } from './currency-settings.page';

const routes: Routes = [
  {
    path: '',
    component: CurrencySettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CurrencySettingsPageRoutingModule {}

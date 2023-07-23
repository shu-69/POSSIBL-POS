import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompanySettingsPage } from './company-settings.page';

const routes: Routes = [
  {
    path: '',
    component: CompanySettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanySettingsPageRoutingModule {}

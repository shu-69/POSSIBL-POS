import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrinterSettingsPage } from './printer-settings.page';

const routes: Routes = [
  {
    path: '',
    component: PrinterSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrinterSettingsPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewCustomersPage } from './view-customers.page';

const routes: Routes = [
  {
    path: '',
    component: ViewCustomersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewCustomersPageRoutingModule {}

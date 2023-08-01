import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewCustomersPageRoutingModule } from './view-customers-routing.module';

import { ViewCustomersPage } from './view-customers.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewCustomersPageRoutingModule
  ],
  declarations: [ViewCustomersPage]
})
export class ViewCustomersPageModule {}

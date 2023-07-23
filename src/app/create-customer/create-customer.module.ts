import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateCustomerPageRoutingModule } from './create-customer-routing.module';

import { CreateCustomerPage } from './create-customer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateCustomerPageRoutingModule
  ],
  declarations: [CreateCustomerPage]
})
export class CreateCustomerPageModule {}

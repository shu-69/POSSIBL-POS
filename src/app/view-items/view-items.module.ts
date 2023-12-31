import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewItemsPageRoutingModule } from './view-items-routing.module';

import { ViewItemsPage } from './view-items.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewItemsPageRoutingModule
  ],
  declarations: [ViewItemsPage]
})
export class ViewItemsPageModule {}

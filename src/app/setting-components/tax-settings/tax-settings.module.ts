import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TaxSettingsPageRoutingModule } from './tax-settings-routing.module';

import { TaxSettingsPage } from './tax-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TaxSettingsPageRoutingModule
  ],
  declarations: [TaxSettingsPage]
})
export class TaxSettingsPageModule {}

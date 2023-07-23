import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CurrencySettingsPageRoutingModule } from './currency-settings-routing.module';

import { CurrencySettingsPage } from './currency-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CurrencySettingsPageRoutingModule
  ],
  declarations: [CurrencySettingsPage]
})
export class CurrencySettingsPageModule {}

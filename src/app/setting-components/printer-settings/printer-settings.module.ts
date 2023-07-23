import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrinterSettingsPageRoutingModule } from './printer-settings-routing.module';

import { PrinterSettingsPage } from './printer-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrinterSettingsPageRoutingModule
  ],
  declarations: [PrinterSettingsPage]
})
export class PrinterSettingsPageModule {}

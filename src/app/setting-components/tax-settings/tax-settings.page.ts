import { Component, OnInit } from '@angular/core';
import { DB_PARAMS } from 'src/app/Params';
import { GeneralService } from 'src/app/services/general.service';
import { UserDetailsService } from 'src/app/services/userdetails.service';

export interface Tax {

  'taxType': 'gst' | 'vat',
  'valueInPercent' : number | string

}

@Component({
  selector: 'app-tax-settings',
  templateUrl: './tax-settings.page.html',
  styleUrls: ['./tax-settings.page.scss'],
})
export class TaxSettingsPage implements OnInit {

  selectedTaxTypeValue : 'gst' | 'vat' | undefined;

  constructor(public userDetails: UserDetailsService, private generalService: GeneralService) { }

  ngOnInit() {

    this.selectedTaxTypeValue = this.userDetails.getTax().taxType;

  }

  async updateTax(tax: Tax) {

    this.generalService.presentToast('Tax settings not applicable!', 'top', 'close-circle')

    return;

    if(!tax.taxType || tax.valueInPercent == '')
      return

    await this.generalService.updateSetting([{ column: DB_PARAMS.SETTINGS_TABLE_COLUMNS.TAX, value: `'${JSON.stringify(tax)}'` }]).then((data) => {

      if (data) {

        this.generalService.presentToast('Details updated successfully!', 'top', 'checkmark-circle')

        this.generalService.initSettings();

      } else {

        this.generalService.presentToast('Updating details failed!', 'top', 'close-circle')
      }

    }).catch((err) => {

      this.generalService.presentToast('Updating details failed!', 'top', 'close-circle')

    })

  }


}

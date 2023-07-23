import { Component, OnInit } from '@angular/core';
import { DB_PARAMS } from 'src/app/Params';
import { UserDetails } from 'src/app/UserDetails';
import { GeneralService } from 'src/app/services/general.service';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { UserDetailsService } from 'src/app/services/userdetails.service';

export interface Currency {

  'id': string,
  'currency': string,
  'country': string,
  'decimal': number,
  'symbol': string

}

@Component({
  selector: 'app-currency-settings',
  templateUrl: './currency-settings.page.html',
  styleUrls: ['./currency-settings.page.scss'],
})
export class CurrencySettingsPage implements OnInit {

  currencies: Currency[] = []

  constructor(private sqliteService: SQLiteService, private generalService: GeneralService, public userDetails: UserDetailsService) { }

  ngOnInit() {

    console.log(this.userDetails.getCurrency())

    this.sqliteService.executeQuery(`SELECT * FROM ` + DB_PARAMS.DB_TABLES_NAMES.CURRENCIES + `;`).then((data) => {

      console.log('Currencies', data)

      for (let i = 0; i < data.rows.length; i++) {

        let curr = data.rows.item(i);

        this.currencies.push(curr)

        console.log('Pushing', curr)

      }

    })

  }

  changeCurrency(e: any) {

    let currencyId = e.target.value;

    this.currencies.forEach(element => {

      if (currencyId == element.id) {

        this.updateCurrency(element);

      }

    });

  }

  async updateCurrency(currency: Currency) {

    await this.generalService.updateSetting([{ column: DB_PARAMS.SETTINGS_TABLE_COLUMNS.CURRENCY, value: `'${JSON.stringify(currency)}'` }]).then((data) => {

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

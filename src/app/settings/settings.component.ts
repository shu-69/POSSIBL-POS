import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonTabs } from '@ionic/angular';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';

export interface SettingsItem {

  'img': string,
  'label': string,
  'click': CallableFunction,
  'routerLink': string

}

export const Tabs = {

  'AccountSettings': '/settings/accounts',
  'PrinterSettings': '/settings/printer',
  'SyncSettings': '/settings/sync',
  'TaxSettings': '/settings/tax',
  'CurrencySettings': '/settings/currency',
  'CompanySettings': '/settings/company'

}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

  @ViewChild('tabs') tabs!: IonTabs;

  private settingsAnimation: AnimationItem | undefined;

  settingsAnimationOption: AnimationOptions = {
    path: '/assets/anims/settings.json',
  };

  settingsItem: SettingsItem[] = [

    // {
    //   'img': 'assets/iconspichon/color/icons8_account_100px_1.png',
    //   'label': 'Account',
    //   'click': () => {
    //   },
    //   'routerLink': Tabs.AccountSettings
    // },
    {
      'img': 'assets/iconspichon/color/icons8_sync_100px.png',
      'label': 'Sync',
      'click': () => {
     
      },
      'routerLink': Tabs.SyncSettings
    },
    // {
    //   'img': 'assets/iconspichon/color/icons8_printer_100px.png',
    //   'label': 'Printer',
    //   'click': () => {
       
    //   },
    //   'routerLink': Tabs.PrinterSettings
    // },
    {
      'img': 'assets/iconspichon/color/icons8_tax_100px.png',
      'label': 'Tax',
      'click': () => {
        
      },
      'routerLink': Tabs.TaxSettings
    },
    {
      'img': 'assets/iconspichon/color/icons8_currency_100px.png',
      'label': 'Currency',
      'click': () => {
       
      },
      'routerLink': Tabs.CurrencySettings 
    },
    {
      'img': 'assets/iconspichon/color/icons8_company_100px.png',
      'label': 'Company',
      'click': () => {
        
      },
      'routerLink': Tabs.CompanySettings 
    },

  ]

  constructor() { }

  ngOnInit() {

    this.removeSettingsAnimation();

  }

  removeSettingsAnimation() {

    setTimeout(() => {

      let animationContainer: HTMLElement = document.getElementById('settingsAnimationContainer')!;

      animationContainer.classList.add('inactive');

    }, 1000);

  }

  ionViewWillEnter() {

    StatusBar.show();
    StatusBar.setBackgroundColor({ color: '#FFFFFF' });
    StatusBar.setStyle({'style': Style.Light})

    //StatusBar.setOverlaysWebView({ overlay: false });  
  }

  settingAnimationCreated(animationItem: AnimationItem): void {
    this.settingsAnimation = animationItem;
  }

}

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';
import { Invoice1Component } from './invoice-pdf-components/invoice1/invoice1.component';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'splash-screen',
    pathMatch: 'full'
  },
  {
    path: 'splash-screen',
    loadChildren: () => import('./splash-screen/splash-screen.module').then( m => m.SplashScreenPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  // {
  //   path: 'settings',
  //   loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  // }
  {
    path: 'settings', component: SettingsComponent, children: [

      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'sync',
      },
      {
        path: 'accounts',
        loadChildren: () => import('./setting-components/account-settings/account-settings.module').then((m) => m.AccountSettingsPageModule),
      },
      {
        path: 'printer',
        loadChildren: () => import('./setting-components/printer-settings/printer-settings.module').then((m) => m.PrinterSettingsPageModule), 
      },
      {
        path: 'sync',
        loadChildren: () => import('./setting-components/sync-settings/sync-settings.module').then( m => m.SyncSettingsPageModule)
      },
      {
        path: 'tax',
        loadChildren: () => import('./setting-components/tax-settings/tax-settings.module').then( m => m.TaxSettingsPageModule)
      },
      {
        path: 'currency',
        loadChildren: () => import('./setting-components/currency-settings/currency-settings.module').then( m => m.CurrencySettingsPageModule)
      },
      {
        path: 'company',
        loadChildren: () => import('./setting-components/company-settings/company-settings.module').then( m => m.CompanySettingsPageModule)
      },

    ]
  },
  {
    path: 'create-item',
    loadChildren: () => import('./create-item/create-item.module').then( m => m.CreateItemPageModule)
  },
  {
    path: 'view-items',
    loadChildren: () => import('./view-items/view-items.module').then( m => m.ViewItemsPageModule)
  },
  
  // TODO :: REMOVE :: 

  {
    path: 'invoice1', component: Invoice1Component 
  },
  {
    path: 'create-customer',
    loadChildren: () => import('./create-customer/create-customer.module').then( m => m.CreateCustomerPageModule)
  }
  
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

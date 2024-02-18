import { NgModule } from '@angular/core';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { SwiperModule } from 'swiper/angular';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormGroup, FormsModule } from '@angular/forms';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';

import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { ItemCardComponent } from './layouts/item-card/item-card.component';
import { DraggableModule } from './draggable/draggable.module';
import { QuantityChangerDialogComponent } from './components/quantity-changer-dialog/quantity-changer-dialog.component';
import { ClearItemsDialogComponent } from './components/clear-items-dialog/clear-items-dialog.component';

import { NgxMoveableModule, NgxMoveableComponent } from 'ngx-moveable'; 
import { NotesDialog } from './components/options/dialog-components/notes-dialog-component';
import { AddTipsDialog } from './components/options/dialog-components/add-tips-component';
import { HomePageRightMenuComponent } from './SideMenu/home-page-right-menu/home-page-right-menu.component';
import { HomePageRightMenuModule } from './SideMenu/home-page-right-menu/home-page-right-menu.module';
import { SettingsComponent } from './settings/settings.component';
import { SaveOrderDraftConfirmationDialogComponent } from './components/save-order-draft-confirmation-dialog/save-order-draft-confirmation-dialog.component';
import { DraftOrdersComponent } from './components/draft-orders/draft-orders.component';
import { HttpClientModule } from '@angular/common/http';

import { Storage } from '@ionic/storage-angular';
import { SaveOrderDialogComponent } from './components/save-order-dialog/save-order-dialog.component';

import { SlideToConfirmModule } from 'ngx-slide-to-confirm';
// import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { IonicGestureConfig } from './IonicGestureConfig';
import { PressDirective } from './directives/press/press.directive';
import { ItemHoldOptionsComponent } from './components/item-hold-options/item-hold-options.component';
import { environment } from 'src/environments/environment';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule, SETTINGS } from '@angular/fire/compat/firestore';
import { Printer } from '@awesome-cordova-plugins/printer/ngx';

import { DragulaModule } from 'ng2-dragula'
import { DiscountDialogComponent } from './components/discount-dialog/discount-dialog.component';
import { OrderLookupComponent } from './components/order-lookup/order-lookup.component';

import { QrCodeModule } from 'ng-qrcode';
import { Invoice1Component } from './invoice-pdf-components/invoice1/invoice1.component';
import { SearchCustomerDialogComponent } from './components/search-customer-dialog/search-customer-dialog.component';
import { ReprintDialogComponent } from './components/reprint-dialog/reprint-dialog.component';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { ItemDetailsEditorComponent } from './components/item-details-editor/item-details-editor.component';
import { ReportsComponent } from './components/reports/reports.component';

export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [AppComponent, QuantityChangerDialogComponent, ClearItemsDialogComponent, AddTipsDialog, NotesDialog, DiscountDialogComponent, OrderLookupComponent, ItemDetailsEditorComponent,
    SaveOrderDraftConfirmationDialogComponent, SearchCustomerDialogComponent, ReprintDialogComponent, ReportsComponent,
    SettingsComponent, DraftOrdersComponent, SaveOrderDialogComponent, ItemHoldOptionsComponent, Invoice1Component ],
  imports: [BrowserModule, IonicModule.forRoot(), DragulaModule.forRoot(), AppRoutingModule, SwiperModule, FormsModule, LottieModule.forRoot({ player: playerFactory }), BrowserAnimationsModule,
            DraggableModule, HttpClientModule, SlideToConfirmModule, AngularFireModule.initializeApp(environment.firebase), AngularFirestoreModule, QrCodeModule ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, {
    provide: HAMMER_GESTURE_CONFIG,
    useClass: IonicGestureConfig
}, SQLite, Storage, Printer, BarcodeScanner ],
  bootstrap: [AppComponent],
})
export class AppModule {

 
  
}
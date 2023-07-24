import { ApplicationRef, Compiler, Component, ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, Injectable, Injector, ModuleWithComponentFactories, NgModule, NgModuleRef, ReflectiveInjector, StaticProvider, ViewContainerRef } from '@angular/core';
import { Charges, Items, ShippingDetails } from '../home/home.page';
import { Bill, Customer, DB_PARAMS, DraftOrder, FavouriteItem, Params, User } from '../Params';
import { SQLiteService } from './sqlite.service';
import items from '../../json/items.json';
import { Observable, Subject, Subscription, elementAt, first, forkJoin, of, retry } from 'rxjs';
import { UserDetails } from '../UserDetails';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Platform, ToastController } from '@ionic/angular';
import { PDFGenerator, PDFGeneratorOptions } from '@awesome-cordova-plugins/pdf-generator/ngx';
import { Network, NetworkStatus } from '@capacitor/network';
//import { FileTransfer, FileUploadOptions, FileTransferObject, FileUploadResult, } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file';
import { Filesystem, Directory, Encoding, WriteFileOptions } from '@capacitor/filesystem';
import { Tracing } from 'trace_events';
import { Billing, Company, CompanyPaymentDetails, TermsNCondition } from '../setting-components/company-settings/company-settings.page';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from 'html-to-pdfmake';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { UserDetailsService } from './userdetails.service';
import axios from 'axios';
import { BufferOptions, TFontDictionary } from 'pdfmake/interfaces';
import { ItemDetails } from '../create-item/create-item.page';
import { Invoice1Component } from '../invoice-pdf-components/invoice1/invoice1.component';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import html2pdf from 'html2pdf.js';

import * as QRCode from 'qrcode';
import { Title } from '@angular/platform-browser';

declare module 'qrcode' {
  export function toDataURL(
    text: string | object,
    options?: QRCodeToFileOptions | QRCodeToDataURLOptions
  ): Promise<string>;
}


@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  private orderSuccessSubject = new Subject<void>();

  constructor(private sqliteService: SQLiteService, private http: HttpClient, public firestoreDb: AngularFirestore, private storage: Storage, private toastController: ToastController,
    private pdfGenerator: PDFGenerator, private angularStorage: AngularFireStorage, private db: AngularFireDatabase, private platform: Platform, private userDetailsService: UserDetailsService,
    private titleService: Title, private userDetails: UserDetailsService) { }

  setLocalStoredValue(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getLocalStoredValue(key: string): any {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  removeLocalStoredValue(key: string) {
    localStorage.removeItem(key);
  }

  async getUserDetails(userId?: string, username?: string): Promise<any> {

    let WhereCondition = userId ? DB_PARAMS.USERS_TABLE_COLUMNS.ID + ' = ' + `'${userId}'` : DB_PARAMS.USERS_TABLE_COLUMNS.USERNAME + ' = ' + `'${username}'`;

    let query = 'SELECT * FROM ' + DB_PARAMS.DB_TABLES_NAMES.USERS + ' WHERE ' + WhereCondition + ''

    let user = undefined;

    await this.sqliteService.executeQuery(query).then(async (data) => {

      user = data.rows.item(0);

    }).catch((err) => {

    })

    return user

  }

  async getAllLoggedInUsers(): Promise<User[]> {

    return await this.sqliteService.getTableData(DB_PARAMS.DB_TABLES_NAMES.USERS);

  }

  async initUserDraftOrders(UserId: string) {

    let query = 'SELECT * FROM ' + DB_PARAMS.DB_TABLES_NAMES.DRAFT_ORDERS + ' WHERE ' + DB_PARAMS.DRAFT_ORDERS_TABLE_COLUMNS.USER_ID + ' = ' + UserId;

    let result = await this.sqliteService.executeQuery(query);

    for (let i = 0; i < result.rows.length; i++) {

      let element: DraftOrder = result.rows.item(i);

      let temp: DraftOrder = {
        id: element.id,
        user_id: element.user_id,
        label: element.label,
        added_on: element.added_on,
        notes: element.notes,
        items: JSON.parse(element.items.toString()),
        charges: JSON.parse(element.charges.toString()),
        customer: JSON.parse(element.customer.toString())
      }

      UserDetails.DraftOrders.push(temp)

    }

  }

  async initUserFavItems(UserId: string) {

    UserDetails.FavouriteItems = [];

    let query = 'SELECT * FROM ' + DB_PARAMS.DB_TABLES_NAMES.FAVOURITE_ITEMS + ' WHERE ' + DB_PARAMS.FAVOURITE_ITEMS_TABLE_COLUMNS.USER_ID + ' = ' + UserId;

    let result = await this.sqliteService.executeQuery(query);

    for (let i = 0; i < result.rows.length; i++) {

      let element: FavouriteItem = result.rows.item(i);

      let temp: FavouriteItem = {
        id: element.id,
        user_id: element.user_id,
        cat_id: element.cat_id,
        item_id: element.item_id
      }

      UserDetails.FavouriteItems.push(temp)

      console.log('Fav Items', UserDetails.FavouriteItems)

    }

  }

  // updateFavouriteItemsOffline(UserId: string, FavouriteItems: FavouriteItem[]) {

  //   let query = 'UPDATE ' + DB_PARAMS.DB_TABLES_NAMES.USERS + ' SET ' + DB_PARAMS.USERS_TABLE_COLUMNS.FAVOURITE_ITEMS + ' = ' + `'${JSON.stringify(FavouriteItems)}'` + 
  //    ' ' + 'WHERE ' + DB_PARAMS.USERS_TABLE_COLUMNS.ID + ' = ' + UserId + ';'

  //   this.sqliteService.executeQuery(query);

  //   console.log(query);

  // }

  // async updateDraftOrderOffline(UserId: string, DraftOrders: DraftOrder[]) : Promise<any> {  

  //   let query = 'UPDATE ' + DB_PARAMS.DB_TABLES_NAMES.USERS + ' SET ' + DB_PARAMS.USERS_TABLE_COLUMNS.DRAFT_ORDERS + ' = ' + `'${JSON.stringify(DraftOrders)}'` + ' ' +
  //     'WHERE ' + DB_PARAMS.USERS_TABLE_COLUMNS.ID + ' = ' + UserId + ';'

  //   return await this.sqliteService.executeQuery(query);

  // }

  async addFavouriteItemsOffline(FavouriteItem: FavouriteItem) {

    let query = 'INSERT INTO ' + DB_PARAMS.DB_TABLES_NAMES.FAVOURITE_ITEMS + ' ( ' + DB_PARAMS.FAVOURITE_ITEMS_TABLE_COLUMNS.USER_ID + ', ' +
      DB_PARAMS.FAVOURITE_ITEMS_TABLE_COLUMNS.CATEGORY_ID + ', ' + DB_PARAMS.FAVOURITE_ITEMS_TABLE_COLUMNS.ITEM_ID + ' ) ' +
      'VALUES ( ' + `'${FavouriteItem.user_id}'` + ', ' + `'${FavouriteItem.cat_id}'` + ', ' + `'${FavouriteItem.item_id}'` + ' );'

    return await this.sqliteService.executeQuery(query);

  }

  async removeFavouriteItemOffline(FavouriteItem: FavouriteItem) {

    let query = `DELETE FROM ${DB_PARAMS.DB_TABLES_NAMES.FAVOURITE_ITEMS} WHERE ${DB_PARAMS.FAVOURITE_ITEMS_TABLE_COLUMNS.USER_ID} = ${FavouriteItem.user_id} 
    AND ${DB_PARAMS.FAVOURITE_ITEMS_TABLE_COLUMNS.ITEM_ID} = '${FavouriteItem.item_id}' AND ${DB_PARAMS.FAVOURITE_ITEMS_TABLE_COLUMNS.CATEGORY_ID} = '${FavouriteItem.cat_id}';`

    return await this.sqliteService.executeQuery(query);

  }

  async addDraftOrderOffline(DraftOrder: DraftOrder): Promise<any> {

    let query = 'INSERT INTO ' + DB_PARAMS.DB_TABLES_NAMES.DRAFT_ORDERS + ' ( ' + DB_PARAMS.DRAFT_ORDERS_TABLE_COLUMNS.USER_ID + ', ' +
      DB_PARAMS.DRAFT_ORDERS_TABLE_COLUMNS.LABEL + ', ' + DB_PARAMS.DRAFT_ORDERS_TABLE_COLUMNS.ADDED_ON + ', ' + DB_PARAMS.DRAFT_ORDERS_TABLE_COLUMNS.NOTES + ', ' +
      DB_PARAMS.DRAFT_ORDERS_TABLE_COLUMNS.ITEMS + ', ' + DB_PARAMS.DRAFT_ORDERS_TABLE_COLUMNS.CHARGES + ', ' + DB_PARAMS.DRAFT_ORDERS_TABLE_COLUMNS.CUSTOMER + ' ) ' +
      'VALUES ( ' + `'${DraftOrder.user_id}'` + ', ' + `'${DraftOrder.label}'` + ', ' + `'${DraftOrder.added_on}'` + ', ' + `'${DraftOrder.notes}'` + ', ' + `'${JSON.stringify(DraftOrder.items)}'` + ', ' +
      `'${JSON.stringify(DraftOrder.charges)}'` + ', ' +
      `'${JSON.stringify(DraftOrder.customer)}'` + ' );'

    return await this.sqliteService.executeQuery(query);

  }

  async deleteDraftOrder(userId: string, orderId: string) {

    let query = 'DELETE FROM ' + DB_PARAMS.DB_TABLES_NAMES.DRAFT_ORDERS + ' WHERE ' + DB_PARAMS.DRAFT_ORDERS_TABLE_COLUMNS.USER_ID + ' = ' + `'${userId}'` + ' AND ' + DB_PARAMS.DRAFT_ORDERS_TABLE_COLUMNS.ID + ' = ' + `'${orderId}'` + ';'

    return await this.sqliteService.executeQuery(query);

  }

  getItemDetails(catId: number | string, itemId: number | string) {

    let category: any = UserDetails.Items?.filter(element => catId == element._id);

    let catItems = category[0].items;

    let item = catItems?.filter((element: any) => element._id == itemId);

    return item;

  }

  encryptDecrypt(input: string, key: string): string {
    let output = "";
    for (let i = 0; i < input.length; i++) {
      const charCode = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      output += String.fromCharCode(charCode);
    }
    return output;
  }

  async loadItems(): Promise<any> {

    let itemsCatSubscription: Subscription;

    let response: any[] = [];

    itemsCatSubscription = await this.firestoreDb.collection<Document>('itemmaster').valueChanges().subscribe((documents) => {

      const innerSubscriptions: Promise<void>[] = [];

      documents.forEach(async (element: any) => {

        let category: any = {
          _id: element.id,
          category_name: element.category_name,
        };

        const itemsSubscription: Subscription = this.firestoreDb.collection<Document>(`itemmaster/${element.id}/items`).valueChanges().subscribe((items) => {
          category.items = items;
        });

        response.push(category)

        const promise = new Promise<void>((resolve) => {
          itemsSubscription.add(() => {
            resolve();
          });
        });

        innerSubscriptions.push(promise);
      });

      console.log('Loading items', response)

      forkJoin(innerSubscriptions).subscribe(() => {
        itemsCatSubscription.unsubscribe();

      });
    })

    return response

  }

  async loadCurrencies(): Promise<any> {

    return new Promise<void>((resolve, reject) => {
      this.firestoreDb.collection<Document>(`currencymaster`).valueChanges().subscribe((currencies: any) => {

        resolve(currencies)

      });

    });

  }

  async loadCustomers() {

    return new Promise<void>((resolve, reject) => {
      this.firestoreDb.collection<Document>(`customermaster`).valueChanges().subscribe((customers: any) => {

        resolve(customers)

      });

    });

  }

  async initItems() {

    UserDetails.Items = [];

    let categories = await this.sqliteService.executeQuery('SELECT * FROM ' + DB_PARAMS.DB_TABLES_NAMES.ITEM_CATEGORIES + ' ;');

    console.log(categories, categories.rows, categories.rows.item(0));

    for (let i = 0; i < categories.rows.length; i++) {

      const itemCat = categories.rows.item(i)

      let cat: Items = {

        _id: itemCat.id,
        category_name: itemCat.name,
        items: []

      }

      try {

        let items = await this.sqliteService.executeQuery(`SELECT * FROM ${DB_PARAMS.DB_TABLES_NAMES.ITEMS} WHERE ${DB_PARAMS.ITEMS_TABLE_COLUMNS.CAT_ID} = '${itemCat.id}'`);

        for (let j = 0; j < items.rows.length; j++) {

          const itemRow = items.rows.item(j);

          let item = {

            _id: itemRow.id,
            name: itemRow.name,
            cat_id: itemRow.cat_id,
            images: JSON.parse(itemRow.images),
            image_source_tpye: "",  // TODO :: 
            price: itemRow.price,
            mrp: itemRow.mrp,
            ptr: itemRow.ptr,
            qty: "", // TODO :: ::
            stock: itemRow.stock,
            active: itemRow.active,
            hsn: itemRow.hsn_code,
            batch: itemRow.batch_no,
            disabled: itemRow.disabled,
            mfg_date: itemRow.mfg_date,
            exp_date: itemRow.exp_date,
            bonus: itemRow.bonus,
            tax_type: itemRow.tax_type,
            tax_value: itemRow.tax_value,
            bar_code: itemRow.bar_code

          }

          cat.items.push(item);

        }

      } catch (err) {
        console.error(err)
      }

      UserDetails.Items.push(cat)

    }

  }

  async loadItems2(): Promise<any> {
    const response: any[] = [];
    const documents = await this.firestoreDb.collection<Document>('itemmaster').valueChanges().pipe(first()).toPromise();

    const innerSubscriptions: Promise<void>[] = [];

    documents!.forEach(async (element: any) => {
      const category: any = {
        _id: element.id,
        category_name: element.category_name,
      };

      const itemsSubscription: Subscription = await this.firestoreDb.collection<Document>(`itemmaster/${element.id}/items`).valueChanges().subscribe((items) => {
        category.items = items;
        response.push(category);
      });

      //response.push(category);

      const promise = new Promise<void>((resolve) => {
        itemsSubscription.add(() => {
          resolve();
        });
      });

      innerSubscriptions.push(promise);
    });

    console.log('Loading items', response);

    //await forkJoin(innerSubscriptions).toPromise();
    return response;
  }

  async loadItems3(): Promise<any[]> {
    try {
      const documents = await this.firestoreDb.collection<Document>('itemmaster').valueChanges().pipe(first()).toPromise();

      const response: any[] = [];

      for (let element of documents!) {

        let ele: any = element;

        const category: any = {
          _id: ele.id,
          category_name: ele.category_name,
        };

        const items = await this.firestoreDb.collection<Document>(`itemmaster/${ele.id}/items`).valueChanges().pipe(first()).toPromise();
        category.items = items;

        response.push(category);
      }

      console.log('Loading items', response);

      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async initSettings() {

    this.sqliteService.executeQuery(`SELECT * FROM ${DB_PARAMS.DB_TABLES_NAMES.SETTINGS};`).then((data) => {

      let rowData = data.rows.item(0)

      UserDetails.Tax = JSON.parse(rowData.tax);

      UserDetails.Currency = JSON.parse(rowData.currency);

      UserDetails.Company = JSON.parse(rowData.company);

      UserDetails.Billing = JSON.parse(rowData.billing)

      UserDetails.CompanyPayment = JSON.parse(rowData.payment)

      this.setPageTitle(`${this.userDetails.getCompany()?.name}`);

    })

  }

  async initCustomers() {

    this.loadCustomers().then((data: any) => {

      UserDetails.Customers = data

    }).catch((e) => { })

  }

  async insertCurrency(id: String, decimal: number, currency: string, country: string, symbol: string) {

    const query = `INSERT INTO ` + DB_PARAMS.DB_TABLES_NAMES.CURRENCIES + ` (` + DB_PARAMS.CURRENCIES_TABLE_COLUMNS.ID + `, ` + DB_PARAMS.CURRENCIES_TABLE_COLUMNS.COUNTRY +
      `, ` + DB_PARAMS.CURRENCIES_TABLE_COLUMNS.DECIMAL + `, ` + DB_PARAMS.CURRENCIES_TABLE_COLUMNS.CURRENCY + `, ` + DB_PARAMS.CURRENCIES_TABLE_COLUMNS.SYMBOL + `) VALUES('${id}', '${country}', ${decimal}, '${currency}', '${symbol}');`

    return await this.sqliteService.executeQuery(query);


  }

  async insertCategory(id: string, name: string): Promise<any> {

    const query = 'INSERT INTO ' + DB_PARAMS.DB_TABLES_NAMES.ITEM_CATEGORIES + ' (' + DB_PARAMS.ITEMS_CATEGORIES_TABLE_COLUMNS.ID +
      ', ' + DB_PARAMS.ITEMS_CATEGORIES_TABLE_COLUMNS.NAME + ') VALUES(' + `'${id}'` + ', ' + `'${name}'` + ');'

    return await this.sqliteService.executeQuery(query);

  }

  async insertItem(item: ItemDetails): Promise<any> {

    let query = `INSERT INTO ${DB_PARAMS.DB_TABLES_NAMES.ITEMS} ( ${DB_PARAMS.ITEMS_TABLE_COLUMNS.ID}, ${DB_PARAMS.ITEMS_TABLE_COLUMNS.CAT_ID} 
      , ${DB_PARAMS.ITEMS_TABLE_COLUMNS.NAME}, ${DB_PARAMS.ITEMS_TABLE_COLUMNS.PRICE}, ${DB_PARAMS.ITEMS_TABLE_COLUMNS.MRP}, ${DB_PARAMS.ITEMS_TABLE_COLUMNS.PTR},  ${DB_PARAMS.ITEMS_TABLE_COLUMNS.UNIT}, ${DB_PARAMS.ITEMS_TABLE_COLUMNS.STOCK}
      , ${DB_PARAMS.ITEMS_TABLE_COLUMNS.ACTIVE}, ${DB_PARAMS.ITEMS_TABLE_COLUMNS.IMAGES}, ${DB_PARAMS.ITEMS_TABLE_COLUMNS.MFG_DATE}, ${DB_PARAMS.ITEMS_TABLE_COLUMNS.EXP_DATE} 
      , ${DB_PARAMS.ITEMS_TABLE_COLUMNS.TAX_TYPE}, ${DB_PARAMS.ITEMS_TABLE_COLUMNS.TAX_VALUE}, ${DB_PARAMS.ITEMS_TABLE_COLUMNS.BONUS}, ${DB_PARAMS.ITEMS_TABLE_COLUMNS.BAR_CODE}
      , ${DB_PARAMS.ITEMS_TABLE_COLUMNS.BATCH_NO}, ${DB_PARAMS.ITEMS_TABLE_COLUMNS.HSN_CODE} ) 
      VALUES( '${item._id}', '${item.cat_id}', '${item.name}', '${item.price}', '${item.mrp}', '${item.ptr}'
      , '${item.unit}', '${item.stock}', '${item.active}', '${JSON.stringify(item.images)}', '${item.mfg_date}', '${item.exp_date}', '${item.tax_type}', '${item.tax_value}', '${item.bonus}', '${item.bar_code}', '${item.batch_no}', '${item.hsn_code}');`

    return await this.sqliteService.executeQuery(query);

  }

  async updateSetting(values: { 'column': string, 'value': any }[]) {

    let query = `UPDATE ${DB_PARAMS.DB_TABLES_NAMES.SETTINGS} SET `;

    values.forEach((element, i) => {

      query += element.column + ' = ' + element.value + (i == (values.length - 1) ? `WHERE ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.ID} = 1;` : ', ')

    });

    return await this.sqliteService.executeQuery(query);

  }

  async checkDefaultSettings() {

    this.sqliteService.executeQuery(`SELECT * FROM ${DB_PARAMS.DB_TABLES_NAMES.SETTINGS} WHERE ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.ID} = 1`).then(async (data) => {

      if (data.rows.length == 0) {

        // Adding default settings

        let defaultCompany: Company = {
          logo: '',
          name: '',
          address: '',
          contact: '',
          gstno: '',
          dlno: ''
        }

        let defaultBilling: Billing = {
          invoiceType: 'A4',
          termsNconditions: [],
          invoiceOrientation: 'portrait',
          invoiceTemplate: 'professional'
        }


        let defaultPayment: CompanyPaymentDetails = {
          bankName: '',
          upiId: '',
          accountNumber: '',
          ifscCode: ''
        }

        await this.firestoreDb.collection('company').doc('details').valueChanges().subscribe({

          next: async (value: any) => {

            try {

              defaultCompany.logo = value.logo;
              defaultCompany.name = value.name;
              defaultCompany.address = value.address;
              defaultCompany.contact = value.contact;
              defaultCompany.gstno = value.gstno;
              defaultCompany.dlno = value.dlno

              console.log('Defalt settings', defaultCompany)

              const query = `INSERT INTO ${DB_PARAMS.DB_TABLES_NAMES.SETTINGS} ( 
            ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.ID}, ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.TAX}, ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.CURRENCY}, ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.COMPANY},
            ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.BILLING}, ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.PAYMENT} )
            VALUES (1, '${JSON.stringify({})}', '${JSON.stringify({})}', '${JSON.stringify(defaultCompany)}', '${JSON.stringify(defaultBilling)}', '${JSON.stringify(defaultPayment)}');`

              this.sqliteService.executeQuery(query);

            } catch (e) {

              console.error(e)

              const query = `INSERT INTO ${DB_PARAMS.DB_TABLES_NAMES.SETTINGS} ( 
                ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.ID}, ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.TAX}, ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.CURRENCY}, ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.COMPANY},
                ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.BILLING} )
                VALUES (1, '${JSON.stringify({})}', '${JSON.stringify({})}', '${JSON.stringify(defaultCompany)}', '${JSON.stringify(defaultBilling)}');`

              this.sqliteService.executeQuery(query);

            }

          },
          error: (err) => {

            const query = `INSERT INTO ${DB_PARAMS.DB_TABLES_NAMES.SETTINGS} ( 
              ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.ID}, ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.TAX}, ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.CURRENCY}, ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.COMPANY},
              ${DB_PARAMS.SETTINGS_TABLE_COLUMNS.BILLING} )
              VALUES (1, '${JSON.stringify({})}', '${JSON.stringify({})}', '${JSON.stringify(defaultCompany)}', '${JSON.stringify(defaultBilling)}');`

            this.sqliteService.executeQuery(query);

          },

        })

      }

    })

  }

  async insertOrder(billId: string, date: string, charges: any, customer: any, notes: string, synced: 'true' | 'false') {

    const query = 'INSERT INTO ' + DB_PARAMS.DB_TABLES_NAMES.ORDERS + ' (' + DB_PARAMS.ORDERS_TABLE_COLUMNS.ID + ', ' + DB_PARAMS.ORDERS_TABLE_COLUMNS.DATE +
      ', ' + DB_PARAMS.ORDERS_TABLE_COLUMNS.CHARGES + ', ' + DB_PARAMS.ORDERS_TABLE_COLUMNS.CUSTOMER + ', ' + DB_PARAMS.ORDERS_TABLE_COLUMNS.NOTES +
      ', ' + DB_PARAMS.ORDERS_TABLE_COLUMNS.SYNCED + ') VALUES(' + `'${billId}'` + ', ' + `'${date}'` + ', ' + `'${JSON.stringify(charges)}'` +
      ', ' + `'${JSON.stringify(customer)}'` + ', ' + `'${notes}'` + ', ' + `'${synced}'` + ');'

    return await this.sqliteService.executeQuery(query);

  }

  async removeOrder(billId: string) {

    const query = `DELETE FROM ${DB_PARAMS.DB_TABLES_NAMES.ORDERS} WHERE ${DB_PARAMS.ORDERS_TABLE_COLUMNS.ID} = '${billId}' ;`

    return await this.sqliteService.executeQuery(query);

  }

  async saveInvoicePdfLocally(pdfData: string, fileName: string) {

    if (this.platform.is('desktop') || this.platform.is('electron')) {

      const link = document.createElement('a');
      link.href = pdfData;
      link.download = fileName;
      link.target = '_blank';
      link.click();

    } else {

      const option: WriteFileOptions = {
        path: fileName,
        data: pdfData,
        directory: Directory.Documents
      }

      Filesystem.writeFile(option)
        .then((data) => console.log('File written successfully', data))
        .catch(error => console.error('Error writing file', error));

    }

  }

  async setValueInSP(key: string, value: string) {

    // await Preferences.set({
    //   key: key,
    //   value: value,
    // });

    this.storage.set(key, value)

  }

  async getValueFromSP(key: string): Promise<any> {

    return await this.storage.get(key);

  }

  async removeValueFromSP(key: string) {

    await this.storage.remove(key);

  }

  getApiBaseUrl() {

    return Params.BASE_URL;

  }

  addCommas(value: number | string): string {

    // const str = value.toString();

    // const chars = str.split('');

    // const reversed = chars.reverse();

    // const result = [];

    // for (let i = 0; i < reversed.length; i++) {
    //   if (i > 0 && i % 3 === 0) {
    //     result.push(',');
    //   }
    //   result.push(reversed[i]);
    // }

    // const finalResult = result.reverse().join('');

    // return finalResult;

    const parts = value.toString().split('.');
    const wholeNumber = parts[0];
    const decimal = parts[1] ? '.' + parts[1] : '';

    const chars = wholeNumber.split('').reverse();
    const result = [];

    for (let i = 0; i < chars.length; i++) {
      if (i > 0 && i % 3 === 0) {
        result.push(',');
      }
      result.push(chars[i]);
    }

    const formattedWholeNumber = result.reverse().join('');
    return formattedWholeNumber + decimal;

  }

  printPdf(pdfBase64: string) {

    if (pdfBase64.startsWith('data:application/pdf;')) {
      pdfBase64 = pdfBase64.split(",")[1]
    }

    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const printWindow = window.open(url, '_blank');

    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => {
          URL.revokeObjectURL(url);
          printWindow.close();
        };
      };
    }
  }

  printPdfWithoutPreview(pdfBase64: string) {

    if (pdfBase64.startsWith('data:application/pdf;')) {
      pdfBase64 = pdfBase64.split(",")[1]
    }

    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.display = 'none';

    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow!.print();
    };

    const removeIframe = () => {
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(iframe);
      }, 1000);
    };

    if ('onafterprint' in window) {
      window.addEventListener('afterprint', removeIframe);
    } else {
      iframe.onload = () => {
        iframe.contentWindow!.print();
        removeIframe();
      };
    }

  }

  printNatively(htmlContent: string) {

    let a = window.open('', '', 'height=500, width=500')!;
    a.document.write('<html>');
    a.document.write('<body>');
    a.document.write(htmlContent);
    a.document.write('</body>');
    a.document.write('</html>');
    a.document.close();
    a.print();


  }

  async generateInvoicePdf(billId: string, billIdNoSuffix: string, billDate: string, date: Date, currencySymbol: string, charges: Charges, customer: Customer, shipping: ShippingDetails, companyPaymentDetails: CompanyPaymentDetails,
    company: Company, items: { cat_id: Number, item: any, details: { quantity: number } }[], totalAmount: number | string, totalAmountInWords: string, invoiceType: 'A4' | 'SMALL', tnc: TermsNCondition[],
    isPaid: boolean, receivedAmount: string | number, dueDate: string, options: PDFGeneratorOptions): Promise<{ 'base64': string | undefined, 'htmlString': string | undefined }> {

    console.log(items)

    let customerDetails: any = {
      name: customer.name,
      contact: customer.contact,
      address: customer.address
    }

    let companyDetails: any = {
      logo: company.logo,
      name: company.name,
      address: company.address,
      contact: company.contact
    }

    let chargesDetails: any = {
      subtotal: charges.subtotal.toFixed(2),
      tips: charges.tips.toFixed(2),
      charges: charges.charges.toFixed(2),
      roundoff: charges.roundoff.toFixed(2),
      tax: charges.tax.toFixed(2),
      discount: {
        'discontType': charges.discount.discontType,
        'discountPercentage': charges.discount.discountPercentage,
        'discountAmount': charges.discount.discountAmount!.toFixed(2)
      }
    };

    totalAmount = Number(totalAmount).toFixed(2)

    let tncs: any[] = tnc

    const pageOrientation = this.userDetailsService.getBilling() ? this.userDetailsService.getBilling()!.invoiceOrientation : 'portrait';

    switch (invoiceType) {

      case 'A4':

        const invoiceTemplate = this.userDetailsService.getBilling() ? this.userDetailsService.getBilling()?.invoiceTemplate : 'default';

        switch (invoiceTemplate) {

          case 'default':

            let docDefinition: any = {
              pageSize: 'A4',
              pageOrientation: pageOrientation,
              content: [
                {
                  columns: [
                    [
                      companyDetails.logo != undefined && companyDetails.logo != '' ? {
                        image: companyDetails.logo,
                        //height: 50,
                        width: 400,
                        alignment: 'left',
                        //objectFit: 'contain',
                        fit: [100, 400],
                        margin: [0, 10, 0, 0]
                        // text: 'ELECTRONIC SHOP',
                        // alignment: 'left',
                        // style: 'companyName',
                      } : {},
                    ],
                    [
                      {
                        text: 'INVOICE',
                        //fontSize: 24,
                        bold: true,
                        alignment: 'right',
                        style: 'invoiceText',
                      },
                    ],
                  ],
                  margin: [0, 0, 0, 25]
                },
                {
                  columns: [
                    [
                      {
                        columns: [
                          { text: 'Billing to:', bold: true, margin: [0, 0, 0, 5], width: 60 },
                          { text: customer.name, bold: true, fontSize: 14, alignment: 'left', margin: [0, -1, 0, 5] }
                        ]
                      },
                      customerDetails.address != '' ? { text: customerDetails.address, margin: [60, 0, 0, 0] } : '',
                      { text: customer.contact, margin: [60, 0, 0, 0] }
                    ],
                    [
                      {
                        columns: [
                          [{ text: 'Invoice#', alignment: 'right', bold: true, }],
                          [{ text: billIdNoSuffix, alignment: 'right' }],
                        ],
                        margin: [0, 0, 0, 5]
                      },
                      {
                        columns: [
                          [{ text: 'Date', alignment: 'right', bold: true, }],
                          [{ text: billDate, alignment: 'right' }],
                        ],
                      },
                    ],
                  ],
                },
                {
                  text: '',
                  margin: [0, 30, 0, 0],
                },
                {
                  table: {
                    headerRows: 1,
                    dontBreakRows: false,
                    widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    //  widths: ['auto', '*', '*', '*', '*', '*', '*', '*', '*', '*'],
                    body: [
                      [
                        { text: 'SL.', margin: [5, 5, 5, 5], border: [true, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' },
                        { text: 'Items', margin: [5, 5, 10, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], style: 'tableHeaderCell' },
                        { text: 'MFD', margin: [5, 5, 5, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' },
                        { text: 'EXP', margin: [5, 5, 5, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' },
                        { text: 'Bonus', margin: [5, 5, 5, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' },
                        { text: 'MRP', margin: [5, 5, 5, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' },
                        { text: 'Rate', margin: [5, 5, 5, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' },
                        { text: 'Qty.', margin: [5, 5, 5, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' },
                        { text: 'TAX', margin: [5, 5, 5, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' },
                        { text: 'Total', margin: [5, 5, 5, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' }
                      ],
                      ...items.map((element, i) => ([
                        { text: (i + 1), margin: [5, 10, 5, 10], border: [true, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell' },
                        { text: element.item.name, margin: [5, 10, 10, 10], border: [false, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], style: 'itemDetailsCell' },
                        { text: element.item.mfg_date, margin: [5, 10, 5, 10], border: [false, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell' },
                        { text: element.item.exp_date, margin: [5, 10, 5, 10], border: [false, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell' },
                        { text: element.item.bonus != undefined && element.item.bonus != 'undefined' ? element.item.bonus : '', margin: [5, 10, 5, 10], border: [false, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell' },
                        { text: element.item.mrp != undefined && element.item.mrp != 'undefined' ? element.item.mrp : '', margin: [5, 10, 5, 10], border: [false, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell' },
                        { text: element.item.price, margin: [5, 10, 5, 10], border: [false, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell' },
                        { text: element.details.quantity, margin: [5, 10, 5, 10], border: [false, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell' },
                        { text: element.item.tax_value != undefined && element.item.tax_value != 'undefined' && element.item.tax_value != '' ? ((element.item.price * (element.item.tax_value / 100)) * element.details.quantity).toFixed(2) + '\n' + `(${element.item.tax_value + '%'})` : '', margin: [5, 10, 5, 10], border: [false, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell' },
                        {
                          text: element.item.tax_value != undefined && element.item.tax_value != 'undefined' && element.item.tax_value != '' ?
                            (((element.item.price * (element.item.tax_value / 100)) * element.details.quantity) + (element.item.price * element.details.quantity)).toFixed(2) :
                            (element.item.price * element.details.quantity).toFixed(2),
                          margin: [5, 10, 5, 10], border: [false, false, true, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell'
                        }
                      ])),
                      // [{ text: 'Total Amount', colSpan: 3 }, {}, {}, {}, items.reduce((sum, element) => sum + (element.details.quantity * element.item.price), 0).toFixed(2)]
                    ]
                  }
                },
                {
                  text: '',
                  margin: [0, 10, 0, 10]
                },
                {
                  columns: [
                    [{ text: 'Thank you for your business' }],
                    {

                    },
                    [
                      {
                        width: 100,
                        alignment: 'right',
                        columns: [
                          { text: 'Sub Total:', alignment: 'left', },
                          { text: `${currencySymbol ? currencySymbol : ''} ${chargesDetails.subtotal}`, alignment: 'left', bold: true, margin: [20, 0, 0, 0] },
                        ],
                      },
                      {
                        text: '',
                        margin: [0, 0, 0, 8]
                      },
                      chargesDetails.discount.discountAmount == 0 ? { text: '', margin: [0, 0, 0, -8] } :
                        {
                          alignment: 'right',
                          columns: [
                            [{ text: 'Discount:', alignment: 'left', }],
                            [{ text: `${currencySymbol ? currencySymbol : ''} ${chargesDetails.discount.discountAmount}`, alignment: 'left', bold: true, margin: [20, 0, 0, 0] }],
                          ],
                        },
                      {
                        text: '',
                        margin: [0, 0, 0, 8]
                      },
                      chargesDetails.charges == 0 ? { text: '', margin: [0, 0, 0, -8] } :
                        {
                          alignment: 'right',
                          columns: [
                            [{ text: 'Charges:', alignment: 'left', }],
                            [{ text: `${currencySymbol ? currencySymbol : ''} ${chargesDetails.charges}`, alignment: 'left', bold: true, margin: [20, 0, 0, 0] }],
                          ],
                        },
                      {
                        text: '',
                        margin: [0, 0, 0, 8]
                      },
                      chargesDetails.roundoff == 0 ? { text: '', margin: [0, 0, 0, -8] } :
                        {
                          alignment: 'right',
                          columns: [
                            [{ text: 'Round off:', alignment: 'left', }],
                            [{ text: `${currencySymbol ? currencySymbol : ''} ${chargesDetails.roundoff}`, alignment: 'left', bold: true, margin: [20, 0, 0, 0] }],
                          ],
                        },
                      {
                        text: '',
                        margin: [0, 0, 0, 8]
                      },
                      Number.isNaN(charges.tax) ? { text: '', margin: [0, 0, 0, -8] } :
                        {
                          alignment: 'right',
                          columns: [
                            [{ text: this.userDetailsService.getTax().taxType.toUpperCase() + ' @ ' + this.userDetailsService.getTax().valueInPercent + '%:', alignment: 'left', }],
                            [{ text: `${currencySymbol ? currencySymbol : ''} ${chargesDetails.tax}`, alignment: 'left', bold: true, margin: [20, 0, 0, 0] }],
                          ],
                        },
                      {
                        text: '',
                        margin: [0, 0, 0, 8]
                      },
                      chargesDetails.tips == 0 ? { text: '', margin: [0, 0, 0, -8] } :
                        {
                          alignment: 'right',
                          columns: [
                            [{ text: 'Tips:', alignment: 'left', }],
                            [{ text: `${currencySymbol ? currencySymbol : ''} ${chargesDetails.tips}`, alignment: 'left', bold: true, margin: [20, 0, 0, 0] }],
                          ],
                        },
                    ]
                  ]
                },
                {
                  text: '',
                  margin: [0, 10, 0, 10]
                },
                {
                  columns: [
                    { qr: `${billId}`, fit: '50' },
                    {},
                    {
                      columns: [
                        {
                          margin: [-60, 0, 0, 0],
                          table: {
                            headerRows: 0,
                            widths: '*',
                            body: [
                              [{
                                text: 'Total:',
                                fillColor: '#383C45',
                                alignment: 'left',
                                color: 'white',
                                border: [false, false, false, false],
                                margin: [60, 10, 0, 10]
                              },
                              {
                                text: `${currencySymbol ? currencySymbol : ''} ${totalAmount}`,
                                fillColor: '#383C45',
                                alignment: 'center',
                                color: 'white',
                                fontSize: 14,
                                bold: true,
                                border: [false, false, false, false],
                                margin: [20, 10, 0, 10]
                              },]
                            ],
                          },
                        },
                      ],
                    },
                  ]
                },
                {
                  text: '',
                  margin: [0, 60, 0, 0],
                },
                companyDetails.name != '' ? {
                  alignment: 'right',
                  columns: [
                    [],
                    [
                      {
                        text: 'Vendor Info', fontSize: 14, bold: true
                      },
                      { text: companyDetails.name, fontSize: 16, bold: true, margin: [0, 10, 0, 0], },
                      {
                        text: companyDetails.address,
                      },
                      {
                        text: companyDetails.contact
                      }
                    ],
                  ],
                } : { text: '', margin: [0, -20, 0, 0], },
                {
                  text: '',
                  margin: [0, 20, 0, 0],
                },
                tnc.length != 0 ?
                  {
                    //absolutePosition: { x: 40, y: (840 - (tnc.length * 30)) }, // A4 Page size 841.89
                    margin: [0, 0, 0, 0],
                    columns: [
                      [
                        { text: 'Terms & Conditions', fontSize: 14, bold: true },
                        {
                          margin: [0, 10, 10, 0],
                          ul: [...tncs.map((element) => ([element.value]))],
                        },
                      ],
                    ],
                  } : { text: '', margin: [0, -20, 0, 0] },
              ],
              footer: {
                margin: [0, 0, 0, 0],
                table: {
                  headerRows: 0,
                  widths: ['*'],
                  body: [
                    [
                      {
                        text: '',
                        alignment: 'right',
                        margin: [0, 0, 0, -40],
                        border: [false, false, false, false],
                        columns: [
                          {
                            text: '____________________',
                            margin: [0, -10, -110, 0],
                            alignment: 'right'
                          },
                          {
                            width: 150,
                            margin: [0, 4, 40, 0],
                            text: 'Authorised Signature',
                            alignment: 'center',
                            fontSize: 8
                          },
                        ],
                      },
                    ],
                    [
                      {
                        margin: [-10, -5, -10, 0],
                        border: [false, false, false, false],
                        columns: [
                          {
                            table: {
                              headerRows: 0,
                              widths: ['*', 'auto', 30],
                              body: [
                                [
                                  {
                                    text: '',
                                    border: [false, false, false, false],
                                    fillColor: '#383C45',
                                  },
                                  {
                                    text: '',
                                    margin: [60, 5, 60, 0],
                                    border: [false, false, false, false],
                                  },
                                  {
                                    text: '',
                                    border: [false, false, false, false],
                                    fillColor: '#383C45',
                                  },
                                ],
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  ],
                },
              },
              styles: {
                sectionHeader: {
                  bold: true,
                  decoration: 'underline',
                  fontSize: 14,
                  margin: [0, 15, 0, 15]
                },
                companyName: {
                  fontSize: 22,
                  color: '#30426A',
                  margin: [0, 10, 0, 0],
                },
                invoiceText: {
                  fontSize: 44,
                  fontFamily: 'monospace',
                  color: '#30426A',
                },
                tableHeaderCell: {
                  fontSize: 10,
                  fillColor: '#383C45',
                  width: '100%',
                  color: 'white',
                  borderColor: ['#383C45', '#383C45', '#383C45', '#383C45']
                },
                itemDetailsCell: {
                  fontSize: 10,
                  borderColor: ['#383C45', '#383C45', '#383C45', '#383C45']
                }
              }
            };

            return new Promise((resolve, reject) => {
              pdfMake.createPdf(docDefinition).getBase64((data) => {
                resolve({ 'base64': data, 'htmlString': undefined });
              });
            });

          case 'professional':

            let paymentQrData = ''

            let qrString = isPaid ? `upi://pay?pa=${companyPaymentDetails.upiId}&pn=${company.name}&tn=${billId}&am=${totalAmount}&cu=INR&tr=${billIdNoSuffix}` :
              `upi://pay?pa=${companyPaymentDetails.upiId}&pn=${company.name}&tn=${billId}&am=${(Number(totalAmount) - Number(receivedAmount))}&cu=INR&tr=${billIdNoSuffix}`

            await QRCode.toDataURL(qrString).then((url: any) => { paymentQrData = url; console.log('qrdata', url) }).catch((err: any) => { console.error('qrdata', err) });

            let pdfData = this.getInvoiceTemplate('professional', {
              invoiceId: billIdNoSuffix,
              invoiceDate: billDate,
              dueDate: dueDate,
              receivedAmount: receivedAmount,
              company: company,
              customer: customer,
              shippingDetails: shipping,
              items: items,
              companyPaymentDetails: companyPaymentDetails,
              tncs: tnc,
              charges: charges,
              totalAmount: totalAmount,
              totalAmountInWords: totalAmountInWords,
              isPaid: isPaid,
              paymentQrData: paymentQrData
            })

            console.log('qrdata', paymentQrData)

            //let doc = new jsPDF('p', 'cm', 'a4');
            let doc = new jsPDF();

            return new Promise((resolve, reject) => {

              const element = document.createElement('section');
              element.style.height = 'fit-content'
              //element.style.width = 'fit-content'
              element.innerHTML = pdfData;

              document.body.appendChild(element);

              var opt = {
                // margin:       1,
                filename: 'generated.pdf',
                image: { type: 'png', quality: 1 },
                // html2canvas: {
                //   useCORS: true, dpi: 2000,
                //   letterRendering: true,
                //   scale: 1
                // },
                jsPDF: {
                  unit: 'mm', format: 'a3', orientation: pageOrientation, compress: true, // Enable compression
                  compression: {
                    enabled: true,
                    compressLevel: 9, // Set the compression level (0 to 9, where 0 is no compression and 9 is maximum compression)
                  }
                },
                //jsPDF: doc,
                pagebreak: { mode: 'css' }, // Enable CSS-based page breaks
              };

              html2pdf()
                .from(element)
                .set(opt)
                .toPdf()
                .output('datauristring')
                .then((base64Pdf: any) => {
                  resolve({ 'base64': base64Pdf, 'htmlString': pdfData });
                }).catch((error: any) => {
                  reject(error);
                });

              /* Using html2pdf because html2canvas is not breaking the page */


              // html2canvas(element).then((canvas: any) => {

              //   //  doc = new jsPDF('p', 'pt', [canvas.width, canvas.height]);

              //   document.body.removeChild(element)

              //   const imgData = canvas.toDataURL('image/png');
              //   const imgProps = doc.getImageProperties(imgData);
              //   const pdfWidth = doc.internal.pageSize.getWidth();
              //   const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

              //   console.log(pdfWidth, canvas.width, canvas.style.width, doc, element.offsetWidth)

              //   //doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'NONE');
              //   doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');

              //   const pdfBase64 = doc.output('datauristring', { 'filename': 'generated.pdf' });   // TODO : Change file name

              //   resolve({ 'base64': pdfBase64, 'htmlString': pdfData });
              // }).catch((error: any) => {
              //   reject(error);
              // });

            });

          default:

            // Using default template here 

            let docDefinitionDefault: any = {
              pageSize: 'A4',
              pageOrientation: pageOrientation,
              content: [
                {
                  columns: [
                    [
                      companyDetails.logo != undefined && companyDetails.logo != '' ? {
                        image: companyDetails.logo,
                        //height: 50,
                        width: 400,
                        alignment: 'left',
                        //objectFit: 'contain',
                        fit: [100, 400],
                        margin: [0, 10, 0, 0]
                        // text: 'ELECTRONIC SHOP',
                        // alignment: 'left',
                        // style: 'companyName',
                      } : {},
                    ],
                    [
                      {
                        text: 'INVOICE',
                        //fontSize: 24,
                        bold: true,
                        alignment: 'right',
                        style: 'invoiceText',
                      },
                    ],
                  ],
                  margin: [0, 0, 0, 25]
                },
                {
                  columns: [
                    [
                      {
                        columns: [
                          { text: 'Billing to:', bold: true, margin: [0, 0, 0, 5], width: 60 },
                          { text: customer.name, bold: true, fontSize: 14, alignment: 'left', margin: [0, -1, 0, 5] }
                        ]
                      },
                      customerDetails.address != '' ? { text: customerDetails.address, margin: [60, 0, 0, 0] } : '',
                      { text: customer.contact, margin: [60, 0, 0, 0] }
                    ],
                    [
                      {
                        columns: [
                          [{ text: 'Invoice#', alignment: 'right', bold: true, }],
                          [{ text: billIdNoSuffix, alignment: 'right' }],
                        ],
                        margin: [0, 0, 0, 5]
                      },
                      {
                        columns: [
                          [{ text: 'Date', alignment: 'right', bold: true, }],
                          [{ text: billDate, alignment: 'right' }],
                        ],
                      },
                    ],
                  ],
                },
                {
                  text: '',
                  margin: [0, 30, 0, 0],
                },
                {
                  table: {
                    headerRows: 1,
                    dontBreakRows: false,
                    widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    //  widths: ['auto', '*', '*', '*', '*', '*', '*', '*', '*', '*'],
                    body: [
                      [
                        { text: 'SL.', margin: [5, 5, 5, 5], border: [true, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' },
                        { text: 'Items', margin: [5, 5, 10, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], style: 'tableHeaderCell' },
                        { text: 'MFD', margin: [5, 5, 5, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' },
                        { text: 'EXP', margin: [5, 5, 5, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' },
                        { text: 'Bonus', margin: [5, 5, 5, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' },
                        { text: 'MRP', margin: [5, 5, 5, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' },
                        { text: 'Rate', margin: [5, 5, 5, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' },
                        { text: 'Qty.', margin: [5, 5, 5, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' },
                        { text: 'TAX', margin: [5, 5, 5, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' },
                        { text: 'Total', margin: [5, 5, 5, 5], border: [false, true, false, false], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'tableHeaderCell' }
                      ],
                      ...items.map((element, i) => ([
                        { text: (i + 1), margin: [5, 10, 5, 10], border: [true, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell' },
                        { text: element.item.name, margin: [5, 10, 10, 10], border: [false, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], style: 'itemDetailsCell' },
                        { text: element.item.mfg_date, margin: [5, 10, 5, 10], border: [false, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell' },
                        { text: element.item.exp_date, margin: [5, 10, 5, 10], border: [false, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell' },
                        { text: element.item.bonus != undefined && element.item.bonus != 'undefined' ? element.item.bonus : '', margin: [5, 10, 5, 10], border: [false, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell' },
                        { text: element.item.mrp != undefined && element.item.mrp != 'undefined' ? element.item.mrp : '', margin: [5, 10, 5, 10], border: [false, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell' },
                        { text: element.item.price, margin: [5, 10, 5, 10], border: [false, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell' },
                        { text: element.details.quantity, margin: [5, 10, 5, 10], border: [false, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell' },
                        { text: element.item.tax_value != undefined && element.item.tax_value != 'undefined' && element.item.tax_value != '' ? ((element.item.price * (element.item.tax_value / 100)) * element.details.quantity).toFixed(2) + '\n' + `(${element.item.tax_value + '%'})` : '', margin: [5, 10, 5, 10], border: [false, false, false, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell' },
                        {
                          text: element.item.tax_value != undefined && element.item.tax_value != 'undefined' && element.item.tax_value != '' ?
                            (((element.item.price * (element.item.tax_value / 100)) * element.details.quantity) + (element.item.price * element.details.quantity)).toFixed(2) :
                            (element.item.price * element.details.quantity).toFixed(2),
                          margin: [5, 10, 5, 10], border: [false, false, true, true], borderColor: ['#383C45', '#383C45', '#383C45', '#383C45'], alignment: 'center', style: 'itemDetailsCell'
                        }
                      ])),
                      // [{ text: 'Total Amount', colSpan: 3 }, {}, {}, {}, items.reduce((sum, element) => sum + (element.details.quantity * element.item.price), 0).toFixed(2)]
                    ]
                  }
                },
                {
                  text: '',
                  margin: [0, 10, 0, 10]
                },
                {
                  columns: [
                    [{ text: 'Thank you for your business' }],
                    {

                    },
                    [
                      {
                        width: 100,
                        alignment: 'right',
                        columns: [
                          { text: 'Sub Total:', alignment: 'left', },
                          { text: `${currencySymbol ? currencySymbol : ''} ${chargesDetails.subtotal}`, alignment: 'left', bold: true, margin: [20, 0, 0, 0] },
                        ],
                      },
                      {
                        text: '',
                        margin: [0, 0, 0, 8]
                      },
                      chargesDetails.discount.discountAmount == 0 ? { text: '', margin: [0, 0, 0, -8] } :
                        {
                          alignment: 'right',
                          columns: [
                            [{ text: 'Discount:', alignment: 'left', }],
                            [{ text: `${currencySymbol ? currencySymbol : ''} ${chargesDetails.discount.discountAmount}`, alignment: 'left', bold: true, margin: [20, 0, 0, 0] }],
                          ],
                        },
                      {
                        text: '',
                        margin: [0, 0, 0, 8]
                      },
                      chargesDetails.charges == 0 ? { text: '', margin: [0, 0, 0, -8] } :
                        {
                          alignment: 'right',
                          columns: [
                            [{ text: 'Charges:', alignment: 'left', }],
                            [{ text: `${currencySymbol ? currencySymbol : ''} ${chargesDetails.charges}`, alignment: 'left', bold: true, margin: [20, 0, 0, 0] }],
                          ],
                        },
                      {
                        text: '',
                        margin: [0, 0, 0, 8]
                      },
                      chargesDetails.roundoff == 0 ? { text: '', margin: [0, 0, 0, -8] } :
                        {
                          alignment: 'right',
                          columns: [
                            [{ text: 'Round off:', alignment: 'left', }],
                            [{ text: `${currencySymbol ? currencySymbol : ''} ${chargesDetails.roundoff}`, alignment: 'left', bold: true, margin: [20, 0, 0, 0] }],
                          ],
                        },
                      {
                        text: '',
                        margin: [0, 0, 0, 8]
                      },
                      Number.isNaN(charges.tax) ? { text: '', margin: [0, 0, 0, -8] } :
                        {
                          alignment: 'right',
                          columns: [
                            [{ text: this.userDetailsService.getTax().taxType.toUpperCase() + ' @ ' + this.userDetailsService.getTax().valueInPercent + '%:', alignment: 'left', }],
                            [{ text: `${currencySymbol ? currencySymbol : ''} ${chargesDetails.tax}`, alignment: 'left', bold: true, margin: [20, 0, 0, 0] }],
                          ],
                        },
                      {
                        text: '',
                        margin: [0, 0, 0, 8]
                      },
                      chargesDetails.tips == 0 ? { text: '', margin: [0, 0, 0, -8] } :
                        {
                          alignment: 'right',
                          columns: [
                            [{ text: 'Tips:', alignment: 'left', }],
                            [{ text: `${currencySymbol ? currencySymbol : ''} ${chargesDetails.tips}`, alignment: 'left', bold: true, margin: [20, 0, 0, 0] }],
                          ],
                        },
                    ]
                  ]
                },
                {
                  text: '',
                  margin: [0, 10, 0, 10]
                },
                {
                  columns: [
                    { qr: `${billId}`, fit: '50' },
                    {},
                    {
                      columns: [
                        {
                          margin: [-60, 0, 0, 0],
                          table: {
                            headerRows: 0,
                            widths: '*',
                            body: [
                              [{
                                text: 'Total:',
                                fillColor: '#383C45',
                                alignment: 'left',
                                color: 'white',
                                border: [false, false, false, false],
                                margin: [60, 10, 0, 10]
                              },
                              {
                                text: `${currencySymbol ? currencySymbol : ''} ${totalAmount}`,
                                fillColor: '#383C45',
                                alignment: 'center',
                                color: 'white',
                                fontSize: 14,
                                bold: true,
                                border: [false, false, false, false],
                                margin: [20, 10, 0, 10]
                              },]
                            ],
                          },
                        },
                      ],
                    },
                  ]
                },
                {
                  text: '',
                  margin: [0, 60, 0, 0],
                },
                companyDetails.name != '' ? {
                  alignment: 'right',
                  columns: [
                    [],
                    [
                      {
                        text: 'Vendor Info', fontSize: 14, bold: true
                      },
                      { text: companyDetails.name, fontSize: 16, bold: true, margin: [0, 10, 0, 0], },
                      {
                        text: companyDetails.address,
                      },
                      {
                        text: companyDetails.contact
                      }
                    ],
                  ],
                } : { text: '', margin: [0, -20, 0, 0], },
                {
                  text: '',
                  margin: [0, 20, 0, 0],
                },
                tnc.length != 0 ?
                  {
                    //absolutePosition: { x: 40, y: (840 - (tnc.length * 30)) }, // A4 Page size 841.89
                    margin: [0, 0, 0, 0],
                    columns: [
                      [
                        { text: 'Terms & Conditions', fontSize: 14, bold: true },
                        {
                          margin: [0, 10, 10, 0],
                          ul: [...tncs.map((element) => ([element.value]))],
                        },
                      ],
                    ],
                  } : { text: '', margin: [0, -20, 0, 0] },
              ],
              footer: {
                margin: [0, 0, 0, 0],
                table: {
                  headerRows: 0,
                  widths: ['*'],
                  body: [
                    [
                      {
                        text: '',
                        alignment: 'right',
                        margin: [0, 0, 0, -40],
                        border: [false, false, false, false],
                        columns: [
                          {
                            text: '____________________',
                            margin: [0, -10, -110, 0],
                            alignment: 'right'
                          },
                          {
                            width: 150,
                            margin: [0, 4, 40, 0],
                            text: 'Authorised Signature',
                            alignment: 'center',
                            fontSize: 8
                          },
                        ],
                      },
                    ],
                    [
                      {
                        margin: [-10, -5, -10, 0],
                        border: [false, false, false, false],
                        columns: [
                          {
                            table: {
                              headerRows: 0,
                              widths: ['*', 'auto', 30],
                              body: [
                                [
                                  {
                                    text: '',
                                    border: [false, false, false, false],
                                    fillColor: '#383C45',
                                  },
                                  {
                                    text: '',
                                    margin: [60, 5, 60, 0],
                                    border: [false, false, false, false],
                                  },
                                  {
                                    text: '',
                                    border: [false, false, false, false],
                                    fillColor: '#383C45',
                                  },
                                ],
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  ],
                },
              },
              styles: {
                sectionHeader: {
                  bold: true,
                  decoration: 'underline',
                  fontSize: 14,
                  margin: [0, 15, 0, 15]
                },
                companyName: {
                  fontSize: 22,
                  color: '#30426A',
                  margin: [0, 10, 0, 0],
                },
                invoiceText: {
                  fontSize: 44,
                  fontFamily: 'monospace',
                  color: '#30426A',
                },
                tableHeaderCell: {
                  fontSize: 10,
                  fillColor: '#383C45',
                  width: '100%',
                  color: 'white',
                  borderColor: ['#383C45', '#383C45', '#383C45', '#383C45']
                },
                itemDetailsCell: {
                  fontSize: 10,
                  borderColor: ['#383C45', '#383C45', '#383C45', '#383C45']
                }
              }
            };

            return new Promise((resolve, reject) => {
              pdfMake.createPdf(docDefinitionDefault).getBase64((data) => {
                resolve({ 'base64': data, 'htmlString': undefined });
              });
            });

        }

        break;

      case 'SMALL':

        let header = `<span style="font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif">${companyDetails.name ? companyDetails.name : ''}</span>
    
                      <span style="font-size: 12px; font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif">${companyDetails.address ? companyDetails.address : ''}</span>`;

        let seprator = this.platform.is('desktop') || this.platform.is('electron') ? `<hr style="height: 1px; width: 100%; background: #000;">` : `<span style="color: black; margin: 5px 0; height: 1px; background: repeating-linear-gradient(90deg, black 0 5px,#0000 0 7px)"></span>`;

        let firstRow = `<div style="display: flex; justify-content: space-between; font-size: 14px; color: black;">
                          <span>${billId}</span>
                          <span>${billDate}</span>
                        </div>`

        let secondRow = `<div style="font-size: 12px; display: grid; grid-template-columns: repeat(4, 40% 20% 20% 20%); font-size: 14px; text-align: end;">
                          <span style="text-align:start;">ITEM NAME</span>
                          <span>QTY</span>
                          <span>PRICE</span>
                          <span>AMT&nbsp;${currencySymbol ? currencySymbol : ''}</span>
                        </div>`

        let thirdRow = ``

        items.forEach(element => {

          thirdRow += `<div style="font-size: 16px; display: grid; grid-template-columns: repeat(4, 40% 20% 20% 20%);  text-align: end">
                        <span style="text-align:start; text-overflow: ellipsis; overflow: hidden;">${element.item.name}</span>
                        <span>${element.details.quantity}</span>
                        <span>${this.addCommas(element.item.price)}</span>
                        <span>${this.addCommas(element.details.quantity * element.item.price)}</span>
                      </div>`;

        });

        let fourthRow = `<div style="font-size: 16px; text-align: end; display: flex; flex-flow: column; gap: 10px;">
                            <div style="width: 100%; display: flex; justify-content: space-between;"><span>Tax</span><span>${currencySymbol ? currencySymbol : ''} ${this.addCommas(chargesDetails.tax)}</span></div>
                            <div style="width: 100%; display: flex; justify-content: space-between;"><span>Tips</span><span>${currencySymbol ? currencySymbol : ''} ${this.addCommas(chargesDetails.tips)}</span></div>
                            <div style="width: 100%; display: flex; justify-content: space-between;"><span>Round off</span><span>${currencySymbol ? currencySymbol : ''} ${this.addCommas(chargesDetails.roundoff)}</span></div>
                            <div style="width: 100%; display: flex; justify-content: space-between;"><span>Discount</span><span>${currencySymbol ? currencySymbol : ''} ${this.addCommas(chargesDetails.discount.discountAmount!)}</span></div>
                          </div>`;

        let fifthRow = `<div style="font-size: 26px; text-align: end; display: flex; flex-flow: column; gap: 10px;">
                          <span>${currencySymbol ? currencySymbol : ''}&nbsp;&nbsp;${this.addCommas(Number(totalAmount))}</span>
                          <span style="font-size: 16px; text-align: start;">${totalAmountInWords}</span>
                        </div>`;

        let sixthRow = `<div style="display: flex; gap: 15px; text-align: start; font-size: 12px">
                          <span>NO OF ITEMS: ${items.length}</span>
                        </div>`;

        let invoiceBody = `<div style="color: black; width: 320px; height: fit-content; background: white; padding: 20px 25px; border:1px dashed black; max-width: 320px; text-align: center; display: flex; flex-flow: column; gap: 10px; padding-bottom: 40px; ">
                            ${header}
                            ${firstRow}
                            ${seprator}
                            ${secondRow}
                            ${seprator}
                            ${thirdRow}
                            ${seprator}
                            ${fourthRow}
                            ${seprator}
                            ${fifthRow}
                            ${seprator}
                            ${sixthRow}
                          </div>`;

        let pdfBody = `<div style="background: #7649f5; height: 100%; display: flex; align-items: center; justify-content: center; border-radius: 10px;">
                        ${invoiceBody}
                        </div>`;

        if (this.platform.is('desktop') || this.platform.is('electron')) {

          return new Promise((resolve, reject) => {

            const doc = new jsPDF();

            const element = document.createElement('section');
            element.style.height = '100%'
            element.innerHTML = pdfBody;

            document.body.appendChild(element);

            html2canvas(element).then((canvas: any) => {

              document.body.removeChild(element)

              const imgData = canvas.toDataURL('image/png');
              const imgProps = doc.getImageProperties(imgData);
              const pdfWidth = doc.internal.pageSize.getWidth();
              const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

              doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');

              const pdfBase64 = doc.output('datauristring', { 'filename': 'generated.pdf' });

              resolve({ 'base64': pdfBase64, 'htmlString': pdfBody });
            }).catch((error: any) => {
              reject(error);
            });

          });

        } else {

          return { 'base64': await this.pdfGenerator.fromData(pdfBody, options), 'htmlString': undefined };

        }

        break;
    }

  }

  getComponentHTML(comp: any, invoiceTemplate: { html: string; scss: string; }) {

    // page-break-inside: avoid; // TODO :: 


    // return new Promise((resolve, reject) => {

    //   this.compileTemplate(invoiceTemplate.html, invoiceTemplate.scss)
    //   .then(modifiedTemplate => {

    //     resolve(modifiedTemplate);

    //   });

    // })

    // const componentFactory = this.componentFactoryResolver.resolveComponentFactory<any>(comp);
    // const componentRef = componentFactory.create(this.injector);

    // componentRef.instance.invoiceId = params.invoiceId;
    // componentRef.instance.invoiceDate = params.invoiceDate;
    // componentRef.instance.dueDate = params.dueDate;
    // componentRef.instance.receivedAmount = params.receivedAmount;
    // componentRef.instance.company = params.company;
    // componentRef.instance.customer = params.customer;
    // componentRef.instance.shippingDetails = params.shippingDetails;
    // componentRef.instance.items = params.items;
    // componentRef.instance.companyPaymentDetails = params.companyPaymentDetails;
    // componentRef.instance.tncs = params.tncs;
    // componentRef.instance.totalAmount = params.totalAmount;
    // componentRef.instance.totalAmountInWords = params.totalAmountInWords;

    // this.appRef.attachView(componentRef.hostView);

    // const domElement = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    // const componentHTML = domElement.innerHTML;

    // componentRef.destroy();

    // return componentHTML;

  }

  getInvoiceTemplate(invoiceTemplate: 'professional', params: {
    invoiceId: string,
    invoiceDate: string,
    dueDate: string,
    receivedAmount: string | number,
    company: Company,
    customer: Customer,
    shippingDetails: ShippingDetails,
    items: { cat_id: Number, item: any, details: { quantity: number } }[],
    companyPaymentDetails: CompanyPaymentDetails,
    tncs: TermsNCondition[],
    charges: Charges,
    totalAmount: number | string,
    totalAmountInWords: string,
    isPaid: boolean,
    paymentQrData?: string
  }): string {

    switch (invoiceTemplate) {

      case 'professional':

        const template1 = `<section class="proffesional-invoice-parent">

      <div class="header">
    
        <div class="flex">
          <span class="bold">TAX INVOICE</span>
          <span style="border: 2px solid gray; border-radius: 4px;
          padding: 2px 4px; color: gray;">ORIGINAL FOR RECIPIENT</span>
        </div>
    
      </div>
    
      <div class="companyDetailsContainer">
    
        <img src="${params.company?.logo}" class="companyImage" style="object-fit: contain;">
    
        <div class="details">
    
          <span class="name bold">${params.company.name}</span>
          <span class="address">${params.company.address}</span>
          <div style="display: flex; gap: 30px;">
            <span class="bold">Mobile:&nbsp;&nbsp;<span class="normal">${params.company.contact}</span></span>
            <span class="bold">GSTIN:&nbsp;&nbsp;<span class="normal">${params.company.gstno}</span></span>
            <span class="bold" style="white-space: nowrap;">DL No.:&nbsp;&nbsp;<span class="normal">${params.company.dlno}</span></span>
          </div>
    
        </div>
    
      </div>
    
      <div class="invoiceDetails">
    
        <div style="background: #d27c19; height: 10px;"></div>
    
        <div style="display: flex; justify-content: space-between; padding: 25px; background: lightgray;">
    
          <div class="field">
    
            <span class="bold">Invoice No.:</span>
            <span class="normal">${params.invoiceId}</span>
    
          </div>
    
          <div class="field">
    
            <span class="bold">Invoice Date:</span>
            <span class="normal">${params.invoiceDate}</span>
    
          </div>

          ${!params.isPaid ? ` <div class="field">
    
          <span class="bold">Due Date:</span>
          <span class="normal">${params.dueDate}</span>
  
        </div>` : ``}  
         
        </div>
    
      </div>
    
      <div class="customerDetails">
    
        <div class="details">
    
          <span class="bold" style="font-size: 20px;">BILL TO</span>
          <span></span>
          <span style="font-size: 22px; font-weight: bold;">${params.customer.name}</span>
          <span></span>
          <span>${params.customer.address}</span>
          ${params.customer.contact != '' ? `<span>Mobile:&nbsp;<span>${params.customer.contact}</span></span>` : ''}
          ${params.customer.gstno && params.customer.gstno != '' ? `<span>GSTIN:&nbsp;<span>${params.customer.gstno}</span></span>` : ''}
          ${params.customer.dlno && params.customer.dlno != '' ? `<span>DL Number:&nbsp;<span>${params.customer.dlno}</span></span>` : ''}
          ${params.customer.state && params.customer.state != '' ? `<span>State:&nbsp;<span>${params.customer.state}</span></span>` : ''}

        </div>
    
        <div></div>
    
        <div class="details">
    
          <span class="bold" style="font-size: 20px;">SHIP TO</span>
          <span></span>
          <span style="font-size: 22px; font-weight: bold;">${params.shippingDetails.name}</span>
          <span></span>
          <span style="font-size: 18px;">${params.shippingDetails.address}</span>
    
        </div>
    
      </div>
    
      <div class="itemDetailsTable">
    
        <table>
    
          <thead>
    
            <tr>
              <th style="text-align: start; padding-left: 10px;">ITEMS</th>
              <th style="width: 7.3%;">EXP</th>
              <th style="width: 7.3%;">BONUS</th>
              <th style="width: 7.3%;">MFG</th>
              <th style="width: 7.3%;">BATCH</th>
              <th style="width: 7.3%;">HSN</th>
              <th style="width: 7.3%;">QTY.</th>
              <th style="width: 7.3%;">MRP</th>
              <th style="width: 7.3%;">PTR</th>
              <th style="width: 7.3%;">RATE</th>
              <th style="width: 7.3%;">TAX</th>
              <th style="width: 7.3%;">AMOUNT</th>
            </tr>
    
          </thead>
    
          <tbody>

          ${params.items.map((element, i) => (`
            <tr>
                <td>${element.item.name}</td>
                <td>${element.item.exp_date && element.item.exp_date != 'undefined' ? element.item.exp_date : ''}</td>
                <td>${element.item.bonus && element.item.bonus != 'undefined' ? element.item.bonus : ''}</td>
                <td>${element.item.mfg_date && element.item.mfg_date != 'undefined' ? element.item.mfg_date : ''}</td>
                <td>${element.item.batch && element.item.batch != 'undefined' ? element.item.batch : ''}</td>
                <td>${element.item.hsn && element.item.hsn != 'undefined' ? element.item.hsn : ''}</td>
                <td>${element.details.quantity}</td>
                <td>${element.item.mrp != undefined && element.item.mrp != 'undefined' && element.item.mrp != '' ? element.item.mrp : ''}</td>
                <td>${element.item.ptr != undefined && element.item.ptr != 'undefined' && element.item.ptr != '' ? element.item.ptr : ''}</td>
                <td>${element.item.price}</td>
                <td>${element.item.tax_value != undefined && element.item.tax_value != 'undefined' && element.item.tax_value != '' ? ((element.item.price * (element.item.tax_value / 100)) * element.details.quantity).toFixed(2) : ''}<span style="color: gray; font-size: 12px; padding: 0;
                  display: block; text-align: center;">(${element.item.tax_value != undefined && element.item.tax_value != 'undefined' && element.item.tax_value != '' ? element.item.tax_value + '%' : ''})</span> </td>
                <td>${element.item.tax_value != undefined && element.item.tax_value != 'undefined' && element.item.tax_value != '' ?
            (((element.item.price * (element.item.tax_value / 100)) * element.details.quantity) + (element.item.price * element.details.quantity)).toFixed(2) :
            (element.item.price * element.details.quantity).toFixed(2)
          }</td>
              </tr>
          ` ))}
            
          </tbody>
    
        </table>
    
      </div>
    
      <div class="subtotalDetailsTable"  style="page-break-inside: avoid;">
    
        <table>
    
          <tbody>
    
            <tr>
              <td style="text-align: start; padding-left: 10px;">SUBTOTAL</td>
              <td style="width: 7.3%;"></td>
              <td style="width: 7.3%;"></td>
              <td style="width: 7.3%;"></td>
              <td style="width: 7.3%;"></td>
              <td style="width: 7.3%;">${params.items.reduce((sum, element) => sum + element.details.quantity, 0)}</td>
              <td style="width: 7.3%;"></td>
              <td style="width: 7.3%;"></td>
              <td style="width: 7.3%;"></td>
              <td style="width: 7.3%;">₹ 
              ${params.items.reduce((sum, element) =>
            sum +

            ((element.item.tax_value !== undefined &&
              element.item.tax_value !== 'undefined' &&
              element.item.tax_value !== '')

              ? (element.item.price * (element.item.tax_value / 100)) *
              element.details.quantity
              : 0)
            , 0).toFixed(2)}
              </td>
              <td style="width: 8%;">₹ ${params.charges.subtotal.toFixed(2)}</td>
            </tr>
    
          </tbody>

        </table>
    
      </div>
    
      <div class="bill-and-payment-details" style="page-break-inside: avoid;">
    
        <div class="row">
    
          <div class="company-payment-details">
    
            <div style="display: flex; flex-flow: column;
            justify-content: space-between;">
    
              <span class="bold">PAYMENT OPTIONS</span>
    
              <span>UPI ID:&nbsp;<span>${params.companyPaymentDetails.upiId}</span></span>
              <span>Bank Name:&nbsp;<span>${params.companyPaymentDetails.bankName}</span></span>
              <span>Account No:&nbsp;<span>${params.companyPaymentDetails.accountNumber}</span></span>
              <span>IFSC:&nbsp;<span>${params.companyPaymentDetails.ifscCode}</span></span>
    
              <div class="upilogos">
                <img
                  src="data:image/png;base64,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">
                <img
                  src="data:image/png;base64,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">
                <img
                  src="data:image/png;base64,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">
                
              </div>
    
            </div>
    
            <div class="qrContainer">

              <img src="${params.paymentQrData && params.paymentQrData != '' ? params.paymentQrData : ''}" /> 
    
            </div>
    
          </div>
    
          <div class="tncs">
    
            <div style="display: flex; flex-flow: column;
            justify-content: space-between;">
    
              <span class="bold">TERMS AND CONDITIONS</span>
    
              <ul>
                ${params.tncs.map((element, i) => (`<li>${element.value}</li>`))}
              </ul>
    
            </div>
    
          </div>
    
        </div>
    
        <div class="row">
    
          <div class="amountDetailsContainer">
    
            <div class="amount-field">
              <span>TAXABLE AMOUNT</span>
              <span>₹ 
              ${params.items.reduce((sum, element) => sum + (element.item.price * element.details.quantity), 0).toFixed(2)}
              </span>
            </div>

            <div class="amount-field">
              <span>GST</span>
              <span>₹ ${params.items.reduce((sum, element) =>
              sum +

              ((element.item.tax_value !== undefined &&
                element.item.tax_value !== 'undefined' &&
                element.item.tax_value !== '')

                ? (element.item.price * (element.item.tax_value / 100)) *
                element.details.quantity
                : 0)
              , 0).toFixed(2)}</span>
            </div>
    
            <div class="totalAmount">
    
              <span class="bold">TOTAL AMOUNT</span>
    
              <span class="bold">₹ ${params.totalAmount}</span>
    
            </div>

            ${params.isPaid ? '' :
            `<div class="amount-field">
                <span>Received Amount</span>
                <span>₹ ${params.receivedAmount}</span>
              </div>`
          }
    
          </div>
    
          <div class="amountInWords">
    
            <span class="bold">Total Amount (in words)</span>
            <span>${params.totalAmountInWords}</span>
    
          </div>
    
          <div class="signature">
    
            <div class="signature-container">
    
    
    
            </div>
    
            <span class="bold">AUTHORISED SIGNATORY FOR</span>
            <span>${params.company.name}</span>
    
          </div>
    
        </div>
    
    
      </div>
    
    </section>
    <style>
    .proffesional-invoice-parent {
      display: flex;
      flex-flow: column;
      gap: 20px;
      background: white;
      color: black;
      padding: 20px 30px;
   }
    .proffesional-invoice-parent .companyDetailsContainer {
      display: flex;
      gap: 20px;
      align-items: center;
   }
    .proffesional-invoice-parent .companyDetailsContainer .companyImage {
      width: 140px;
      height: 140px;
      min-width: 140px;
      min-height: 140px;
      max-width: 140px;
      max-height: 140px;
      object-fit: contain;
   }
    .proffesional-invoice-parent .companyDetailsContainer .details {
      display: flex;
      flex-flow: column;
      gap: 5px;
      align-items: start;
      font-size: 20px;
   }
    .proffesional-invoice-parent .companyDetailsContainer .details .name {
      color: #d27c19;
      font-size: 32px;
   }
    .proffesional-invoice-parent .invoiceDetails {
      font-size: 18px;
   }
    .proffesional-invoice-parent .invoiceDetails .field {
      display: flex;
      gap: 20px;
   }
    .proffesional-invoice-parent .customerDetails {
      display: grid;
      grid-template-columns: repeat(3, calc((100% - 15px) / 2) 15px calc((100% - 15px) / 2));
   }
    .proffesional-invoice-parent .customerDetails .details {
      display: flex;
      flex-flow: column;
      gap: 5px;
      font-size: 18px;
   }
    .proffesional-invoice-parent .itemDetailsTable {
      padding-bottom: 120px;
   }
    .proffesional-invoice-parent .itemDetailsTable table {
      width: 100%;
   }
    .proffesional-invoice-parent .itemDetailsTable table thead {
      border-top: 3px solid #d27c19;
      border-bottom: 3px solid #d27c19;
      font-family: unset;
      font-size: 18px;
   }
    .proffesional-invoice-parent .itemDetailsTable table thead tr th {
      padding: 20px 0;
   }
    .proffesional-invoice-parent .itemDetailsTable table tbody tr {
      font-family: unset;
      font-size: 18px;
      border-bottom: 2px solid lightgray;
   }
    .proffesional-invoice-parent .itemDetailsTable table tbody tr td {
      padding: 20px 0;
      text-align: center;
   }
    .proffesional-invoice-parent .itemDetailsTable table tbody tr :first-child {
      padding: 20px 0 20px 10px;
      text-align: start;
   }
    .proffesional-invoice-parent .subtotalDetailsTable table {
      width: 100%;
   }
    .proffesional-invoice-parent .subtotalDetailsTable table tbody {
      font-weight: bold;
      border-top: 3px solid #d27c19;
      border-bottom: 3px solid #d27c19;
   }
    .proffesional-invoice-parent .subtotalDetailsTable table tbody tr {
      font-family: unset;
      font-size: 18px;
      border-bottom: 2px solid lightgray;
   }
    .proffesional-invoice-parent .subtotalDetailsTable table tbody tr td {
      padding: 20px 0;
      text-align: center;
   }
    .proffesional-invoice-parent .subtotalDetailsTable table tbody tr :first-child {
      padding: 20px 0 20px 10px;
      text-align: start;
   }
    .proffesional-invoice-parent .bill-and-payment-details {
      display: flex;
      justify-content: space-between;
     /* // display: grid;
      // grid-template-columns: repeat(3, 1fr);
      */
   }
    .proffesional-invoice-parent .bill-and-payment-details .company-payment-details {
      display: flex;
      gap: 20px;
      font-size: 20px;
      height: fit-content;
   }
    .proffesional-invoice-parent .bill-and-payment-details .company-payment-details .upilogos {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 5px;
      align-items: center;
   }
    .proffesional-invoice-parent .bill-and-payment-details .company-payment-details .upilogos img {
      max-width: 40px;
   }
    .proffesional-invoice-parent .bill-and-payment-details .company-payment-details .qrContainer img {
      width: 140px;
      height: 140px;
   }
    .proffesional-invoice-parent .bill-and-payment-details .amountDetailsContainer {
      display: flex;
      flex-flow: column;
      gap: 6px;
      font-size: 20px;
      min-width: 350px;
   }
    .proffesional-invoice-parent .bill-and-payment-details .amountDetailsContainer .amount-field {
      display: grid;
      grid-template-columns: repeat(2, 60% 40%);
      text-align: end;
   }
    .proffesional-invoice-parent .bill-and-payment-details .amountDetailsContainer .totalAmount {
      padding: 10px 0;
      margin: 10px 0;
      display: grid;
      grid-template-columns: repeat(2, 60% 40%);
      text-align: end;
      border-top: 2px solid black;
      border-bottom: 2px solid black;
   }
    .proffesional-invoice-parent .bill-and-payment-details .tncs {
      display: flex;
      gap: 20px;
      font-size: 20px;
      height: fit-content;
      margin-top: 40px;
      max-width: 500px;
   }
    .proffesional-invoice-parent .bill-and-payment-details .amountInWords {
      display: flex;
      flex-flow: column;
      gap: 6px;
      text-align: end;
      font-size: 20px;
      margin-top: 40px;
   }
    .proffesional-invoice-parent .bill-and-payment-details .signature {
      display: flex;
      flex-flow: column;
      gap: 6px;
      text-align: end;
      font-size: 20px;
      margin-top: 40px;
   }
    .proffesional-invoice-parent .bill-and-payment-details .signature .signature-container {
      height: 140px;
   }
    .bold {
      font-weight: bold;
   }
    .normal {
      font-weight: normal;
   }
    .flex {
      display: flex;
      gap: 10px;
      align-items: center;
   }
    
    </style> `

        return template1

    }

  }

  private getFullComponentHTML(componentRef: ComponentRef<any>): string {
    const componentRootNode = componentRef.location.nativeElement;
    const clonedComponentRootNode = componentRootNode.cloneNode(true);
    const styles = this.getStylesheetsHTML();

    const wrapperDiv = document.createElement('div');
    wrapperDiv.appendChild(clonedComponentRootNode);

    return `
      <html>
        <head>
          ${styles}
        </head>
        <body>
          ${wrapperDiv.innerHTML}
        </body>
      </html>
    `;
  }

  private getStylesheetsHTML(): string {
    const stylesheets = Array.from(document.styleSheets);
    let stylesHTML = '';

    stylesheets.forEach((stylesheet) => {
      if (stylesheet.href) {
        stylesHTML += `<link rel="stylesheet" href="${stylesheet.href}" />`;
      }
    });

    return stylesHTML;
  }

  uploadBill(bill: Bill): Promise<any> {

    let path = `billmaster/${bill.billid}`;

    const documentRef = this.firestoreDb.doc(path);
    return documentRef.set(bill)

  }

  uploadInvoice(fileData: string, filename: string): Promise<any> {

    const filePath = `invoices/${filename}`;
    const storageRef = this.angularStorage.ref(filePath);
    const imageBlob = this.dataURItoBlob(fileData);
    const uploadTask = this.angularStorage.upload(filePath, imageBlob);

    return new Promise<string>((resolve, reject) => {
      uploadTask.percentageChanges().subscribe((percentage: any) => {
        console.log('Uploading image', percentage)
      });

      uploadTask.then(() => {
        storageRef.getDownloadURL().subscribe((downloadUrl: string) => {
          resolve(downloadUrl);
        }, (error: any) => {
          reject(error);
        });
      }, (error: any) => {
        reject(error);
      });
    });

  }

  async downloadImageFromStorage(path: string): Promise<string> {
    try {
      const storageRef = this.angularStorage.ref(path);
      const downloadUrl = await storageRef.getDownloadURL().toPromise();

      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const base64Image = await this.convertBlobToBase64(blob);

      return base64Image;
    } catch (error: any) {
      throw new Error('Image download failed: ' + error.message);
    }
  }

  convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to base64.'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeString });
  }

  getBillId(suffix?: Boolean): string {   // Not in use

    console.log('Get bill id')

    const dataRef = this.db.object('billsettings/currentbillid').valueChanges();
    dataRef.subscribe({
      next: (data) => {
        console.log('Retrieved data:', data);
        // Handle the retrieved data here or pass it to another function
        // return data;
      },
      error: (error) => {
        console.error('Error retrieving data:', error);
      },
      complete: () => {
        console.log('Data retrieval complete.');
      }
    });

    return ''

    /* 

    Code for getting offline bill id

    return suffix ? 'BILL#' + UserDetails.Billing.invoice_id_index : UserDetails.Billing.invoice_id_index;

    */
  }

  updateBillId(billIdIntWithZeros: string, updatedBillId: string) {

    for (let i = 0; i < billIdIntWithZeros.length; i++) {

      if (updatedBillId.length == billIdIntWithZeros.length) {

        break;

      }

      updatedBillId = '0' + updatedBillId;

    }

    const dataRef = this.db.object('billsettings/');
    const newData = {
      currentbillid: updatedBillId,
    };

    dataRef.update(newData)
      .then(() => {
        console.log('Data updated successfully');
      })
      .catch((error) => {
        console.error('Error updating data:', error);
      });

    /*

    Code for offline bill id update

    let curentBillId = this.getBillId();

    let updatedBillId: string = (Number(this.getBillId()) + 1).toString();

    for (let i = 0; i < curentBillId.length; i++) {

      if (updatedBillId.length == curentBillId.length) {

        break;

      }

      updatedBillId = '0' + updatedBillId;

    }

    let updatedBill: Billing = {
      invoice_id_index: updatedBillId
    }

    this.updateSetting([{ column: DB_PARAMS.SETTINGS_TABLE_COLUMNS.BILLING, value: `'${JSON.stringify(updatedBill)}'` }]).then((data) => {

      this.initSettings();

    })

    */

  }

  calculateTotalAmount(charges: Charges): number {

    let total = charges.subtotal + charges.tips + charges.charges - charges.roundoff + (charges.tax ? charges.tax : 0) - (charges.discount ? charges.discount.discountAmount! : 0)

    return total

  }

  setPageTitle(title: string) {

    try {

      this.titleService.setTitle(title);

    } catch (e) { }

  }

  async checkNetwork() {

    return await Network.getStatus();

  }

  triggerOrderSuccessPopup() {
    this.orderSuccessSubject.next();
  }

  getOrderSuccessSubjectTriggerObservable() {
    return this.orderSuccessSubject.asObservable();
  }

  async presentToast(message: string, position?: 'bottom' | 'middle' | 'top', icon?: string) {
    const toast = await this.toastController.create({
      position: position ? position : 'bottom',
      message: message,
      duration: 3000,
      icon: icon ? icon : '',
    });

    await toast.present();
  }

}

function uuidv4() {
  throw new Error('Function not implemented.');
}


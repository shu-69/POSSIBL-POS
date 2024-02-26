import { Component, OnInit } from '@angular/core';
import { Directory, Filesystem, ReadFileOptions } from '@capacitor/filesystem';
import { AlertController } from '@ionic/angular';
import { Bill, DB_PARAMS, Params } from 'src/app/Params';
import { UserDetails } from 'src/app/UserDetails';
import { Charges } from 'src/app/home/home.page';
import { GeneralService } from 'src/app/services/general.service';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { File } from '@awesome-cordova-plugins/file/ngx';

@Component({
  selector: 'app-sync-settings',
  templateUrl: './sync-settings.page.html',
  styleUrls: ['./sync-settings.page.scss'],
})
export class SyncSettingsPage implements OnInit {

  itemSyncOptions = {

    'isSyncing': false,
    'lastSync': 'Never'

  }

  orderUploadOptions = {

    'isUploading': false,
    'totalUnUnploadedItems': 0

  }

  constructor(private generalService: GeneralService, private alertController: AlertController, private sqlService: SQLiteService) {

    this.ionViewDidEnter();

  }

  async ngOnInit() {

    // Items sync details 

    let lastSync = await this.generalService.getValueFromSP(Params.SP_KEYS.LAST_ITEM_SYNC);
    this.itemSyncOptions.lastSync = lastSync == null ? 'Never' : lastSync;

    this.initOrderUploadDetails();

  }

  initOrderUploadDetails() {

    // Order sync details 

    this.sqlService.executeQuery(`SELECT * FROM ${DB_PARAMS.DB_TABLES_NAMES.ORDERS} WHERE ${DB_PARAMS.ORDERS_TABLE_COLUMNS.SYNCED} = 'false'`).then((data) => {

      if (data.rows) {

        this.orderUploadOptions.totalUnUnploadedItems = data.rows.length;

      } else {

        this.orderUploadOptions.totalUnUnploadedItems = 0

      }

      console.log('Orders count', data.rows.length)

    }).catch((err) => {

      this.orderUploadOptions.totalUnUnploadedItems = 0;

    })

  }

  async ionViewDidEnter() {

    // console.log('last sync', await this.generalService.getValueFromSP('lastItemsSync'))

  }

  async startItemSync() {

    this.itemSyncOptions.isSyncing = true;

    this.generalService.loadItems3().then(async (value) => {

      this.itemSyncOptions.isSyncing = false;

      let result = value;

      await this.sqlService.deleteTableData(DB_PARAMS.DB_TABLES_NAMES.ITEM_CATEGORIES);
      await this.sqlService.deleteTableData(DB_PARAMS.DB_TABLES_NAMES.ITEMS);

      await result.forEach((element: any, i: number) => {

        this.generalService.insertCategory(element._id, element.category_name)

        element.items.forEach((itemelement: any, i: number) => {

          this.generalService.insertItem(itemelement)

        });

      });

      this.generalService.initItems();

      let date = new Date();

      let sycedOn = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' at ' + date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

      this.generalService.setValueInSP(Params.SP_KEYS.LAST_ITEM_SYNC, sycedOn)

      this.itemSyncOptions.lastSync = sycedOn

    }).catch((error) => {

      console.error(error)

      this.itemSyncOptions.isSyncing = false;

      this.presentAlert('Sync failed due to an unknown error', 'Sync Failed', 'Alert')

    })

  }

  async startOrderUpload() {

    this.sqlService.executeQuery(`SELECT * FROM ${DB_PARAMS.DB_TABLES_NAMES.ORDERS} WHERE ${DB_PARAMS.ORDERS_TABLE_COLUMNS.SYNCED} = 'false'`).then(async (data) => {

      if (data.rows) {

        for (let i = 0; i < data.rows.length; i++) {

          this.orderUploadOptions.isUploading = true

          let order = data.rows.item(i);

          let billId = order.id;
          let invoiceFileName = order.id + '.pdf';
          let notes = order.notes
          let date = new Date(order.date);
          let dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
          const utcDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
          let dateIso = utcDate.toISOString()
          let charges: Charges = JSON.parse(order.charges)

          let options: ReadFileOptions = {
            path: invoiceFileName,
            directory: Directory.Documents
          }

          const contents = await Filesystem.readFile(options);

          let invoiceData = 'data:application/pdf;base64,' + contents.data;

          await this.generalService.uploadInvoice(invoiceData, invoiceFileName).then((data) => {

            if (data && data.response) {

              let bill: Bill = {

                billid: billId,
                notes: notes,
                billdocfilename: invoiceFileName,
                amount: this.generalService.calculateTotalAmount(charges),
                docdate: {
                  str: dateStr + ' ' + date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
                  iso: dateIso
                },
                billurl: data,
                customer: {
                  id: '',
                  name: '',
                  contact: '',
                  email: '',
                  address: '',
                  gstno: '',
                  dlno: '',
                  state: ''
                },
                charges: charges

              }

              this.generalService.uploadBill(bill).then((result) => {

                this.generalService.removeOrder(billId).then((data) => {

                  console.log('Row deleted');
                  this.orderUploadOptions.isUploading = false;

                })

              }).catch((err) => {

                this.orderUploadOptions.isUploading = false;

              });

            } else {


            }

          }).catch((err) => {

            this.orderUploadOptions.isUploading = false;

          })

          if (i == (data.rows.length - 1)) {

            setTimeout(() => {

              this.initOrderUploadDetails();

            }, 400);

          }

        }

      } else {

        this.orderUploadOptions.isUploading = false;

      }

    }).catch((err) => {

      this.orderUploadOptions.isUploading = false

    })

  }

  async presentAlert(message: string, subHeader?: string, header?: string) {
    const alert = await this.alertController.create({
      header: header,
      subHeader: subHeader,
      message: message,
      mode: 'ios',
      animated: true,
      buttons: ['OK'],
    });

    await alert.present();
  }

}

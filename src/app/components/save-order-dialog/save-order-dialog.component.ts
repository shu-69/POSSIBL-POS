import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { PDFGeneratorOptions } from "@awesome-cordova-plugins/pdf-generator/ngx";
import { AlertController, ModalController, Platform } from "@ionic/angular";
import { Bill, Customer, Params } from "src/app/Params";
import { UserDetails } from "src/app/UserDetails";
import { Charges, ShippingDetails } from "src/app/home/home.page";
import { GeneralService } from "src/app/services/general.service";
import { UserDetailsService } from "src/app/services/userdetails.service";
import { File } from '@awesome-cordova-plugins/file/ngx';
import { AngularFireDatabase } from "@angular/fire/compat/database";
import { Subscription } from "rxjs";
import { Printer, PrintOptions } from '@awesome-cordova-plugins/printer/ngx';
import { ItemDetailsEditorComponent } from "../item-details-editor/item-details-editor.component";

@Component({
  selector: 'app-save-order-dialog',
  templateUrl: './save-order-dialog.component.html',
  styleUrls: ['./save-order-dialog.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class SaveOrderDialogComponent implements OnInit {

  @Input() items: { cat_id: Number, item: any, details: { quantity: number } }[] = [];

  @Input() customerDetails!: Customer;

  @Input() shippingDetails!: ShippingDetails;

  @Input() charges!: Charges;

  @Input() notes!: string;

  paid = false;

  receivedAmount = 0;
  dueDate = '';

  isSaving = false;
  saveInvoiceLocally = false;
  showPrintPreview = true;

  isLoading = false;
  loadingMessage = ''

  billId = '';

  isDueDatePopupOpen = false
  billIdSubscription: Subscription | undefined;

  constructor(public generalService: GeneralService, private db: AngularFireDatabase, public userDetails: UserDetailsService, private modalCtrl: ModalController,
    private platform: Platform, private printer: Printer, private alertController: AlertController,) {

    this.isLoading = true;

    this.billIdSubscription = this.db.object('billsettings/currentbillid').valueChanges().subscribe({
      next: (data: any) => {
        this.billId = data;
        this.isLoading = false;
        console.log('Retrieved data:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error retrieving data:', error);
      },
      complete: () => {
        console.log('Data retrieval complete.');
      }
    });

  }

  ngOnInit() {

    //  this.receivedAmount = this.calculateTotalAmount()

  }

  ngOnDestroy() {

    console.log('unsubscribing')

    this.billIdSubscription?.unsubscribe();

  }

  async save() {

    if (this.billId == undefined || this.billId == '') {
      this.generalService.presentToast("Can't get bill id", "top", 'close-outline');
      this.close(false);
      return;
    }

    this.isSaving = true;

    this.loadingMessage = 'Saving Order Please Wait...'

    let date = new Date();

    //  let dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(); 

    let dateStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    const utcDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    let dateIso = utcDate.toISOString();
    
    let billIdStr = Params.InvoiceIdSuffix + this.billId;

    let billIdIntWithZeros = this.billId

    let invoiceFileName = billIdStr + '.pdf';

    let options: PDFGeneratorOptions = {

      'documentSize': 'A4',
      'type': this.saveInvoiceLocally ? 'share' : 'base64',
      'fileName': invoiceFileName

    }

    this.loadingMessage = 'Generating invoice...';

    let invoiceType = this.userDetails.getBilling() ? this.userDetails.getBilling()!.invoiceType : 'A4';

    let tnc = this.userDetails.getBilling()!.termsNconditions

    this.generalService.generateInvoicePdf(billIdStr, billIdIntWithZeros, dateStr, date, this.userDetails.getCurrency() ? this.userDetails.getCurrency()!.symbol : '', this.charges, this.customerDetails, this.shippingDetails, this.userDetails.getCompanyPaymentDetails(), this.userDetails.getCompany(),
      this.items, this.calculateTotalAmount(),
      this.calculateTotalAmountInWords(this.calculateTotalAmount()), invoiceType, tnc, this.paid, this.receivedAmount, this.dueDate, options).then(async (result) => {

        let data = result.base64 ? result.base64 : '';

        let invoiceHtmlString = result.htmlString;

        let invoiceData = data;

        if (data.startsWith('data:application/pdf;')) {
          data = data.replace('data:application/pdf;base64,', '');
        }

        if (data.startsWith('data:application/pdf;filename=generated.pdf;base64,')) {
          data = data.replace('data:application/pdf;filename=generated.pdf;base64,', '');
        }

        //data:application/pdf;filename=generated.pdf;base64,

        invoiceData = 'data:application/pdf;base64,' + data;

        console.log(data)

        if (this.platform.is('desktop') || this.platform.is('electron')) {

          if (this.showPrintPreview) {
            this.generalService.printPdf(data)
          } else {
            this.generalService.printPdfWithoutPreview(data)
          }

        } else {

          //  https://github.com/katzer/cordova-plugin-printer

          let options: PrintOptions = {
            name: billIdStr,
            duplex: true,
            orientation: 'portrait',
            monochrome: false,
          }

          // let pdfHtml = `<iframe src="data:application/pdf;base64,${data}" type="application/pdf" width="100%" height="600px"></iframe>`

          // console.log('Pdf html', pdfHtml)

          this.printer.print(invoiceHtmlString, options).then((data) => {

            console.log(data)

          }).catch((e) => {

            console.error(e)

          })

        }

        this.loadingMessage = 'Uploading invoice...'

        this.generalService.updateBillId(billIdIntWithZeros, (Number(billIdIntWithZeros) + 1).toString());

        if (this.platform.is('desktop') || this.platform.is('electron')) {

          if (this.saveInvoiceLocally)
            this.generalService.saveInvoicePdfLocally(invoiceData, invoiceFileName)

        } else {

          this.generalService.saveInvoicePdfLocally(invoiceData, invoiceFileName);

        }

        if ((await this.generalService.checkNetwork()).connected) {

          this.generalService.uploadInvoice(invoiceData, invoiceFileName).then((data) => {

            if (data) {

              let bill: Bill = {
                billid: billIdStr,
                notes: this.notes,
                billdocfilename: invoiceFileName,
                amount: this.calculateTotalAmount().toFixed(2),
                docdate: {
                  str: dateStr + ' ' + date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
                  iso: dateIso
                },
                billurl: data,
                customer: this.customerDetails,
                charges: this.charges
              }

              this.generalService.uploadBill(bill).then((result) => {

                console.log(result);
                this.generalService.presentToast('Order details uploaded.', "top", 'checkmark-outline')
                this.close(true)

              }).catch((err) => {

                this.generalService.insertOrder(billIdStr, date.toString(), this.charges, this.customerDetails, this.notes, 'false');
                this.generalService.presentToast('Order details uploading failed.', "top", 'close-outline')
                this.close(true)

              });

            } else {

              this.generalService.insertOrder(billIdStr, date.toString(), this.charges, this.customerDetails, this.notes, 'false');
              this.close(true)

            }

          }).catch((err) => {

            this.generalService.insertOrder(billIdStr, date.toString(), this.charges, this.customerDetails, this.notes, 'false');
            this.generalService.presentToast('Order details uploading failed.', "top", 'close-outline')
            this.close(true)

          })

        } else {

          this.generalService.insertOrder(billIdStr, date.toString(), this.charges, this.customerDetails, this.notes, 'false');
          this.close(true)

        }

      }).catch((err) => {

        console.error(err)
        this.generalService.presentToast('Invoice generation failed.', "top", 'close-outline');
        this.close(false);

      });

  }

  async editItem(item: any) {

    console.log('Editing item', item)

    const modal = await this.modalCtrl.create({
      component: ItemDetailsEditorComponent,
      cssClass: 'editItemDialog',
      componentProps: {
        item: item.item,
      }
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role == 'done' && data != undefined) {

      item.item.bonus = data.bonus;

      console.log('Bonus Updated!', item.item.bonus, data.bonus)

    }

  }

  calculateTotalAmount(): number {

    return this.generalService.calculateTotalAmount(this.charges);

  }

  calculateAmountInWords(amount: number | string): string {

    // if (typeof amount == 'string') {

    //   amount = Number(amount)

    //   amount = Math.floor(amount)

    // }

    // const onesWords = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    // const tensWords = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    // if (amount === 0) {
    //   return 'Zero';
    // }

    // if (amount < 0) {
    //   return `Minus ${this.calculateTotalAmountInWords(Math.abs(amount))}`;
    // }

    // let words = '';

    // if (Math.floor(amount / 1000000) > 0) {
    //   words += `${this.calculateTotalAmountInWords(Math.floor(amount / 1000000))} Million `;
    //   amount %= 1000000;
    // }

    // if (Math.floor(amount / 1000) > 0) {
    //   words += `${this.calculateTotalAmountInWords(Math.floor(amount / 1000))} Thousand `;
    //   amount %= 1000;
    // }

    // if (Math.floor(amount / 100) > 0) {
    //   words += `${onesWords[Math.floor(amount / 100)]} Hundred `;
    //   amount %= 100;
    // }

    // if (amount > 0) {
    //   if (words !== '') {
    //     words += 'and ';
    //   }

    //   if (amount < 20) {
    //     words += onesWords[amount];
    //   } else {
    //     words += tensWords[Math.floor(amount / 10)];
    //     if (amount % 10 > 0) {
    //       words += `-${onesWords[amount % 10]}`;
    //     }
    //   }
    // }

    // return words.trim();

    if (typeof amount === 'string' || Number.isInteger(amount)) {
      amount = Number(amount);
      amount = Math.floor(amount);
    }

    const onesWords = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tensWords = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (amount === 0) {
      return 'Zero';
    }

    if (amount < 0) {
      return `Minus ${this.calculateAmountInWords(Math.abs(amount))}`;
    }

    let words = '';

    if (amount >= 1) {
      if (Math.floor(amount / 1000000) > 0) {
        words += `${this.calculateAmountInWords(Math.floor(amount / 1000000))} Million `;
        amount %= 1000000;
      }

      if (Math.floor(amount / 1000) > 0) {
        words += `${this.calculateAmountInWords(Math.floor(amount / 1000))} Thousand `;
        amount %= 1000;
      }

      if (Math.floor(amount / 100) > 0) {
        words += `${onesWords[Math.floor(amount / 100)]} Hundred `;
        amount %= 100;
      }

      if (amount > 0) {
        if (words !== '') {
          words += ' '; // and
        }

        if (amount < 20) {
          words += onesWords[amount];
        } else {
          words += tensWords[Math.floor(amount / 10)];
          if (amount % 10 > 0) {
            words += `-${onesWords[amount % 10]}`;
          }
        }
      }
    }

    return words.trim();

  }

  convertDecimalToWords(decimalPart: any) {
    const tensWords = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const onesWords = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    let words = '';

    if (decimalPart >= 1) {
      if (decimalPart < 20) {
        words += onesWords[decimalPart];
      } else {
        words += tensWords[Math.floor(decimalPart / 10)];
        if (decimalPart % 10 > 0) {
          words += `-${onesWords[decimalPart % 10]}`;
        }
      }
    }

    return words.trim();
  }

  calculateTotalAmountInWords(amount: any) {
    const integerPart = Math.floor(amount);
    const decimalPart = Math.floor((amount - integerPart) * 100);

    let words = '';

    if (integerPart !== 0) {
      words += this.calculateAmountInWords(integerPart);
    }

    if (decimalPart !== 0) {
      words += ' and ' + this.convertDecimalToWords(decimalPart);
    }

    return words.trim();
  }

  // async openDatePicker(dateField: string) {
  //   const date = await this.datePicker.show({
  //     titleText: 'Select Date',
  //     dateFormat: 'DD/MM/YYYY',
  //     closeButton: true,
  //     doneButton: true,
  //     cancelButton: true,
  //   });

  //   if (date) {
  //     // Handle the selected date
  //     console.log('Selected date:', date);
  //   }
  // }

  changeDueDate(e: any) {

    this.dueDate = this.formatDate(e.detail.value)

    //date.split('T')[0]

  }

  formatDate(date: string): string {
    console.log(date.split('T')[0])
    date = date.split('T')[0]
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  close(orderSaved: Boolean) {

    this.modalCtrl.dismiss({ 'orderSaved': orderSaved });

  }

}

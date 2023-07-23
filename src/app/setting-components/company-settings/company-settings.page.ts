import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Bill, DB_PARAMS } from 'src/app/Params';
import { GeneralService } from 'src/app/services/general.service';
import { UserDetailsService } from 'src/app/services/userdetails.service';

export interface Company {

  'logo': string,
  'name': string,
  'address': string,
  'contact': string,
  'gstno': string,
  'dlno': string

}

export interface TermsNCondition {

  'value': string,
  'editedValue' ? : string

}

export interface Billing {

  'invoiceType': 'SMALL' | 'A4',
  'invoiceTemplate': 'default' | 'professional',
  'invoiceOrientation': 'portrait' | 'landscape',
  'termsNconditions' : TermsNCondition[]

}

export interface CompanyPaymentDetails {

  'bankName': string,
  'upiId': string,
  'accountNumber': string,
  'ifscCode': string,

}

@Component({
  selector: 'app-company-settings',
  templateUrl: './company-settings.page.html',
  styleUrls: ['./company-settings.page.scss'],
})

export class CompanySettingsPage implements OnInit {

  companyLogo = '';

  termsNconditions : TermsNCondition[] = this.userDetals.getBilling()!.termsNconditions

  constructor(private generalService: GeneralService, public userDetals: UserDetailsService, private storage: AngularFireStorage, private firestore: AngularFirestore) { 

    this.companyLogo = this.userDetals.getCompany().logo;

  }

  ngOnInit() {

    this.termsNconditions.forEach(element => { element.editedValue = element.value });

  }

  async updateCompanyDetails(company: Company) {

    if (company.name == '') {

      this.generalService.presentToast('Company name required!', 'top', 'alert-circle')

      return

    }

    this.uploadCompanyDetails(company)

    await this.generalService.updateSetting([{ column: DB_PARAMS.SETTINGS_TABLE_COLUMNS.COMPANY, value: `'${JSON.stringify(company)}'` }]).then((data) => {

      console.log(data)

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

  async updateBillingsDetails(billing: Billing) {

    let tncsFiltered : { 'value' : string }[] = billing.termsNconditions

    billing.termsNconditions = tncsFiltered

    await this.generalService.updateSetting([{ column: DB_PARAMS.SETTINGS_TABLE_COLUMNS.BILLING, value: `'${JSON.stringify(billing).replaceAll("'", "''")}'` }]).then((data) => {

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

  uploadCompanyDetails(company: Company) {

    if(this.companyLogo == undefined || this.companyLogo == ''){
      return 
    }

    // const filePath = `applicationassets/companylogo`;
    // const storageRef = this.storage.ref(filePath);
    // const imageBlob = this.dataURItoBlob(this.companyLogo);
    // const uploadTask = this.storage.upload(filePath, imageBlob);

      // uploadTask.percentageChanges().subscribe((percentage: any) => {
        
      // });

      this.firestore.doc('company/details').set(company)
          .then(() => {
            console.log('Document successfully set!');
          })
          .catch((error) => {
            console.error('Error setting document:', error);
          });

      // uploadTask.then(() => {
      //   storageRef.getDownloadURL().subscribe((downloadUrl: string) => {

      //     company.logo = downloadUrl;

          

      //   }, (error: any) => {
      //   });
      // }, (error: any) => {
      
      // });
      

  }

  uploadPaymentDetails(payment: CompanyPaymentDetails) {

    // const filePath = `applicationassets/companylogo`;
    // const storageRef = this.storage.ref(filePath);
    // const imageBlob = this.dataURItoBlob(this.companyLogo);
    // const uploadTask = this.storage.upload(filePath, imageBlob);

      // uploadTask.percentageChanges().subscribe((percentage: any) => {
        
      // });

      this.firestore.doc('company/paymentDetails').set(payment)
          .then(() => {
            console.log('Document successfully set!');
          })
          .catch((error) => {
            console.error('Error setting document:', error);
          });

      // uploadTask.then(() => {
      //   storageRef.getDownloadURL().subscribe((downloadUrl: string) => {

      //     company.logo = downloadUrl;

          

      //   }, (error: any) => {
      //   });
      // }, (error: any) => {
      
      // });
      

  }

  async updateCompanyPaymentDetails(payment: CompanyPaymentDetails) {

    this.uploadPaymentDetails(payment)

    await this.generalService.updateSetting([{ column: DB_PARAMS.SETTINGS_TABLE_COLUMNS.PAYMENT, value: `'${JSON.stringify(payment)}'` }]).then((data) => {

      console.log(data)

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


  deleteTnc(tnc: TermsNCondition){

    this.termsNconditions = this.termsNconditions.filter(element => element != tnc)

    let billing : Billing = {
      invoiceType: this.userDetals.getBilling()!.invoiceType,
      invoiceTemplate: this.userDetals.getBilling()!.invoiceTemplate,
      invoiceOrientation: this.userDetals.getBilling()!.invoiceOrientation,
      termsNconditions: this.termsNconditions
    }

    this.updateBillingsDetails(billing)

  }

  updateTnc(tnc: TermsNCondition){

    this.termsNconditions.forEach((element, i) => {

      if(element == tnc){

        tnc.value = tnc.editedValue!;
        this.termsNconditions[i] = tnc

      }

    })

    let billing : Billing = {
      invoiceType: this.userDetals.getBilling()!.invoiceType,
      invoiceTemplate: this.userDetals.getBilling()!.invoiceTemplate,
      invoiceOrientation: this.userDetals.getBilling()!.invoiceOrientation,
      termsNconditions: this.termsNconditions
    }

    this.updateBillingsDetails(billing)

  }

  addTnc(){

    this.termsNconditions.push({ 'value' : '', 'editedValue' : '' })

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

  async selectDisplayImage(e: any) {

    console.log(e.target.files[0])

    let file = e.target.files[0];

    if (file) {

      this.fileToBase64(file)
        .then((base64String: any) => {
          this.companyLogo = 'data:image/jpeg;base64,' + base64String
        })
        .catch(function (error) {
          console.error('Error:', error);
        });

    }

  }

  fileToBase64(file: any) {
    return new Promise((resolve, reject) => {
      const reader: any = new FileReader();

      reader.addEventListener('load', function () {
        const base64String = reader.result!.split(',')[1]; // Extracting the Base64 string
        resolve(base64String);
      });

      reader.addEventListener('error', function (error: any) {
        reject(error);
      });

      reader.readAsDataURL(file);
    });
  }

}

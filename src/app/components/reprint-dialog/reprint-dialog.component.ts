import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Bill, Params } from 'src/app/Params';

import { saveAs } from 'file-saver'
import print from 'print-js'
import printJS from 'print-js';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { HttpClient } from '@angular/common/http';
import { GeneralService } from 'src/app/services/general.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-reprint-dialog',
  templateUrl: './reprint-dialog.component.html',
  styleUrls: ['./reprint-dialog.component.scss'],
})
export class ReprintDialogComponent implements OnInit {

  isLastOrderLoading = false;
  isPreviousOrdersLoading = false

  lastOrder: Bill | undefined

  previousOrders: Bill[] = []

  constructor(private http: HttpClient, private generalServices: GeneralService, private firestore: AngularFirestore, 
    private db: AngularFireDatabase, private storage: AngularFireStorage, private modalCtrl: ModalController) {

    this.loadLastOrder()

    this.loadPreviousOrders()

   }

  ngOnInit() {

    

  }

  loadLastOrder() {

    this.isLastOrderLoading = true;

    this.db.object('billsettings/currentbillid').valueChanges().subscribe({
      next: (data: any) => {

        const lastBillId = Params.InvoiceIdSuffix + this.getLastBillId(data);

        this.firestore.collection('billmaster').doc(lastBillId).valueChanges().subscribe((data: any) => {

          this.isLastOrderLoading = false;

          this.lastOrder = data;

          console.log(this.lastOrder);

        })

      },
      error: (error) => {

        this.isLastOrderLoading = false;

        this.modalCtrl.dismiss()

      },
      complete: () => {



      }
    });

  }

  loadPreviousOrders() {

  this.isPreviousOrdersLoading = true;    

    this.db.object('billsettings/currentbillid').valueChanges().subscribe({
      next: (data: any) => {

        let count = 0;

        let prevBillId = this.getLastBillId(data);

        while(count <= 10){

          count++;

          const billId = Params.InvoiceIdSuffix + prevBillId;

          prevBillId = this.getLastBillId(prevBillId)

          this.firestore.collection('billmaster').doc(billId).valueChanges().subscribe((data: any) => {

            this.isPreviousOrdersLoading = false;

            if(!data){
              count = 10;
              return
            }
    
            this.previousOrders.push(data);

            console.log(data)
  
          })

        }     

      },
      error: (error) => {

        this.isPreviousOrdersLoading = false;

      },
      complete: () => {



      }
    });

  }

  getLastBillId(currentbillid: string) {
    const number = parseInt(currentbillid, 10); // Convert string to number
    const result = (number - 1).toString(); // Subtract one and convert back to string
    const paddedResult = result.padStart(currentbillid.length, '0'); // Pad result with zeros to match the original string length
    return paddedResult;
  }

  downloadPdfFile(url: string, fileName: string) {

    //console.log('saving', url, fileName)

    // saveAs(url, fileName)

    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  openInvoicePdf(url: string) {

    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', url);
    document.body.appendChild(link);
    link.click();
    link.remove();

  }

  printInvoicePdf(url: string) {

    try {

      printJS(url)

    } catch (e) {

      const newTab = window.open(url, '_blank');

      newTab?.print();


    }

  }

  async downloadAndPrintFile(url: string) {
    const ref = this.storage.storage.refFromURL(url);
    ref.getDownloadURL().then(downloadUrl => {

      this.http.get(downloadUrl, { responseType: 'blob' }).toPromise()
        .then(async (blob: any) => {

          this.generalServices.printPdfWithoutPreview(await this.generalServices.convertBlobToBase64(blob));

        })
        .catch(error => {
          console.log(error);
          this.openInvoicePdf(url)
        });

    }).catch(error => {
      console.error('Error:', error);
    });
  }

  downloadAndSaveFile(url: string, fileName: string) {

    const ref = this.storage.storage.refFromURL(url);
    ref.getDownloadURL().then(downloadUrl => {

      this.http.get(downloadUrl, { responseType: 'blob' }).toPromise()
        .then((blob: any) => {
          saveAs(blob, fileName);
        })
        .catch(error => {
          this.downloadPdfFile(url, fileName)
        });

    }).catch(error => {
      console.error('Error:', error);
    });

  }

  compareDates(dateString: string): string {
    
    const dateTimeParts = dateString.split(' ');
    const dateParts = dateTimeParts[0].split('/');
    const timeParts = dateTimeParts[1].split(':');
    const amPm = dateTimeParts[2];
  
    const givenDate = new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0], +timeParts[0], +timeParts[1]);
  
    // Adjust hour if AM/PM is provided
    if (amPm.toLowerCase() === 'pm' && givenDate.getHours() < 12) {
      givenDate.setHours(givenDate.getHours() + 12);
    } else if (amPm.toLowerCase() === 'am' && givenDate.getHours() === 12) {
      givenDate.setHours(0);
    }
    const currentDate = new Date();

    // Set both dates to the same time to compare only the dates
    givenDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    const timeDiff = Math.abs(currentDate.getTime() - givenDate.getTime());
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff === 0) {
      return 'Today';
    } else {
      return `${daysDiff} days ago`;
    }
  }

}

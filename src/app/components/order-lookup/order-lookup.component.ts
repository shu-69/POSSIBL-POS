import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import saveAs from 'file-saver';
import { Bill } from 'src/app/Params';

@Component({
  selector: 'app-order-lookup',
  templateUrl: './order-lookup.component.html',
  styleUrls: ['./order-lookup.component.scss'],
})
export class OrderLookupComponent implements OnInit {

  isExpanded = true;

  orders: Bill[] = []

  constructor(private http: HttpClient, private firestore: AngularFirestore, private storage: AngularFireStorage) { }

  ngOnInit( ) {

    this.firestore.collection<Document>(`billmaster`).valueChanges().subscribe((orders: any) => {

      this.orders = orders

    });
    
  }

  toggleExpand() {

    this.isExpanded = !this.isExpanded;

  }

  openInvoicePdf(url: string) {

    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', url);
    document.body.appendChild(link);
    link.click();
    link.remove();

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


}

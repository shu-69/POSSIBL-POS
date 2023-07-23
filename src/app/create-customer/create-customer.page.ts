import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ActivatedRoute } from '@angular/router';
import { Customer } from '../Params';
import { GeneralService } from '../services/general.service';
import { AlertController, LoadingController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-create-customer',
  templateUrl: './create-customer.page.html',
  styleUrls: ['./create-customer.page.scss'],
})
export class CreateCustomerPage implements OnInit {

  isUpdating = false;

  customerDisplayImage = '';

  customerDetails: Customer = {
    id: this.firestore.createId(),
    name: '',
    contact: '',
    email: '',
    address: '',
    gstno: '',
    dlno: '',
    state: '', 
  }

  private customersCollection!: AngularFirestoreCollection<any>;

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage, private loadingCtrl: LoadingController, private navCtrl: NavController,
    private generalServices: GeneralService, private alertController: AlertController, public route: ActivatedRoute) {

    this.customersCollection = this.firestore.collection<any>('customermaster');

  }

  ngOnInit() {

    this.route.queryParams.subscribe((data: any) => {

      if (data.id) {

        this.isUpdating = true;

        this.customerDetails.id = data._id,
          this.customerDetails.name = data.name,
          this.customerDetails.contact = data.contact,
          this.customerDetails.email = data.email,
          this.customerDetails.address = data.address

        //  console.log(this.customerDetails)

      }

    });

  }

  async submit() {

    if (this.checkErrors()) {

      const loading = await this.loadingCtrl.create({
        message: 'Submitting Customer details'
      });

      loading.present();

      let path = `customermaster/${this.customerDetails.id}`;

      const documentRef = this.firestore.doc(path);
      documentRef.set(this.customerDetails).then((data) => {

        this.generalServices.presentToast('Customer added successfully!', 'top', 'checkmark-circle')

        loading.dismiss();

        this.navCtrl.pop();

      }).catch((err) => {

        this.generalServices.presentToast('Customer adding failed!', 'top', 'close-circle')
        console.error(err)
        loading.dismiss();

      })

    }

  }

  async update() {

    console.log(this.customerDetails)

    if (this.checkErrorsForUpdate()) {

      const loading = await this.loadingCtrl.create({
        message: 'Submitting Customer details'
      });

      loading.present();

      let path = `customermaster/${this.customerDetails.id}`;

      const documentRef = this.firestore.doc(path);
      documentRef.update(this.customerDetails).then((data) => {

        this.generalServices.presentToast('Customer updated successfully!', 'top', 'checkmark-circle')

        loading.dismiss();

        this.navCtrl.pop();

      }).catch((err) => {

        this.generalServices.presentToast('Customer updating failed!', 'top', 'close-circle')

        loading.dismiss();

      })

    }

  }

  checkErrors(): Boolean {

    if (this.customerDetails.name == '') {
      alert('Enter  name')
      return false;
    }
    if (this.customerDetails.contact == '') {
      alert('Enter Customer name')
      return false;
    }

    return true;

  }

  checkErrorsForUpdate(): Boolean {

    if (this.customerDetails.name == '') {
      alert('Enter Customer name')
      return false;
    }
    if (this.customerDetails.contact == '') {
      alert('Enter Customer name')
      return false;
    }

    return true;

  }

  async selectDisplayImage(e: any) {

    console.log(e.target.files[0])

    let file = e.target.files[0];

    if (file) {

      this.fileToBase64(file)
        .then((base64String: any) => {
          this.customerDisplayImage = 'data:image/jpeg;base64,' + base64String
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

  uploadcustomerImage(customerCategoryId: string, customerId: string, base64Image: string, loader: HTMLIonLoadingElement): Promise<string> {
    const filePath = `customerimages/${customerCategoryId}/${customerId}/displayImage`;    //  ${uuidv4()
    const storageRef = this.storage.ref(filePath);
    const imageBlob = this.dataURItoBlob(base64Image);
    const uploadTask = this.storage.upload(filePath, imageBlob);

    return new Promise<string>((resolve, reject) => {
      uploadTask.percentageChanges().subscribe((percentage: any) => {
        loader.message = `Uploading image: ${Math.floor(percentage)}%`
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

}

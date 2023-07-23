import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { GeneralService } from '../services/general.service';
import { AlertController, LoadingController, NavController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuidv4 } from 'uuid';
import { ActivatedRoute } from '@angular/router';

export interface ItemCategory {

  id: string,
  category_name: string

}

export interface ItemDetails {

  _id: string,
  name: string,
  description: string,
  cat_id: string,
  images: string[],
  cp: number | undefined,
  price: number | undefined,
  mrp: number | undefined,
  ptr: number | undefined,
  qty: string,
  stock: string,
  active: string,
  unit: string,
  net_qty: string,
  mfd_by: string,
  mfg_date: string,
  exp_date: string,
  batch_no: string,
  hsn_code: string,
  bonus: string,
  tax_type: string,
  bar_code: string,
  tax_value: number | undefined | string

}

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.page.html',
  styleUrls: ['./create-item.page.scss'],
})
export class CreateItemPage implements OnInit {

  itemDisplayImage = "";

  itemCategories: { 'name': string, 'id': string }[] = [];

  isUpdating = false;

  itemDetails: ItemDetails = {
    _id: this.firestore.createId(),
    name: '',
    description: '',
    cat_id: '',
    images: [],
    cp: undefined,
    price: undefined,
    mrp: undefined,
    ptr: undefined,
    qty: '',
    stock: 'yes',
    active: 'yes',
    unit: '',
    net_qty: '',
    mfd_by: '',
    mfg_date: '',
    exp_date: '',
    batch_no: '',
    hsn_code: '',
    bar_code: '',
    bonus: '',
    tax_type: 'GST',
    tax_value: undefined
  }

  private itemsCollection!: AngularFirestoreCollection<any>;

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage, private loadingCtrl: LoadingController, private navCtrl: NavController,
    private generalServices: GeneralService, private alertController: AlertController, public route: ActivatedRoute) {

    this.itemsCollection = this.firestore.collection<any>('itemmaster');

  }

  ngOnInit() {

    this.initItemCategories()

    this.route.queryParams.subscribe((data: any) => {

      if (data._id) {

        this.isUpdating = true;

        this.itemDetails._id = data._id,
        this.itemDetails.name = data.name,
        this.itemDetails.description = data.description,
        this.itemDetails.cat_id = data.cat_id,
        this.itemDetails.images = data.images,
        this.itemDetails.cp = data.cp,
        this.itemDetails.price = data.price,
        this.itemDetails.mrp = data.mrp,
        this.itemDetails.ptr = data.ptr,
        this.itemDetails.qty = data.qty,
        this.itemDetails.stock = data.stock,
        this.itemDetails.active = data.active,
        this.itemDetails.unit = data.unit,
        this.itemDetails.net_qty = data.net_qty,
        this.itemDetails.mfd_by = data.mfd_by,
        this.itemDetails.mfg_date = data.mfg_date,
        this.itemDetails.exp_date = data.exp_date
        this.itemDetails.batch_no = data.batch_no
        this.itemDetails.bonus = data.bonus
        this.itemDetails.tax_type = data.tax_type
        this.itemDetails.tax_value = data.tax_value
        this.itemDetails.hsn_code = data.hsn_code
        this.itemDetails.bar_code = data.bar_code

        //  console.log(this.itemDetails)

      }

    });

    //this.addItemCategories('Foods')

  }

  async submit() {

    if (this.checkErrors()) {

      const loading = await this.loadingCtrl.create({
        message: 'Submitting item details'
      });

      loading.present();

      this.uploadItemImage(this.itemDetails.cat_id, this.itemDetails._id, this.itemDisplayImage, loading)
        .then((downloadUrl: string) => {

          loading.message = 'Submitting item details'

          this.itemDetails.images.push(downloadUrl)

          let path = `itemmaster/${this.itemDetails.cat_id}/items/${this.itemDetails._id}`;

          const documentRef = this.firestore.doc(path);
          documentRef.set(this.itemDetails).then((data) => {

            this.generalServices.presentToast('Item added successfully!', 'top', 'checkmark-circle')

            loading.dismiss();

            this.navCtrl.pop();

          }).catch((err) => {

            this.generalServices.presentToast('Item adding failed!', 'top', 'close-circle')
            console.error(err)
            loading.dismiss();

          })

        })
        .catch((error: any) => {
          loading.dismiss();
          console.error(error)
          alert('Image uploading failed!');
        });

    }

  }

  async update() {

    console.log(this.itemDetails)

    if (this.checkErrorsForUpdate()) {

      const loading = await this.loadingCtrl.create({
        message: 'Submitting item details'
      });

      loading.present();

      if (this.itemDisplayImage && this.itemDisplayImage != '') {

        try {

          this.uploadItemImage(this.itemDetails.cat_id, this.itemDetails._id, this.itemDisplayImage, loading)
            .then((downloadUrl: string) => {

              loading.message = 'Updating item details'

              this.itemDetails.images = []

              this.itemDetails.images.push(downloadUrl)

              let path = `itemmaster/${this.itemDetails.cat_id}/items/${this.itemDetails._id}`;

              const documentRef = this.firestore.doc(path);
              documentRef.update(this.itemDetails).then((data) => {

                this.generalServices.presentToast('Item updated successfully!', 'top', 'checkmark-circle')

                loading.dismiss();

                this.navCtrl.pop();

              }).catch((err) => {

                this.generalServices.presentToast('Item updating failed!', 'top', 'close-circle')

                loading.dismiss();

              })

            })
            .catch((error: any) => {
              loading.dismiss();
              alert('Image uploading failed!');
            });


        } catch (e: any) {

          loading.dismiss();
          alert('Image uploading failed!');

        }

      } else {

        try {

          loading.message = 'Updating item details'

          let path = `itemmaster/${this.itemDetails.cat_id}/items/${this.itemDetails._id}`;

          const documentRef = this.firestore.doc(path);
          documentRef.update(this.itemDetails).then((data) => {

            console.log(data)

            this.generalServices.presentToast('Item updated successfully!', 'top', 'checkmark-circle')

            loading.dismiss();

            this.navCtrl.pop();

          }).catch((err) => {

            this.generalServices.presentToast('Item updating failed!', 'top', 'close-circle')

            loading.dismiss();

          })

        } catch (e: any) {

          this.generalServices.presentToast('Item updating failed!', 'top', 'close-circle')

          loading.dismiss();

          console.error(e)

        }

      }

    }

  }

  checkErrors(): Boolean {

    if (this.itemDetails.name == '') {
      alert('Enter Item name')
      return false;
    }

    if (this.itemDetails.cat_id == '') {
      alert('Select Item category')
      return false;
    }

    if (this.itemDetails.cp == undefined) {
      alert('Enter Item Cost price')
      return false;
    }

    if (this.itemDetails.price == undefined) {
      alert('Enter Item Selling price')
      return false;
    }

    if (this.itemDetails.cp == undefined) {
      alert('Enter Item Cost price')
      return false;
    }

    if (this.itemDetails.mrp == undefined) {
      alert('Enter Item MRP')
      return false;
    }

    if (this.itemDetails.ptr == undefined) {
      alert('Enter Item PTR')
      return false;
    }

    if (this.itemDisplayImage == undefined || this.itemDisplayImage == '') {
      alert('Select item display image')
      return false;
    }

    if(this.itemDetails.tax_value == undefined)
      this.itemDetails.tax_value = ''

    return true;

  }

  checkErrorsForUpdate(): Boolean {

    if (this.itemDetails.name == '') {
      alert('Enter Item name')
      return false;
    }

    if (this.itemDetails.cat_id == '') {
      alert('Select Item category')
      return false;
    }

    if (this.itemDetails.cp == undefined) {
      alert('Enter Item Cost price')
      return false;
    }

    if (this.itemDetails.price == undefined) {
      alert('Enter Item Selling price')
      return false;
    }

    if (this.itemDetails.cp == undefined) {
      alert('Enter Item Cost price')
      return false;
    }

    if (this.itemDetails.mrp == undefined) {
      alert('Enter Item MRP')
      return false;
    }

    if (this.itemDetails.ptr == undefined) {
      alert('Enter Item PTR')
      return false;
    }

    // if (this.itemDisplayImage == undefined || this.itemDisplayImage == '') {
    //   alert('Select item display image')
    //   return false;
    // }

    if(this.itemDetails.tax_value == undefined)
      this.itemDetails.tax_value = ''

    return true;

  }

  async selectDisplayImage(e: any) {

    console.log(e.target.files[0])

    let file = e.target.files[0];

    if (file) {

      this.fileToBase64(file)
        .then((base64String: any) => {
          this.itemDisplayImage = 'data:image/jpeg;base64,' + base64String
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

  uploadItemImage(itemCategoryId: string, itemId: string, base64Image: string, loader: HTMLIonLoadingElement): Promise<string> {
    const filePath = `itemimages/${itemCategoryId}/${itemId}/displayImage`;    //  ${uuidv4()
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

  initItemCategories() {

    this.itemCategories = []

    let itemsSubscription: Subscription;

    itemsSubscription = this.itemsCollection.valueChanges().subscribe((data) => {
      data.forEach((element: any, i) => {
        this.itemCategories.push({ id: element.id, name: element.category_name });

        if (i == (data.length - 1)) {

          itemsSubscription.unsubscribe();

        }

      });
    });

  }

  async showAddItemCatPopup() {

    const alert = await this.alertController.create({
      header: 'Add Item Category',
      subHeader: 'Please fill the details below',
      buttons: [{
        text: 'OK',
        handler: (data) => {
          if (data.categoryName && data.categoryName != '') {
            this.addItemCategories(data.categoryName)
          }
        },
      }],
      inputs: [
        {
          name: 'categoryName',
          placeholder: 'Category name',
        }
      ]
    });

    await alert.present();

  }

  addItemCategories(categoryName: string) {

    const docId = this.firestore.createId();

    const newDocument: ItemCategory = {
      id: docId,
      category_name: categoryName
    };

    this.itemsCollection.doc(docId).set(newDocument)
      .then(() => {
        this.initItemCategories();
        this.generalServices.presentToast('Category added successfully!', 'top', 'checkmark-circle')
      })
      .catch(error => {
        this.generalServices.presentToast('Category adding failed!', 'top', 'close-circle')
      });

  }

}

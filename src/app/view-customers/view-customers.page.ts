import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Subscription } from 'rxjs';
import { ItemDetails } from '../create-item/create-item.page';
import { AlertController, NavController } from '@ionic/angular';
import { NaivgationService } from '../services/naivgation.service';
import { NavigationOptions } from '@ionic/angular/providers/nav-controller';
import { Customer } from '../Params';


@Component({
  selector: 'app-view-customers',
  templateUrl: './view-customers.page.html',
  styleUrls: ['./view-customers.page.scss'],
})
export class ViewCustomersPage implements OnInit {

  private customerCollection!: AngularFirestoreCollection<any>;

  customers: Customer[] | undefined;

  constructor(private firestore: AngularFirestore, private alertController: AlertController, private navCtrl: NavController) {

    this.customerCollection = this.firestore.collection<any>('customermaster');

  }

  async ngOnInit() {

    const spanshot = await this.customerCollection.valueChanges().subscribe((documents) => {

      console.log(documents)

      this.customers = documents;

    })

    // this.customerCollection.doc(catId).collection('items').valueChanges().subscribe((data: any) => {

    //   this.selectedCatItems = data;

    // })

  }


  async deleteItem(item: any) {

    const deleteAlert = await this.alertController.create({
      header: 'Alert!',
      subHeader: 'Are you sure to delete this item?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          handler: (data) => {

            this.customerCollection.doc(item.cat_id).collection('items').doc(item._id).delete().then((data) => {

              console.log(data);

              alert('Item Deleted successfully!')

            }).catch((error) => {

              alert('Failed to delete item!')

              console.error(error)

            })

          },
        }],
    });

    await deleteAlert.present();

  }

  editItem(item: any) {

    let navOptions: NavigationOptions = {

      queryParams: {

        _id: item._id,
        name: item.name,
        description: item.description,
        cat_id: item.cat_id,
        images: item.images,
        cp: item.cp,
        price: item.price,
        mrp: item.mrp,
        ptr: item.ptr,
        qty: item.qty,
        stock: item.stock,
        active: item.active,
        unit: item.unit,
        net_qty: item.net_qty,
        mfd_by: item.mfd_by,
        mfg_date: item.mfg_date,
        exp_date: item.exp_date,
        batch_no: item.batch_no,
        bonus: item.bonus,
        tax_type: item.tax_type,
        tax_value: item.tax_value,
        hsn_code: item.hsn_code,
        bar_code: item.bar_code

      }

    };

    this.navCtrl.navigateForward(['create-item'], navOptions)

  }

}

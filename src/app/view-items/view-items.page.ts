import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Subscription } from 'rxjs';
import { ItemDetails } from '../create-item/create-item.page';
import { AlertController, NavController } from '@ionic/angular';
import { NaivgationService } from '../services/naivgation.service';
import { NavigationOptions } from '@ionic/angular/providers/nav-controller';

@Component({
  selector: 'app-view-items',
  templateUrl: './view-items.page.html',
  styleUrls: ['./view-items.page.scss'],
})
export class ViewItemsPage implements OnInit {

  itemCategories: { 'name': string, 'id': string }[] = [];

  selectedCatItems: ItemDetails[] = []

  private itemsCollection!: AngularFirestoreCollection<any>;

  constructor(private firestore: AngularFirestore, private alertController: AlertController, private navCtrl: NavController) {

    this.itemsCollection = this.firestore.collection<any>('itemmaster');

    this.initItemCategories()

  }

  ngOnInit() {



  }

  selectItemCategory(e: any) {

    const catId = e.target.value;

    this.itemsCollection.doc(catId).collection('items').valueChanges().subscribe((data: any) => {

      this.selectedCatItems = data;

    })

  }

  async deleteItem(item: ItemDetails) {

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

            this.itemsCollection.doc(item.cat_id).collection('items').doc(item._id).delete().then((data) => {

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

  async deleteCategory(cat_id: string) {

    const deleteAlert = await this.alertController.create({
      header: 'Alert!',
      subHeader: 'Are you sure to delete this category? Releated items will be also deleted.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          handler: (data) => {

            this.itemsCollection.doc(cat_id).delete().then((data) => {

              this.initItemCategories()

              alert('category Deleted successfully!')

            }).catch((error) => {

              alert('Failed to delete category!')

              console.error(error)

            })

          },
        }],
    });

    await deleteAlert.present();

  }

  editItem(item: ItemDetails) {

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

  initItemCategories() {

    this.itemCategories = []

    let itemsSubscription: Subscription;

    itemsSubscription = this.itemsCollection.valueChanges().subscribe((data) => {
      data.forEach((element: any, i) => {
        this.itemCategories.push({ id: element.id, name: element.category_name });

        if (i == (data.length - 1)) {

          this.selectItemCategory(

            {
              target: {
                value: this.itemCategories[0].id
              }
            }

          )

          itemsSubscription.unsubscribe();

        }

      });
    });

  }

}

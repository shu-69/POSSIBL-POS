import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { DB_PARAMS, FavouriteItem } from 'src/app/Params';
import { UserDetails } from 'src/app/UserDetails';
import { GeneralService } from 'src/app/services/general.service';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { setTimeout } from 'timers';

@Component({
  selector: 'app-item-hold-options',
  templateUrl: './item-hold-options.component.html',
  styleUrls: ['./item-hold-options.component.scss'],
})

export class ItemHoldOptionsComponent implements OnInit {

  @Input() itemId!: string;

  @Input() catId!: string;

  @Input() active!: string;

  isItemIsFavItem : Boolean = false;

  constructor(private popoverController: PopoverController, private generalServices: GeneralService, private sqliteService: SQLiteService) { }

  ngOnInit() {

    this.isItemIsFavItem = this.checkIfItemAddedToFavItems(this.catId, this.itemId);

  }

  addToFav() {

    let favItem: FavouriteItem = {
      user_id: UserDetails.Id,
      cat_id: this.catId,
      item_id: this.itemId
    }

    this.generalServices.addFavouriteItemsOffline(favItem).then((data) => {

      this.isItemIsFavItem = true;

      this.generalServices.initUserFavItems(UserDetails.Id);
      
      this.generalServices.presentToast('Item added to favorites!', 'top', 'checkmark-circle')

    }).catch((err) => {

      console.log(err)

      this.generalServices.presentToast('Adding item to favorites failed!', 'top', 'close-circle')

    })

  }

  removeFromFav() {

    let favItem: FavouriteItem = {
      user_id: UserDetails.Id,
      cat_id: this.catId,
      item_id: this.itemId
    }

    this.generalServices.removeFavouriteItemOffline(favItem).then((data) => {

      this.isItemIsFavItem = false;

      this.generalServices.initUserFavItems(UserDetails.Id);
      
      this.generalServices.presentToast('Item removed from favorites!', 'top', 'checkmark-circle')

    }).catch((err) => {

      console.log(err)

      this.generalServices.presentToast('Removing item from favorites failed!', 'top', 'close-circle')

    })

  }

  enableItem() {

    let query = `UPDATE ${DB_PARAMS.DB_TABLES_NAMES.ITEMS} SET ${DB_PARAMS.ITEMS_TABLE_COLUMNS.ACTIVE} = 'YES' 
    WHERE ${DB_PARAMS.ITEMS_TABLE_COLUMNS.ID} = '${this.itemId}' AND ${DB_PARAMS.ITEMS_TABLE_COLUMNS.CAT_ID} = '${this.catId}';`;

    this.sqliteService.executeQuery(query).then((data) => {

      this.active = 'YES';

      this.generalServices.initItems().then((data) => {

        this.close(true)

      }).catch((err) => {

        this.close(false)

      })

      this.generalServices.presentToast('Item enabled!', 'top', 'checkmark-circle')

    }).catch((err) => {

      this.generalServices.presentToast('Enabling item failed!', 'top', 'close-circle')

    })

  }

  disableItem() {

    let query = `UPDATE ${DB_PARAMS.DB_TABLES_NAMES.ITEMS} SET ${DB_PARAMS.ITEMS_TABLE_COLUMNS.ACTIVE} = 'NO' 
    WHERE ${DB_PARAMS.ITEMS_TABLE_COLUMNS.ID} = '${this.itemId}' AND ${DB_PARAMS.ITEMS_TABLE_COLUMNS.CAT_ID} = '${this.catId}';`;

    this.sqliteService.executeQuery(query).then((data) => {

      this.active = 'NO';

      this.generalServices.initItems().then((data) => {

        this.close(true)

      }).catch((err) => {

        this.close(false)

      })

      this.generalServices.presentToast('Item disabled!', 'top', 'checkmark-circle')

    }).catch((err) => {

      this.generalServices.presentToast('Disabling item failed!', 'top', 'close-circle')

    })

  }

  checkIfItemAddedToFavItems(cat_id: string | number, item_id: string | number) : Boolean {

    let item = UserDetails.FavouriteItems.filter(element => ( element.cat_id == cat_id && element.item_id == item_id ));

    return item.length == 0 ? false : true;

  }

  close(reloadItems: Boolean) {

    this.popoverController.dismiss({reloadItems: reloadItems})

  }

}

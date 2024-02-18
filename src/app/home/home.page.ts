import { AfterViewInit, Component, ViewChild, ElementRef, OnInit, AfterViewChecked, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { StatusBar } from '@capacitor/status-bar';
import { AlertController, IonFab, MenuController, ModalController, NavController, Platform, PopoverController, ToastController, ViewDidEnter } from '@ionic/angular';
import { Observable, Subscription, interval as observableInterval } from "rxjs";
import { takeWhile, scan, tap, startWith, map } from "rxjs/operators";

import { ClearItemsDialogComponent } from '../components/clear-items-dialog/clear-items-dialog.component';
import { OptionsComponent } from '../components/options/options.component';
import { QuantityChangerDialogComponent } from '../components/quantity-changer-dialog/quantity-changer-dialog.component';
import { SaveOrderDraftConfirmationDialogComponent } from '../components/save-order-draft-confirmation-dialog/save-order-draft-confirmation-dialog.component';
import { Customer, DraftOrder, FavouriteItem, User, Address, Params } from '../Params';
import { GeneralService } from '../services/general.service';
import { UserDetails } from '../UserDetails';
import { SaveOrderDialogComponent } from '../components/save-order-dialog/save-order-dialog.component';
import { UserDetailsService } from '../services/userdetails.service';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';
import { ItemHoldOptionsComponent } from '../components/item-hold-options/item-hold-options.component';
import { DiscountDialogComponent } from '../components/discount-dialog/discount-dialog.component';
import { OrderLookupComponent } from '../components/order-lookup/order-lookup.component';
import { Title } from '@angular/platform-browser';
import { SearchCustomerDialogComponent } from '../components/search-customer-dialog/search-customer-dialog.component';
import { ReprintDialogComponent } from '../components/reprint-dialog/reprint-dialog.component';
import { FormControl } from '@angular/forms';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';

import Keyboard from 'simple-keyboard';
interface MenuItem {

  "id": string,
  "label": string,
  "classlist": string[],
  "f": CallableFunction

}
export interface Items {
  _id: string
  category_name: string,
  items:
  {
    _id: string
    name: string,
    cat_id: string,
    images: string[]
    image_source_tpye: string
    price: Number,
    mrp: Number,
    ptr: Number,
    qty: string,
    stock: string,
    active: string,
    hsn: string,
    batch: string,
    mfg_date: string,
    exp_date: string,
    bonus: string,
    tax_type: string,
    tax_value: string,
    bar_code: string,
    packing: string

  }[]
}

export interface Charges {

  'subtotal': number,
  'tips': number,
  'charges': number,
  'roundoff': number,
  'tax': number,
  'discount': Discount

}

export interface ShippingDetails {

  'name': string,
  'address': string

}

export interface Discount {

  discontType: 'percent' | 'amount',
  discountPercentage?: number,
  discountAmount?: number

}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class HomePage implements OnInit, AfterViewChecked, AfterViewInit, ViewDidEnter {

  saveSuccessAnimationOption: AnimationOptions = {
    path: 'assets/anims/checkmark-animation.json',
    loop: true,
    autoplay: true,

  };

  @ViewChild('itemsCategoryContainer') itemsCategoryContainer: ElementRef | undefined;

  @ViewChild('movableMenu') movableMenu!: ElementRef;

  @ViewChild('floatingLoader') floatingLoader!: ElementRef;

  @ViewChild('floatingOrderSuccessPopup') floatingOrderSuccessPopup!: ElementRef;

  @ViewChild('movableMenuFab') movableMenuFab!: HTMLIonFabElement;

  @ViewChild('seg2ParentContainer') seg2ParentContainer!: ElementRef;

  @ViewChild('seg2Footer') seg2Footer!: ElementRef;

  @ViewChild('simpleKeyboard') simpleKeyboard!: ElementRef;

  BASE_URL = Params.BASE_URL;

  ITEM_EXP_DATE_WARNING_DAYS_BEFORE = 60;

  charges: Charges = {

    subtotal: 0.00,
    tips: 0.00,
    charges: 0.00,
    roundoff: 0.00,
    tax: 0.00,
    discount: { 'discontType': 'percent', discountPercentage: 0, discountAmount: 0 }

  }

  customer: Customer = {
    id: '',
    name: '',
    contact: '',
    email: '',
    address: '',
    gstno: '',
    dlno: '',
    state: ''
  }

  shippingDetails: ShippingDetails = {
    name: '',
    address: ''
  }

  logged_in_user_name = UserDetails.Name;

  selectedCategoryIndex = 0;

  items: Items[] = UserDetails.Items;

  selectedItems: { cat_id: string, item: any, details: { quantity: number } }[] = [];

  menuTranslate = [0, 0];

  menuItems: MenuItem[] = [

    {
      id: "menu1",
      label: 'Customer Search',
      classlist: ['menu-item', 'fa', 'fa-home'],
      f: () => {

        console.log('1')
        this.toogleSeg2Footer();

      }

    },
    {
      id: "menu2",
      label: 'Customer Search',
      classlist: ['menu-item', 'fa', 'fa-user'],
      f: () => {

        console.log('1')
        this.toogleSeg2Footer();

      }
    },
    {
      id: "menu3",
      label: 'Customer Search',
      classlist: ['menu-item', 'fa', 'fa-pie-chart'],
      f: () => {

        console.log('1')
        this.toogleSeg2Footer();

      }
    },
    {
      id: "menu4",
      label: 'Customer Search',
      classlist: ['menu-item', 'fa', 'fa-cog'],
      f: () => {

        console.log('1')
        this.toogleSeg2Footer();

      }
    },
    {
      id: "menu5",
      label: 'Customer Search',
      classlist: ['menu-item', 'fa', 'fa-home'],
      f: () => {

        console.log('1')
        this.toogleSeg2Footer();

      }
    },
    {
      id: "menu6",
      label: 'Customer Search',
      classlist: ['menu-item', 'fa', 'fa-minus'],
      f: () => {

        console.log('1')
        this.toogleSeg2Footer();

      }
    },
    {
      id: "menu7",
      label: 'Customer Search',
      classlist: ['menu-item', 'fa', 'fa-pie-chart'],
      f: () => {

        console.log('1')
        this.toogleSeg2Footer();

      }
    },
    {
      id: "menu8",
      label: 'Customer Search',
      classlist: ['menu-item', 'fa', 'fa-cog'],
      f: () => {

        console.log('1')
        this.toogleSeg2Footer();

      }
    },
    {
      id: "menu9",
      label: 'Customer Search',
      classlist: ['menu-item', 'fa', 'fa-user'],
      f: () => {

        console.log('1')
        this.toogleSeg2Footer();

      }
    },
    {
      id: "menu10",
      label: 'Customer Search',
      classlist: ['menu-item', 'fa', 'fa-pie-chart'],
      f: () => {

        console.log('1')
        this.toogleSeg2Footer();

      }
    }

  ]

  notes = '';

  loaderMessage = 'Please wait...';

  isSearchingItemCode = false

  Keyboard: Keyboard | undefined

  myControl = new FormControl('');
  itemNames: { 'name': string, 'cat_id': string, '_id': string }[] = []
  filteredOptions!: Observable<any[]>;

  private orderSuccessPopupTriggerSubscription: Subscription;

  keyboardLayoutType: 'numbers' | 'default' | 'shift' = 'default';

  constructor(public platform: Platform, private modalCtrl: ModalController, private toastController: ToastController, private popoverController: PopoverController,
    public genralServices: GeneralService, public navCtrl: NavController, public userDetails: UserDetailsService, private cdr: ChangeDetectorRef,
    private alertController: AlertController, private barcodeScanner: BarcodeScanner, private titleService: Title) {



    this.orderSuccessPopupTriggerSubscription = this.genralServices.getOrderSuccessSubjectTriggerObservable().subscribe(() => {

      this.showOrderSuccessPopup()

    });

  }

  async ngOnInit() {

    this.filteredOptions = this.myControl.valueChanges.pipe(startWith(''), map(value => this._filter(value || '')),
    );

    this.initItemsNameAutoComplete()

    //  console.log('Home page items', this.items)

    // console.log('Fav Item >> ', this.genralServices.getItemDetails('408', '1682329549824'))

    // console.log('Fav Items >> ', this.userDetails.getFavItems())

  }

  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();

    return this.itemNames.filter((option: any) => option.name.toLowerCase().includes(filterValue));
  }

  ngOnDestroy() {
    //  this.orderSuccessPopupTriggerSubscription.unsubscribe();    // TODO :: ::
  }

  ngAfterViewInit() {

    //this.initMenuItemsClickListeners();

  }

  ngAfterViewChecked() {

    this.updateAmountAndCharges();

    // this.menuTranslate = [this.movableMenu.nativeElement.getBoundingClientRect().x, this.movableMenu.nativeElement.getBoundingClientRect().y]; 
    // console.log("Transform", this.menuTranslate);
  }

  ionViewDidEnter() {

    

  }

  ionViewWillEnter() {

    this.items = UserDetails.Items;

    StatusBar.show();
    StatusBar.setBackgroundColor({ color: '#5DD462' });

    this.menuTranslate = [this.movableMenu.nativeElement.getBoundingClientRect().x, this.movableMenu.nativeElement.getBoundingClientRect().y];  // TODO :: Subtract header height from y axis value if header is outside the parent element;

    //StatusBar.setOverlaysWebView({ overlay: false });  
  }

  onDragStart(e: any) {
    e.set(this.menuTranslate);
  }

  onDrag(e: any) {
    this.menuTranslate = e.beforeTranslate;

    e.target.style.transform = `translate(${this.menuTranslate[0]}px, ${this.menuTranslate[1]}px)`;
  }
  
  initItemsNameAutoComplete() {

    this.itemNames = [];

    this.itemNames = this.items.flatMap(item => item.items.map(subItem => ({
      name: subItem.name,
      cat_id: subItem.cat_id,
      _id: subItem._id.toString()
    })));

  }

  handleItemDropDownSelect(_id: string | number) {

    for (let i = 0; i < this.items.length; i++) {

      for (let j = 0; j < this.items[i].items.length; j++) {

        const thisItem = this.items[i].items[j];

        if (thisItem._id == _id) {

          if (this.checkItemSelected(thisItem.cat_id, thisItem._id)) {

            this.updateSelectedItemQuantity(thisItem.cat_id, thisItem._id, 1)

            //  this.genralServices.presentToast('Item already selected!', "top", "alert-circle")

          } else {

            this.selectItem(thisItem.cat_id, thisItem)

            this.selectedCategoryIndex = i

            setTimeout(() => {
              this.scrollCategoryAndFocusItem('itemsContainerContent', `item-${thisItem.cat_id}-${thisItem._id}`)
            }, 50);

          }

          i == this.items.length; // Breaking outer loop

          break;

        }

      }

    }

  }

  handleItemCodeChange(e: any) {

    const itemCode = e.target.value

    if(itemCode === '')
      return

    this.isSearchingItemCode = true;

    for (let i = 0; i < this.items.length; i++) {

      for (let j = 0; j < this.items[i].items.length; j++) {

        const thisItem = this.items[i].items[j];

        if (thisItem.bar_code == itemCode) {

          if (this.checkItemSelected(thisItem.cat_id, thisItem._id)) {

            this.updateSelectedItemQuantity(thisItem.cat_id, thisItem._id, 1)

            //  this.genralServices.presentToast('Item already selected!', "top", "alert-circle")

          } else {

            this.selectItem(thisItem.cat_id, thisItem)

            this.selectedCategoryIndex = i

            setTimeout(() => {
              this.scrollCategoryAndFocusItem('itemsContainerContent', `item-${thisItem.cat_id}-${thisItem._id}`)
            }, 50);

          }

          this.isSearchingItemCode = false;

          i == this.items.length; // Breaking outer loop

          break;

        }

      }

      if (i == (this.items.length - 1)) {
        this.isSearchingItemCode = false;
      }

    }

  }

  scrollCategoryAndFocusItem(parentId: string, childId: string, catIndex?: number): void {

    if (catIndex) {

      this.selectedCategoryIndex = catIndex

      setTimeout(() => {

        const parentElement = document.getElementById(parentId);
        //const childElement = parentElement?.querySelector(`#${childId}`) as HTMLElement;
        const childElement = document.getElementById(childId);

        if (parentElement && childElement) {
          const parentRect = parentElement.getBoundingClientRect();
          const childRect = childElement.getBoundingClientRect();

          const parentScrollTop = parentElement.scrollTop;
          const parentScrollLeft = parentElement.scrollLeft;

          const childOffsetTop = childRect.top - parentRect.top + parentScrollTop;
          const childOffsetLeft = childRect.left - parentRect.left + parentScrollLeft;

          parentElement.scrollTo({
            top: childOffsetTop,
            left: childOffsetLeft,
            behavior: 'smooth'
          });

          childElement.setAttribute('tabindex', '0');
          childElement.focus();
        }

      }, 50);

    } else {

      const parentElement = document.getElementById(parentId);
      //const childElement = parentElement?.querySelector(`#${childId}`) as HTMLElement;
      const childElement = document.getElementById(childId);

      if (parentElement && childElement) {
        const parentRect = parentElement.getBoundingClientRect();
        const childRect = childElement.getBoundingClientRect();

        const parentScrollTop = parentElement.scrollTop;
        const parentScrollLeft = parentElement.scrollLeft;

        const childOffsetTop = childRect.top - parentRect.top + parentScrollTop;
        const childOffsetLeft = childRect.left - parentRect.left + parentScrollLeft;

        parentElement.scrollTo({
          top: childOffsetTop,
          left: childOffsetLeft,
          behavior: 'smooth'
        });

        childElement.setAttribute('tabindex', '0');
        childElement.focus();
      }

    }

  }

  startBarCodeScan(itemCodeInput: HTMLInputElement) {

    this.barcodeScanner.scan().then(barcodeData => {

      itemCodeInput.value = barcodeData.text;

      this.handleItemCodeChange(
        {
          target: {
            value: barcodeData.text
          }
        }
      )

    }).catch(err => {
      console.log('Error', err);
    });

  }

  async toogleMenu() {

    document.getElementById('circularMenu')!.classList.toggle('active');

    // console.log("Class list", document.getElementById('circularMenu')!.classList);

  }

  async toogleFabMenu() {

    this.movableMenuFab.activated = !this.movableMenuFab.activated;

  }

  async openOptions(e: any) {

    const popover = await this.popoverController.create({
      component: OptionsComponent,
      event: e,
      mode: 'ios',
      arrow: true,
      animated: false,
      // side: "top",
      // alignment: "end",
      // size: "auto",
      cssClass: "optionsPopup",
      componentProps: {

        'charges': this.charges

      }
    });

    await popover.present();

    const { data, role } = await popover.onDidDismiss();

    if (data != undefined) {

      // console.log("home", data)

      this.charges.tips = data.charges.tips;

    }

  }

  async openDiscountDialog() {

    const modal = await this.modalCtrl.create({
      component: DiscountDialogComponent,
      cssClass: 'discountDialog',
      componentProps: {
        discount: this.charges.discount,
      }
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (data != undefined) {

      if (data.confirm) {

        switch (data.discountType) {
          case 'percent':

            this.charges.discount.discountPercentage = data.discountValue;

            break;

          case 'amount':

            this.charges.discount.discountAmount = data.discountValue

            break;

          default:
            break;
        }

      }

    }

  }

  async openSavDialog() {

    if (this.selectedItems == undefined || this.selectedItems.length == 0) {
      return;
    }

    const modal = await this.modalCtrl.create({
      component: SaveOrderDialogComponent,
      cssClass: 'saveDialog',
      componentProps: {
        items: this.selectedItems,
        customerDetails: this.customer,
        charges: this.charges,
        notes: this.notes,
        shippingDetails: this.shippingDetails
      }
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (data != undefined) {

      if (data.orderSaved) {

        this.showOrderSuccessPopup();

        this.resetPage();

      }

    }

  }

  async openCustomerSearchDialog() {

    const modal = await this.modalCtrl.create({
      component: SearchCustomerDialogComponent,
      cssClass: 'searchCustomerDialog',
      componentProps: {

      }
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (data != undefined) {

      if (data.customer) {

        this.customer = data.customer

      }

    }

  }

  async openOrderLookup() {

    const modal = await this.modalCtrl.create({
      component: OrderLookupComponent,
      cssClass: 'orderLookupDialog',
      componentProps: {
      }
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

  }

  async openReprint() {

    const modal = await this.modalCtrl.create({
      component: ReprintDialogComponent,
      cssClass: 'reprintDialog',
      componentProps: {
      }
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

  }

  updateAmountAndCharges() {

    let subtotal = 0;

    this.selectedItems.forEach(element => {

      let item = element;

      subtotal += item.item.price * item.details.quantity;

      //  Calcualting tax for the items

      if (item.item.tax_value != undefined && item.item.tax_value != 'undefined' && item.item.tax_value != '' && !Number.isNaN(item.item.tax_value)) {

        let tax = ((item.item.price * (item.item.tax_value / 100)) * item.details.quantity);

        subtotal += tax;

      }

    });

    this.charges.subtotal = subtotal;

    // Calculating discounts

    if (this.charges.discount) {

      switch (this.charges.discount.discontType) {

        case 'percent':

          this.charges.discount.discountAmount = (subtotal * (this.charges.discount.discountPercentage! / 100));

          subtotal = subtotal - this.charges.discount.discountAmount;

          break;

        case 'amount':

          subtotal = subtotal - this.charges.discount.discountAmount!;

          break;

        default:
          break;
      }

    }

    // Calculating taxes

    if (this.userDetails.getTax() && this.userDetails.getTax().valueInPercent) {

      const taxPer = Number(this.userDetails.getTax().valueInPercent);

      this.charges.tax = (subtotal * taxPer) / 100;

    } else {
      this.charges.tax = NaN;
    }

    this.cdr.detectChanges();

    // console.log(subtotal);

    //return subtotal;

  }

  selectItem(cat_id: string | string, item: any) {

    if (item.active.toLowerCase() == 'no')
      return;

    // if(typeof cat_id == 'string'){

    //   cat_id = Number(cat_id)

    // }

    this.selectedItems.push({ cat_id, item, details: { "quantity": 1 } });

    // for (let i = 0; i < this.selectedItems.length; i++) {

    //   if (cat_id == this.selectedItems[i].cat_id && item._id == this.selectedItems[i].item._id) {

    //     return;

    //   }

    // }

    // this.selectedItems.push({ cat_id, item, details: { "quantity": 1 } });
    // this.toast(item.name + " Item added");

  }

  async openChargesPopup() {

    const alert = await this.alertController.create({
      header: 'Charges',
      subHeader: 'Enter amount',
      buttons: [{
        text: 'OK',
        handler: (data) => {
          if (data.charges && data.charges != '' && !isNaN(Number(data.charges))) {

            this.charges.charges = Number(data.charges)

          }
        },
      }],
      inputs: [
        {
          name: 'charges',
          placeholder: 'Amount',
        }
      ]
    });

    await alert.present();

  }

  async clearSelectedItems() {

    if (this.selectedItems == undefined || this.selectedItems.length == 0) {
      return;
    }

    const modal = await this.modalCtrl.create({
      component: ClearItemsDialogComponent,
      cssClass: 'dialogDefault',
      componentProps: {
        'totalItemQuantity': this.selectedItems.length
      }
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (data != undefined) {

      if (data.delete) {

        this.selectedItems = [];

      }

    }

  }

  async saveOrderToDraft() {

    if (this.selectedItems.length <= 0) {
      return
    }

    const modal = await this.modalCtrl.create({
      component: SaveOrderDraftConfirmationDialogComponent,
      cssClass: 'dialogDefault'
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (data != undefined) {

      if (data.confirm) {

        this.toogleFloatingLoader(true, "Saving order to draft");

        let orderDetails: DraftOrder = {
          id: Date.now().toString(),
          user_id: UserDetails.Id,
          label: data.label,
          added_on: new Date().toString(),
          notes: this.notes,
          items: this.selectedItems,
          charges: this.charges,
          customer: this.customer
        }

        UserDetails.DraftOrders.push(orderDetails);

        //let result = await this.genralServices.updateDraftOrderOffline(UserDetails.Id, UserDetails.DraftOrders);

        let result = await this.genralServices.addDraftOrderOffline(orderDetails);

        if (result && result.rowsAffected >= 1) {

          setTimeout(() => {

            this.toast("Order saved to draft!", 'top', 'bag-check');

            this.resetPage();

            this.toogleFloatingLoader(false);

          }, 1500);

        } else {

          this.toast("Order saving failed!", 'top');

          this.toogleFloatingLoader(false);

          UserDetails.DraftOrders = UserDetails.DraftOrders.filter(element => element != orderDetails)

        }

        console.log("Saving order to draft result", result);

      }

    }

  }

  resetPage() {

    this.charges = {

      subtotal: 0.00,
      tips: 0.00,
      charges: 0.00,
      roundoff: 0.00,
      tax: 0.00,
      discount: { discontType: 'percent', discountPercentage: 0, discountAmount: 0 }

    }

    this.customer = {

      id: '',
      name: '',
      address: '',
      contact: '',
      email: '',
      gstno: '',
      dlno: '',
      state: ''

    }

    this.shippingDetails = {

      name: '',
      address: ''

    }

    this.selectedCategoryIndex = 0;

    this.selectedItems = [];

    this.notes = '';

    this.loaderMessage = 'Please wait...';

  }

  showOrderSuccessPopup() {

    this.floatingOrderSuccessPopup.nativeElement.classList.add('active');

    setTimeout(() => {

      this.removeOrderSuccessPopup()

    }, 5000);

  }

  removeOrderSuccessPopup() {

    this.floatingOrderSuccessPopup.nativeElement.classList.remove('active');

    this.floatingOrderSuccessPopup.nativeElement.classList.add('inactive');

    setTimeout(() => {

      this.floatingOrderSuccessPopup.nativeElement.classList.remove('inactive');

    }, 1000);

  }

  async openQuantityChangerDialog(cat_id: string, item: any) {

    const modal = await this.modalCtrl.create({
      component: QuantityChangerDialogComponent,
      cssClass: 'dialogDefault',
      componentProps: {
        'quantity': this.getSelectedItemDetails(cat_id, item._id).quantity,
      }
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (data != undefined) {

      this.getSelectedItemDetails(cat_id, item._id).quantity = data.quantity;

    }

  }

  getSelectedItemDetails(cat_id: string, item_id: string) {

    for (let i = 0; i < this.selectedItems.length; i++) {

      if (cat_id == this.selectedItems[i].cat_id && item_id == this.selectedItems[i].item._id) {

        return this.selectedItems[i].details;

      }

    }

    return { "quantity": 0 };       // TODO :: Update this if changed

  }

  updateSelectedItemQuantity(cat_id: string, item_id: string, updateQuantityBy: number) {

    for (let i = 0; i < this.selectedItems.length; i++) {

      if (cat_id == this.selectedItems[i].cat_id && item_id == this.selectedItems[i].item._id) {

        this.selectedItems[i].details.quantity += updateQuantityBy;

        if (this.selectedItems[i].details.quantity <= 0) {

          //this.selectedItems =  this.selectedItems.splice(i, 1).slice(0, this.selectedItems.length);

          this.selectedItems = this.selectedItems.filter(item => item !== this.selectedItems[i]);   //(item.item._id !== this.selectedItems[i].item._id && item.cat_id !== this.selectedItems[i].cat_id)

          return

        }


        console.log(this.selectedItems);

      }

    }

  }

  checkArray() {
    console.log(this.selectedItems)
  }

  checkItemSelected(cat_id: Number | string, item_id: Number | string) {

    for (let i = 0; i < this.selectedItems.length; i++) {

      if (cat_id == this.selectedItems[i].cat_id && item_id == this.selectedItems[i].item._id) {

        return true;

      }

    }

    return false

  }

  checkItemExpDate(expDate: string): { 'expired': boolean, 'daysLeft': number, 'value': string } {

    const currentDate = new Date();
    const expirationDate = new Date(expDate);

    const timeDiff = expirationDate.getTime() - currentDate.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysLeft < 0) {
      const expiredDaysAgo = Math.abs(daysLeft);
      return {
        expired: true,
        daysLeft: 0,
        value: `Expired ${expiredDaysAgo} days ago`,
      };
    } else {
      return {
        expired: false,
        daysLeft,
        value: `Expiring in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
      };
    }

  }

  selectCategory(_id: string) {

    this.items.forEach((element, index) => {

      if (_id == element._id) {

        this.selectedCategoryIndex = index;

        let container: HTMLElement = document.getElementById('itemsContainerContent')!;

        this.scrollToTop(container);

      }

    });

  }

  scrollToTop(el: any) {
    const duration = 100;
    const interval = 5;
    const move = el.scrollTop * interval / duration;
    observableInterval(interval).pipe(
      scan((acc, curr) => acc - move, el.scrollTop),
      tap(position => el.scrollTop = position),
      takeWhile(val => val > 0)).subscribe();
  }

  goCategoryOneStepTop() {

    if (this.selectedCategoryIndex - 1 < 0) {
      this.toast("You reached at the top of category")
      return;
    }

    this.selectedCategoryIndex -= 1;

    let container: HTMLElement = document.getElementById('itemsContainerContent')!;

    this.scrollToTop(container);

  }

  goCategoryOneStepDown() {

    if (this.items && this.selectedCategoryIndex + 1 > this.items.length - 1) {
      this.toast("You reached at the end of category")
      return;
    }

    this.selectedCategoryIndex += 1;

    let container: HTMLElement = document.getElementById('itemsContainerContent')!;

    this.scrollToTop(container);

  }

  triggerItemCategoryContainer() {

    let container: HTMLElement = document.getElementById('seg2Container')!;
    let itemsCategoryContainer: HTMLElement = document.getElementById('itemsCategoryContainer')!;
    let itemsParentContainer: HTMLElement = document.getElementById('itemsParentContainer')!;
    let itemsContainer: HTMLElement = document.getElementById('itemsContainer')!;
    let triggerButtonIcon: HTMLElement = document.getElementById('triggerItemsCategoryButtonIcon')!;

    if (itemsCategoryContainer.classList.contains('collapsed')) {

      itemsCategoryContainer.classList.toggle('collapsed');

      container.style.gridTemplateColumns = "repeat(2, 20% 80%)";

      itemsContainer.style.gridTemplateColumns = "repeat(3, 1fr)";

      itemsParentContainer.style.marginLeft = "2px";

      // triggerButtonIcon.classList.add('forward');
      // triggerButtonIcon.classList.remove('backward');

      triggerButtonIcon.style.rotate = "360deg";

    } else {

      itemsCategoryContainer.classList.toggle('collapsed');

      container.style.gridTemplateColumns = "repeat(1, 0 100%)";

      itemsContainer.style.gridTemplateColumns = "repeat(4, 1fr)";

      itemsParentContainer.style.marginLeft = "0";

      triggerButtonIcon.style.rotate = "180deg";

      // triggerButtonIcon.classList.remove('forward');
      // triggerButtonIcon.classList.add('backward');

    }



  }

  initMenuItemsClickListeners() {  // TODO :: Remove

    this.menuItems.forEach((element, index) => {

      console.log("Adding event listener", element.id)

      let menuElement: HTMLElement = document.getElementById(element.id)!;

      menuElement.addEventListener('click', function () {

        console.log(element.id + " Clicked!")
        element.f();

      })

    });

  }

  async itemLongPress(e: Event, catId: any, itemId: any, active: string) {

    const popover = await this.popoverController.create({
      component: ItemHoldOptionsComponent,
      event: e,
      mode: 'ios',
      arrow: true,
      animated: false,
      cssClass: 'item-hold-popup',
      side: "left",
      // alignment: "start",
      size: "auto",
      componentProps: {
        itemId: itemId,
        catId: catId,
        active: active
      }
    });

    await popover.present();

    const { data, role } = await popover.onDidDismiss();

    if (data) {

      if (data.reloadItems) {

        this.items = UserDetails.Items

      }

    }

  }

  toogleFloatingLoader(toShow: Boolean, loaderMessage?: string) {

    loaderMessage ? this.loaderMessage = loaderMessage : '';

    if (toShow) {

      this.floatingLoader.nativeElement.classList.add('active');
      this.floatingLoader.nativeElement.classList.remove('inactive');

    } else {

      this.floatingLoader.nativeElement.classList.add('inactive');
      this.floatingLoader.nativeElement.classList.remove('active');

    }

  }

  toogleSeg2Footer() {

    try {

      console.log('Footer')

      this.seg2Footer.nativeElement.classList.toggle('active');

      this.seg2ParentContainer.nativeElement.classList.toggle('no-footer');

    } catch (e) {

      console.log("Can't toogle footer", e)

    }

  }

  closeSeg2Footer() {

    this.seg2Footer.nativeElement.classList.remove('active');

    this.seg2ParentContainer.nativeElement.classList.add('no-footer');

  }
  
  openOnScreenKeyboard(inputField: HTMLInputElement) {

    this.simpleKeyboard.nativeElement.classList.remove('inactive')
    this.simpleKeyboard.nativeElement.classList.add('active')

    if (this.Keyboard) {
      this.Keyboard.destroy()
    }

    this.Keyboard = new Keyboard({
      onChange: input => onChange(input),
      onKeyPress: button => onKeyPress(button),
      layout: {
        default: this.getKeyboardLayout(this.keyboardLayoutType)
      }
    });

    this.Keyboard.setInput(inputField.value)

    let onChange = (input: any) => {
      inputField.value = input;

      this.handleItemCodeChange(
        {
          target: {
            value: inputField.value
          }
        }
      )

    }

    function onKeyPress(button: any) {
      if (button === "{shift}" || button === "{lock}") handleShift();
    }

    let handleShift = () => {

      this.keyboardLayoutType = this.keyboardLayoutType == 'default' ? 'shift' : 'default';

      let currentLayout = this.Keyboard!.options.layoutName;
      let shiftToggle : 'numbers' | 'default' | 'shift' = currentLayout === "default" ? "shift" : "default";

      this.Keyboard!.setOptions({
        layout: {
          default: this.getKeyboardLayout(this.keyboardLayoutType)
        }
      });
    };

  }

  closeOnScreenKeyboard() {

    this.simpleKeyboard.nativeElement.classList.remove('active')
    this.simpleKeyboard.nativeElement.classList.add('inactive')

    if (this.Keyboard) {
      this.Keyboard.destroy()
    }

  }

  changeKeyboardLayout(e: any) {

    if (e.target.checked) {

      this.keyboardLayoutType = 'numbers';

      this.Keyboard!.setOptions({
        layout: {
          default: this.getKeyboardLayout('numbers')
        }
      });

    } else {

      this.keyboardLayoutType = 'default';

      this.Keyboard!.setOptions({
        layout: {
          default: this.getKeyboardLayout('default')
        }
      });

    }

  }

  getKeyboardLayout(layoutType: 'default' | 'numbers' | 'shift'): string[] {

    switch (layoutType) {

      case 'default':

        return [
          '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
          '{tab} q w e r t y u i o p [ ] \\',
          '{lock} a s d f g h j k l ; \' {enter}',
          '{shift} z x c v b n m , . / {shift}',
          '.com @ {space}'
        ]

      case 'numbers':

        return ['1 2 3', '4 5 6', '7 8 9', '{backspace} 0 {enter}']

        case 'shift':

        return [
          '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
          '{tab} Q W E R T Y U I O P [ ] \\',
          '{lock} A S D F G H J K L ; \' {enter}',
          '{shift} Z X C V B N M , . / {shift}',
          '.com @ {space}'
        ]

      default:

        return [
          '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
          '{tab} q w e r t y u i o p [ ] \\',
          '{lock} a s d f g h j k l ; \' {enter}',
          '{shift} z x c v b n m , . / {shift}',
          '.com @ {space}'
        ]

    }

  }

  async toast(message: string, position?: 'bottom' | 'middle' | 'top', icon?: string) {
    const toast = await this.toastController.create({
      position: position ? position : 'bottom',
      message: message,
      duration: 3000,
      icon: icon ? icon : ''
    });

    await toast.present();
  }

}

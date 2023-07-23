import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DraftOrder, Params } from 'src/app/Params';
import { GeneralService } from 'src/app/services/general.service';
import { UserDetails } from 'src/app/UserDetails';
import { SaveOrderDialogComponent } from '../save-order-dialog/save-order-dialog.component';
import { HomePage } from 'src/app/home/home.page';

@Component({
  selector: 'app-draft-orders',
  templateUrl: './draft-orders.component.html',
  styleUrls: ['./draft-orders.component.scss'],
})
export class DraftOrdersComponent implements OnInit {

  BASE_URL = Params.BASE_URL;

  draftOrders: DraftOrder[] = UserDetails.DraftOrders.reverse();

  isExpanded: Boolean = false;

  isDeletePopupOpen = false;

  selectedOrderForDeleting : any;

  card_content_translateY = 'translateY(0)';

  @ViewChild('popover') popover: any;

  constructor(private generalService: GeneralService, private modalCtrl: ModalController) { }

  async ngOnInit() {

    setTimeout(() => {
      
      //this.close()

    }, 2000);

  }

  async openSavDialog(items: any[], customerDetails: any, charges: any, notes: string, selectedOrder : DraftOrder) {

    const modal = await this.modalCtrl.create({
      component: SaveOrderDialogComponent,
      cssClass: 'saveDialog',
      componentProps: {
        items : items,
        customerDetails : customerDetails,
        charges: charges,
        notes: notes
      }
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (data != undefined) {

      if(data.orderSaved){

        this.selectedOrderForDeleting = selectedOrder;

        this.removeOrder()

        this.close(true)

        setTimeout(() => {

          this.generalService.triggerOrderSuccessPopup();
          
        }, 500);

        //this.resetPage();

      }

    }

  }


  toggleExpand() {

    this.isExpanded = !this.isExpanded;

  }

  getDate(dateStr: string): string {

    let todayDate = new Date();

    let date = new Date(dateStr);

    if (date.getDate() == todayDate.getDate() && date.getMonth() == todayDate.getMonth() && date.getFullYear() && todayDate.getFullYear()) {

      return "Today";

    } else if ((date.getDate() + 1) == todayDate.getDate() && date.getMonth() == todayDate.getMonth() && date.getFullYear() == todayDate.getFullYear()) {

      return "Yesterday";

    } else {
      return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear()
    }

  }

  compareTime(from: string) {

    let now = new Date();
    let past = new Date(from)

    let result = this.getTimeAgo(past);

    let days = result.days;
    let months = result.months;

    let hours = result.hours;
    let minutes = result.minutes;
    let seconds = result.seconds;

    if (days > 0) {
      return days + ' days' + ' ago'
    } else {
      return (hours == 0 ? '' : hours + ' hrs ') + (minutes == 0 ? '' : minutes + ' mins ') + (seconds == 0 || hours > 0 ? '' : seconds + ' secs') + ' ago';
    }

  }

  getTimeAgo(date: Date) {

    const now = new Date();
    const diff = now.getTime() - date.getTime();

    let diffSeconds = Math.floor(diff / 1000);
    let diffMinutes = Math.floor(diff / (1000 * 60));
    let diffHours = Math.floor(diff / (1000 * 60 * 60));
    let diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    let diffMonths = (now.getMonth() + 12 * now.getFullYear()) - (date.getMonth() + 12 * date.getFullYear());

    diffSeconds = diffSeconds % 60;
    diffMinutes = diffMinutes % 60;
    diffHours = diffHours % 24;
    diffDays = diffDays % 30;

    return {
      months: diffMonths,
      days: diffDays,
      hours: diffHours,
      minutes: diffMinutes,
      seconds: diffSeconds,
    };
    
  }

  async removeOrder() {

    console.log('Removing order', this.selectedOrderForDeleting)

    this.isDeletePopupOpen = false;

    UserDetails.DraftOrders = UserDetails.DraftOrders.filter(element => element != this.selectedOrderForDeleting);

    await this.generalService.deleteDraftOrder(UserDetails.Id, this.selectedOrderForDeleting.id);

    this.draftOrders = UserDetails.DraftOrders.reverse();

  }

  presentDeletePopover(e: Event, selectedOrderForDeleting : DraftOrder) {
    this.popover.event = e;
    this.isDeletePopupOpen = true;
    this.selectedOrderForDeleting = selectedOrderForDeleting;
  }

  async close(status: Boolean) {

    setTimeout(async () => {

      this.modalCtrl.dismiss({'status': status})
      
    }, 500);

  }

}

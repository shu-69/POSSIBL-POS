import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserDetails } from 'src/app/UserDetails';

@Component({
  selector: 'app-save-order-draft-confirmation-dialog',
  templateUrl: './save-order-draft-confirmation-dialog.component.html',
  styleUrls: ['./save-order-draft-confirmation-dialog.component.scss'],
})
export class SaveOrderDraftConfirmationDialogComponent implements OnInit {

  confirmationMessage = "Are you sure you want to move this order to draft?";

  orderLabel : string = '#Order ' + UserDetails.DraftOrders.length;

  constructor(private modalController: ModalController) { }

  ngOnInit() {


  }

  async close(confirm: boolean){

    if(this.orderLabel.includes("'")){
      this.orderLabel = this.orderLabel.replace("'", "''");
    }

    await this.modalController.dismiss({

      "confirm": confirm,
      "label": this.orderLabel

    });


  }

}

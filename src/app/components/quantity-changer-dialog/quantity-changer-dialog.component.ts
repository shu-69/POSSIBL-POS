import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-quantity-changer-dialog',
  templateUrl: './quantity-changer-dialog.component.html',
  styleUrls: ['./quantity-changer-dialog.component.scss'],
})
export class QuantityChangerDialogComponent implements OnInit {

  @Input() quantity: number | undefined;

  constructor(private modalController: ModalController) { }

  ngOnInit() { }

  updateQuantity(updateBy: number) {

    this.quantity! += updateBy;

  }

  async returnData() {

    if (this.quantity != undefined && this.quantity > 0) {

      await this.modalController.dismiss({

        "quantity": this.quantity

      });

    } else {

    }


  }


}

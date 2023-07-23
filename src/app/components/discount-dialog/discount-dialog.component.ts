import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Discount } from 'src/app/home/home.page';

@Component({
  selector: 'app-discount-dialog',
  templateUrl: './discount-dialog.component.html',
  styleUrls: ['./discount-dialog.component.scss'],
})
export class DiscountDialogComponent implements OnInit {

  @Input() discount!: Discount;

  constructor(private modalController: ModalController) { }

  ngOnInit() {}

  async close(confirm: boolean, discountType ? : 'percent' | 'amount', discountValue ? : number | string){

    await this.modalController.dismiss({

      "confirm": confirm,
      'discountType': discountType,
      'discountValue': discountValue


    });

  }


}

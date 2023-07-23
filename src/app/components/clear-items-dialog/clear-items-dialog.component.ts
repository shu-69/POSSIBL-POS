import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-clear-items-dialog',
  templateUrl: './clear-items-dialog.component.html',
  styleUrls: ['./clear-items-dialog.component.scss'],
})
export class ClearItemsDialogComponent implements OnInit {

  @Input() totalItemQuantity: number | undefined;

  confirmationMessage = "Are you sure you want to clear all items?";

  constructor(private modalController: ModalController) { }

  ngOnInit() {

    if(this.totalItemQuantity){

      this.confirmationMessage = "Are you sure you want to clear " + this.totalItemQuantity + " selected items?";

      
    }

  }

  async close(confirmDelete: boolean){

    await this.modalController.dismiss({

      "delete": confirmDelete

    });


  }

}

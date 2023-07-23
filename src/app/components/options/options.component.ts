import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { HomePage } from 'src/app/home/home.page';
import { AddTipsDialog } from './dialog-components/add-tips-component';
import { NotesDialog } from './dialog-components/notes-dialog-component';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class OptionsComponent implements OnInit {

  @Input() charges: any;

  constructor(private modalCtrl: ModalController, private popoverController: PopoverController) { }

  ngOnInit() {

    console.log('Options ', this.charges);

  }

  async openAddTipsPopup() {

    const modal = await this.modalCtrl.create({
      component: AddTipsDialog,
      cssClass: 'dialogDefault',
      componentProps: {

        'tips': this.charges.tips

      }
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (data != undefined) {

      this.charges.tips = data.tips;

      this.popoverController.dismiss({ 'charges': this.charges })

    }

  }

  async openNotesPopup() {

    const modal = await this.modalCtrl.create({
      component: NotesDialog,
      cssClass: 'notesDialog',
      componentProps: {


      }
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (data != undefined) {


    }

  }

}



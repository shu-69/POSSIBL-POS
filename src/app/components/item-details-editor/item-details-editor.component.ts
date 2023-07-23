import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-item-details-editor',
  templateUrl: './item-details-editor.component.html',
  styleUrls: ['./item-details-editor.component.scss'],
})
export class ItemDetailsEditorComponent implements OnInit {

  @Input() item : any;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  close() {

    let data = {

      'bonus' : this.item.bonus

    }

    this.modalCtrl.dismiss(data, 'done');

  }

}

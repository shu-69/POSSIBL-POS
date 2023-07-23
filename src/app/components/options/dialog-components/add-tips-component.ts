import { Component, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";

@Component({
    selector: 'addtips-dialog',
    template: ` <section style="padding: 20px; width: 400px; display: flex; justify-content: center; flex-flow: column;">
  
          <img src="assets/icon/money_bag.png" style="height: 120px; object-fit: contain;">
  
          <div style="height: 80px; display: grid; grid-template-columns: repeat(2, 1fr); margin-top: 20px;">
  
          <div style="background: white; border: 1px solid black; border-radius: 8px; padding: 4px;">
          <input type="number" style="height: 100%; background: #d1d1d1; border: none; border-radius: 4px; outline: none;
              font-size: 26px; width: 100%; text-align: center; font-family: 'Poppins-Medium', sans-serif; color: black;" [(ngModel)]="tips">
          </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); color: black; gap: 10px; margin-left: 20px;">
  
              <span style="background: #6872f1; color: white; display: flex; justify-content: center;
              align-items: center; border-radius: 4px; font-size: 16px;" 
              *ngFor="let button of [ {'label': '50', 'value': 50}, {'label': '100', 'value': 100},
              {'label': '200', 'value': 200}, {'label': '300', 'value': 300} ]" (click)="setTips(button.value)">{{button.label}}</span>
  
            </div>
  
          </div>
          
          <span style="color: black; background: #f4cef5; margin-top: 20px; height: 42px; border-radius: 8px;
      display: flex; justify-content: center; align-items: center; font-family: 'Poppins-Medium', sans-serif;
      border: 1px solid #d1d1d1;" (click)="done()">Done!</span>
  
    </section>`,
    standalone: false,
  })
  
  export class AddTipsDialog {
  
    @Input() tips: any;
  
    constructor(private modalCtrl: ModalController) { }
  
    done() {
  
      this.modalCtrl.dismiss({ 'tips': this.tips })
  
    }
  
    setTips(value: number) {
  
      this.tips = value
  
    }
  
  }
  
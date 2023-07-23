import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { ModalController } from "@ionic/angular";

@Component({
  selector: 'notes-dialog',
  template: ` <section >
  
            <div class="header">
              <span class="title">Create Note</span>
  
              <div style="display: flex; align-items: center; gap: 15px;">
  
                <div class="colorPalette">
  
                  <span #selectedColorSpan class="selectedColor active" [ngStyle]="{'background': selectedColor}" (click)="toogleColors()">
                  </span>
  
                  <div #colors class="colors"> 
                    <span  class="color" *ngFor="let color of [ { 'value': '#fcca7f', 'stroke': '#8b9091' }, { 'value': '#d7ad04', 'stroke': '#8b9091' }, { 'value': '#5eae54', 'stroke': 'rgb(199 202 203)' }, { 'value': '#da7db5', 'stroke': 'rgb(88 88 88)' }, { 'value': '#a477d1', 'stroke': 'rgb(211 211 211)' } ]"
                        [ngStyle]="{'background': color.value}" (click)="changeNotesBackground(color.value, color.stroke)">
                        <ion-icon name="checkmark" *ngIf="color.value == selectedColor"></ion-icon>
                    </span>
                  </div>
  
                  <!-- nickie_dabarbie -->
                  
  
                </div>
  
                <div class="textStylesContainer">
  
                  <span (click)="toogleTextBold()">
                    <img [src]="textBoldIcon">
                  </span>
  
                  <span (click)="toogleTextItalic()">
                    <img [src]="textItalicIcon">  
                  </span> 
  
                </div>
  
                <span class="saveSpan">
                  <ion-icon name="save"></ion-icon>
                  save
                </span>
  
              </div>
  
            </div>
  
            <div class="notesContainer notebook-paper" #notesContainer >
  
              <textarea #notesTextArea rows="20" cols="50" maxlength="150">{{text}}</textarea>
                
            </div>    
  
    </section>`,
  standalone: false,
  styleUrls: ['../dialog-styles/notes-dialog.scss'],
})

export class NotesDialog {

  @Input() tips: any;

  @ViewChild('colors') colorsSpans!: ElementRef;

  @ViewChild('selectedColorSpan') selectedColorSpan!: ElementRef;

  @ViewChild('notesContainer') notesContainer!: ElementRef;

  @ViewChild('notesTextArea') notesTextArea!: ElementRef;

  text = ""

  selectedColor = '#fcca7f';

  icons = {

    'textBold_active': '../assets/iconsaxicons/bold/text-bold.svg',
    'textBold_inactive': '../assets/iconsaxicons/outline/text-bold.svg',

    'textItalic_active': '../assets/iconsaxicons/bold/text-italic.svg',
    'textItalic_inactive': '../assets/iconsaxicons/outline/text-italic.svg'

  }

  textBoldIcon = this.icons.textBold_inactive;

  textItalicIcon = this.icons.textItalic_inactive;

  constructor(private modalCtrl: ModalController) { }

  toogleColors() {

    this.selectedColorSpan.nativeElement.classList.toggle('active');
    this.colorsSpans.nativeElement.classList.toggle('active');

  }

  toogleTextBold() {

    let fontWeight = this.notesTextArea.nativeElement.style.fontWeight;

    if (fontWeight == 'bold') {

      this.notesTextArea.nativeElement.style.fontWeight = 'normal';

      this.textBoldIcon = this.icons.textBold_inactive

    } else {

      this.notesTextArea.nativeElement.style.fontWeight = 'bold';

      this.textBoldIcon = this.icons.textBold_active

    }

  }

  toogleTextItalic() {

    let d: HTMLElement

    let fontStyle = this.notesTextArea.nativeElement.style.fontStyle;

    if (fontStyle == 'italic') {

      this.notesTextArea.nativeElement.style.fontStyle = 'normal';

      this.textItalicIcon = this.icons.textItalic_inactive

    } else {

      this.notesTextArea.nativeElement.style.fontStyle = 'italic';

      this.textItalicIcon = this.icons.textItalic_active

    }

  }

  changeNotesBackground(color: string, strokeColor: string) {

    this.selectedColor = color;

    let bg = 'linear-gradient(to bottom, ' + color + ' 29px, ' + strokeColor + ' 1px)'

    this.notesContainer.nativeElement.style.backgroundImage = bg

    this.toogleColors();

  }

  done() {

    this.modalCtrl.dismiss({ 'tips': this.tips })

  }

  setTips(value: number) {

    this.tips = value

  }

}
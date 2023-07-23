import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { DraggableModule } from '../draggable/draggable.module';

import { NgxMoveableModule, NgxMoveableComponent } from 'ngx-moveable';
import { HomePageRightMenuComponent } from '../SideMenu/home-page-right-menu/home-page-right-menu.component';
import { HomePageRightMenuModule } from '../SideMenu/home-page-right-menu/home-page-right-menu.module';

import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { DirectivesModule } from '../directives/directives.module';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

import { MatButtonModule } from '@angular/material/button';

export function playerFactory() {
  return player;
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule, DirectivesModule, MatButtonModule, MatFormFieldModule, MatAutocompleteModule, MatInputModule, MatOptionModule, ReactiveFormsModule,
    DraggableModule, NgxMoveableModule, HomePageRightMenuModule, LottieModule.forRoot({ player: playerFactory }),
  ],
  declarations: [HomePage]
})
export class HomePageModule {}

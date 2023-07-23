import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { HomePageRightMenuComponent } from '../../SideMenu/home-page-right-menu/home-page-right-menu.component';

@NgModule({
    imports: [
        CommonModule,
        IonicModule.forRoot(),
    ],
    exports: [HomePageRightMenuComponent],
    providers: [],
    declarations: [HomePageRightMenuComponent]
})
export class HomePageRightMenuModule { }

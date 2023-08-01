import { Component, Input, OnInit } from '@angular/core';
import { IonHeader, MenuController, ModalController } from '@ionic/angular';
import { UserDetails } from 'src/app/UserDetails';
import { DraftOrdersComponent } from 'src/app/components/draft-orders/draft-orders.component';
import { GeneralService } from 'src/app/services/general.service';
import { NaivgationService } from 'src/app/services/naivgation.service';
import { UserDetailsService } from 'src/app/services/userdetails.service';

export interface MenuItem {

  'img': string,
  'label': string,
  'click': CallableFunction

}

@Component({
  selector: 'app-home-page-right-menu',
  templateUrl: './home-page-right-menu.component.html',
  styleUrls: ['./home-page-right-menu.component.scss'],
})
export class HomePageRightMenuComponent implements OnInit {

  @Input() username: string = '';

  menuItems: MenuItem[] = [ ]

  constructor(private menu: MenuController, private navService: NaivgationService, private modalCtrl: ModalController,
    private generalService: GeneralService, public userDetails: UserDetailsService) {

    this.menuItems.push({
      'img': 'assets/iconspichon/win10/icons8_draft_100px_1.png',
      'label': 'Draft Orders',
      'click': async () => {

        const modal = await this.modalCtrl.create({
          component: DraftOrdersComponent,
          cssClass: 'draftOrdersPopup',
        });

        modal.present();

        const { data, role } = await modal.onWillDismiss();

        if (data != undefined) {

          if (data.status) {

            this.closeMenu();

          }

        }

      }
    })

    // Admin Options

    if (UserDetails.IsAdmin) {

      this.menuItems.push({
        'img': 'assets/iconsaxicons/bold/add.svg',
        'label': 'Create Item',
        'click': () => {

          this.navService.navigate('create-item');

        }
      })

      this.menuItems.push({
        'img': 'assets/iconsaxicons/bold/user-add.svg',
        'label': 'Add Customer',
        'click': () => {

          this.navService.navigate('create-customer');

        }
      })

      this.menuItems.push({
        'img': 'assets/iconspichon/icons8_view_100px.png',
        'label': 'View Items',
        'click': () => {

          this.navService.navigate('view-items');

        }
      })

      this.menuItems.push({
        'img': 'assets/iconsaxicons/bold/user-search.svg',
        'label': 'View Customers',
        'click': () => {

          this.navService.navigate('view-customers');

        }
      })

    }

    this.menuItems.push( {

        'img': 'assets/iconsaxicons/bold/setting-2.svg',
        'label': 'Settings',
        'click': () => {

          this.navService.navigate('settings');

        }
      }

    )

  }

  ngOnInit() {



  }

  menuClicked() {


  }

  logout() {

    this.navService.navigateRoot('login');

    this.generalService.removeLocalStoredValue('username');

  }

  closeMenu() {

    this.menu.close();

  }

}

import { AfterContentChecked, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { SwiperComponent } from 'swiper/angular';
import { EffectFade } from 'swiper';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';

import SwiperCore, { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NaivgationService } from '../services/naivgation.service';

import { AlertController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StatusBar } from '@capacitor/status-bar';
import { GeneralService } from '../services/general.service';
import { DB_PARAMS, Params, User } from '../Params';
import { SQLiteService } from '../services/sqlite.service';
import { UserDetails } from '../UserDetails';

import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { resolve } from 'dns';
import { App } from '@capacitor/app';

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y, Autoplay]);

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class LoginPage implements OnInit, AfterContentChecked {

  @ViewChild('swiper') swiper: SwiperComponent | undefined;
  @ViewChild('content') private content: any;
  @ViewChild('bottomMessageContainer') private bottomMessageContainer: any;

  usernameInputContainerId = "usernameContainer";
  passInputContainerId = "passwordContainer";

  username = "User"                                                                              // TODO :: Remove
  loadingMessage = "Please wait..."

  isLoading: boolean = false;

  passwordEyeIcon = "eye";
  passwordFieldType = "password";

  swiperContent = [

    {
      "content": "Fast and efficient: Our POS app is designed to streamline your billing process and make it quicker and more efficient, so you can focus on providing great service to your customers."
    },

    {
      "content": "User-friendly interface: With a simple and intuitive user interface, our POS app is easy to use for both experienced and novice users, making it the perfect choice for businesses of all sizes."
    },

    {
      "content": "Robust features: Our POS app comes packed with a range of powerful features that allow you to customize your billing process to suit your needs."
    }


  ]

  loggedInUsers: User[] = []

  userProfileAnimationOption: AnimationOptions = {
    path: '/assets/anims/default_profile_animated.json',
  };

  formData = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    rememberMe: new FormControl(false)
  });

  constructor(private navigation: NaivgationService, private navController: NavController, private router: Router,
    private generalService: GeneralService, private sqlService: SQLiteService, private authService: AuthService, private alertController: AlertController) {

    this.loadLoggedInUsers();

    //this.generalService.syncUserDetailsOffline(UserDetails.Id, UserDetails.FavouriteItems, UserDetails.DraftOrders);

  }

  ionViewWillEnter() {
    StatusBar.hide();
  }

  // ionViewWillLeave(){
  //   StatusBar.show();
  // }

  ngAfterContentChecked() {

    if (this.swiper) {
      this.swiper.updateSwiper({})
      this.swiper.swiperRef.autoplay.start();
    }

  }

  async authenticate() {

    if (this.formData.valid) {

      this.isLoading = true;

      (await this.authService.authenticate(this.formData.controls.username.value!, this.formData.controls.password.value!)).subscribe({

        next: (response) => {

          this.isLoading = false;

          console.log(response)

          if (response) {

            if (response.password == this.formData.controls.password.value) {

              let details = response;

              UserDetails.Id = details.id;
              UserDetails.Name = details.name;
              UserDetails.Username = details.username;
              UserDetails.Logged_on = new Date().toDateString();   // TODO :: ::
              UserDetails.ProjectId = '';
              UserDetails.IsAdmin = details.isAdmin

              this.saveUserDetails(this.formData.controls.username.value!, this.formData.controls.password.value!, details.name, new Date(), '', details.isAdmin);

              if (this.formData.controls.rememberMe.value) {

                this.saveLoginDetails(this.formData.controls.username.value!, this.formData.controls.password.value!);

              }

              this.showLoadingPanel()

            } else {

              let pfield: HTMLElement = document.getElementById(this.passInputContainerId)!;

              pfield.classList.add('fieldError');

              setTimeout(() => {
                pfield.classList.remove('fieldError');
              }, 1500);

              this.showCustomNotification("Password doesn't matched", true, 'red')

            }

          } else {

            // undefined means user not exists in firebase

            let ufield: HTMLElement = document.getElementById(this.usernameInputContainerId)!;

            ufield.classList.add('fieldError');

            setTimeout(() => {
              ufield.classList.remove('fieldError');
            }, 1500);

            this.showCustomNotification("Username not exists", true, 'red')

          }

        }, error: (err) => {

          this.isLoading = false;

          console.error(err)

          this.showCustomNotification("Something went wrong. Please try again...", true, 'red')

        }

      });

      // setTimeout(() => {

      //   this.isLoading = false;



      //   

      // }, 3000);

    } else {

      if (this.formData.controls.username.invalid) {

        let field: HTMLElement = document.getElementById(this.usernameInputContainerId)!;

        field.classList.add('fieldError');

        setTimeout(() => {
          field.classList.remove('fieldError');
        }, 1500);

        return;
      }

      if (this.formData.controls.password.invalid) {

        let field: HTMLElement = document.getElementById(this.passInputContainerId)!;

        field.classList.add('fieldError');

        setTimeout(() => {
          field.classList.remove('fieldError');
        }, 1500);

        return;
      }

    }

  }

  ngOnInit() {

    this.navigation.removePageFromStac('splash-screen');

    this.startClippedBgImageLoop();

  }

  saveLoginDetails(username: string, password: string) {

    this.generalService.setLocalStoredValue('username', username);
    this.generalService.setLocalStoredValue('password', password);

  }

  async saveUserDetails(username: string, password: string, name: string, logged_in_date: Date, projectId: string, isAdmin: boolean) {

    if (!this.checkUserDetailsExists(username)) {

      //let encryptedPassword = this.generalService.encryptDecrypt(password, Params.ENCRYPTION_SECRET_KEY);

      //console.log('Saving Login details', username, password, encryptedPassword, logged_in_date);

      let query = 'INSERT INTO ' + DB_PARAMS.DB_TABLES_NAMES.USERS + ' (' + DB_PARAMS.USERS_TABLE_COLUMNS.USERNAME + ', ' + DB_PARAMS.USERS_TABLE_COLUMNS.PASSWORD + ', ' +
        DB_PARAMS.USERS_TABLE_COLUMNS.NAME + ', ' + DB_PARAMS.USERS_TABLE_COLUMNS.LOGGED_IN_ON + ', ' + DB_PARAMS.USERS_TABLE_COLUMNS.PROJECT_ID + ', ' + DB_PARAMS.USERS_TABLE_COLUMNS.IS_ADMIN + ') ' +
        'VALUES (' + `'${username}', ` + `'${password}', ` + `'${name}', ` + `'${logged_in_date}', ` + `'${projectId}', ` + `'${isAdmin}' ` + ');'

      await this.sqlService.executeQuery(query);

    }

  }

  checkUserDetailsExists(username: string): boolean {

    for (let i = 0; i < this.loggedInUsers.length; i++) {

      if (username == this.loggedInUsers[i].username)
        return true;

    }

    return false;

  }

  async loadLoggedInUsers() {

    this.loggedInUsers = await this.generalService.getAllLoggedInUsers()

    // await (await this.generalService.getAllLoggedInUsers()).forEach(element => {

    //   this.loggedInUsers.push(element);

    //   console.log(element)

    // });

    //console.log(await this.generalService.getAllLoggedInUsers())
    //console.log(this.loggedInUsers)

  }

  switchAccount(userId: string) {

    this.loggedInUsers.forEach((element, index) => {

      if (element.id == userId) {
        this.username = element.name.substring(0, element.name.includes(' ') ? element.name.lastIndexOf(' ') : element.name.length);   // TODO :: Check if the username is correct ?

        this.showLoadingPanel();
      }

    });
  }

  changeTimeFormat(date: string): string {

    let newDate = new Date(date)

    return newDate.getDate() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getFullYear() + '  ' + newDate.toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  }

  startClippedBgImageLoop() {

    let clippedBackgroundElement: HTMLElement = document.getElementById('clipped-bg')!;

    let interval = setInterval(function () {
      let imageUrl = "https://source.unsplash.com/600x600?tech/laptop?sig=" + getRandomNumber();
      clippedBackgroundElement.style.background = 'url(' + imageUrl + ')';     // url(https://source.unsplash.com/600x600?summer)
      clippedBackgroundElement.style.backgroundSize = 'cover';
      clippedBackgroundElement.style.backgroundColor = '#0cb96e';
    }, 8000)

    function getRandomNumber() {
      return (Math.floor(Math.random() * 50));
    }

  }

  async showLoadingPanel() {

    document.getElementById('welcomeText')!.innerText = "Hii, " + UserDetails.Name;

    this.content.scrollToBottom(600);

    // Fetching all items
    console.log("Loading items");

    this.loadOtherDataInBackground();

    this.generalService.loadItems3().then(async (response) => {
      
      console.log(response);

      let result = response;

      await this.sqlService.deleteTableData(DB_PARAMS.DB_TABLES_NAMES.ITEM_CATEGORIES);
      await this.sqlService.deleteTableData(DB_PARAMS.DB_TABLES_NAMES.ITEMS);

      await result.forEach((element: any, i: number) => {

        this.generalService.insertCategory(element._id, element.category_name)

        if(element.items){

          element.items.forEach((itemelement: any, i: number) => {

            this.generalService.insertItem(itemelement)
  
          });

        }

      });

      await this.generalService.initItems();

      this.goHomePage(1000)

    }).catch((error) => {
      
      console.error(error)
      this.goHomePage(1000)

    });

    this.generalService.initCustomers();

  }

  goHomePage(timeout: number) {

    setTimeout(() => {

      this.navigation.navigateRoot('home');

    }, timeout);

  }

  loadOtherDataInBackground() {     // TODO :: Rename this function

    let task1 = new Promise(async (resolve, reject) => {

      this.sqlService.deleteTableData(DB_PARAMS.DB_TABLES_NAMES.CURRENCIES);

      this.generalService.loadCurrencies().then((value) => {

        console.log('Currencies', value)

        value.forEach((element: any) => {

          this.generalService.insertCurrency(element.id, element.decimal, element.currency, element.country, element.symbol);

        });

      }).catch((err) => {

        console.error('Got error while loading currencies', err)

      })

      //resolve(result);
    });

    let task2 = new Promise(async (resolve, reject) => {

      this.generalService.initSettings();

    });

  }

  tooglePasswordType() {

    // this.passwordFieldType == 'text' ? () => {

    //   this.passwordEyeIcon = 'eye';
    //   this.passwordFieldType = 'password';

    // } : () =>{

    //   this.passwordEyeIcon = 'eye-off';
    //   this.passwordFieldType = 'text'; 

    // };

    if (this.passwordFieldType == 'text') {

      this.passwordEyeIcon = 'eye';
      this.passwordFieldType = 'password';

    } else {

      this.passwordEyeIcon = 'eye-off';
      this.passwordFieldType = 'text';

    };

  }

  profileAnimationCreated(animationItem: AnimationItem): void {
    //console.log(animationItem);
  }

  focusInputContainer(containerId: string) {

    let container: HTMLElement = document.getElementById(containerId)!;

    container.classList.add('focusField');

  }

  removeFocus(containerId: string) {

    let container: HTMLElement = document.getElementById(containerId)!;

    container.classList.remove('focusField');

  }

  showCustomNotification(message: string, autoRemove: boolean, color?: 'default' | 'red') {

    this.bottomMessageContainer.nativeElement.classList.add('active');
    //this.bottomMessageContainer.nativeElement.classList.remove('inactive');

    if (color) {

      switch (color) {

        case "default":

          this.bottomMessageContainer.nativeElement.style.background = 'black';

          break;

        case "red":

          this.bottomMessageContainer.nativeElement.style.background = '#c40000';

          break;

        default:
          break;

      }

      this.bottomMessageContainer.nativeElement.background

    }

    document.getElementById('bottomMessageContainerMessage')!.innerText = message;

    if (autoRemove) {

      setTimeout(() => {

        this.removeCustomNotification()

      }, 4000);

    }

  }

  removeCustomNotification() {

    //this.bottomMessageContainer.nativeElement.classList.add('inactive');
    this.bottomMessageContainer.nativeElement.classList.remove('active');

  }

  async presentAlert(message: string, subHeader?: string, header?: string) {
    const alert = await this.alertController.create({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  getState(outlet: any) {
    // TODO :: Not Using
    // Changing the activatedRouteData.state triggers the animation
    return outlet.activatedRouteData.state;
  }

}

// https://swiperjs.com/demos
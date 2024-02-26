import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { StatusBar } from '@capacitor/status-bar';
import { ModalController, ViewDidEnter, ViewDidLeave } from '@ionic/angular';
import { UserDetails } from 'src/app/UserDetails';
import { Chart, ChartOptions } from 'chart.js/auto';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Bill } from 'src/app/Params';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit, ViewDidEnter, ViewDidLeave, AfterViewInit {

  @ViewChild('month_wise_sales_chart') monthWiseSalesChart!: any;

  monthWiseSalesChartOptions = {
    selectedYear: new Date().getFullYear(),
    yearsOptions: [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2]
  }

  currencySymbol = UserDetails.Currency.symbol;

  loaders = {
    isTodayLoaderActive: false,
    isWeekLoaderActive: false,
    isMonthLoaderActive: false,
    isYearLoaderActive: false,
  }

  reportValues = {
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    yearSales: 0
  }

  constructor(private modalCtrl: ModalController, private fireService: FirebaseService, public generalServices: GeneralService) {    

    this.fireService.getItems('billmaster').subscribe({
      next: (data: Bill[]) => {
        if (data) {
          const arrangedBills = this.arrangeBills(data)
          if(arrangedBills.yearBills && arrangedBills.yearBills.length > 0) {
            arrangedBills.yearBills.forEach(bill => {
              this.reportValues.yearSales += +(bill.amount)
            })
          }
          if(arrangedBills.monthBills && arrangedBills.monthBills.length > 0) {
            arrangedBills.monthBills.forEach(bill => {
              this.reportValues.monthSales += +(bill.amount)
            })
          }
          if(arrangedBills.weekBills && arrangedBills.weekBills.length > 0) {
            arrangedBills.weekBills.forEach(bill => {
              this.reportValues.weekSales += +(bill.amount)
            })
          }
          if(arrangedBills.dayBills && arrangedBills.dayBills.length > 0) {
            arrangedBills.dayBills.forEach(bill => {
              this.reportValues.todaySales += +(bill.amount)
            })
          } 
        }
      }, error: (e) => {
        alert('Can\'t load data');
      }
    })

  }

  ngOnInit() { }

  ngAfterViewInit() {

    this.initMonthWiseSalesChart()

  }

  ionViewDidEnter() {

    StatusBar.setBackgroundColor({ color: '#f7f7f7' })

  }

  ionViewDidLeave() {

    StatusBar.setBackgroundColor({ color: '#5DD462' });

  }

  arrangeBills(bills: Bill[]): { yearBills: Bill[], monthBills: Bill[], weekBills: Bill[], dayBills: Bill[] } {

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentWeek = this.getWeekNumber(currentDate);
    const currentDay = currentDate.getDate();

    const currentYearTransactions = bills.filter(bill => {
      const transactionDate = new Date(bill.docdate.iso);
      return transactionDate.getFullYear() === currentYear;
    });

    // Filter transactions for current month
    const currentMonthTransactions = currentYearTransactions.filter(bill => {
      const transactionDate = new Date(bill.docdate.iso);
      return transactionDate.getMonth() === currentMonth;
    });

    // Filter transactions for current week
    const currentWeekTransactions = currentMonthTransactions.filter(bill => {
      const transactionDate = new Date(bill.docdate.iso);
      const transactionWeek = this.getWeekNumber(transactionDate);
      return transactionWeek === currentWeek;
    });

    // Filter transactions for current day
    const currentDayTransactions = currentWeekTransactions.filter(bill => {
      const transactionDate = new Date(bill.docdate.iso);
      return transactionDate.getDate() === currentDay;
    });

    return { yearBills: currentYearTransactions, monthBills: currentMonthTransactions, weekBills: currentWeekTransactions, dayBills: currentDayTransactions }

  }

  private getWeekNumber(date: Date): number {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((date.getTime() - oneJan.getTime()) / 86400000);
    return Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
  }

  initMonthWiseSalesChart() {

    const demoData = [
      { month: 'January', sales: 100 },
      { month: 'February', sales: 150 },
      { month: 'March', sales: 200 },
      { month: 'April', sales: 180 },
      { month: 'May', sales: 220 },
      { month: 'June', sales: 250 },
      { month: 'July', sales: 300 },
      { month: 'August', sales: 280 },
      { month: 'September', sales: 320 },
      { month: 'October', sales: 350 },
      { month: 'November', sales: 0 },
      { month: 'December', sales: 0 }
    ];

    const salesData = demoData.map((item, index) => {
      return { x: index + 1, y: item.sales };
    });

    let ctx = this.monthWiseSalesChart.nativeElement.getContext('2d');

    let myChart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Sales',
          backgroundColor: "rgba(83, 107, 201,0.4)",
          borderColor: "rgb(48 81 204)",
          fill: true,
          data: salesData,
          cubicInterpolationMode: 'monotone'    // For smooth curves
        }]
      },
      options: {
        scales: {
          x: {
            type: 'linear',
            scaleLabel: {
              display: true,
              labelString: 'Month'
            },
            ticks: {
              stepSize: 1,
              min: 1,
              max: 12,
              callback: (value: number) => demoData[value - 1].month
            }
          },
          y: {
            scaleLabel: {
              display: true,
              labelString: 'Sales'
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      } as ChartOptions<'line'>
    });
  }

  onMonthWiseSalesChartOptionsYearChange(event: any) {

    const year = event.detail.value

    this.monthWiseSalesChartOptions.selectedYear = year;

  }
  
  onTodayRefreshClicked() {

    this.loaders.isTodayLoaderActive = true;

    this.fireService.getItems('billmaster').subscribe({
      next: (data: Bill[]) => {
        this.loaders.isTodayLoaderActive = false;
        if (data) {
          const arrangedBills = this.arrangeBills(data)
          if(arrangedBills.dayBills && arrangedBills.dayBills.length > 0) {
            this.reportValues.todaySales = 0;
            arrangedBills.dayBills.forEach(bill => {
              this.reportValues.todaySales += +(bill.amount)
            })
          } 
        }
      }, error: (e) => {
        this.loaders.isTodayLoaderActive = false;
        alert('Can\'t load data');
      }
    })

  }

  onWeekRefreshClicked() {

    this.loaders.isWeekLoaderActive = true;

    this.fireService.getItems('billmaster').subscribe({
      next: (data: Bill[]) => {
        this.loaders.isWeekLoaderActive = false;
        if (data) {
          const arrangedBills = this.arrangeBills(data)
          if(arrangedBills.weekBills && arrangedBills.weekBills.length > 0) {
            this.reportValues.weekSales = 0;
            arrangedBills.dayBills.forEach(bill => {
              this.reportValues.weekSales += +(bill.amount)
            })
          } 
        }
      }, error: (e) => {
        this.loaders.isWeekLoaderActive = false;
        alert('Can\'t load data');
      }
    })

  }

  onMonthRefreshClicked() {

    this.loaders.isMonthLoaderActive = true;

    this.fireService.getItems('billmaster').subscribe({
      next: (data: Bill[]) => {
        this.loaders.isMonthLoaderActive = false;
        if (data) {
          const arrangedBills = this.arrangeBills(data)
          if(arrangedBills.monthBills && arrangedBills.monthBills.length > 0) {
            this.reportValues.monthSales = 0;
            arrangedBills.monthBills.forEach(bill => {
              this.reportValues.monthSales += +(bill.amount)
            })
          } 
        }
      }, error: (e) => {
        this.loaders.isMonthLoaderActive = false;
        alert('Can\'t load data');
      }
    })

  }

  onYearRefreshClicked() {

    this.loaders.isYearLoaderActive = true;

    this.fireService.getItems('billmaster').subscribe({
      next: (data: Bill[]) => {
        this.loaders.isYearLoaderActive = false;
        if (data) {
          const arrangedBills = this.arrangeBills(data)
          if(arrangedBills.yearBills && arrangedBills.yearBills.length > 0) {
            this.reportValues.yearSales = 0;
            arrangedBills.yearBills.forEach(bill => {
              this.reportValues.yearSales += +(bill.amount)
            })
          } 
        }
      }, error: (e) => {
        this.loaders.isYearLoaderActive = false;
        alert('Can\'t load data');
      }
    })

  }

  close() {

    this.modalCtrl.dismiss()

  }

}

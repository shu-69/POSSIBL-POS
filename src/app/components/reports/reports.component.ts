import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { StatusBar } from '@capacitor/status-bar';
import { ViewDidEnter, ViewDidLeave } from '@ionic/angular';
import { UserDetails } from 'src/app/UserDetails';
import { Chart, ChartOptions } from 'chart.js/auto';

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

  reportValues = {
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    yearSales: 0
  }

  constructor() { }

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

}

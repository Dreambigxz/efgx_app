import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, ActivatedRoute, Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import {FormGroup, FormControl} from '@angular/forms';

import { ApiService } from "../api/api.service";
import { AuthService } from "../auth/auth.service";
import { DataService } from "../user/data.service";

import {ReactiveFormsModule} from '@angular/forms';
import {MatToolbarModule} from '@angular/material/toolbar';
import { SimpleDialogComponent } from "../simple-dialog/simple-dialog.component";

import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from "@angular/material/icon";
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';

import { Observable, of} from 'rxjs';
import { numberWithCommas } from '../../helper';

import { LiquidateComponent } from "./liquidate/liquidate.component";

@Component({
  selector: 'app-task',
  imports: [
    RouterLink,CommonModule, ReactiveFormsModule,MatToolbarModule,
    MatIconModule,MatGridListModule,MatCardModule,LiquidateComponent
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})

export class TaskComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {}

  current = 'tasks';

  serviceData = inject(DataService)
  apiService = inject(ApiService)
  authService = inject(AuthService)

  AllData=this.serviceData.userData;

  directory!:string

  loading=false

  taskForm = new FormGroup({
    amount: new FormControl(''),
    // password: new FormControl(''),
  });

  taskModel: any[] = []
  taskData = (this.serviceData.userData as any).task

  history = window.history

  wallet = (this.serviceData.userData as any).wallet
  initCurrency:any
  currencySymbol = ''
  isLoadingContent = false

  checkConditions(){

    if (
      this.serviceData.userData &&
      typeof this.serviceData.userData === 'object' &&
      'task' in this.serviceData.userData
      ) {

        this.taskData = (this.serviceData.userData as any).task;
        this.taskModel=(this.serviceData.userData as any).taskModel
        this.initCurrency=(this.serviceData.userData as any).init_currency
        this.wallet=(this.serviceData.userData as any).wallet
        if (this.taskData.active) {
          this.cards[0].value = numberWithCommas(this.taskData.active.capital,2)
          this.cards[1].value = numberWithCommas(this.taskData.active.daily_return)
          this.cards[2].value = numberWithCommas(this.taskData.active.total_earning)
          this.cards[2].caption = `+${this.taskData.active.total_percentage}% total percentage`
          // this.cards[0].caption = !this.taskData.pending_liquidation?'Active':'Inactive';

        }


        this.cards[1].caption = `✔️ ${this.taskData.settings.percentage}% on todays task`


        this.events = this.taskData.activities
        this.events?this.events.reverse():0
        this.currencySymbol=(this.initCurrency as any).symbol

        this.displayedItems=[],this.currentIndex=0,

        this.loadMore()
        return true //taskData
    }else{
      return false
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const action = params.get('action');
      this.directory=`${action}`
      // this.directory==='do-task'?this.current='tasks':this.current=''
      if (!this.checkConditions()){
        this.isLoadingContent = true
        this.apiService.tokenData('task/get_task', this.authService.tokenKey,'get',{}).subscribe({
          next: (response) => {
            this.AllData = this.serviceData.update(response);
            this.checkConditions()
            this.isLoadingContent = false
          },
          error: (err) => {
            if (err.statusText === "Unauthorized") {this.authService.logout(true)}
          }
        });
      }
    });


  }

  handleTaskFormSubmit(){
    let data = this.taskForm.value

    this.loading=true
    this.apiService.tokenData('task/create_or_update/', this.authService.tokenKey, 'post', data)
    .subscribe(response => {
      this.loading=false;
      this.serviceData.update(response)
      this.dialog.open(SimpleDialogComponent,{
        data:{message:response.message,header:response.header,color:response.success?'green':'red'}
      })
      response.success?[
        // this.displayedItems=[],this.currentIndex=0,
        this.router.navigate(['/task','manage-task'])
      ]:0

    }, error =>{
      this.loading=false
      if (error.statusText === "Unauthorized") {this.authService.logout()}else{
        this.dialog.open(SimpleDialogComponent,{
          data:{message:"Unable to process request, please try again",header:'Request timeout!', color:'red'}
        })
      }
    });

  }

  cards = [
    { title: 'Task Capital', value: 0, icon: 'wallet', iconColor: '#3f51b5', caption_:'Inactive' },
    { title: 'Daily Return', value: 0, icon: 'bar_chart', iconColor: '#4caf50', caption: '✔️ 2% on todays task' },
    { title: 'Total Earning', value: 0, icon: 'check_circle', iconColor: '#2196f3', caption: '+0% total percentage' },
    // { title: 'Upcoming Events', value: 0, icon: 'event', iconColor: '#ff9800', caption: 'This year' }
  ];

  events: any[] = [] //{ title: 'Parent-Teacher Conference', date: 'June 5, 2025', time: '2:00 PM', description: "Meeting with Emma Smith's parents", color: '#1f3c88' }, { title: 'Math Quiz', date: 'June 7, 2025', time: '10:00 AM', description: 'Chapter 6: Quadratic Equations', color: '#f4a300' }, { title: 'Field Trip', date: 'June 10, 2025', time: '9:00 AM', description: 'Science Museum Visit', color: '#28a745' } ];

  // loadMore
  displayedItems: any[] = [];
  batchSize = 4;
  currentIndex = 0;
  loadingMoreEvent = false

  loadMore() {

    if (this.events) {
      const nextItems = this.events.slice(this.currentIndex, this.currentIndex + this.batchSize);
      this.displayedItems = [...this.displayedItems, ...nextItems];
      this.currentIndex += this.batchSize;
    }
  }

  onScroll(event: any) {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop >= element.clientHeight) {
      this.loadMore();
    }
  }

  liquidate=false

}

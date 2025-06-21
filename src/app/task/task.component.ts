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


@Component({
  selector: 'app-task',
  imports: [
    RouterLink,CommonModule, ReactiveFormsModule,MatToolbarModule,
    MatIconModule,MatGridListModule,MatCardModule
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

  initCurrency!:Object
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
        if (this.taskData.active) {
          this.cards[0].value = numberWithCommas(this.taskData.active.capital,2)
          this.cards[1].value = numberWithCommas(this.taskData.active.daily_return)
          this.cards[2].value = numberWithCommas(this.taskData.active.total_earning)

        }
        this.events = this.taskData.activities
        this.events?this.events.reverse():0
        this.currencySymbol=(this.initCurrency as any).symbol
        return true //taskData
    }else{
      return false
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const action = params.get('action');
      this.directory=`${action}`

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

      console.log({directory:this.directory,userData:this.serviceData.userData});

    });

  }

  handleTaskFormSubmit(){
    let data = this.taskForm.value

    this.loading=true
    this.apiService.tokenData('task/create_or_update/', this.authService.tokenKey, 'post', data)
    .subscribe(response => {
      // console.log(response);
      this.loading=false;
      this.serviceData.update(response)
      this.dialog.open(SimpleDialogComponent,{
        // width:'400px',
        data:{message:response.message,header:response.header,color:response.success?'green':'red'}
      })
      response.success?this.router.navigate(['/task','manage-task']):0
      // this.AllData = this.serviceData.update(response)
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
    { title: 'Task Capital', value: 0, icon: 'wallet', iconColor: '#3f51b5' },
    { title: 'Dily Return', value: 0, icon: 'bar_chart', iconColor: '#4caf50', caption: '✔️ 92% attendance' },
    { title: 'Total Earning', value: 0, icon: 'check_circle', iconColor: '#2196f3', caption: '+2.1% from last week' },
    // { title: 'Upcoming Events', value: 0, icon: 'event', iconColor: '#ff9800', caption: 'This year' }
  ];

  events: any[] = [] //{ title: 'Parent-Teacher Conference', date: 'June 5, 2025', time: '2:00 PM', description: "Meeting with Emma Smith's parents", color: '#1f3c88' }, { title: 'Math Quiz', date: 'June 7, 2025', time: '10:00 AM', description: 'Chapter 6: Quadratic Equations', color: '#f4a300' }, { title: 'Field Trip', date: 'June 10, 2025', time: '9:00 AM', description: 'Science Museum Visit', color: '#28a745' } ];

  openDetails(id:any){

    console.log('opening>><< ID', id);

    // this.router.navigate(['detail'], { relativeTo: this.router.url });

  }
}

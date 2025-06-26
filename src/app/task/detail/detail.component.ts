import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from "../../api/api.service";
import { AuthService } from "../../auth/auth.service";
import { DataService } from "../../user/data.service";

import { RouterLink, ActivatedRoute, Router } from '@angular/router';

import {FormGroup, FormControl} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';

import { SimpleDialogComponent } from "../../simple-dialog/simple-dialog.component";
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-detail',
  imports: [CommonModule,ReactiveFormsModule,RouterLink],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class TaskDetailComponent {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {}

  history = window.history
  serviceData = inject(DataService)
  apiService = inject(ApiService)
  authService = inject(AuthService)

  taskId!:string

  isLoadingContent = true
  loading = false

  taskDetails!: any
  allComments: any[] = [ ]
  hasComment = false
  totalComments = 0
  hasTask=false

  commentForm =  new FormGroup({
    comment: new FormControl(''),
    // taskID:this.taskId
  })

  updateResponse(response:any): void{

    this.isLoadingContent = false
    this.hasComment=response.hasComment;
    this.allComments = response.allComments
    response.taskDetails?this.taskDetails=response.taskDetails:0;
    this.totalComments = response.allComments.length
    this.hasTask=response.hasTask
  }

  ngOnInit(): void{
    this.route.paramMap.subscribe(params => {
      this.taskId=`${params.get('id')}`
      this.apiService.tokenData('task/get_task?taskID='+this.taskId, this.authService.tokenKey,'get',{}).subscribe({
        next: (response) => {this.updateResponse(response)},
        error: (err) => {
          if (err.statusText === "Unauthorized") {this.authService.logout(true)}
        }
      });

    })
  }

  handleSubmit(){

    let data = {taskId:this.taskId}

    Object.assign(data,this.commentForm.value)
    this.loading=true
    this.apiService.tokenData('task/add_comment/', this.authService.tokenKey, 'post', data)
    .subscribe(response => {
      this.loading=false;
      this.dialog.open(SimpleDialogComponent,{
        data:{message:response.message,header:response.header,color:response.success?'green':'red'}
      })
      response.success?[
        this.updateResponse(response),
        this.serviceData.update(response),
        this.router.navigate(['/task','manage-task'])
      ]:0;
    }, error =>{
      this.loading=false
      if (error.statusText === "Unauthorized") {this.authService.logout()}else{
        this.dialog.open(SimpleDialogComponent,{
          data:{message:"Unable to process request, please try again",header:'Request timeout!', color:'red'}
        })
      }
    });
  }

}

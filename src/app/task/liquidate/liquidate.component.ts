import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {ReactiveFormsModule} from '@angular/forms';
import {FormGroup, FormControl} from '@angular/forms';

import { ApiService } from "../../api/api.service";
import { AuthService } from "../../auth/auth.service";
import { DataService } from "../../user/data.service";

import { SimpleDialogComponent } from "../../simple-dialog/simple-dialog.component";

import { RouterLink, ActivatedRoute, Router} from '@angular/router';

import { TaskComponent } from "../task.component";
import {MatButtonModule} from '@angular/material/button';

import {

  MatDialog,
  MatDialogActions,
 } from '@angular/material/dialog';

@Component({
  selector: 'app-liquidate',
  imports: [ReactiveFormsModule,CommonModule,MatDialogActions,MatButtonModule],
  templateUrl: './liquidate.component.html',
  styleUrl: '../../modal/modal.component.css'
})
export class LiquidateComponent {

  constructor(
    // private route: ActivatedRoute,
    private router: Router,
    private task: TaskComponent,
    public dialog: MatDialog
  ) {}

  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
    this.task.liquidate=false
  }

  serviceData = inject(DataService)
  apiService = inject(ApiService)
  authService = inject(AuthService)

  loading = false

  selectedFile: any //File | null = null;

  Form = new FormGroup({
    reason:new FormControl(''),
  })

  handleSubmit (){

     let data = {'action':'liquidate'}
     Object.assign(data,this.Form.value)
     this.loading=true

     this.apiService.tokenData('task/liquidate/', this.authService.tokenKey, 'post', data)
     .subscribe(response => {
       this.close()
       this.loading=false;
       this.serviceData.update(response)
       this.dialog.open(SimpleDialogComponent,{
         data:{message:response.message,header:response.header,color:response.success?'green':'red'}
       })
       response.success?[this.task.checkConditions()]:0
     }, error =>{
       this.loading=false;
       this.close()
       if (error.statusText === "Unauthorized") {this.authService.logout()}else{
         this.dialog.open(SimpleDialogComponent,{
           data:{message:"Unable to process request, please try again",header:'Request timeout!', color:'red'}
         })

       }
     });

   }

}

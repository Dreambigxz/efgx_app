
import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {ReactiveFormsModule} from '@angular/forms';
import {FormGroup, FormControl} from '@angular/forms';

import { ApiService } from "../../api/api.service";
import { AuthService } from "../../auth/auth.service";
import { DataService } from "../../user/data.service";

import { SimpleDialogComponent } from "../../simple-dialog/simple-dialog.component";

import { RouterLink, ActivatedRoute, Router} from '@angular/router';

import {MatButtonModule} from '@angular/material/button';

import { ProfileComponent } from "../../profile/profile.component";

import {

  MatDialog,
  MatDialogActions,
  // MatDialogClose,
  // MatDialogContent,
  // MatDialogRef,
  // MatDialogTitle,
 } from '@angular/material/dialog';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule,CommonModule,MatDialogActions,MatButtonModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})

export class ChangePasswordComponent {

  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
    this.profile.changePassword=false
  }

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private profile: ProfileComponent
  ) {}

  serviceData = inject(DataService)
  apiService = inject(ApiService)
  authService = inject(AuthService)

  loading = false

  Form = new FormGroup({
    old_password:new FormControl(''),
    new_password:new FormControl(''),
    // file:new FormControl(null)
  })

  must_reset_password = (this.serviceData.userData as any).must_reset_password

  handleSubmit(){

    let data = {}

    Object.assign(data,this.Form.value)

    this.loading = true


    this.apiService.tokenData('settings/change_password/', this.authService.tokenKey, 'post', data)
    .subscribe(response => {
      this.loading=false; this.profile.changePassword=false
      this.dialog.open(SimpleDialogComponent,{
        data:{message:response.message,header:response.header,color:response.success?'green':'red'},
        // width:'400px'
      })
      if (response.success) {
        this.serviceData.update(response)
      }
    }, error =>{

      this.loading=false;this.profile.changePassword=false
      if (error.statusText === "Unauthorized") {this.authService.logout()}else{
        this.dialog.open(SimpleDialogComponent,{
          data:{message:"Unable to process request, please try again",header:'Request timeout!', color:'red'}
        })
      }
    });
  }

}

import { Component, inject} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import { ApiService } from "../../api/api.service";
import { AuthService } from "../../auth/auth.service";
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatDialog,MatDialogClose } from '@angular/material/dialog';

import { SimpleDialogComponent } from "../../simple-dialog/simple-dialog.component";
import { MatIconModule } from '@angular/material/icon';

import { loadExternalScript } from "../../../helper";
@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, CommonModule, MatIconModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  constructor(
    public dialog: MatDialog,
  ) {}

  authService = inject(AuthService);
  router = inject(Router);
  apiService = inject(ApiService);

  history = window.history

  favoriteFramework = '';
  loading=false

  Form = new FormGroup({
    email: new FormControl(''),
  });

  handleSubmit() {

    let data = this.Form.value
    this.loading=true

    this.apiService.NotokenData('forgot-password/',data).subscribe({
      next: (response) => {
        // console.log('Data posted successfully:', response);
        // console.log({response});
        this.loading=false
        const dialogRef = this.dialog.open(SimpleDialogComponent,{
          data:{message:response.message,header:response.header,color:response.success?'green':'red'}
        })
        dialogRef.afterClosed().subscribe(result => {response.success?this.router.navigate(['/login']):0})

      },
      error: (error) => {
        this.loading=false
        let res = error['error']
        this.dialog.open(SimpleDialogComponent,{
          data:{message:"Unable to process request, please try again",header:'Request timeout!', color:'red'}
        })
      }
    });

  }

  ngAfterViewInit() {
    loadExternalScript()
  }

  navigate(url:any) {
    url = url.split(' ')
    this.router.navigate(url);
  }

}

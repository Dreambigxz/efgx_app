import { Component, inject} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import { ApiService } from "../api/api.service";
import { AuthService } from "../auth/auth.service";
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatDialog,MatDialogClose } from '@angular/material/dialog';

import { SimpleDialogComponent } from "../simple-dialog/simple-dialog.component";
import { MatIconModule } from '@angular/material/icon';

import { loadExternalScript } from "../../helper";

@Component({
  selector: 'app-authentication',
  imports: [ReactiveFormsModule, RouterLink, CommonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './authentication.component.css'
})

export class LoginComponent {

  constructor(
    public dialog: MatDialog,
    // public loadLink :loadExternalScript
  ) {}

  authService = inject(AuthService);
  router = inject(Router);
  apiService = inject(ApiService);

  history = window.history
  helpLink = localStorage['helpLink']
  favoriteFramework = '';
  loading=false
  showPassword=false
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  });

  handleSubmit() {

    let data = this.loginForm.value
    this.loading=true

    this.apiService.NotokenData('login/',data).subscribe({
      next: (response) => {
        // this.loading=false
        const dialogRef=this.dialog.open(SimpleDialogComponent,{
          data:{message:response.message,header:response.header,color:response.success?'green':'red'}
        })
        dialogRef.afterClosed().subscribe(result => {
          if (response.success) {
            this.authService.login(response.token)
            localStorage['redirectUrl']?[this.router.navigate([localStorage['redirectUrl']]),delete(localStorage['redirectUrl'])]:0;
          }
          this.loading=false

        })

      },
      error: (error) => {
        this.loading=false
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

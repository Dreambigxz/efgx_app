import { Component, inject} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import { ApiService } from "../api/api.service";
import { AuthService } from "../auth/auth.service";
import { Router , RouterLink} from '@angular/router';

import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { SimpleDialogComponent } from "../simple-dialog/simple-dialog.component";

import { loadExternalScript } from "../../helper";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-authentication',
  imports: [ReactiveFormsModule,RouterLink,CommonModule,FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './authentication.component.css'
})

export class RegisterComponent {

  constructor(
    // private route: ActivatedRoute,
    // private router: Router
    private dialog: MatDialog
  ) {}

  apiService = inject(ApiService);
  authService = inject(AuthService);
  router = inject(Router);

  history = window.history

  loading = false
  favoriteFramework = '';
  invitedBy!:any


  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  MyForm = new FormGroup({
    username: new FormControl(''),
    otp: new FormControl(''),
    fullname: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    currency: new FormControl(''),
    invite:new FormControl(this.invitedBy)
  });

  currencySettings: any [ ] = [ ]

  handleSubmit() {
    if (this.resending) {this.resending=false;return}
    let data = this.MyForm.value

    this.loading=true

    console.log({data}, 'submit');

    this.apiService.NotokenData('register/',data).subscribe({
      next: (response) => {
        const dialogRef = this.dialog.open(SimpleDialogComponent,{
          data:{message:response.message,header:response.header,color:response.success?'green':'red'}
        })
        dialogRef.afterClosed().subscribe(result => {

          if (response.success) {
            this.invitedBy?delete(localStorage['invitedBy']):0
            this.authService.login(response.token)
            this.router.navigate(['/main']);
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

  ngOnInit():void{
    let checkUrl = window.location.href.split('invited_by')

    if (checkUrl[1]) {
      this.invitedBy=checkUrl[1].replaceAll('=','')
      localStorage['invitedBy']=this.invitedBy
    }else{
      if (localStorage['invitedBy']) {
        this.invitedBy=localStorage['invitedBy']
      }
    }
    this.MyForm.patchValue({invite:this.invitedBy})

    if (!this.currencySettings[0]) {
      this.apiService.NotokenData('register/',{},'get').subscribe({
        next: (response) => {
          this.loading=false
          this.currencySettings=response.currencySettings
        },
        error: (error) => {
          this.loading=false
          this.dialog.open(SimpleDialogComponent,{
            data:{message:"Unable to process request, please try again",header:'Request timeout!', color:'red'}
          })
        }
      });
    }



  }
  ngAfterViewInit() {
    loadExternalScript()
  }

  otpCode = '';
  countdown = 0;
  resending = false
  private intervalId: any;

  startCountdown(): void {
    this.countdown = 30;
    clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.intervalId);
      }
    }, 1000);
  }

  resendOtp(): void {
    this.resending=true
    this.otpCode = '';
    this.startCountdown();

  }

}

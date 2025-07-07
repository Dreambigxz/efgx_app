import { Component, Output, inject, Inject, AfterViewInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import { ApiService } from "../api/api.service";
import { AuthService } from "../auth/auth.service";
import { Router , RouterLink} from '@angular/router';

import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { SimpleDialogComponent } from "../simple-dialog/simple-dialog.component";

import { loadExternalScript, quickMessage } from "../../helper";
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FormBuilder, Validators } from '@angular/forms';

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
    private pop: quickMessage,
    private dialog: MatDialog
  ) {}

  @ViewChild('selectCurrency') selectCurrency!: ElementRef<HTMLInputElement>;


  apiService = inject(ApiService);
  authService = inject(AuthService);
  router = inject(Router);
  helpLink=''
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
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl(''),
    currency: new FormControl(''),
    invite:new FormControl(this.invitedBy)
  });

  currencySettings :any [ ] = [ ]

  handleSubmit(url='register/',method='post') {


    let data = this.MyForm.value;


    if (url==='register/') {
      if (!this.MyForm.valid) {return}
      this.loading=true
    }

    this.apiService.NotokenData(url,data,method).subscribe({
      next: (response) => {
        if (method==='post') {
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
        }
        else{
          this.pop.show(response.message)
        }

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

    this.authService.isLoggedIn?this.router.navigate(['/main']):0;

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
      this.apiService.NotokenData('register/?action=currency_settings',{},'get').subscribe({
        next: (response) => {
          this.loading=false;
          this.helpLink=response.helpLink
          localStorage['helpLink']=response.helpLink
          this.currencySettings=response.currencySettings
          let currencySettings =  document.querySelector('select.currencySettings')
          this.currencySettings.forEach(element => {
            let option = document.createElement('option')
            option.value=element.code;option.innerText = element.name
            currencySettings?.appendChild(option)
          });
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
    let data = this.MyForm.value

    if (!data.email) {
      this.pop.show('Please provide a valid email address')
      setTimeout(() => {
        this.resending=false
      }, 2000);

      return
    }

    this.otpCode = '';
    this.startCountdown();

    this.handleSubmit('register/?action=send_verification_code&email='+data.email,'get')

  }

  trackById(index: number, item: any) {
    return item.id;
  }
  navigate(url:any) {
    url = url.split(' ')
    this.router.navigate(url);
  }


}

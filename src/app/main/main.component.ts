import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { DataService } from "../user/data.service";
import { tap, delay } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Observable, } from 'rxjs';


import { ApiService } from "../api/api.service";
import { AuthService } from "../auth/auth.service";

import { RouterLink, Router } from '@angular/router';

import { SpinComponent } from "../spin/spin.component";

import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';

import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogComponent } from "../simple-dialog/simple-dialog.component";
import { GoogleAuthComponent } from "../google-auth/google-auth.component";

@Component({
  standalone: true,
  imports: [RouterLink, CommonModule,SpinComponent, MatSliderModule,MatIconModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})

// export class MainComponent implements OnInit {
export class MainComponent implements OnInit {

  // @ViewChild('googleAuthModal') googleAuthModal!: ElementRef<HTMLInputElement>;

  constructor(
    // private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    // private googleAuth: GoogleAuthComponent
  ) {}

  serviceData = inject(DataService)
  apiService = inject(ApiService)
  authService = inject(AuthService)


  AllData=this.serviceData.userData;
  user=(this.serviceData.userData as any).user
  wallet=(this.serviceData.userData as any).wallet
  init_currency=(this.serviceData.userData as any).init_currency
  //
  isLoadingContent = false
  spinnedSignedUp = true
  has2FA = (this.serviceData.userData as any).has2FA
  build2FA = (this.serviceData.userData as any).build2FA
  forceClose2fa = false
  totalNotUnread = (this.serviceData.userData as any).totalNotUnread

  ngOnInit(): void{

    if (!Object.keys(this.serviceData.userData).includes('user')) {
      this.isLoadingContent = true
      this.apiService.tokenData('main/', this.authService.tokenKey,'get', {})
      .subscribe(response => {
        this.AllData = this.serviceData.update(response)
        this.user = response.user
        this.wallet = response.wallet
        this.init_currency = response.init_currency
        this.isLoadingContent = false;
        this.spinnedSignedUp=response.spinnedSignedUp
        this.has2FA=response.has2FA
        this.build2FA=response.build2FA;
        this.totalNotUnread=response.totalNotUnread
        this.checkViews()
      }, err => {
        if (err.statusText === "Unauthorized") {this.authService.logout(true)}
      });
    }else{

      console.log('totalNotUnread>>', this.totalNotUnread);

      this.spinnedSignedUp=(this.serviceData.userData as any).spinnedSignedUp
      this.checkViews()
    }

    this.startAutoSlide();
  }

  checkViews(){
    if ((this.serviceData.userData as any).must_reset_password) {
      this.router.navigate(['/profile'])
    }
    else{this.check2Fa()}
  }

  images = [
    'https://jmglimitedbucket.s3.amazonaws.com/paymentProof/slide01.jpg',
    'https://jmglimitedbucket.s3.amazonaws.com/paymentProof/slide02.jpg',
    'https://jmglimitedbucket.s3.amazonaws.com/paymentProof/slide03.jpg',
    'https://jmglimitedbucket.s3.amazonaws.com/paymentProof/slide04.jpg'
  ];

  currentIndex = 0;
  autoSlideInterval: any;

  ngAfterViewInit() {
    // let page = document.querySelector('.page')
  }

  ngOnDestroy() {
    clearInterval(this.autoSlideInterval);
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextImage();
    }, 3000); // Change every 3 seconds
  }

  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  notificationsCount = 0; // Example count

  current = 'home';

  navigate(url:any) {
    url = url.split(' ')
    this.router.navigate(url);
  }

  check2Fa(){

    if (this.user&&!this.has2FA) {
      let dialogRef = this.dialog.open(GoogleAuthComponent,{
        data:this.build2FA
      })
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (typeof(result)==='string') {
            if (result.length==6) {
              this.isLoadingContent=true
              this.apiService.tokenData('main/', this.authService.tokenKey, 'post', {otp:result,action:'bind'})
              .subscribe(response => {
                this.isLoadingContent=false
                let dialogRef = this.dialog.open(SimpleDialogComponent,{
                  data:{message:response.message,header:response.header,color:response.success?'green':'red'}
                })
                dialogRef.afterClosed().subscribe(result => {
                  response.success?[
                    this.has2FA=true,
                    this.serviceData.update({has2FA:true})
                  ]:this.check2Fa()
                })

              }, error =>{
                this.isLoadingContent=false
                if (error.statusText === "Unauthorized") {this.authService.logout()}else{
                  let dialogRef=this.dialog.open(SimpleDialogComponent,{
                    data:{message:"Unable to process request, please try again",header:'Request timeout!', color:'red'}
                  });

                }
              });
            }else{
              this.check2Fa()
            }
          }else{
            this.forceClose2fa=true
          }
        }else{this.check2Fa()}
      })

    }
  }

}

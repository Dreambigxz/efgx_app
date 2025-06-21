import { Component, OnInit, inject } from '@angular/core';
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


@Component({
  selector: 'app-main',
  imports: [RouterLink, CommonModule,SpinComponent, MatSliderModule,MatIconModule],
  templateUrl: './main.component.html',
  // template:`    <p>Car Listing: {{ username }}</p>`,
  styleUrl: './main.component.css'
})

// export class MainComponent implements OnInit {
export class MainComponent implements OnInit {

  constructor(
    // private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    // private otp: OtpComponent
  ) {}

  serviceData = inject(DataService)
  apiService = inject(ApiService)
  authService = inject(AuthService)

  // taskComponent = inject(TaskComponent)

  AllData=this.serviceData.userData;
  user=(this.serviceData.userData as any).user
  wallet=(this.serviceData.userData as any).wallet
  init_currency=(this.serviceData.userData as any).init_currency
  //
  isLoadingContent = false
  spinnedSignedUp = true
  // (this.serviceData.userData as any).spinnedSignedUp

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
        this.checkViews()
      }, err => {
        if (err.statusText === "Unauthorized") {this.authService.logout(true)}
      });
    }else{
      this.spinnedSignedUp=(this.serviceData.userData as any).spinnedSignedUp
      this.checkViews()
    }

    this.startAutoSlide();
  }

  checkViews(){
    if ((this.serviceData.userData as any).must_reset_password) {
      this.router.navigate(['/profile'])
    }
  }

  images = [
    'https://jmglimitedbucket.s3.amazonaws.com/paymentProof/slide01.jpg',
    'https://jmglimitedbucket.s3.amazonaws.com/paymentProof/slide02.jpg',
    'https://jmglimitedbucket.s3.amazonaws.com/paymentProof/slide03.jpg',
    'https://jmglimitedbucket.s3.amazonaws.com/paymentProof/slide04.jpg'
  ];

  currentIndex = 0;
  autoSlideInterval: any;


  ngOnDestroy() {
    clearInterval(this.autoSlideInterval);
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextImage();
    }, 3000); // Change every 3 seconds
  }

  // prevImage() {
  //   this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  // }

  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  notificationsCount = 0; // Example count

  logout() {
    // Your logout logic here
    const dialogRef = this.dialog.open(SimpleDialogComponent,{
      data:{message:"Are you sure you want to logout your account?",header:'Logout!', color:'red',confirmation:true},
      // width:200px
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authService.logout()
      }
    })

  }

  current = 'home';

  navigate(url:any) {
    url = url.split(' ')
    this.router.navigate(url);
  }

}

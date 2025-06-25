import { Component, inject, OnInit,ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from "../api/api.service";
import { AuthService } from "../auth/auth.service";
import { DataService } from "../user/data.service";

import { RouterLink, ActivatedRoute, Router} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { ChangePasswordComponent } from "../modal/change-password/change-password.component";
import { loadExternalScript } from "../../helper";


@Component({
  selector: 'app-profile',
  imports: [CommonModule,MatIconModule, RouterLink, ChangePasswordComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

    constructor(
      // private route: ActivatedRoute,
      private router: Router,
      // public dialog: MatDialog,
      // private otp: OtpComponent
    ) {}

  navigate (url:any){
    this.router.navigate(url.split(' '))
  }
  current = 'profile';

  serviceData = inject(DataService)
  apiService = inject(ApiService)
  authService = inject(AuthService)

  AllData=this.serviceData.userData;

  directory!:string

  loading=false
  isLoadingContent = false
  history = window.history

  user = (this.serviceData.userData as any).user
  wallet = (this.serviceData.userData as any).wallet
  initCurrency = (this.serviceData.userData as any).init_currency
  profileDir = (this.serviceData.userData as any).profileDir

  changePassword = false


  profileImageUrl = 'assets/images/avatar.jpg'
  // profileDir.image_ur

  setImageUrl(){
    this.profileDir?.image_url?this.profileImageUrl=this.profileDir.image_url:0;
  }

  ngOnInit(): void {
      this.setImageUrl()

    if (!this.user) {
      this.isLoadingContent = true
      this.apiService.tokenData('profile/', this.authService.tokenKey,'get', {}).subscribe({
        next: (response) =>{
          this.isLoadingContent = false
          this.serviceData.update(response)
          this.user=response.user;this.checkViews()
          this.profileDir=response.profileDir
        this.setImageUrl()
        },
        error: (err) => {
          this.isLoadingContent = false
          if (err.statusText === "Unauthorized") {this.authService.logout(true)}
        }
      });

    }
    this.checkViews()
  }

  checkViews(){
    if ((this.serviceData.userData as any).must_reset_password) {this.changePassword=true}
  }

  ngAfterViewInit() {
    loadExternalScript()
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        this.profileImageUrl = reader.result as string;
        this.apiService.tokenData('profile/', this.authService.tokenKey, 'post', {image:this.profileImageUrl,'action':'upload_profile_image'})
        .subscribe(response => {
        }, error =>{
          if (error.statusText === "Unauthorized") {this.authService.logout()}
        });

      };

      reader.readAsDataURL(file);
    }
  }

}

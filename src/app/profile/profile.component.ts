import { Component, inject, OnInit,ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from "../api/api.service";
import { AuthService } from "../auth/auth.service";
import { DataService } from "../user/data.service";

import { RouterLink, ActivatedRoute, Router} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { ChangePasswordComponent } from "../modal/change-password/change-password.component";
import { loadExternalScript } from "../../helper";

import { GoogleAuthComponent } from "../google-auth/google-auth.component";
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogComponent } from "../simple-dialog/simple-dialog.component";
import { OtpComponent } from "../modal/otp/otp.component";

import { AppComponent } from '../app.component';

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
      public dialog: MatDialog,
      private app: AppComponent
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

  has2FA = (this.serviceData.userData as any).has2FA
  build2FA = (this.serviceData.userData as any).build2FA
  forceClose2fa = false

  totalNotUnread = 0


  changePassword = false

  profileImageUrl = 'assets/images/avatar.jpg'


  awaitingReq: any
  appVersion = (this.serviceData.userData as any).appVersion

  selectedFile: any

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
          this.user=response.user;
          this.profileDir=response.profileDir;
          this.has2FA=response.has2FA;
          this.appVersion=response.appVersion;
          this.setImageUrl();this.checkViews()
        },
        error: (err) => {
          this.isLoadingContent = false
          if (err.statusText === "Unauthorized") {this.authService.logout(true)}
        }
      });

    }else{
      this.checkViews()
    }
    //
  }

  checkViews(){
    this.totalNotUnread=(this.serviceData.userData as any).totalNotUnread
    if ((this.serviceData.userData as any).must_reset_password) {this.changePassword=true}

    this.app.checkAppVersion(this.appVersion)
  }

  ngAfterViewInit() {
    loadExternalScript()
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      this.selectedFile=file

      reader.onload = () => {
        this.profileImageUrl = reader.result as string;
        this.sendImageData()
      };
      reader.readAsDataURL(file);
    }

  }

  sendImageData(){

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('action', 'set_profile_img');
    console.log({formData});

    this.apiService.tokenData('upload/', this.authService.tokenKey, 'post', formData)
    .subscribe(response => {
      console.log({response});

    }, error =>{
      if (error.statusText === "Unauthorized") {this.authService.logout()}
    });
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

    }else{
      console.log("2fa EXIST",this.build2FA);
      // this.build2FA.push(true)
      let dialogRef = this.dialog.open(GoogleAuthComponent,{
        data:''
      })
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.awaitingReq = (result:any)=>{
            result['action']='reset'
            this.isLoadingContent=true
            this.apiService.tokenData('main/', this.authService.tokenKey, 'post', result)
            .subscribe(response => {
              this.isLoadingContent=false;
              this.serviceData.update(response)
              this.dialog.open(SimpleDialogComponent,{
                data:{message:response.message,header:response.header,color:response.success?'green':'red'},
              })
              if (response.success) {
                this.has2FA=false;
                this.build2FA=response.build2FA;
                this.check2Fa();

              }


            }, error =>{
              this.isLoadingContent=false
              if (error.statusText === "Unauthorized") {this.authService.logout()}else{
                this.dialog.open(SimpleDialogComponent,{
                  data:{message:"Unable to process request, please try again",header:'Request timeout!', color:'red'}
                })

              }
            });
          }
          this.promptOtp({'message':'Pleae provide the 6 digit OTP code sent to your valid email address.', header:'OTP'})
          this.apiService.tokenData('main/', this.authService.tokenKey, 'post', {action:'get_or_set_otp'})
          .subscribe(response => {
            console.log({response});

          }, error =>{


            if (error.statusText === "Unauthorized") {this.authService.logout()}else{
              this.dialog.open(SimpleDialogComponent,{
                data:{message:"Unable to process request, please try again",header:'Request timeout!', color:'red'}
              })

            }
          });
        }
      })

    }
  }

  promptOtp(data:any){//{message:'response.message',header:'response.header'}){
    let dialogRef = this.dialog.open(OtpComponent,{
      data:data
      // width:'400px'
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result&&result.length===6) {
        console.log({result});
        this.awaitingReq({'pin':result})
      }
      else{
          result?this.promptOtp(data):0;
      }

    })
    // return
  }


}

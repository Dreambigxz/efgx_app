import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';
import { addHours } from '../../helper';
import {inject} from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from "../user/data.service";

import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogComponent } from "../simple-dialog/simple-dialog.component";


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  // constructor(
  //   public ,
  // ) {}

  dialog  = inject(MatDialog)
  router = inject(Router);

  isLoggedIn = false;
  tokenKey=null

  chekLogin() {
    // console.log('checking if user is logged');
    let token;
    if (localStorage['token']) {
      token =JSON.parse(localStorage['token'])
    }

    // console.log({token,isLoggedIn:this.isLoggedIn});
    if (token) {
      //check if token expired
      let[exp,now]=[new Date(token.exp),new Date()]
      // console.log({exp,now});

      if (now>exp) {
        delete(localStorage['token'])
        this.isLoggedIn=false
      }else{this.isLoggedIn=true;this.tokenKey=token.token}
    }
    // console.log('isLoggedIn?', this.isLoggedIn);

    // this.isLoggedIn?this.validate(token.token):0;
    return this.isLoggedIn
  }

  // store the URL so we can redirect after logging in
  redirectUrl: string | null = null;

  login(token:number|string): Observable<any> {

    // this.isLoggedIn = true
    localStorage['token'] =JSON.stringify({
      created:new Date(),
      exp:addHours(new Date(),48),
      token:token
    })
    return of(true)
    // .pipe(
    //   // delay(1000),
    //   tap(() => this.isLoggedIn = true)
    // );
    // return this.isLoggedIn
  }

  logout_now(): void {
    delete(localStorage['token'])
    this.isLoggedIn=false;
    this.tokenKey=null
    window.location.reload()
  }

  logout(force=true) {
    // Your logout logic here
    if (force) {
        this.logout_now()
    }else{
      const dialogRef = this.dialog.open(SimpleDialogComponent,{
        data:{message:"Are you sure you want to logout your account?",header:'Logout!', color:'red',confirmation:true},
        // width:200px
      })
      dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.logout_now()
      }
    })
    }

  }

}

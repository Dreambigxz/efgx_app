import { Component } from '@angular/core';
import { App } from '@capacitor/app';
import {CommonModule} from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http'; // ✅ Import this

import { DownloadAppComponent } from "./download-app/download-app.component";
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  standalone:true,
 imports: [ RouterOutlet, RouterLink, HttpClientModule],
   templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})

export class AppComponent {

  constructor(
    public dialog: MatDialog,
  ) {}

  title = 'EFGX - Investment App';
  appVersion:any
  // isMobileApp = !!(window as any).cordova || !!(window as any).Capacitor;

  // ngOnInit(){}

  checkAppVersion(version:any){

    App.getInfo().then(info => {
      this.appVersion=info.version
      console.log('App Version:', info.version);
      console.log('App Name:', info.name);
      console.log('Build Version:', info.build);
      if (version.version>info.version) {
        let dialogRef = this.dialog.open(DownloadAppComponent,{
          data:{'url':version.url}
        })
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
              if (typeof(result)==='string') {}
            }
          })
      }

    });
  }
}

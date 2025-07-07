import { Component } from '@angular/core';
import { App } from '@capacitor/app';
import {CommonModule} from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http'; // ✅ Import this

import { DownloadAppComponent } from "./download-app/download-app.component";
import { MatDialog } from '@angular/material/dialog';

import PullToRefresh from 'pulltorefreshjs';

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

  ngOnInit(): void {

    App.getInfo().then(info => {

      PullToRefresh.init({
        mainElement: 'body',
        onRefresh: () => {
          // Your refresh logic here
          return new Promise((resolve) => {
            // console.log('Pull-to-refresh triggered');
            // simulate async refresh
            setTimeout(() => {
              window.location.reload(); // or any refresh logic
              resolve(true);
            }, 1000);
          });
        }
      });
    });



  }

  ngOnDestroy(): void {
    PullToRefresh.destroyAll(); // Clean up when component is destroyed

    // console.log(window.location.href);

  }
}

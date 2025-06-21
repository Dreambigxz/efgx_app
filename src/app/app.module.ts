import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // ✅ Import this

import { AppComponent } from './app.component';
import { ApiService } from '../api/api.service';
import { NgxQRCodeModule } from 'ngx-qrcode2';

@NgModule({
  declarations: [
    AppComponent,
    ApiService,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgxQRCodeModule // ✅ Add this to imports
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

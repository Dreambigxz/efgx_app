import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // ✅ Import this

import { AppComponent } from './app.component';
import { WalletComponent } from './wallet.component';
import { ApiService } from '../api/api.service';
// import { NgxQRCodeModule } from 'ngx-qrcode2';

@NgModule({
  declarations: [
    AppComponent,
    ApiService,
    WalletComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    // NgxQRCodeModule // ✅ Add this to imports
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // allows <qrcode> tag without error

  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

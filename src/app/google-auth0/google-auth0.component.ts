import { Component, Output, EventEmitter, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import {MatButtonModule} from '@angular/material/button';

import { ApiService } from "../api/api.service";
import { AuthService } from "../auth/auth.service";
import { DataService } from "../user/data.service";

import { MainComponent } from "../main/main.component";

import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogRef,
  MatDialogClose
 } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-google-auth',
  imports: [CommonModule,MatDialogActions,MatButtonModule,FormsModule,MatDialogClose],
  templateUrl: './google-auth.component.html',
  styleUrl: './google-auth.component.css'
})
export class GoogleAuthComponent {

  @Output() closeModal = new EventEmitter<void>();

  constructor(
    // private route: ActivatedRoute,
    // private router: Router,
    // public data: { message: string ,header:string, color:'red',confirmation:false},

    private main: MainComponent,
    public dialog: MatDialog
  ) {}

  close() {this.main.forceClose2fa=true}

  serviceData = inject(DataService)
  apiService = inject(ApiService)
  authService = inject(AuthService)

  user=(this.serviceData.userData as any).user
  buid2FA=(this.serviceData.userData as any).buid2FA

  otp: string[] = ['', '', '', '','','']; // for 6-digit OTP
  otpDigits = new Array(6);

  onKeyUp(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    console.log({key});
    if (key === 'Backspace' && index > 0 && !input.value) {
      const prev = document.getElementById('otp-' + (index - 1));
      prev?.focus();
    } else if (input.value && index < 7) {
      input.value=key; this.otp[index]=key
      const next = document.getElementById('otp-' + (index + 1));
      next?.focus();
    }
  }

  getOtp(): string {
    return this.otp.join('');
  }

  bindNow(){
    let otp = this.getOtp()
    console.log({otp});
    if (otp.length==6) {
      console.log('code valid');

    }

  }

  ngOnInit(): void{
    console.log('INIT');
    console.log(this.buid2FA);

  }

}

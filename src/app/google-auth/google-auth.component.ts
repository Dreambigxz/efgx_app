import { Component, Output, inject, Inject, AfterViewInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
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

  constructor(
    public dialogRef: MatDialogRef<GoogleAuthComponent>,
    @Inject(MAT_DIALOG_DATA) public data: [ 'secret_key' ,'qrcode'],
    public dialog: MatDialog,
  ) {}

  @Output() closeModal = new EventEmitter<void>();
  @ViewChild('otpInput') otpInput!: ElementRef<HTMLInputElement>;
  @ViewChild('googleAuthModal') googleAuthModal!: ElementRef<HTMLInputElement>;


  close(): void {this.dialogRef.close()}

  otp: string[] = ['', '', '', '','','']; // for 6-digit OTP
  otpDigits = new Array(6);

  ngAfterViewInit() {


    setTimeout(() => {
      this.googleAuthModal.nativeElement.scrollTop=0

      this.otpInput?.nativeElement?.blur();
      this.googleAuthModal.nativeElement.click()

    }, 500); // Short delay ensures DOM is fully settled

  }

  onKeyUp(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    const key = event.key;
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


  copied=false

  copyContent(item:any) {
    navigator.clipboard.writeText(item).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 3000);
    });
  }

}

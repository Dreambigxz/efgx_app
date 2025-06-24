import { Component, Output, EventEmitter, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import {MatButtonModule} from '@angular/material/button';


import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogRef,
  MatDialogClose
 } from '@angular/material/dialog';
@Component({
  selector: 'app-otp',
  imports: [CommonModule,MatDialogActions,MatButtonModule,FormsModule,MatDialogClose],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.css'
})

// @Directive({ selector: '[focusOnInit]' })
export class OtpComponent {

  constructor(
    public dialogRef: MatDialogRef<OtpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: 'input OTP' ,header:'OTP',},
    public dialog: MatDialog,
  ) {}


  @Output() closeModal = new EventEmitter<void>();

  close(): void {
    this.dialogRef.close();
  }


  otp: string[] = ['', '', '', '', '', '']; // for 6-digit OTP
  otpDigits = new Array(6);

  onKeyUp(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    // console.log({key});
    if (key === 'Backspace' && index > 0 && !input.value) {
      const prev = document.getElementById('otp-' + (index - 1));
      prev?.focus();
    } else if (input.value && index < 5) {
      input.value=key; this.otp[index]=key
      const next = document.getElementById('otp-' + (index + 1));
      next?.focus();
    }
  }

  getOtp(): string {
    return this.otp.join('');
  }
}

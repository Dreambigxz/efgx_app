import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';

import { DataService } from "../user/data.service";
import { ApiService } from "../api/api.service";
import { AuthService } from "../auth/auth.service";

import { SimpleDialogComponent } from "../simple-dialog/simple-dialog.component";


import { MainComponent } from "../main/main.component";

import {
  MatDialog,
  MatDialogActions,
  MatDialogRef,
  MatDialogClose
 } from '@angular/material/dialog';

@Component({
  selector: 'app-spin',
  imports: [CommonModule,MatDialogActions,MatButtonModule,MatDialogClose],
  templateUrl: './spin.component.html',
  styleUrl: './spin.component.css'
})

export class SpinComponent {

  constructor(

    // public dialogRef: MatDialogRef<SpinComponent>,
    private main: MainComponent,
    public dialog: MatDialog,

  ){}

  serviceData = inject(DataService)
  apiService = inject(ApiService)
  authService = inject(AuthService)

  @Output() closeModal = new EventEmitter<void>();


  close(): void {
    this.main.spinnedSignedUp=true
  }


  numbers = [1, 2, 3, 4, 5, 6, 7, 8,9,10];
  segmentAngle = 360 / this.numbers.length;
  rotation = 0;
  spinning = false;
  selectedNumber: number | null = null;

  spinWheel() {
    if (this.spinning) return;

    this.spinning = true;
    const spins = Math.floor(Math.random() * 5) + 5; // Spin 5–9 full turns
    const selectedIndex = Math.floor(Math.random() * this.numbers.length);

    const extraDegrees = selectedIndex * this.segmentAngle + this.segmentAngle / 2;
    const totalRotation = spins * 360 + extraDegrees;

    this.rotation += totalRotation;

    setTimeout(() => {

      this.selectedNumber = this.numbers[selectedIndex];
      if (this.selectedNumber>3) {
        this.selectedNumber=Math.floor(Math.random() * 3)
      }
      this.spinning = false;
      this.sendWonValue(this.selectedNumber)
    }, 4000); // match CSS transition duration
  }

  sendWonValue(val:any){
    if (val<=0) {val=1}
    this.main.isLoadingContent=true
    this.apiService.tokenData('wallet/send_request/', this.authService.tokenKey,'post', {amount:val,action:'welcome_bonus_lucky_draw'})
    .subscribe(response => {
      this.main.isLoadingContent=false
      if (response.success) {
        this.serviceData.update(response)
        this.main.spinnedSignedUp=response.spinnedSignedUp
        this.main.wallet=response.wallet
      }

      this.dialog.open(SimpleDialogComponent,{
        data:{message:response.message,header:response.header,color:response.success?'green':'red'},
        // width:'400px'
      })
    }, error => {
      this.main.isLoadingContent=false
      if (error.statusText === "Unauthorized") {
        this.authService.logout()
      }
    });
  }

}

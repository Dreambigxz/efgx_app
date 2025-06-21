import { Component, ChangeDetectionStrategy, Inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { CommonModule } from '@angular/common';

import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle, } from '@angular/material/dialog';

@Component({
  selector: 'app-simple-dialog',
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent,CommonModule],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './simple-dialog.component.html',
  styleUrl: './simple-dialog.component.css'
})

export class SimpleDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<SimpleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string ,header:string, color:'red',confirmation:false},
    public dialog: MatDialog
  ) {}

  // continueAction=false
  // this.dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       // User confirmed
  //       this.deleteItem();
  //     }
  //
  // });

  close(): void {
    this.dialogRef.close();
  }

  // open(): void{
  //   this.dialog.open()
  // }

}

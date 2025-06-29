import { Component, Output, inject, Inject, AfterViewInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogRef,
  MatDialogClose
 } from '@angular/material/dialog';
@Component({
  selector: 'app-download-app',
  imports: [CommonModule,MatDialogActions,MatButtonModule,MatDialogClose,MatIconModule],
  templateUrl: './download-app.component.html',
  styleUrl: './download-app.component.css'
})
export class DownloadAppComponent {

  constructor(
    public dialogRef: MatDialogRef<DownloadAppComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {url:''},
    public dialog: MatDialog,
  ) {}

  close(): void {this.dialogRef.close()}


}

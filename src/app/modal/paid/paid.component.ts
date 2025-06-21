import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {ReactiveFormsModule} from '@angular/forms';
import {FormGroup, FormControl} from '@angular/forms';

import { ApiService } from "../../api/api.service";
import { AuthService } from "../../auth/auth.service";
import { DataService } from "../../user/data.service";

import { SimpleDialogComponent } from "../../simple-dialog/simple-dialog.component";

import { RouterLink, ActivatedRoute, Router} from '@angular/router';

import { WalletComponent } from "../../wallet/wallet.component";
import {MatButtonModule} from '@angular/material/button';

import {

  MatDialog,
  MatDialogActions,
  // MatDialogClose,
  // MatDialogContent,
  // MatDialogRef,
  // MatDialogTitle,
 } from '@angular/material/dialog';

@Component({
  selector: 'app-paid',
  imports: [ReactiveFormsModule,CommonModule,MatDialogActions,MatButtonModule],
  templateUrl: './paid.component.html',
  styleUrl: '../modal.component.css'
})
export class PaidComponent {

  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
  }

  constructor(
    // private route: ActivatedRoute,
    private router: Router,
    private wallet: WalletComponent,
    public dialog: MatDialog
  ) {}

  serviceData = inject(DataService)
  apiService = inject(ApiService)
  authService = inject(AuthService)

  loading = false

  selectedFile: any //File | null = null;

  paymentCompletedForm = new FormGroup({
    senders_name:new FormControl(''),
    transaction_id:new FormControl(''),
    file:new FormControl(null)
  })

  onFileChange(event: Event) {
      const input = event.target as HTMLInputElement;

      if (input.files && input.files.length > 0) {
        this.selectedFile = input.files[0];
        // this.paymentCompletedForm.file=this.selectedFile
      }
  }

   handleSubmit (){

     const formData = new FormData();

     const { senders_name, transaction_id } = this.paymentCompletedForm.value;

     formData.append('senders_name', senders_name as any);
     formData.append('transaction_id', transaction_id as any);
     formData.append('action', 'submit_payment_proof');
     formData.append('file', this.selectedFile);


     let data = {'action':'submit_payment_proof'}

     this.loading=true

     this.apiService.tokenData('upload/', this.authService.tokenKey, 'post', formData)
     .subscribe(response => {
       console.log(response);
       this.close()
       this.loading=false;
       this.serviceData.update(response)
       this.dialog.open(SimpleDialogComponent,{
         data:{message:response.message,header:response.header,color:response.success?'green':'red'}
       })

       response.success?[this.wallet.awaitingDeposit=response.awaitingDeposit]:0
       // this.AllData = this.serviceData.update(response)
     }, error =>{
       this.loading=false
       if (error.statusText === "Unauthorized") {this.authService.logout()}else{
         this.dialog.open(SimpleDialogComponent,{
           data:{message:"Unable to process request, please try again",header:'Request timeout!', color:'red'}
         })

       }
     });

   }

}

import { Component, inject, OnInit,ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {FormGroup, FormControl} from '@angular/forms';

import { ApiService } from "../api/api.service";
import { AuthService } from "../auth/auth.service";
import { DataService } from "../user/data.service";

import {ReactiveFormsModule, FormsModule} from '@angular/forms';

import { SimpleDialogComponent } from "../simple-dialog/simple-dialog.component";
import { MatDialog } from '@angular/material/dialog';

import { RouterLink, ActivatedRoute, Router} from '@angular/router';

import { copyContent } from '../../helper';
import { PaidComponent } from "../modal/paid/paid.component";
import { OtpComponent } from "../modal/otp/otp.component";

// import { NgxQRCodeModule } from 'ngx-qrcode2';
import { NgxQrcodeStylingModule } from 'ngx-qrcode-styling';
import { Observable, of } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageEvent, MatPaginator } from '@angular/material/paginator';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';

@Component({
  selector: 'app-wallet',
  imports: [
    ReactiveFormsModule,RouterLink,CommonModule,
    PaidComponent,
    NgxQrcodeStylingModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
    //
  ],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css'
})
export class WalletComponent {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    // private otp: OtpComponent
  ) {}

  serviceData = inject(DataService)
  apiService = inject(ApiService)
  authService = inject(AuthService)

  AllData=this.serviceData.userData;

  directory!:string

  loading=false
  isLoadingContent = false
  history = window.history

  awaitingDeposit = (this.serviceData.userData as any).awaitingDeposit
  withdrawalInfo = (this.serviceData.userData as any).withdrawalInfo

  wallet = (this.serviceData.userData as any).wallet
  initCurrency = (this.serviceData.userData as any).init_currency

  walletForm = new FormGroup({
    amount: new FormControl(''),
    selectedAddress: new FormControl('')
  })

  addAddressForm = new FormGroup({
    account_number: new FormControl(''),
    account_holder: new FormControl(''),
    bank: new FormControl(''),
    pin: new FormControl(''),
  })

  awaitingReq: any = null

  myProfile = (this.serviceData.userData as any).profile

  checkPin(){
    let hasPin=true
    if (this.myProfile&&!this.myProfile.transaction_pin) {
      hasPin=false
      this.promptOtp({'message':'Pleae update your four digit Security pin and save it somewhere.', header:'Set Pin'})
      this.awaitingReq = (result:any)=>{
        result['action']='set_trasanction_pin'
        this.isLoadingContent=true
        this.apiService.tokenData('wallet/send_request/', this.authService.tokenKey, 'post', result)
        .subscribe(response => {
          this.isLoadingContent=false;
          this.serviceData.update(response)
          this.dialog.open(SimpleDialogComponent,{
            data:{message:response.message,header:response.header,color:response.success?'green':'red'},
            // width:'400px'
          })
          this.myProfile=response.profile

        }, error =>{
          this.isLoadingContent=true
          if (error.statusText === "Unauthorized") {this.authService.logout()}else{
            this.dialog.open(SimpleDialogComponent,{
              data:{message:"Unable to process request, please try again",header:'Request timeout!', color:'red'}
            })

          }
        });
      }
    }
    return hasPin
  }

  updateWalletAddress(awaitingDeposit:any){
    if (awaitingDeposit.transaction) {
      let extraField = JSON.parse(awaitingDeposit.transaction[0].extraField)
      this.walletAddress = extraField.pay_address
    }
  }

  updateResponse(response:any){
    this.isLoadingContent = false
    this.initCurrency = response.init_currency
    this.wallet = response.wallet
    this.serviceData.update(response)
    this.myProfile=response.profile
    this.checkPin()
  }

  ngOnInit(): void {
    this.checkPin();
    // this.setPage(0, 5);

    this.route.paramMap.subscribe(params => {
      const action = params.get('action');
      this.directory=`${action}`
      if (this.directory==='deposit') {
        if (!this.awaitingDeposit) {
          this.isLoadingContent = true
          this.apiService.tokenData('wallet/get_data?type=awaiting_deposit', this.authService.tokenKey,'get', {}).subscribe({
            next: (response) =>{
              this.awaitingDeposit=response.awaitingDeposit
              this.updateResponse(response)
              this.updateWalletAddress(response.awaitingDeposit)
            },
            error: (err) => {
              if (err.statusText === "Unauthorized") {this.authService.logout(true)}
            }
          });
        }else{
        }
      }else if(this.directory==='withdraw'){
        if (!this.withdrawalInfo) {
          this.isLoadingContent = true
          this.apiService.tokenData('wallet/get_data?type=withdrawal_info', this.authService.tokenKey,'get', {}).subscribe({
            next: (response) =>{
              this.withdrawalInfo=response.withdrawalInfo
              this.updateResponse(response)
            },
            error: (err) => {
              if (err.statusText === "Unauthorized") {this.authService.logout(true)}
            }
          });
        }
      }else{
        if (!this.transactions) {
          this.isLoadingContent=true
          this.apiService.tokenData('wallet/get_data?type=transactions', this.authService.tokenKey,'get', {}).subscribe({
            next: (response) =>{
              // this.withdrawalInfo=response.withdrawalInfo
              this.updateResponse(response)
              this.transactions=response.transactions
              this.startTransaction()
            },
            error: (err) => {
              if (err.statusText === "Unauthorized") {this.authService.logout(true)}
            }
          });

        }
        // this.startTransaction()
      }
    });

  }

  handleDepositSubmit(action='create_deposit'){

    let data = {action}

    Object.assign(data,this.walletForm.value)

    this.loading=true
    this.apiService.tokenData('wallet/send_request/', this.authService.tokenKey, 'post', data)
    .subscribe(response => {
      this.loading=false;
      this.serviceData.update(response)
      this.dialog.open(SimpleDialogComponent,{
        data:{message:response.message,header:response.header,color:response.success?'green':'red'},
        // width:'400px'
      })
      this.awaitingDeposit=response.awaitingDeposit
      this.updateWalletAddress(response.awaitingDeposit)
    }, error =>{
      this.loading=false
      if (error.statusText === "Unauthorized") {this.authService.logout()}else{
        this.dialog.open(SimpleDialogComponent,{
          data:{message:"Unable to process request, please try again",header:'Request timeout!', color:'red'}
        })

      }
    });

  }

  handleAddressSubmit(){

    let data = {'action':'setup_wallet'}
    // const formData = new FormData(form);

    Object.assign(data,this.addAddressForm.value)

    this.awaitingReq = (result:any)=>{
      result?Object.assign(data,result):0;

      this.loading=true
      this.apiService.tokenData('wallet/send_request/', this.authService.tokenKey, 'post', data)
      .subscribe(response => {
        this.loading=false;
        this.serviceData.update(response)
        this.dialog.open(SimpleDialogComponent,{
          data:{message:response.message,header:response.header,color:response.success?'green':'red'},
          // width:'400px'
        })
        this.withdrawalInfo=response.withdrawalInfo

      }, error =>{
        this.loading=false
        if (error.statusText === "Unauthorized") {this.authService.logout()}else{
          this.dialog.open(SimpleDialogComponent,{
            data:{message:"Unable to process request, please try again",header:'Request timeout!', color:'red'}
          })

        }
      });
    }

    this.checkPin()?this.promptOtp({header:'Security pin',message:"Please provide your 4 digit pin"}):0

  }

  copyContent = copyContent

  invoice = {

  }

  paymentCompletedModal=false

  deleteAction(action:any){
    const dialogRef = this.dialog.open(SimpleDialogComponent,{
      data:{message:"Are you sure you want to continue?",header:'Delete!', color:'red',confirmation:true},
      // width:200px
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoadingContent=true
        this.apiService.tokenData('wallet/send_request/', this.authService.tokenKey, 'post', {action:'delete_deposit'})
        .subscribe(response => {
          this.isLoadingContent=false;
          this.serviceData.update(response)
          this.awaitingDeposit=response.awaitingDeposit
          response.message?[this.dialog.open(SimpleDialogComponent,{
            data:{message:response.message,header:response.header,color:response.success?'green':'red'},
            // width:'400px'
          })]:0
          this.awaitingDeposit=response.awaitingDeposit
        }, error =>{
          this.isLoadingContent=true
          if (error.statusText === "Unauthorized") {this.authService.logout()}else{
            this.dialog.open(SimpleDialogComponent,{
              data:{message:"Unable to process request, please try again",header:'Request timeout!', color:'red'}
            })
          }
        });
      }
    });
  }

  promptOtp(data:any){//{message:'response.message',header:'response.header'}){
    let dialogRef = this.dialog.open(OtpComponent,{
      data:data
      // width:'400px'
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result&&result.length==4) {
        this.awaitingReq({'pin':result})
      }
    })
    // return
  }

  walletAddress: string = ''; // Example Bitcoin address
  amount: number = 0.005;
  copied: boolean = false;

  copyAddress() {
    navigator.clipboard.writeText(this.walletAddress).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 3000);
    });
  }

  //Transaction view

  transactions= (this.serviceData.userData as any).transaction

  startTransaction (){
    this.allTransactions = this.transactions;
    this.filteredTransactions=[...this.allTransactions]
      this.updatePagedTransactions();
  }


  selectedType: string = 'All';
  dateFrom: string = '';
  dateTo: string = '';

  displayedColumns: string[] = ['type', 'amount', 'date', 'status'];
  allTransactions: any[] = [] //this.transactions

  filteredTransactions:any[]=[] //= [...this.allTransactions];
  pagedTransactions: any[] = [];
  pageSize = 5;
  currentPage = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    // this.paginator.page.subscribe(() => this.updatePagedTransactions());
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePagedTransactions();
  }

  updatePagedTransactions(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.pagedTransactions = this.filteredTransactions.slice(start, end);
  }

  applyFilters() {
   this.filteredTransactions = this.allTransactions.filter((tx) => {
     const txDate = new Date(tx.date);
     const fromDate = this.dateFrom ? new Date(this.dateFrom) : null;
     const toDate = this.dateTo ? new Date(this.dateTo) : null;

     return (
       (this.selectedType === 'All' || tx.type === this.selectedType) &&
       (!fromDate || txDate >= fromDate) &&
       (!toDate || txDate <= toDate)
     );
   });

   // this.calculateTotals();
   this.setPage(0, 5);
 }
 //
   // calculateTotals() {
   //   this.totalDeposit = this.filteredTransactions
   //     .filter(t => t.type === 'Deposit')
   //     .reduce((sum, t) => sum + t.amount, 0);
   //   this.totalWithdrawal = this.filteredTransactions
   //     .filter(t => t.type === 'Withdrawal')
   //     .reduce((sum, t) => sum + t.amount, 0);
   // }

 //   onPageChange(event: PageEvent) {
 //     this.setPage(event.pageIndex, event.pageSize);
 //   }
 //
   setPage(index: number, size: number) {
     const start = index * size;
     this.pagedTransactions = this.filteredTransactions.slice(start, start + size);
   }

}

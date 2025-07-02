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

// import { NgxQrcodeStylingModule } from 'ngx-qrcode-styling';
import { Observable, of } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageEvent, MatPaginator } from '@angular/material/paginator';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';


import { QRCodeComponent } from 'angularx-qrcode';
import { GoogleAuthComponent } from "../google-auth/google-auth.component";

@Component({
  selector: 'app-wallet',
  imports: [
    ReactiveFormsModule,RouterLink,CommonModule,
    PaidComponent,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    QRCodeComponent
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
  ) {}

  copyContent = copyContent

  serviceData = inject(DataService)
  apiService = inject(ApiService)
  authService = inject(AuthService)

  AllData=this.serviceData.userData;

  directory!:string

  loading=false
  isLoadingContent = false
  forceClose2fa= false
  history = window.history

  user=(this.serviceData.userData as any).user

  awaitingDeposit = (this.serviceData.userData as any).awaitingDeposit
  withdrawalInfo = (this.serviceData.userData as any).withdrawalInfo

  wallet = (this.serviceData.userData as any).wallet
  initCurrency = (this.serviceData.userData as any).init_currency

  addNewAddress = false

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
  hasPin=true

  has2FA = (this.serviceData.userData as any).has2FA
  build2FA = (this.serviceData.userData as any).build2FA

  extraField:any

  checkPin(){
    if (this.myProfile&&!this.myProfile.transaction_pin) {
      this.hasPin=false
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
          if (response.success) {
            this.myProfile=response.profile
            this.hasPin=Object.keys(response.profile).includes('transaction_pin')
          }

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
    return this.hasPin
  }

  updateWalletAddress(awaitingDeposit:any){
    if (awaitingDeposit.transaction) {
      this.extraField = JSON.parse(awaitingDeposit.transaction[0].extraField)
      this.walletAddress = this.extraField.pay_address
    }
  }

  updateResponse(response:any){
    this.isLoadingContent = false
    this.initCurrency = response.init_currency
    this.wallet = response.wallet
    this.serviceData.update(response)
    this.myProfile=response.profile
    this.has2FA = response.has2FA
    this.user=response.user
    this.build2FA=response.build2FA
    this.check2Fa();

    if (this.withdrawalInfo?.addresses) {this.showWithdrawalAdd(this.withdrawalInfo.addresses)}
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const action = params.get('action');
      this.directory=`${action}`
      if (this.directory==='deposit') {
        if (!this.awaitingDeposit||this.awaitingDeposit&&this.awaitingDeposit.transaction) {
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
          this.updateResponse(this.serviceData.userData);
          this.updateWalletAddress(this.awaitingDeposit)
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
        }else{
          this.updateResponse(this.serviceData.userData)
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

  handleSubmit(action='create_deposit'){

    let data = {action}
    Object.assign(data,this.walletForm.value)

    this.awaitingReq = (result:any)=>{
      result?Object.assign(data,result):0;

      this.loading=true
      this.apiService.tokenData('wallet/send_request/', this.authService.tokenKey, 'post', data)
      .subscribe(response => {
        this.loading=false;
        this.serviceData.update(response)
        const dialogRef= this.dialog.open(SimpleDialogComponent,{
          data:{message:response.message,header:response.header,color:response.success?'green':'red'},
        })
        dialogRef.afterClosed().subscribe(result => {
          if (response.redirect) {
            this.router.navigate(['/wallet',response.redirect])
          }
        })

        if (response.awaitingDeposit) {
          this.awaitingDeposit=response.awaitingDeposit
          this.updateWalletAddress(response.awaitingDeposit)
        }

      }, error =>{
        this.loading=false
        if (error.statusText === "Unauthorized") {this.authService.logout()}else{
          this.dialog.open(SimpleDialogComponent,{
            data:{message:"Unable to process request, please try again",header:'Request timeout!', color:'red'}
          })

        }
      });

    }
    if (action==='create_deposit') {
      this.awaitingReq('')
    }else{this.check2Fa()?this.promptOtp({header:'2 Factor Authentication!',message:"Please provide your google authentication code:"}):0}

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
        if (response.success) {
          if (response.withdrawalInfo) {
            this.withdrawalInfo=response.withdrawalInfo
            this.showWithdrawalAdd(response.withdrawalInfo.addresses)
          }
          this.addNewAddress=false
        }

      }, error =>{
        this.loading=false
        if (error.statusText === "Unauthorized") {this.authService.logout()}else{
          this.dialog.open(SimpleDialogComponent,{
            data:{message:"Unable to process request, please try again",header:'Request timeout!', color:'red'}
          })

        }
      });
    }
    this.check2Fa()?this.promptOtp({header:'2 Factor Authentication!',message:"Please provide your google authentication code:"}):0
  }

  showWithdrawalAdd(addresses:any[]){

    setTimeout(() => {
      let select =  document.querySelector('select')

      let option = document.createElement('option')
      option.setAttribute('disabled','')
      option.setAttribute('selected','');option.innerText='Select Address'
      select?.append(option)

      for (let index = 0; index < addresses.length; index++) {
        const element = addresses[index];
        option = document.createElement('option')
        option.value=`${index}`;option.innerText = element.account_number
        select?.append(option)
      }

    }, 300);

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
      if (result&&result.length===6) {
        this.awaitingReq({'pin':result})
      }
      else{
          result?this.promptOtp(data):0;
      }

    })
    // return
  }

  check2Fa(){

    if (this.user&&!this.has2FA) {

      let dialogRef = this.dialog.open(GoogleAuthComponent,{
        data:this.build2FA
      })
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (typeof(result)==='string') {
            if (result.length==6) {
              this.isLoadingContent=true
              this.apiService.tokenData('main/', this.authService.tokenKey, 'post', {otp:result,action:'bind'})
              .subscribe(response => {
                this.isLoadingContent=false
                let dialogRef = this.dialog.open(SimpleDialogComponent,{
                  data:{message:response.message,header:response.header,color:response.success?'green':'red'}
                })
                dialogRef.afterClosed().subscribe(result => {
                  response.success?[
                    this.has2FA=true,
                    this.serviceData.update({has2FA:true})
                  ]:this.check2Fa()
                })

              }, error =>{
                this.isLoadingContent=false
                if (error.statusText === "Unauthorized") {this.authService.logout()}else{
                  let dialogRef=this.dialog.open(SimpleDialogComponent,{
                    data:{message:"Unable to process request, please try again",header:'Request timeout!', color:'red'}
                  });

                }
              });
            }else{
              this.check2Fa()
            }
          }else{
            this.forceClose2fa=true
          }
        }else{this.check2Fa()}
      })
      return false
    }else{return true}
  }

  walletAddress: string = ''; // Example Bitcoin address
  amount: number = 0.005;
  copied: boolean = false;

  copyAddress(item=this.walletAddress,dialog=false) {
    navigator.clipboard.writeText(item).then(() => {
      dialog?[this.dialog.open(SimpleDialogComponent,{
        data:{message: item+' successfully copied',header:'Success',color:'green'},
      })]:this.copied = true;
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
    try {
      this.paginator.page?.subscribe(() => this.updatePagedTransactions());

    } catch (error) {
      console.log('error>>', error);
    }
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

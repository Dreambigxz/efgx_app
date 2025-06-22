import { Component, inject, OnInit,ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from "../api/api.service";
import { AuthService } from "../auth/auth.service";
import { DataService } from "../user/data.service";

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { RouterLink, ActivatedRoute, Router} from '@angular/router';


@Component({
  selector: 'app-teams',
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    RouterLink
  ],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.css'
})

export class TeamsComponent {

  constructor(
    // private route: ActivatedRoute,
    private router: Router,
    // public dialog: MatDialog,
    // private otp: OtpComponent
  ) {}

  current = 'teams';

  serviceData = inject(DataService)
  apiService = inject(ApiService)
  authService = inject(AuthService)

  AllData=this.serviceData.userData;

  directory!:string

  loading=false
  isLoadingContent = false
  history = window.history

  wallet = (this.serviceData.userData as any).wallet
  initCurrency = (this.serviceData.userData as any).init_currency
  teamsDir = (this.serviceData.userData as any).teams_dir

  teamLevels: any[]=[]
  copied = false
  inviteCode = window.location.host+'/register?invited_by='+this.teamsDir?.invite_url

  copyContent() {
    navigator.clipboard.writeText(this.inviteCode).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 3000);
    });
  }

  updateResponse(response:any){
    this.isLoadingContent = false
    this.initCurrency = response.init_currency
    this.wallet = response.wallet
    this.serviceData.update(response)
    this.teamsDir=response.teams_dir
    this.inviteCode = window.location.host+'/register?invited_by='+this.teamsDir?.invite_url
  }

  ngOnInit(): void {
    if (!this.teamsDir) {
      this.isLoadingContent = true
      this.apiService.tokenData('teams/get_data?type=teams', this.authService.tokenKey,'get', {}).subscribe({
        next: (response) =>{
          this.isLoadingContent = false
          this.serviceData.update(response)
          this.teamsDir = (this.serviceData.userData as any).teams_dir
          this.setLevelCard()
          this.updateResponse(response)
        },
        error: (err) => {if (err.statusText === "Unauthorized") {this.authService.logout(true)}}
      });
    }else{
      this.updateResponse(this.serviceData.userData)
      this.setLevelCard()
    }
  }

  findData(data:any,type:any,action:any){
    let result = 0
    if (data&&Object.keys(data).includes(type)) {
      result =data[type][action]
    }
    return result
  }

  setLevelCard(){
    let leveNum  = [ 5,2,1]
    for (let i = 0; i < leveNum.length; i++) {
      let level = i+1
      let generationData = this.teamsDir.generation_track[level]
      this.teamLevels.push(
        {
          'users':this.findData(generationData,'registered','count'),
          // user:0,
          'active':this.findData(generationData,'active_user','count'),
          total_deposit:this.findData(generationData,'gen_deposit','amount'),
          total_withdraw:this.findData(generationData,'gen_withdraw','amount'),
          income:this.findData(generationData,'commission','amount'),
          level:level,
          percentage:leveNum[i]
        }
      )
    }
  }

  openLevelDetails(level:any){
    this.router.navigate(['/team-detail',level]);
  }

  onScroll(event: any) {
    const element = event.target;

    // console.log({clientHeight:element.clientHeight,'scrollTop':element.scrollTop,'scrollHeight':element.scrollHeight});

    const scrollLeft = element.scrollHeight - element.scrollTop
     // - element.clientHeight;
     const isAtBottom = Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 1;
     const isAtBottom2 = Math.ceil(element.scrollTop) >= element.scrollHeight - element.clientHeight;


     console.log({isAtBottom,isAtBottom2});

    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      console.log('ENDOF PAGE');
      console.log({scrollLeft});


    }else{
      console.log('PAGE NOT EDED');

    }
  }


}

import { Component, inject, OnInit,ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from "../../api/api.service";
import { AuthService } from "../../auth/auth.service";
import { DataService } from "../../user/data.service";

import { RouterLink, ActivatedRoute, Router} from '@angular/router';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { PageEvent, MatPaginator } from '@angular/material/paginator';


@Component({
  selector: 'app-team-details',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './team-details.component.html',
  styleUrl: './team-details.component.css'
})

export class TeamDetailsComponent implements OnInit{

  constructor(
    private route: ActivatedRoute,
    // private router: Router,
    // public dialog: MatDialog,
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

  wallet = (this.serviceData.userData as any).wallet
  initCurrency = (this.serviceData.userData as any).init_currency
  teamsDir = (this.serviceData.userData as any).teams_dir

  // team1

  updateResponse(response:any){
    this.isLoadingContent = false
    this.initCurrency = response.init_currency
    this.wallet = response.wallet
    this.serviceData.update(response)
    this.teamsDir=response.teams_dir
    this.users = this.teamsDir['a_level'+this.directory]

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const action = params.get('level');
      this.directory=`${action}`
        if (!this.teamsDir) {
          this.isLoadingContent = true
          this.apiService.tokenData('teams/get_data?type=teams', this.authService.tokenKey,'get', {}).subscribe({
            next: (response) =>{
              this.isLoadingContent = false
              this.serviceData.update(response)
              this.teamsDir = (this.serviceData.userData as any).teams_dir
              this.updateResponse(response)
            },
            error: (err) => {
              if (err.statusText === "Unauthorized") {this.authService.logout(true)}
            }
          });
        }else{this.updateResponse(this.serviceData.userData)}

    })
  }

  users : any[] = []

  pageSize = 1;
  currentPage = 1;

  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.users.length / this.pageSize);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

}

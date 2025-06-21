import { Component, inject, OnInit,ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from "../api/api.service";
import { AuthService } from "../auth/auth.service";
import { DataService } from "../user/data.service";

@Component({
  selector: 'app-team1',
  imports: [],
  templateUrl: './team1.component.html',
  styleUrl: './team1.component.css'
})

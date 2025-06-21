import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import {inject} from '@angular/core';
import { DataService } from "../user/data.service";


@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent {

  serviceData = inject(DataService)

  AllData = this.serviceData.update({'now':new Date()})

}

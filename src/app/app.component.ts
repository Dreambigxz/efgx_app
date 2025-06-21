import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import {CommonModule} from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http'; // ✅ Import this



@Component({
  selector: 'app-root',
  standalone:true,
 imports: [ RouterOutlet, RouterLink, HttpClientModule],
   templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'EFGX - Investment App';

}

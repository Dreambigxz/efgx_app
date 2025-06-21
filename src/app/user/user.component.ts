import { Component } from '@angular/core';
import {RouterOutlet } from '@angular/router';
import {inject} from '@angular/core';

@Component({
  selector: 'app-user',
  imports: [ RouterOutlet ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})

export class UserComponent {

  // username : 'hello'
}

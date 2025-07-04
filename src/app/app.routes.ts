import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AppComponent } from './app.component';
import { UserComponent } from './user/user.component';
import {LoginComponent} from './authentication/login.component'
import {RegisterComponent} from './authentication/register.component'
import {ForgotPasswordComponent} from './authentication/forgot-password/forgot-password.component'
import { MainComponent } from "./main/main.component";
import { TaskComponent } from "./task/task.component";
import { TaskDetailComponent } from "./task/detail/detail.component";
import { WalletComponent } from "./wallet/wallet.component";
import { TeamsComponent } from "./teams/teams.component";
import { TeamDetailsComponent } from "./teams/team-details/team-details.component";
import { ProfileComponent } from "./profile/profile.component";
import { NotificationPageComponent } from "./notification-page/notification-page.component";
import { AboutComponent } from "./about/about.component";
import { PaymentConfirmationComponent } from "./payment-confirmation/payment-confirmation.component";

import {authGuard} from './auth/auth.guard'

export const routes: Routes = [

  {
    path: '',
    component: HomeComponent,
    title: 'EFGX',

  },

  {
    path: 'main',
    component: MainComponent,
    title: 'Dashboard',
    canActivate: [authGuard],

  },

  {
    component: TaskComponent,
    title: 'Task',
    canActivate: [authGuard],
    path: 'task/:action',

  },
  {
    component: TaskDetailComponent,
    title: 'Task Details',
    canActivate: [authGuard],
    path: 'task-detail/:id',

  },

  {
    component: WalletComponent,
    title: 'wallet',
    canActivate: [authGuard],
    path: 'wallet/:action',

  },

  {
    component: TeamsComponent,
    title: 'Teams',
    canActivate: [authGuard],
    path: 'teams',

  },

  {
    component: TeamDetailsComponent,
    title: 'Team-Details',
    canActivate: [authGuard],
    path: 'team-detail/:level',

  },

  {
    component: ProfileComponent,
    title: 'Profile',
    canActivate: [authGuard],
    path: 'profile',

  },

  {
    component: NotificationPageComponent,
    title: 'Notifications',
    canActivate: [authGuard],
    path: 'notification',

  },

  {
      component: AboutComponent,
      title: 'About us',
      // canActivate: [authGuard],
      path: 'about',

    },

  {
      component: PaymentConfirmationComponent,
      title: 'CONFIRMATION',
      canActivate: [authGuard],
      path: 'confirmation',

    },

  { path:"login",  component: LoginComponent, title:'Authentication'},
  { path:"register",  component: RegisterComponent, title:'Authentication'},
  { path:"forgot-password",  component: ForgotPasswordComponent,title:'Authentication'},

  {
    path: '**',
    // component: AppComponent,
    // title: 'App',
    redirectTo:'',
    pathMatch:'full'

  },
];

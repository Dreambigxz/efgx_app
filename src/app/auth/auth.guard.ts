import { CanActivateFn } from '@angular/router';
import {inject} from '@angular/core';

import {AuthService} from './auth.service';
import { Router } from '@angular/router';


export const authGuard: CanActivateFn = (route, state) => {

  // console.log({route, state});

  const authService = inject(AuthService);
  const router = inject(Router);

  localStorage['redirectUrl'] = state.url

  if (authService.chekLogin()) {
    return true;
  }

  // Redirect to the login page
  return router.parseUrl('/login');

};

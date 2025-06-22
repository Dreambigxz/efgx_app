import { CanActivateFn } from '@angular/router';

export const googleAuthGuard: CanActivateFn = (route, state) => {
  return true;
};

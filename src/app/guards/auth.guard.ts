import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('accessToken');
  const expires = localStorage.getItem('tokenExpiresAt');

  const now = new Date().getTime();

  if (token && expires && now < Number(expires)) {

    return true;
  } else {

    localStorage.clear();
    router.navigate(['/login']);
    return false;
  }
};

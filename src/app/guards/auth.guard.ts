import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('accessToken');
  const expires = localStorage.getItem('tokenExpiresAt');
  const roleId = Number(localStorage.getItem('roleId'));

  const now = new Date().getTime();


  if (!token || !expires || now >= Number(expires)) {
    localStorage.clear();
    router.navigate(['/login']);
    return false;
  }

  const allowedRoles = route.data?.['roles'] as number[] | undefined;

  if (allowedRoles && !allowedRoles.includes(roleId)) {
    router.navigate(['/']); 
    return false;
  }

  return true;
};

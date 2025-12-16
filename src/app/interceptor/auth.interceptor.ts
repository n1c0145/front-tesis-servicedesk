import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const token = localStorage.getItem('accessToken');
  const expires = localStorage.getItem('tokenExpiresAt');
  const now = new Date().getTime();

  if (token && expires && now >= Number(expires)) {
    localStorage.clear();
    router.navigate(['/login']);
    return next(req);
  }

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};

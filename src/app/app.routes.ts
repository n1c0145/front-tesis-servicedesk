import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HeaderComponent } from './layout/header/header.component';
import { HomeComponent } from "./main/home/home.component";
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
    {
    path: 'register',
    component: RegisterComponent
  },

    {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: '',
    component: HeaderComponent,
    children: [
      { path: 'home', component: HomeComponent,  canActivate: [authGuard] },
    ]
  }
];
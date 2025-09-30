import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HeaderComponent } from './layout/header/header.component';
import { HomeComponent } from "./main/home/home.component";

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: HeaderComponent,
    children: [
      { path: 'home', component: HomeComponent },

    ]
  }
];
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HeaderComponent } from './layout/header/header.component';
import { HomeComponent } from "./main/home/home.component";
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { authGuard } from './guards/auth.guard';
import { ProfileComponent } from './main/profiles/profile/profile.component';
import { UpdatePasswordComponent } from './auth/update-password/update-password.component';
import { UsersListComponent } from './main/profiles/users-list/users-list.component';
import { ManageProfileComponent } from './main/profiles/manage-profile/manage-profile.component';
import { ProjectsListComponent } from './main/projects/projects-list/projects-list.component';
import { NewProjectComponent } from './main/projects/new-project/new-project.component';
import { UpdateProjectComponent } from './main/projects/update-project/update-project.component';

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
      { path: 'home', component: HomeComponent, canActivate: [authGuard] },
      { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
      { path: 'update-password', component: UpdatePasswordComponent, canActivate: [authGuard] },
      { path: 'users-list', component: UsersListComponent, canActivate: [authGuard] },
      { path: 'manage-profile/:id', component: ManageProfileComponent, canActivate: [authGuard] },
      { path: 'projects-list', component: ProjectsListComponent, canActivate: [authGuard] },
      { path: 'new-project', component: NewProjectComponent, canActivate: [authGuard] },
      { path: 'update-project/:id', component: UpdateProjectComponent, canActivate: [authGuard] },
    ]
  }
];
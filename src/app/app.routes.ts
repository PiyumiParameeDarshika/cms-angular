import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'complaints', loadComponent: () => import('./features/complaints/list/complaints-list.component').then(m => m.ComplaintsListComponent) },
      { path: 'complaints/new', canActivate: [roleGuard], data: { roles: ['Admin','Supervisor','Agent'] },
        loadComponent: () => import('./features/complaints/form/complaint-form.component').then(m => m.ComplaintFormComponent) },
      { path: 'complaints/:id', loadComponent: () => import('./features/complaints/detail/complaint-detail.component').then(m => m.ComplaintDetailComponent) },
      { path: 'clients', loadComponent: () => import('./features/clients/list/clients-list.component').then(m => m.ClientsListComponent) },
      { path: 'clients/new', canActivate: [roleGuard], data: { roles: ['Admin','Supervisor'] },
        loadComponent: () => import('./features/clients/form/client-form.component').then(m => m.ClientFormComponent) },
      { path: 'clients/:id', loadComponent: () => import('./features/clients/detail/client-detail.component').then(m => m.ClientDetailComponent) },
      { path: 'users', canActivate: [roleGuard], data: { roles: ['Admin'] },
        loadComponent: () => import('./features/users/list/users-list.component').then(m => m.UsersListComponent) },
      { path: 'users/new', canActivate: [roleGuard], data: { roles: ['Admin'] },
        loadComponent: () => import('./features/users/form/user-form.component').then(m => m.UserFormComponent) },
      { path: 'cases/:id', loadComponent: () => import('./features/cases/cases.component').then(m => m.CasesComponent) },
      { path: 'categories', canActivate: [roleGuard], data: { roles: ['Admin','Supervisor'] },
        loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'reports', canActivate: [roleGuard], data: { roles: ['Admin','Supervisor'] },
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) },
      { path: 'profile', loadComponent: () => import('./features/users/profile/profile.component').then(m => m.ProfileComponent) },
    ]
  },
  { path: 'unauthorized', loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent) },
  { path: '**', redirectTo: '/dashboard' }
];

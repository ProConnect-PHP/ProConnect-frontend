import { Routes } from '@angular/router';

import { AdminActivityLogsPageComponent } from './pages/admin-activity-logs-page/admin-activity-logs-page.component';
import { AdminDashboardPageComponent } from './pages/admin-dashboard-page/admin-dashboard-page.component';
import { AdminLayoutPageComponent } from './pages/admin-layout-page/admin-layout-page.component';
import { AdminUserDetailPageComponent } from './pages/admin-user-detail-page/admin-user-detail-page.component';
import { AdminUsersPageComponent } from './pages/admin-users-page/admin-users-page.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutPageComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Panel administrativo | ProConnect',
        component: AdminDashboardPageComponent,
      },
      {
        path: 'users',
        title: 'Usuarios | Admin ProConnect',
        component: AdminUsersPageComponent,
      },
      {
        path: 'users/:id',
        title: 'Detalle de usuario | Admin ProConnect',
        component: AdminUserDetailPageComponent,
      },
      {
        path: 'activity-logs',
        title: 'Activity Logs | Admin ProConnect',
        component: AdminActivityLogsPageComponent,
      },
    ],
  },
];

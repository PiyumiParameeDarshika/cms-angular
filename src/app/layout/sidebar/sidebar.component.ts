import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { AuthService } from '@core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, NgIf, NgFor],
  template: `
    <aside class="cms-sidebar" [class.collapsed]="collapsed">
      <div class="sidebar-brand">
        <div class="brand-icon"><i class="bi bi-shield-check"></i></div>
        <span class="brand-text" *ngIf="!collapsed">CMS Portal</span>
      </div>

      <nav class="sidebar-nav">
        <ng-container *ngFor="let item of visibleItems">
          <a class="nav-item" [routerLink]="item.route" routerLinkActive="active"
             [routerLinkActiveOptions]="{exact: item.route === '/dashboard'}"
             [title]="collapsed ? item.label : ''">
            <i class="bi" [ngClass]="'bi-' + item.icon"></i>
            <span *ngIf="!collapsed">{{ item.label }}</span>
          </a>
        </ng-container>
      </nav>

      <div class="sidebar-footer">
        <a class="nav-item" routerLink="/profile" routerLinkActive="active" [title]="collapsed ? 'Profile' : ''">
          <i class="bi bi-person-circle"></i>
          <span *ngIf="!collapsed">My Profile</span>
        </a>
        <button class="nav-item btn-logout" (click)="auth.logout()" [title]="collapsed ? 'Logout' : ''">
          <i class="bi bi-box-arrow-right"></i>
          <span *ngIf="!collapsed">Logout</span>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  auth = inject(AuthService);

  private navItems: NavItem[] = [
    { label: 'Dashboard',   icon: 'grid-1x2-fill',    route: '/dashboard' },
    { label: 'Complaints',  icon: 'chat-left-text-fill', route: '/complaints' },
    { label: 'Clients',     icon: 'building-fill',    route: '/clients' },
    { label: 'Cases',       icon: 'folder2-open',     route: '/cases' },
    { label: 'Users',       icon: 'people-fill',      route: '/users',      roles: ['Admin'] },
    { label: 'Categories',  icon: 'tags-fill',        route: '/categories', roles: ['Admin', 'Supervisor'] },
    { label: 'Reports',     icon: 'bar-chart-fill',   route: '/reports',    roles: ['Admin', 'Supervisor'] },
  ];

  get visibleItems(): NavItem[] {
    return this.navItems.filter(item =>
      !item.roles || this.auth.hasRole(...item.roles)
    );
  }
}

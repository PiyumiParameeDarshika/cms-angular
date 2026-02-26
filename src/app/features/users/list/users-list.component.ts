import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '@core/services/user.service';
import { User, UserSearchRequest } from '@core/models/user.model';
import { PagedResult } from '@core/models/api-response.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, DatePipe, FormsModule],
  template: `
    <div class="page-header">
      <div><h2 class="page-title">Users</h2><p class="page-sub">Manage system users</p></div>
      <a routerLink="/users/new" class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i> New User</a>
    </div>
    <div class="card cms-card mb-3">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-md-4"><input type="text" class="form-control form-control-sm" placeholder="Search by name or email..." [(ngModel)]="req.keyword" (keyup.enter)="load()"></div>
          <div class="col-md-3">
            <select class="form-select form-select-sm" [(ngModel)]="req.role">
              <option value="">All Roles</option><option>Admin</option><option>Supervisor</option><option>Agent</option><option>Client</option>
            </select>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary btn-sm" (click)="load()"><i class="bi bi-search me-1"></i>Filter</button>
            <button class="btn btn-outline-secondary btn-sm ms-1" (click)="clearFilters()">Clear</button>
          </div>
        </div>
      </div>
    </div>
    <div class="card cms-card">
      <div class="card-body p-0">
        <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
        <div class="table-responsive" *ngIf="!loading()">
          <table class="table table-hover cms-table mb-0">
            <thead><tr><th>Name</th><th>Email</th><th>Username</th><th>Role</th><th>Status</th><th>Last Login</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let u of result()?.items">
                <td class="fw-medium">{{ u.name }}</td>
                <td class="text-muted">{{ u.email }}</td>
                <td><code>{{ u.username }}</code></td>
                <td><span class="badge" [class]="getRoleClass(u.role)">{{ u.role }}</span></td>
                <td><span class="badge" [class]="u.isActive ? 'bg-success' : 'bg-secondary'">{{ u.isActive ? 'Active' : 'Inactive' }}</span></td>
                <td class="small text-muted">{{ u.lastLoginDateTime ? (u.lastLoginDateTime | date:'MMM d, y') : 'Never' }}</td>
                <td><button class="btn btn-sm btn-outline-danger" (click)="delete(u.id)"><i class="bi bi-trash"></i></button></td>
              </tr>
              <tr *ngIf="!result()?.items?.length">
                <td colspan="7" class="text-center py-4 text-muted"><i class="bi bi-people fs-3 d-block mb-2"></i>No users found</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="d-flex justify-content-between align-items-center px-3 py-2 border-top" *ngIf="result()">
          <small class="text-muted">{{ result()!.totalCount }} users</small>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" [disabled]="req.page === 1" (click)="changePage(-1)"><i class="bi bi-chevron-left"></i></button>
            <button class="btn btn-outline-secondary" [disabled]="req.page! >= result()!.totalPages" (click)="changePage(1)"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UsersListComponent implements OnInit {
  private svc = inject(UserService);
  result = signal<PagedResult<User> | null>(null);
  loading = signal(true);
  req: UserSearchRequest = { page: 1, pageSize: 15 };
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); this.svc.search(this.req).subscribe({ next: r => { if (r.isSuccess) this.result.set(r.data); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  clearFilters(): void { this.req = { page: 1, pageSize: 15 }; this.load(); }
  changePage(delta: number): void { this.req.page = (this.req.page ?? 1) + delta; this.load(); }
  delete(id: number): void { if (!confirm('Deactivate this user?')) return; this.svc.delete(id).subscribe(() => this.load()); }
  getRoleClass(r: string): string { return { Admin: 'bg-danger', Supervisor: 'bg-warning text-dark', Agent: 'bg-primary', Client: 'bg-info text-dark' }[r] ?? 'bg-secondary'; }
}

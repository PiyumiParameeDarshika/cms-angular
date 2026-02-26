import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from '@core/services/complaint.service';
import { AuthService } from '@core/services/auth.service';
import { Complaint, ComplaintSearchRequest } from '@core/models/complaint.model';
import { PagedResult } from '@core/models/api-response.model';

@Component({
  selector: 'app-complaints-list',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, DatePipe, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Complaints</h2>
        <p class="page-sub">Manage and track all complaints</p>
      </div>
      <a routerLink="/complaints/new" class="btn btn-primary"
         *ngIf="auth.hasRole('Admin','Supervisor','Agent')">
        <i class="bi bi-plus-lg me-1"></i> New Complaint
      </a>
    </div>

    <!-- Filters -->
    <div class="card cms-card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-4">
            <input type="text" class="form-control form-control-sm" placeholder="Search subject, number, client..."
                   [(ngModel)]="req.q" (keyup.enter)="load()">
          </div>
          <div class="col-md-2">
            <select class="form-select form-select-sm" [(ngModel)]="req.priority">
              <option value="">All Priorities</option>
              <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select form-select-sm" [(ngModel)]="req.statusId">
              <option [value]="undefined">All Statuses</option>
              <option [value]="1">New</option><option [value]="2">Assigned</option>
              <option [value]="3">InProgress</option><option [value]="5">Escalated</option>
              <option [value]="6">Resolved</option><option [value]="7">Closed</option>
            </select>
          </div>
          <div class="col-md-auto">
            <button class="btn btn-primary btn-sm" (click)="load()">
              <i class="bi bi-search me-1"></i> Filter
            </button>
            <button class="btn btn-outline-secondary btn-sm ms-1" (click)="clearFilters()">
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card cms-card">
      <div class="card-body p-0">
        <div *ngIf="loading()" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <div class="table-responsive" *ngIf="!loading()">
          <table class="table table-hover cms-table mb-0">
            <thead>
              <tr>
                <th>Number</th><th>Subject</th><th>Client</th>
                <th>Priority</th><th>Status</th><th>SLA</th>
                <th>Assigned To</th><th>Created</th><th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of result()?.items">
                <td><code class="text-primary">{{ c.complaintNumber }}</code></td>
                <td>
                  <a [routerLink]="['/complaints', c.id]" class="fw-medium text-decoration-none">
                    {{ c.subject | slice:0:40 }}{{ c.subject.length > 40 ? '...' : '' }}
                  </a>
                </td>
                <td>{{ c.clientName || '—' }}</td>
                <td><span class="badge" [class]="getPriorityClass(c.priority)">{{ c.priority }}</span></td>
                <td><span class="badge" [class]="getStatusClass(c.complaintStatusName)">{{ c.complaintStatusName }}</span></td>
                <td><span class="badge" [class]="getSlaClass(c.slaStatus)">{{ c.slaStatus }}</span></td>
                <td>{{ c.assignedToUserName || '—' }}</td>
                <td class="text-muted small">{{ c.createdDateTime | date:'MMM d, y' }}</td>
                <td>
                  <a [routerLink]="['/complaints', c.id]" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-eye"></i>
                  </a>
                </td>
              </tr>
              <tr *ngIf="!result()?.items?.length">
                <td colspan="9" class="text-center py-4 text-muted">
                  <i class="bi bi-inbox fs-3 d-block mb-2"></i>No complaints found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center px-3 py-2 border-top" *ngIf="result()">
          <small class="text-muted">
            Showing {{ (req.page! - 1) * req.pageSize! + 1 }}–{{ Math.min(req.page! * req.pageSize!, result()!.totalCount) }}
            of {{ result()!.totalCount }}
          </small>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" [disabled]="req.page === 1" (click)="changePage(-1)">
              <i class="bi bi-chevron-left"></i>
            </button>
            <button class="btn btn-outline-secondary" [disabled]="req.page! >= result()!.totalPages" (click)="changePage(1)">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ComplaintsListComponent implements OnInit {
  private svc = inject(ComplaintService);
  auth = inject(AuthService);
  Math = Math;

  result = signal<PagedResult<Complaint> | null>(null);
  loading = signal(true);
  req: ComplaintSearchRequest = { page: 1, pageSize: 15 };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.search(this.req).subscribe({
      next: res => { if (res.isSuccess) this.result.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  clearFilters(): void {
    this.req = { page: 1, pageSize: 15 };
    this.load();
  }

  changePage(delta: number): void {
    this.req.page = (this.req.page ?? 1) + delta;
    this.load();
  }

  getPriorityClass(p: string): string {
    return { Critical: 'bg-danger', High: 'bg-warning text-dark', Medium: 'bg-info text-dark', Low: 'bg-success' }[p] ?? 'bg-secondary';
  }

  getStatusClass(s: string): string {
    return { New: 'badge-status-new', Assigned: 'badge-status-assigned', InProgress: 'badge-status-inprogress',
             Escalated: 'badge-status-escalated', Resolved: 'badge-status-resolved', Closed: 'badge-status-closed' }[s] ?? 'bg-secondary';
  }

  getSlaClass(s: string): string {
    return { WithinSLA: 'bg-success', AtRisk: 'bg-warning text-dark', Breached: 'bg-danger' }[s] ?? 'bg-secondary';
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIf, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '@core/services/report.service';
import { ReportFilterRequest } from '@core/models/report.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [NgIf, JsonPipe, FormsModule],
  template: `
    <div class="page-header">
      <div><h2 class="page-title">Reports</h2><p class="page-sub">Complaint analytics and summaries</p></div>
      <button class="btn btn-primary" (click)="load()"><i class="bi bi-arrow-clockwise me-1"></i> Refresh</button>
    </div>

    <!-- Filters -->
    <div class="card cms-card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <label class="form-label small fw-medium mb-1">From Date</label>
            <input type="date" class="form-control form-control-sm" [(ngModel)]="filter.from">
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-medium mb-1">To Date</label>
            <input type="date" class="form-control form-control-sm" [(ngModel)]="filter.to">
          </div>
          <div class="col-auto">
            <button class="btn btn-primary btn-sm" (click)="load()"><i class="bi bi-funnel me-1"></i>Apply</button>
            <button class="btn btn-outline-secondary btn-sm ms-1" (click)="filter={}; load()">Clear</button>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

    <div class="card cms-card" *ngIf="summary() && !loading()">
      <div class="card-header"><h6 class="card-title mb-0">Complaint Summary</h6></div>
      <div class="card-body">
        <p class="text-muted">Summary data loaded from API. Connect chart.js for visual graphs.</p>
        <pre class="bg-light p-3 rounded small">{{ summary() | json }}</pre>
      </div>
    </div>

    <div class="alert alert-info mt-3" *ngIf="!loading() && !summary()">
      <i class="bi bi-info-circle me-2"></i>No summary data available for the selected period.
    </div>
  `
})
export class ReportsComponent implements OnInit {
  private svc = inject(ReportService);
  summary = signal<object | null>(null);
  loading = signal(false);
  filter: ReportFilterRequest = {};
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading.set(true);
    this.svc.getComplaintSummary(this.filter).subscribe({ next: r => { if (r.isSuccess) this.summary.set(r.data); this.loading.set(false); }, error: () => this.loading.set(false) });
  }
}

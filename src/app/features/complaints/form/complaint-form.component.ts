import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ComplaintService } from '@core/services/complaint.service';
import { ClientService } from '@core/services/client.service';
import { CategoryService } from '@core/services/category.service';
import { Category } from '@core/models/category.model';
import { Client } from '@core/models/client.model';

@Component({
  selector: 'app-complaint-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">New Complaint</h2>
        <p class="page-sub">Log a new customer complaint</p>
      </div>
    </div>

    <div class="card cms-card" style="max-width: 800px">
      <div class="card-body">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <!-- Client -->
            <div class="col-md-6">
              <label class="form-label fw-medium">Client</label>
              <select class="form-select" formControlName="clientId">
                <option [value]="null">— Walk-in / Anonymous —</option>
                <option *ngFor="let c of clients()" [value]="c.id">{{ c.companyName }}</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium">Channel <span class="text-danger">*</span></label>
              <select class="form-select" formControlName="complaintChannelId">
                <option [value]="1">Phone</option><option [value]="2">Email</option>
                <option [value]="3">Portal</option><option [value]="4">Walk-In</option>
              </select>
            </div>

            <!-- Category -->
            <div class="col-md-6">
              <label class="form-label fw-medium">Category <span class="text-danger">*</span></label>
              <select class="form-select" formControlName="complaintCategoryId">
                <option value="">Select category...</option>
                <option *ngFor="let c of categories()" [value]="c.id">{{ c.name }}</option>
              </select>
              <div class="form-error" *ngIf="f['complaintCategoryId'].touched && f['complaintCategoryId'].invalid">Required.</div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium">Priority <span class="text-danger">*</span></label>
              <select class="form-select" formControlName="priority">
                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
              </select>
            </div>

            <!-- Subject -->
            <div class="col-12">
              <label class="form-label fw-medium">Subject <span class="text-danger">*</span></label>
              <input type="text" class="form-control" formControlName="subject"
                     placeholder="Brief description of the complaint">
              <div class="form-error" *ngIf="f['subject'].touched && f['subject'].invalid">Required.</div>
            </div>

            <!-- Description -->
            <div class="col-12">
              <label class="form-label fw-medium">Description <span class="text-danger">*</span></label>
              <textarea class="form-control" formControlName="description" rows="5"
                        placeholder="Detailed description of the issue..."></textarea>
              <div class="form-error" *ngIf="f['description'].touched && f['description'].invalid">Required.</div>
            </div>

            <!-- Walk-in fields -->
            <ng-container *ngIf="!form.value.clientId">
              <div class="col-md-6">
                <label class="form-label fw-medium">Client Name</label>
                <input type="text" class="form-control" formControlName="clientName" placeholder="Walk-in customer name">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-medium">Client Email</label>
                <input type="email" class="form-control" formControlName="clientEmail">
              </div>
            </ng-container>

            <div class="col-12">
              <div class="alert alert-danger py-2" *ngIf="errorMsg">{{ errorMsg }}</div>
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary" [disabled]="loading()">
                  <span *ngIf="loading()" class="spinner-border spinner-border-sm me-1"></span>
                  Submit Complaint
                </button>
                <button type="button" class="btn btn-outline-secondary" (click)="router.navigate(['/complaints'])">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ComplaintFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ComplaintService);
  private clientSvc = inject(ClientService);
  private catSvc = inject(CategoryService);
  router = inject(Router);

  clients = signal<Client[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(false);
  errorMsg = '';

  form = this.fb.group({
    clientId: [null as number | null],
    clientName: [''],
    clientEmail: [''],
    clientMobile: [''],
    complaintChannelId: [1, Validators.required],
    complaintCategoryId: ['', Validators.required],
    subCategoryId: [null as number | null],
    subject: ['', [Validators.required, Validators.maxLength(300)]],
    description: ['', Validators.required],
    priority: ['Medium', Validators.required]
  });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.clientSvc.search({ pageSize: 100 }).subscribe(r => { if (r.isSuccess) this.clients.set(r.data.items); });
    this.catSvc.getAll().subscribe(r => { if (r.isSuccess) this.categories.set(r.data); });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg = '';
    this.svc.create(this.form.value as any).subscribe({
      next: res => {
        if (res.isSuccess) this.router.navigate(['/complaints', res.data.id]);
        else { this.errorMsg = res.message; this.loading.set(false); }
      },
      error: err => { this.errorMsg = err.error?.message || 'Error submitting complaint.'; this.loading.set(false); }
    });
  }
}

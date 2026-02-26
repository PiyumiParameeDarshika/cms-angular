import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="page-header"><div><h2 class="page-title">New User</h2><p class="page-sub">Create a system user account</p></div></div>
    <div class="card cms-card" style="max-width:650px">
      <div class="card-body">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-12"><label class="form-label fw-medium">Full Name <span class="text-danger">*</span></label><input type="text" class="form-control" formControlName="name"><div class="form-error" *ngIf="f['name'].touched && f['name'].invalid">Required.</div></div>
            <div class="col-md-6"><label class="form-label fw-medium">Email <span class="text-danger">*</span></label><input type="email" class="form-control" formControlName="email"><div class="form-error" *ngIf="f['email'].touched && f['email'].invalid">Valid email required.</div></div>
            <div class="col-md-6"><label class="form-label fw-medium">Username <span class="text-danger">*</span></label><input type="text" class="form-control" formControlName="username"><div class="form-error" *ngIf="f['username'].touched && f['username'].invalid">Required.</div></div>
            <div class="col-md-6"><label class="form-label fw-medium">Phone</label><input type="text" class="form-control" formControlName="phoneNumber"></div>
            <div class="col-md-6"><label class="form-label fw-medium">Role <span class="text-danger">*</span></label><select class="form-select" formControlName="role"><option>Admin</option><option>Supervisor</option><option>Agent</option><option>Client</option></select></div>
            <div class="col-12"><label class="form-label fw-medium">Password <span class="text-danger">*</span></label><input type="password" class="form-control" formControlName="password"><div class="form-error" *ngIf="f['password'].touched && f['password'].invalid">Min 8 characters.</div></div>
            <div class="col-12">
              <div class="alert alert-danger py-2" *ngIf="errorMsg">{{ errorMsg }}</div>
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary" [disabled]="loading"><span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>Create User</button>
                <button type="button" class="btn btn-outline-secondary" (click)="router.navigate(['/users'])">Cancel</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class UserFormComponent {
  private fb = inject(FormBuilder);
  private svc = inject(UserService);
  router = inject(Router);
  loading = false;
  errorMsg = '';
  form = this.fb.group({
    name: ['', Validators.required], email: ['', [Validators.required, Validators.email]],
    username: ['', Validators.required], phoneNumber: [''],
    role: ['Agent', Validators.required], password: ['', [Validators.required, Validators.minLength(8)]]
  });
  get f() { return this.form.controls; }
  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.svc.create(this.form.value as any).subscribe({
      next: res => { if (res.isSuccess) this.router.navigate(['/users']); else { this.errorMsg = res.message; this.loading = false; } },
      error: err => { this.errorMsg = err.error?.message || 'Error.'; this.loading = false; }
    });
  }
}

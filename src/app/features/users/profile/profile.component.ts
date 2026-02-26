import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="page-header"><div><h2 class="page-title">My Profile</h2><p class="page-sub">Manage your account</p></div></div>
    <div class="row g-3" style="max-width:700px">
      <div class="col-12">
        <div class="card cms-card">
          <div class="card-header"><h6 class="card-title mb-0">Account Info</h6></div>
          <div class="card-body">
            <ng-container *ngIf="auth.currentUser() as u">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="user-avatar-lg">{{ u.fullName.charAt(0).toUpperCase() }}</div>
                <div>
                  <div class="fw-semibold fs-5">{{ u.fullName }}</div>
                  <div class="text-muted">{{ u.email }}</div>
                  <span class="badge mt-1" [class]="getRoleClass(u.role)">{{ u.role }}</span>
                </div>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
      <div class="col-12">
        <div class="card cms-card">
          <div class="card-header"><h6 class="card-title mb-0">Change Password</h6></div>
          <div class="card-body">
            <form [formGroup]="pwdForm" (ngSubmit)="changePwd()">
              <div class="mb-3"><label class="form-label fw-medium">Current Password</label><input type="password" class="form-control" formControlName="currentPassword"></div>
              <div class="mb-3"><label class="form-label fw-medium">New Password</label><input type="password" class="form-control" formControlName="newPassword"></div>
              <div class="mb-3"><label class="form-label fw-medium">Confirm Password</label><input type="password" class="form-control" formControlName="confirmPassword"></div>
              <div class="alert alert-success py-2" *ngIf="pwdSuccess">Password changed successfully!</div>
              <div class="alert alert-danger py-2" *ngIf="pwdError">{{ pwdError }}</div>
              <button type="submit" class="btn btn-primary">Update Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  private svc = inject(UserService);
  auth = inject(AuthService);
  pwdSuccess = false;
  pwdError = '';
  pwdForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });
  changePwd(): void {
    if (this.pwdForm.invalid) { this.pwdForm.markAllAsTouched(); return; }
    this.svc.changePassword(this.pwdForm.value as any).subscribe({
      next: res => { if (res.isSuccess) { this.pwdSuccess = true; this.pwdForm.reset(); } else this.pwdError = res.message; },
      error: err => { this.pwdError = err.error?.message || 'Error.'; }
    });
  }
  getRoleClass(r: string): string { return { Admin: 'bg-danger', Supervisor: 'bg-warning text-dark', Agent: 'bg-primary', Client: 'bg-info text-dark' }[r] ?? 'bg-secondary'; }
}

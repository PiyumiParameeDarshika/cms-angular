import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ComplaintService } from '@core/services/complaint.service';
import { CaseService } from '@core/services/case.service';
import { AttachmentService } from '@core/services/attachment.service';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { Complaint, ComplaintHistory } from '@core/models/complaint.model';
import { CaseActivity } from '@core/models/case.model';
import { Attachment } from '@core/models/attachment.model';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-complaint-detail',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, ReactiveFormsModule, RouterLink],
  template: `
    <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

    <ng-container *ngIf="complaint() as c">
      <!-- Header -->
      <div class="page-header">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <a routerLink="/complaints" class="text-muted small"><i class="bi bi-arrow-left me-1"></i>Back</a>
          </div>
          <h2 class="page-title mb-1">{{ c.complaintNumber }}</h2>
          <p class="page-sub mb-0">{{ c.subject }}</p>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <span class="badge fs-6" [class]="getPriorityClass(c.priority)">{{ c.priority }}</span>
          <span class="badge fs-6" [class]="getStatusClass(c.complaintStatusName)">{{ c.complaintStatusName }}</span>
        </div>
      </div>

      <div class="row g-3">
        <!-- Left: Details -->
        <div class="col-lg-8">
          <div class="card cms-card mb-3">
            <div class="card-header"><h6 class="card-title mb-0">Complaint Details</h6></div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-sm-6">
                  <label class="detail-label">Client</label>
                  <div class="detail-value">{{ c.clientName || 'Walk-In' }}</div>
                </div>
                <div class="col-sm-6">
                  <label class="detail-label">Channel</label>
                  <div class="detail-value">{{ c.complaintChannelName }}</div>
                </div>
                <div class="col-sm-6">
                  <label class="detail-label">Category</label>
                  <div class="detail-value">{{ c.complaintCategoryName }}</div>
                </div>
                <div class="col-sm-6">
                  <label class="detail-label">Assigned To</label>
                  <div class="detail-value">{{ c.assignedToUserName || '—' }}</div>
                </div>
                <div class="col-sm-6">
                  <label class="detail-label">Due Date</label>
                  <div class="detail-value">{{ c.dueDate ? (c.dueDate | date:'medium') : '—' }}</div>
                </div>
                <div class="col-sm-6">
                  <label class="detail-label">SLA Status</label>
                  <div class="detail-value">
                    <span class="badge" [class]="getSlaClass(c.slaStatus)">{{ c.slaStatus }}</span>
                  </div>
                </div>
                <div class="col-12">
                  <label class="detail-label">Description</label>
                  <div class="detail-value">{{ c.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions for authorised users -->
          <div class="card cms-card mb-3" *ngIf="auth.hasRole('Admin','Supervisor','Agent')">
            <div class="card-header"><h6 class="card-title mb-0">Actions</h6></div>
            <div class="card-body">
              <div class="d-flex flex-wrap gap-2">
                <button class="btn btn-sm btn-outline-primary" (click)="activeAction='assign'"
                        *ngIf="auth.hasRole('Admin','Supervisor')">
                  <i class="bi bi-person-check me-1"></i> Assign
                </button>
                <button class="btn btn-sm btn-outline-warning" (click)="activeAction='escalate'">
                  <i class="bi bi-arrow-up-circle me-1"></i> Escalate
                </button>
                <button class="btn btn-sm btn-outline-success" (click)="activeAction='resolve'">
                  <i class="bi bi-check-circle me-1"></i> Resolve
                </button>
                <button class="btn btn-sm btn-secondary" (click)="close()"
                        *ngIf="auth.hasRole('Admin','Supervisor') && c.isResolved">
                  <i class="bi bi-lock me-1"></i> Close
                </button>
                <button class="btn btn-sm btn-danger" (click)="delete()"
                        *ngIf="auth.hasRole('Admin')">
                  <i class="bi bi-trash me-1"></i> Delete
                </button>
              </div>

              <!-- Assign Form -->
              <ng-container *ngIf="activeAction === 'assign'">
                <hr>
                <form [formGroup]="assignForm" (ngSubmit)="submitAssign(c.id)" class="row g-2">
                  <div class="col-md-5">
                    <select class="form-select form-select-sm" formControlName="assignedToUserId">
                      <option value="">Select agent...</option>
                      <option *ngFor="let a of agents()" [value]="a.id">{{ a.name }}</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <input type="datetime-local" class="form-control form-control-sm" formControlName="dueDate">
                  </div>
                  <div class="col-auto">
                    <button type="submit" class="btn btn-sm btn-primary">Save</button>
                    <button type="button" class="btn btn-sm btn-link" (click)="activeAction=''">Cancel</button>
                  </div>
                </form>
              </ng-container>

              <!-- Resolve Form -->
              <ng-container *ngIf="activeAction === 'resolve'">
                <hr>
                <form [formGroup]="resolveForm" (ngSubmit)="submitResolve(c.id)" class="row g-2">
                  <div class="col-12">
                    <textarea class="form-control form-control-sm" formControlName="resolutionSummary"
                              rows="3" placeholder="Resolution summary..."></textarea>
                  </div>
                  <div class="col-auto">
                    <button type="submit" class="btn btn-sm btn-success">Mark Resolved</button>
                    <button type="button" class="btn btn-sm btn-link" (click)="activeAction=''">Cancel</button>
                  </div>
                </form>
              </ng-container>

              <!-- Escalate Form -->
              <ng-container *ngIf="activeAction === 'escalate'">
                <hr>
                <form [formGroup]="escalateForm" (ngSubmit)="submitEscalate(c.id)" class="row g-2">
                  <div class="col-md-5">
                    <select class="form-select form-select-sm" formControlName="escalatedToUserId">
                      <option value="">Escalate to...</option>
                      <option *ngFor="let a of agents()" [value]="a.id">{{ a.name }}</option>
                    </select>
                  </div>
                  <div class="col-md-5">
                    <input type="text" class="form-control form-control-sm" formControlName="reason"
                           placeholder="Reason for escalation">
                  </div>
                  <div class="col-auto">
                    <button type="submit" class="btn btn-sm btn-warning">Escalate</button>
                    <button type="button" class="btn btn-sm btn-link" (click)="activeAction=''">Cancel</button>
                  </div>
                </form>
              </ng-container>
            </div>
          </div>

          <!-- Attachments -->
          <div class="card cms-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="card-title mb-0">Attachments</h6>
              <label class="btn btn-sm btn-outline-primary mb-0" style="cursor:pointer">
                <i class="bi bi-paperclip me-1"></i> Attach
                <input type="file" hidden (change)="uploadFile($event, c.id)">
              </label>
            </div>
            <div class="card-body">
              <div class="attachment-item" *ngFor="let a of attachments()">
                <i class="bi bi-file-earmark me-2 text-primary"></i>
                <span class="flex-grow-1">{{ a.fileName }}</span>
                <span class="text-muted small me-3">{{ formatBytes(a.fileSizeBytes) }}</span>
                <button class="btn btn-sm btn-link text-danger p-0" (click)="deleteAttachment(c.id, a.id)"
                        *ngIf="auth.hasRole('Admin','Supervisor')">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
              <p class="text-muted small mb-0" *ngIf="!attachments().length">No attachments</p>
            </div>
          </div>
        </div>

        <!-- Right: History & Case Activities -->
        <div class="col-lg-4">
          <div class="card cms-card mb-3">
            <div class="card-header"><h6 class="card-title mb-0">Case Activities</h6></div>
            <div class="card-body p-0">
              <div class="activity-feed">
                <div class="activity-item" *ngFor="let a of activities()">
                  <div class="activity-dot"></div>
                  <div class="activity-body">
                    <div class="activity-type badge bg-light text-dark">{{ a.activityType }}</div>
                    <p class="activity-desc">{{ a.description }}</p>
                    <div class="activity-meta">{{ a.performedByName }} · {{ a.createdDateTime | date:'MMM d, h:mm a' }}</div>
                  </div>
                </div>
              </div>
              <!-- Add activity -->
              <div class="p-3 border-top" *ngIf="auth.hasRole('Admin','Supervisor','Agent')">
                <form [formGroup]="activityForm" (ngSubmit)="addActivity()">
                  <select class="form-select form-select-sm mb-2" formControlName="activityType">
                    <option>Note</option><option>Call</option><option>Email</option><option>StatusChange</option>
                  </select>
                  <textarea class="form-control form-control-sm mb-2" formControlName="description"
                            rows="2" placeholder="Activity description..."></textarea>
                  <button type="submit" class="btn btn-sm btn-primary w-100">Log Activity</button>
                </form>
              </div>
            </div>
          </div>

          <!-- History Timeline -->
          <div class="card cms-card">
            <div class="card-header"><h6 class="card-title mb-0">History</h6></div>
            <div class="card-body p-0">
              <div class="activity-feed">
                <div class="activity-item" *ngFor="let h of history()">
                  <div class="activity-dot activity-dot-sm"></div>
                  <div class="activity-body">
                    <div class="fw-medium small">{{ h.action }}</div>
                    <div class="text-muted small" *ngIf="h.oldStatus && h.newStatus">
                      {{ h.oldStatus }} → {{ h.newStatus }}
                    </div>
                    <div class="activity-meta">{{ h.performedByName }} · {{ h.createdDateTime | date:'MMM d, h:mm a' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
  `
})
export class ComplaintDetailComponent implements OnInit {
  @Input() id!: string;
  private svc = inject(ComplaintService);
  private caseSvc = inject(CaseService);
  private attachSvc = inject(AttachmentService);
  private userSvc = inject(UserService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);

  complaint = signal<Complaint | null>(null);
  history = signal<ComplaintHistory[]>([]);
  activities = signal<CaseActivity[]>([]);
  attachments = signal<Attachment[]>([]);
  agents = signal<User[]>([]);
  loading = signal(true);
  activeAction = '';

  assignForm = this.fb.group({ assignedToUserId: [''], dueDate: [''], note: [''] });
  resolveForm = this.fb.group({ resolutionSummary: ['', Validators.required] });
  escalateForm = this.fb.group({ reason: ['', Validators.required], escalatedToUserId: [''], escalationType: ['Manual'] });
  activityForm = this.fb.group({ activityType: ['Note'], description: ['', Validators.required] });

  ngOnInit(): void {
    const cid = +this.id;
    this.svc.getById(cid).subscribe(r => { if (r.isSuccess) this.complaint.set(r.data); this.loading.set(false); });
    this.svc.getHistory(cid).subscribe(r => { if (r.isSuccess) this.history.set(r.data); });
    this.attachSvc.getByComplaintId(cid).subscribe(r => { if (r.isSuccess) this.attachments.set(r.data); });
    this.userSvc.getAgents().subscribe(r => { if (r.isSuccess) this.agents.set(r.data); });
  }

  submitAssign(id: number): void {
    this.svc.assign(id, this.assignForm.value as any).subscribe(() => { this.reload(id); this.activeAction = ''; });
  }

  submitResolve(id: number): void {
    if (this.resolveForm.invalid) return;
    this.svc.resolve(id, this.resolveForm.value as any).subscribe(() => { this.reload(id); this.activeAction = ''; });
  }

  submitEscalate(id: number): void {
    if (this.escalateForm.invalid) return;
    this.svc.escalate(id, this.escalateForm.value as any).subscribe(() => { this.reload(id); this.activeAction = ''; });
  }

  close(): void {
    this.svc.close(+this.id).subscribe(() => this.reload(+this.id));
  }

  delete(): void {
    if (!confirm('Delete this complaint?')) return;
    this.svc.delete(+this.id).subscribe(() => this.router.navigate(['/complaints']));
  }

  addActivity(): void {
    if (this.activityForm.invalid) return;
    // In production, fetch the linked caseId from complaint data
    const caseId = 1; // placeholder
    this.caseSvc.addActivity(caseId, this.activityForm.value as any).subscribe(() => {
      this.activityForm.reset({ activityType: 'Note', description: '' });
    });
  }

  uploadFile(event: Event, complaintId: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.attachSvc.upload(complaintId, file).subscribe(() =>
      this.attachSvc.getByComplaintId(complaintId).subscribe(r => { if (r.isSuccess) this.attachments.set(r.data); })
    );
  }

  deleteAttachment(complaintId: number, id: number): void {
    if (!confirm('Delete attachment?')) return;
    this.attachSvc.delete(complaintId, id).subscribe(() =>
      this.attachments.update(list => list.filter(a => a.id !== id))
    );
  }

  reload(id: number): void {
    this.svc.getById(id).subscribe(r => { if (r.isSuccess) this.complaint.set(r.data); });
    this.svc.getHistory(id).subscribe(r => { if (r.isSuccess) this.history.set(r.data); });
  }

  formatBytes(b: number): string {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
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

export interface Complaint {
  id: number;
  complaintNumber: string;
  clientId?: number;
  clientName?: string;
  clientEmail?: string;
  complaintChannelId: number;
  complaintChannelName: string;
  complaintCategoryId: number;
  complaintCategoryName: string;
  subCategoryId?: number;
  subCategoryName?: string;
  subject: string;
  description: string;
  priority: string;
  complaintStatusId: number;
  complaintStatusName: string;
  assignedToUserId?: number;
  assignedToUserName?: string;
  assignedDate?: string;
  dueDate?: string;
  slaStatus: string;
  isSlaBreached: boolean;
  isResolved: boolean;
  resolvedDate?: string;
  resolutionNotes?: string;
  isClosed: boolean;
  closedDate?: string;
  createdDateTime: string;
  createdByName: string;
}

export interface CreateComplaintRequest {
  clientId?: number;
  clientName?: string;
  clientEmail?: string;
  clientMobile?: string;
  complaintChannelId: number;
  complaintCategoryId: number;
  subCategoryId?: number;
  subject: string;
  description: string;
  priority: string;
}

export interface ComplaintSearchRequest {
  q?: string;
  statusId?: number;
  categoryId?: number;
  channelId?: number;
  priority?: string;
  assignedToUserId?: number;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface AssignComplaintRequest {
  assignedToUserId: number;
  dueDate?: string;
  note?: string;
}

export interface EscalateComplaintRequest {
  reason: string;
  escalatedToUserId: number;
  escalationType: string;
}

export interface ResolveComplaintRequest {
  resolutionSummary: string;
  rootCause?: string;
  fixApplied?: string;
}

export interface UpdateStatusRequest {
  statusId: number;
  note?: string;
}

export interface ComplaintHistory {
  id: number;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  note?: string;
  performedByName: string;
  createdDateTime: string;
}

/**
 * MockMedicareService simulates Medicare's API for claims documentation and review process
 */
export class MockMedicareService {
  public static readonly FILE_TYPES = [
    'PREPAYMENT_REVIEW',
    'POSTPAYMENT_REVIEW',
    'ADDITIONAL_DOCUMENTATION_REQUEST',
    'AUDIT_REQUEST',
  ] as const;

  public static readonly REVIEW_STATUS = [
    'PENDING',
    'IN_PROGRESS',
    'AWAITING_DOCUMENTATION',
    'DOCUMENTATION_RECEIVED',
    'UNDER_REVIEW',
    'COMPLETED',
    'DENIED',
    'APPROVED',
  ] as const;

  public static readonly DOCUMENT_TYPES = [
    'PROGRESS_NOTE',
    'DISCHARGE_SUMMARY',
    'OPERATIVE_REPORT',
    'CONSULTATION_NOTE',
    'IMAGING_REPORT',
    'LAB_RESULT',
    'BILLING_RECORD',
  ] as const;

  public static readonly DENIAL_REASONS = [
    'MEDICAL_NECESSITY_NOT_ESTABLISHED',
    'INSUFFICIENT_DOCUMENTATION',
    'INCORRECT_CODING',
    'DUPLICATE_CLAIM',
    'SERVICE_NOT_COVERED',
    'TIMELY_FILING',
  ] as const;

  /**
   * Simulates Medicare's API response for a file notification
   */
  public getFileNotification(fileId: string): MedicareFileNotification {
    const seed = this.hashString(fileId);
    
    return {
      notificationId: `NOTIF-${fileId}`,
      receivedTimestamp: this.generateTimestamp(seed),
      fileMetadata: {
        fileId,
        fileName: this.generateFileName(seed),
        fileType: this.getRandomElement(MockMedicareService.FILE_TYPES, seed),
        mimeType: 'application/pdf',
        sizeBytes: this.generateNumber(1000000, 10000000, seed),
      },
      reviewDetails: {
        reviewId: `REV-${fileId}`,
        status: this.getRandomElement(MockMedicareService.REVIEW_STATUS, seed),
        assignedDate: this.generateTimestamp(seed - 1),
        dueDate: this.generateTimestamp(seed + 30),
        priority: this.generateNumber(1, 5, seed),
      },
      patientInfo: {
        medicareId: this.generateMedicareId(seed),
        dateOfService: this.generateTimestamp(seed - 90),
        facilityNPI: this.generateNPI(seed),
        claimNumber: this.generateClaimNumber(seed),
        requestedDocuments: this.generateRequestedDocuments(seed),
      },
      denialDetails: this.generateDenialDetails(seed),
      auditTrail: this.generateAuditTrail(seed),
    };
  }

  /**
   * Simulates fetching a batch of file notifications
   */
  public getFileNotificationBatch(
    page = 1,
    pageSize = 20,
    filters?: FileNotificationFilters
  ): FileNotificationBatchResponse {
    const startId = (page - 1) * pageSize;
    const notifications: MedicareFileNotification[] = [];

    for (let i = 0; i < pageSize; i++) {
      const fileId = `FILE-${startId + i}`;
      const notification = this.getFileNotification(fileId);

      if (this.matchesFilters(notification, filters)) {
        notifications.push(notification);
      }
    }

    return {
      notifications,
      pagination: {
        currentPage: page,
        pageSize,
        totalPages: 50, // Simulated total
        totalItems: 1000, // Simulated total
      },
      batchMetrics: {
        averageProcessingTime: this.generateNumber(24, 72, page),
        completionRate: this.generateNumber(0.6, 0.95, page),
        denialRate: this.generateNumber(0.1, 0.3, page),
      },
    };
  }

  // Private helper methods
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private generateTimestamp(seed: number): string {
    const date = new Date();
    date.setDate(date.getDate() - (seed % 365));
    return date.toISOString();
  }

  private generateFileName(seed: number): string {
    const type = this.getRandomElement(MockMedicareService.FILE_TYPES, seed);
    return `${type}_${seed}_REVIEW.pdf`;
  }

  private generateMedicareId(seed: number): string {
    return `MBI${seed.toString().padStart(9, '0')}`;
  }

  private generateNPI(seed: number): string {
    return `1${seed.toString().padStart(9, '0')}`;
  }

  private generateClaimNumber(seed: number): string {
    return `CLM${seed.toString().padStart(11, '0')}`;
  }

  private generateRequestedDocuments(seed: number): RequestedDocument[] {
    const count = (seed % 3) + 1;
    const documents: RequestedDocument[] = [];

    for (let i = 0; i < count; i++) {
      documents.push({
        documentType: this.getRandomElement(MockMedicareService.DOCUMENT_TYPES, seed + i),
        required: true,
        receivedDate: this.generateTimestamp(seed + i),
        status: this.getRandomElement(MockMedicareService.REVIEW_STATUS, seed + i),
      });
    }

    return documents;
  }

  private generateDenialDetails(seed: number): DenialDetails {
    return {
      reason: this.getRandomElement(MockMedicareService.DENIAL_REASONS, seed),
      denialDate: this.generateTimestamp(seed),
      appealDeadline: this.generateTimestamp(seed + 60),
      deniedAmount: this.generateNumber(1000, 50000, seed),
      recoveryStatus: this.getRandomElement(['PENDING', 'IN_PROGRESS', 'RECOVERED'], seed),
    };
  }

  private generateAuditTrail(seed: number): AuditEvent[] {
    const events: AuditEvent[] = [];
    const count = (seed % 5) + 3;

    for (let i = 0; i < count; i++) {
      events.push({
        eventId: `EVENT-${seed}-${i}`,
        timestamp: this.generateTimestamp(seed + i),
        eventType: this.getRandomElement([
          'FILE_RECEIVED',
          'REVIEW_STARTED',
          'DOCUMENTATION_REQUESTED',
          'DOCUMENTATION_RECEIVED',
          'REVIEW_COMPLETED',
        ], seed + i),
        userId: `USER-${seed % 100}`,
        details: `Processed by system at ${this.generateTimestamp(seed + i)}`,
      });
    }

    return events;
  }

  private generateNumber(min: number, max: number, seed: number): number {
    const random = Math.abs(Math.sin(seed)) * (max - min) + min;
    return Math.round(random * 100) / 100;
  }

  private getRandomElement<T>(array: readonly T[], seed: number): T {
    return array[seed % array.length];
  }

  private matchesFilters(
    notification: MedicareFileNotification,
    filters?: FileNotificationFilters
  ): boolean {
    if (!filters) return true;

    if (filters.fileType && notification.fileMetadata.fileType !== filters.fileType) {
      return false;
    }

    if (filters.status && notification.reviewDetails.status !== filters.status) {
      return false;
    }

    if (filters.dateRange) {
      const notifDate = new Date(notification.receivedTimestamp);
      if (
        notifDate < new Date(filters.dateRange.start) ||
        notifDate > new Date(filters.dateRange.end)
      ) {
        return false;
      }
    }

    return true;
  }
}

// Types
type FileNotificationFilters = {
  fileType?: typeof MockMedicareService.FILE_TYPES[number];
  status?: typeof MockMedicareService.REVIEW_STATUS[number];
  dateRange?: {
    start: string;
    end: string;
  };
};

interface MedicareFileNotification {
  notificationId: string;
  receivedTimestamp: string;
  fileMetadata: {
    fileId: string;
    fileName: string;
    fileType: typeof MockMedicareService.FILE_TYPES[number];
    mimeType: string;
    sizeBytes: number;
  };
  reviewDetails: {
    reviewId: string;
    status: typeof MockMedicareService.REVIEW_STATUS[number];
    assignedDate: string;
    dueDate: string;
    priority: number;
  };
  patientInfo: {
    medicareId: string;
    dateOfService: string;
    facilityNPI: string;
    claimNumber: string;
    requestedDocuments: RequestedDocument[];
  };
  denialDetails: DenialDetails;
  auditTrail: AuditEvent[];
}

interface RequestedDocument {
  documentType: typeof MockMedicareService.DOCUMENT_TYPES[number];
  required: boolean;
  receivedDate: string;
  status: typeof MockMedicareService.REVIEW_STATUS[number];
}

interface DenialDetails {
  reason: typeof MockMedicareService.DENIAL_REASONS[number];
  denialDate: string;
  appealDeadline: string;
  deniedAmount: number;
  recoveryStatus: 'PENDING' | 'IN_PROGRESS' | 'RECOVERED';
}

interface AuditEvent {
  eventId: string;
  timestamp: string;
  eventType: string;
  userId: string;
  details: string;
}

interface FileNotificationBatchResponse {
  notifications: MedicareFileNotification[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  batchMetrics: {
    averageProcessingTime: number;
    completionRate: number;
    denialRate: number;
  };
}
/**
 * Error Report Service
 * Handles error reporting to admins/owners
 */

import { ErrorCategory } from './notificationService';
import { Role } from '../../core/config/appConstants';

export interface ErrorReport {
  category: ErrorCategory;
  message: string;
  description: string;
  targetRole: Role;
  autoDetails: any;
  reportedBy?: {
    userId?: string;
    userEmail?: string;
    userRole?: Role;
  };
  timestamp?: string;
}

/**
 * Submit error report
 * In a real app, this would send to backend API
 */
async function submitErrorReport(report: ErrorReport): Promise<void> {
  // TODO: Replace with actual API call
  // For now, we'll just log it and simulate success
  
  const fullReport: ErrorReport = {
    ...report,
    reportedBy: {
      userId: report.autoDetails.userId,
      userEmail: report.autoDetails.userEmail,
      userRole: report.autoDetails.userRole,
    },
    timestamp: new Date().toISOString(),
  };

  // Log error report (in production, send to backend)
  console.log('Error Report:', {
    category: fullReport.category,
    message: fullReport.message,
    targetRole: fullReport.targetRole,
    description: fullReport.description,
    autoDetails: fullReport.autoDetails,
    reportedBy: fullReport.reportedBy,
    timestamp: fullReport.timestamp,
  });

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // In production, would call:
  // await httpService.post('/api/error-reports', fullReport);
}

const errorReportService = {
  submitErrorReport,
};

export default errorReportService;


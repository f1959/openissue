import { OpenIssue } from '../types';
import { formatDateTime } from './dateFormat';

export type ExportIssueRecord = {
  id: string;
  issueNo: number;
  title: string;
  status: OpenIssue['status'];
  seriousLevel: OpenIssue['seriousLevel'];
  raisedBy: string;
  responsible: string;
  problem: string;
  solution: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
};

export function toExportIssueRecord(issue: OpenIssue): ExportIssueRecord {
  return {
    id: issue.id,
    issueNo: issue.issueNo,
    title: issue.title,
    status: issue.status,
    seriousLevel: issue.seriousLevel,
    raisedBy: issue.raisedBy,
    responsible: issue.responsible,
    problem: issue.problem,
    solution: issue.solution,
    imageUrls: issue.imageUrls,
    createdAt: formatDateTime(issue.createdAt),
    updatedAt: formatDateTime(issue.updatedAt),
  };
}

import { OpenIssue } from '../types';
import { formatDateTime } from './dateFormat';
import { extractInlineImageUrls, stripInlineImages } from './inlineImages';

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
  const imageUrls = [
    ...new Set([
      ...issue.imageUrls,
      ...extractInlineImageUrls(issue.problem, issue.solution),
    ]),
  ];

  return {
    id: issue.id,
    issueNo: issue.issueNo,
    title: issue.title,
    status: issue.status,
    seriousLevel: issue.seriousLevel,
    raisedBy: issue.raisedBy,
    responsible: issue.responsible,
    problem: stripInlineImages(issue.problem),
    solution: stripInlineImages(issue.solution),
    imageUrls,
    createdAt: formatDateTime(issue.createdAt),
    updatedAt: formatDateTime(issue.updatedAt),
  };
}

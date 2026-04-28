import { Timestamp } from 'firebase/firestore';

export type IssueStatus = 'open' | 'in_progress' | 'resolved';
export type SeriousLevel = 'low' | 'medium' | 'high' | 'critical';

export type OpenIssue = {
  id: string;
  issueNo: number;
  title: string;
  raisedBy: string;
  responsible: string;
  problem: string;
  solution: string;
  status: IssueStatus;
  seriousLevel: SeriousLevel;
  imageUrls: string[];
  archived: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  updatedBy?: string;
};

export type OpenIssueInput = Omit<OpenIssue, 'id'>;

export type SortOption = 'issue_no' | 'updated_desc' | 'serious_desc' | 'status';

import { OpenIssue, SortOption } from '../types';

const seriousRank = { low: 0, medium: 1, high: 2, critical: 3 };
const statusRank = { open: 0, in_progress: 1, resolved: 2 };

export function sortIssues(issues: OpenIssue[], sort: SortOption): OpenIssue[] {
  return [...issues].sort((a, b) => {
    switch (sort) {
      case 'issue_no':
        return a.issueNo - b.issueNo;
      case 'updated_desc':
        return b.updatedAt.toMillis() - a.updatedAt.toMillis();
      case 'serious_desc':
        return seriousRank[b.seriousLevel] - seriousRank[a.seriousLevel];
      case 'status':
        return statusRank[a.status] - statusRank[b.status] || a.issueNo - b.issueNo;
      default:
        return 0;
    }
  });
}

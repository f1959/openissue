import { OpenIssue } from '../types';
import { formatDateTime } from '../utils/dateFormat';
import { SeriousLevelBadge } from './SeriousLevelBadge';
import { StatusBadge } from './StatusBadge';

type Props = {
  issues: OpenIssue[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function Sidebar({ issues, selectedId, onSelect }: Props) {
  return (
    <div className="issue-list">
      {issues.map((issue) => (
        <button
          key={issue.id}
          className={`issue-row ${selectedId === issue.id ? 'selected' : ''}`}
          onClick={() => onSelect(issue.id)}
        >
          <div className="issue-row-top">
            <strong>#{issue.issueNo}</strong>
            <StatusBadge status={issue.status} />
          </div>
          <div className="issue-title">{issue.title || '(No title)'}</div>
          <div className="issue-meta">
            <SeriousLevelBadge level={issue.seriousLevel} />
            <span>Owner: {issue.responsible || '-'}</span>
          </div>
          <div className="issue-updated">Updated {formatDateTime(issue.updatedAt)}</div>
        </button>
      ))}
      {issues.length === 0 && <div className="empty-list">No issues found.</div>}
    </div>
  );
}

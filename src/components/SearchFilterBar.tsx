import { IssueStatus, SeriousLevel, SortOption } from '../types';

type Props = {
  query: string;
  status: IssueStatus | 'all';
  level: SeriousLevel | 'all';
  sort: SortOption;
  showArchived: boolean;
  onQuery: (v: string) => void;
  onStatus: (v: IssueStatus | 'all') => void;
  onLevel: (v: SeriousLevel | 'all') => void;
  onSort: (v: SortOption) => void;
  onArchived: (v: boolean) => void;
};

export function SearchFilterBar(props: Props) {
  return (
    <div className="search-panel">
      <input
        placeholder="검색: 제목 / 문의자 / 협의자 / 문의내용"
        value={props.query}
        onChange={(e) => props.onQuery(e.target.value)}
      />
      <div className="filter-row">
        <select value={props.status} onChange={(e) => props.onStatus(e.target.value as IssueStatus | 'all')}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={props.level} onChange={(e) => props.onLevel(e.target.value as SeriousLevel | 'all')}>
          <option value="all">All Level</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select value={props.sort} onChange={(e) => props.onSort(e.target.value as SortOption)}>
          <option value="updated_desc">Updated Date</option>
          <option value="issue_no">Issue No.</option>
          <option value="serious_desc">Serious Level</option>
          <option value="status">Status</option>
        </select>
      </div>
      <label className="archived-toggle">
        <input type="checkbox" checked={props.showArchived} onChange={(e) => props.onArchived(e.target.checked)} />
        보관 표시
      </label>
    </div>
  );
}

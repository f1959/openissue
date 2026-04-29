import { OpenIssue } from '../types';

type Props = {
  open: boolean;
  issues: OpenIssue[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onClose: () => void;
  onDownload: () => Promise<void>;
  loading: boolean;
  error?: string | null;
};

export function ExportModal(props: Props) {
  if (!props.open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Export to PPTX</h3>
        <p className="muted">Select issues to include. {props.selected.size} selected.</p>
        <div className="modal-actions">
          <button onClick={props.onSelectAll}>Select All</button>
          <button onClick={props.onClear}>Clear Selection</button>
        </div>
        <div className="modal-list">
          {props.issues.map((issue) => (
            <label key={issue.id} className="modal-item">
              <input
                type="checkbox"
                checked={props.selected.has(issue.id)}
                onChange={() => props.onToggle(issue.id)}
              />
              <span>#{issue.issueNo} {issue.title}</span>
            </label>
          ))}
        </div>
        {props.error && <p className="error-text">{props.error}</p>}
        <div className="modal-footer">
          <button onClick={props.onClose}>Cancel</button>
          <button className="primary" onClick={() => void props.onDownload()} disabled={props.loading}>
            {props.loading ? 'Generating...' : 'Download PPTX'}
          </button>
        </div>
      </div>
    </div>
  );
}

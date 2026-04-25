import { ClipboardEvent } from 'react';
import { OpenIssue, SeriousLevel } from '../types';
import { formatDateTime } from '../utils/dateFormat';

type Props = {
  issue: OpenIssue | null;
  onChange: <K extends keyof OpenIssue>(key: K, value: OpenIssue[K]) => void;
  onSave: () => Promise<void>;
  onImagePaste: (file: File) => Promise<void>;
  onRemoveImage: (url: string) => void;
  saving: boolean;
  message?: string | null;
  error?: string | null;
};

export function IssueEditor({ issue, onChange, onSave, onImagePaste, onRemoveImage, saving, message, error }: Props) {
  if (!issue) {
    return <div className="editor-empty">Select an issue from the left sidebar.</div>;
  }

  const handlePaste = async (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const item = Array.from(event.clipboardData.items).find((entry) => entry.type.startsWith('image/'));
    if (!item) return;
    event.preventDefault();
    const file = item.getAsFile();
    if (!file) return;
    await onImagePaste(file);
  };

  return (
    <div className="editor-card">
      <div className="editor-grid">
        <label>Title<input value={issue.title} onChange={(e) => onChange('title', e.target.value)} /></label>
        <label>Raised By<input value={issue.raisedBy} onChange={(e) => onChange('raisedBy', e.target.value)} /></label>
        <label>Responsible<input value={issue.responsible} onChange={(e) => onChange('responsible', e.target.value)} /></label>
        <label>
          Status
          <select value={issue.status} onChange={(e) => onChange('status', e.target.value as OpenIssue['status'])}>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>
        <label>
          Serious Level
          <select value={issue.seriousLevel} onChange={(e) => onChange('seriousLevel', e.target.value as SeriousLevel)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={issue.archived} onChange={(e) => onChange('archived', e.target.checked)} />
          Archived
        </label>
      </div>

      <div className="timestamps">
        <span>Created: {formatDateTime(issue.createdAt)}</span>
        <span>Updated: {formatDateTime(issue.updatedAt)}</span>
      </div>

      <label className="full">
        Problem
        <textarea rows={8} value={issue.problem} onChange={(e) => onChange('problem', e.target.value)} onPaste={(e) => void handlePaste(e)} />
      </label>
      <label className="full">
        Solution
        <textarea rows={8} value={issue.solution} onChange={(e) => onChange('solution', e.target.value)} onPaste={(e) => void handlePaste(e)} />
      </label>

      <div>
        <h4>Attached Images</h4>
        <div className="image-grid">
          {issue.imageUrls.map((url) => (
            <div key={url} className="image-item">
              <img src={url} alt="issue attachment" />
              <button onClick={() => onRemoveImage(url)}>Remove</button>
            </div>
          ))}
          {issue.imageUrls.length === 0 && <span className="muted">Paste image into Problem/Solution fields (Ctrl/Cmd + V).</span>}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}
      {message && <p className="success-text">{message}</p>}

      <button className="primary" onClick={() => void onSave()} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
    </div>
  );
}

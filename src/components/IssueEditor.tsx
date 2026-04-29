import { ClipboardEvent } from 'react';
import { OpenIssue, SeriousLevel } from '../types';
import { formatDateTime } from '../utils/dateFormat';

type Props = {
  issue: OpenIssue | null;
  onChange: <K extends keyof OpenIssue>(key: K, value: OpenIssue[K]) => void;
  onSave: () => Promise<void>;
  onImagePaste: (file: File) => Promise<void>;
  onRemoveImage: (url: string) => void;
  storageEnabled: boolean;
  saving: boolean;
  message?: string | null;
  error?: string | null;
};

export function IssueEditor({ issue, onChange, onSave, onImagePaste, onRemoveImage, storageEnabled, saving, message, error }: Props) {
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
      <div className="editor-topbar">
        <h2>Open Issue 상세</h2>
        <div className="editor-top-actions">
          <label className="archive-chip">
            <input type="checkbox" checked={issue.archived} onChange={(e) => onChange('archived', e.target.checked)} />
            Archive
          </label>
          <button className="primary" onClick={() => void onSave()} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>

      <div className="editor-grid">
        <label>제목<input value={issue.title} onChange={(e) => onChange('title', e.target.value)} /></label>
        <label>문의자<input value={issue.raisedBy} onChange={(e) => onChange('raisedBy', e.target.value)} /></label>
        <label>협의자<input value={issue.consultedBy ?? issue.responsible} onChange={(e) => onChange('consultedBy', e.target.value)} /></label>
        <label>문의일<input type="date" value={issue.inquiryDate ?? ''} onChange={(e) => onChange('inquiryDate', e.target.value)} /></label>
        <label>협의일<input type="date" value={issue.consultDate ?? ''} onChange={(e) => onChange('consultDate', e.target.value)} /></label>
        <label>
          상태
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
      </div>

      <div className="timestamps">
        <span>Created: {formatDateTime(issue.createdAt)}</span>
        <span>Updated: {formatDateTime(issue.updatedAt)}</span>
      </div>

      <div className="body-split">
        <label className="full body-pane">
          협의 내용
          <textarea rows={12} value={issue.solution} onChange={(e) => onChange('solution', e.target.value)} onPaste={(e) => void handlePaste(e)} />
        </label>
        <label className="full body-pane">
          문의 내용
          <textarea rows={12} value={issue.problem} onChange={(e) => onChange('problem', e.target.value)} onPaste={(e) => void handlePaste(e)} />
        </label>
      </div>

      <div>
        <h4>첨부 이미지</h4>
        {!storageEnabled && <p className="muted">Storage OFF mode: images are saved inline in Firestore (recommended under 700KB each).</p>}
        <div className="image-grid">
          {issue.imageUrls.map((url) => (
            <div key={url} className="image-item">
              <img src={url} alt="issue attachment" />
              <button onClick={() => onRemoveImage(url)}>Remove</button>
            </div>
          ))}
          {issue.imageUrls.length === 0 && <span className="muted">붙여넣기(Ctrl/Cmd + V)로 이미지 첨부.</span>}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}
      {message && <p className="success-text">{message}</p>}
    </div>
  );
}

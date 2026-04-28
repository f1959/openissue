import { OpenIssue, SeriousLevel } from '../types';
import { formatDateTime } from '../utils/dateFormat';
import { appendInlineImage, extractInlineImageUrls } from '../utils/inlineImages';
import { DocumentField } from './DocumentField';

type Props = {
  issue: OpenIssue | null;
  onChange: <K extends keyof OpenIssue>(key: K, value: OpenIssue[K]) => void;
  onSave: () => Promise<void>;
  onImagePaste: (file: File) => Promise<string>;
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

  const inlineImageUrls = new Set(extractInlineImageUrls(issue.problem, issue.solution));
  const unplacedImages = issue.imageUrls.filter((url) => !inlineImageUrls.has(url));

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

      <DocumentField
        label="Problem"
        value={issue.problem}
        onChange={(value) => onChange('problem', value)}
        onImagePaste={onImagePaste}
        onRemoveImage={onRemoveImage}
      />
      <DocumentField
        label="Solution"
        value={issue.solution}
        onChange={(value) => onChange('solution', value)}
        onImagePaste={onImagePaste}
        onRemoveImage={onRemoveImage}
      />

      {unplacedImages.length > 0 && (
        <div className="unplaced-images">
          <div className="document-heading">
            <span>Unplaced Images</span>
          </div>
          <div className="unplaced-image-list">
            {unplacedImages.map((url) => (
              <figure className="unplaced-image" key={url}>
                <img src={url} alt="unplaced attachment" />
                <div>
                  <button type="button" onClick={() => onChange('problem', appendInlineImage(issue.problem, url))}>
                    Add to Problem
                  </button>
                  <button type="button" onClick={() => onChange('solution', appendInlineImage(issue.solution, url))}>
                    Add to Solution
                  </button>
                  <button type="button" onClick={() => onRemoveImage(url)}>
                    Remove
                  </button>
                </div>
              </figure>
            ))}
          </div>
        </div>
      )}

      {!storageEnabled && <p className="muted compact-note">Storage OFF: keep pasted images under 700KB.</p>}

      {error && <p className="error-text">{error}</p>}
      {message && <p className="success-text">{message}</p>}

      <button className="primary" onClick={() => void onSave()} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
    </div>
  );
}

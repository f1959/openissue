import { ClipboardEvent, useMemo, useState } from 'react';
import { inlineImageToken, splitInlineImages } from '../utils/inlineImages';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onImagePaste: (file: File) => Promise<string>;
  onRemoveImage: (url: string) => void;
};

export function DocumentField({ label, value, onChange, onImagePaste, onRemoveImage }: Props) {
  const [uploading, setUploading] = useState(false);
  const segments = useMemo(() => splitInlineImages(value), [value]);

  const replaceTextSegment = (segmentIndex: number, nextText: string) => {
    const next = segments
      .map((segment, index) => {
        if (segment.type === 'image') return inlineImageToken(segment.url);
        return index === segmentIndex ? nextText : segment.text;
      })
      .join('');
    onChange(next);
  };

  const handlePaste = async (event: ClipboardEvent<HTMLTextAreaElement>, segmentIndex: number) => {
    const item = Array.from(event.clipboardData.items).find((entry) => entry.type.startsWith('image/'));
    if (!item) return;

    event.preventDefault();
    const file = item.getAsFile();
    if (!file) return;

    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const currentText = target.value;

    setUploading(true);
    try {
      const url = await onImagePaste(file);
      const before = currentText.slice(0, start).replace(/\s+$/, '');
      const after = currentText.slice(end).replace(/^\s+/, '');
      const imageText = inlineImageToken(url);
      const nextText = [before, imageText, after].filter(Boolean).join('\n\n');
      replaceTextSegment(segmentIndex, nextText);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="document-group">
      <div className="document-heading">
        <span>{label}</span>
        {uploading && <span className="document-status">Adding image...</span>}
      </div>
      <div className="document-surface">
        {segments.map((segment, index) => {
          if (segment.type === 'image') {
            return (
              <figure className="document-image" key={`${segment.url}-${index}`}>
                <img src={segment.url} alt={`${label} attachment`} />
                <button type="button" onClick={() => onRemoveImage(segment.url)}>
                  Remove
                </button>
              </figure>
            );
          }

          const rows = Math.max(4, Math.min(16, segment.text.split('\n').length + 2));
          return (
            <textarea
              key={`text-${index}`}
              rows={rows}
              value={segment.text}
              placeholder={index === 0 ? `Write ${label.toLowerCase()}...` : 'Continue writing...'}
              onChange={(event) => replaceTextSegment(index, event.target.value)}
              onPaste={(event) => void handlePaste(event, index)}
            />
          );
        })}
      </div>
    </section>
  );
}

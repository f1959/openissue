import PptxGenJS from 'pptxgenjs';
import type { ExportIssueRecord } from './exportModel';

const statusColor = { open: 'C62828', in_progress: 'EF6C00', resolved: '2E7D32' };
const seriousColor = { low: '607D8B', medium: 'F9A825', high: 'EF6C00', critical: 'C62828' };

function splitText(text: string, chunk = 1200): string[] {
  if (!text.trim()) return ['(empty)'];
  const paragraphs = text.split('\n');
  const out: string[] = [];
  let current = '';
  for (const p of paragraphs) {
    if ((current + '\n' + p).length > chunk) {
      if (current) out.push(current);
      current = p;
    } else {
      current = current ? `${current}\n${p}` : p;
    }
  }
  if (current) out.push(current);
  return out;
}

async function imageToData(url: string): Promise<string | null> {
  if (url.startsWith('data:image/')) return url;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function addFooter(slide: PptxGenJS.Slide, exportDate: string, issueNo: string, pageNo: number) {
  slide.addText(`${exportDate} | ${issueNo} | Page ${pageNo}`, {
    x: 0.4,
    y: 6.95,
    w: 12.5,
    h: 0.3,
    fontSize: 9,
    color: '666666',
    align: 'right',
  });
}

export async function exportIssuesToPptx(records: ExportIssueRecord[]): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  const exportDate = new Date().toISOString().slice(0, 10);
  let pageNo = 1;

  const cover = pptx.addSlide();
  cover.background = { color: 'FFFFFF' };
  cover.addText('Open Issue Report', { x: 0.6, y: 1.2, w: 12, h: 0.8, fontSize: 34, bold: true, color: '111111' });
  cover.addText(`Export date: ${exportDate}`, { x: 0.6, y: 2.2, w: 8, h: 0.4, fontSize: 16, color: '333333' });
  cover.addText(`Selected issues: ${records.length}`, { x: 0.6, y: 2.7, w: 8, h: 0.4, fontSize: 16, color: '333333' });
  addFooter(cover, exportDate, 'All Issues', pageNo++);

  const summary = pptx.addSlide();
  summary.background = { color: 'FFFFFF' };
  summary.addText('Issue Summary', { x: 0.6, y: 0.3, w: 10, h: 0.6, fontSize: 24, bold: true, color: '111111' });
  summary.addTable(
    [
      [{ text: 'No' }, { text: 'Title' }, { text: 'Status' }, { text: 'Level' }, { text: 'Raised By' }, { text: 'Responsible' }, { text: 'Updated' }],
      ...records.map((r) => [
        { text: `#${r.issueNo}` },
        { text: r.title },
        { text: r.status },
        { text: r.seriousLevel },
        { text: r.raisedBy || '-' },
        { text: r.responsible || '-' },
        { text: r.updatedAt },
      ]),
    ],
    {
      x: 0.5,
      y: 1,
      w: 12.3,
      h: 5.8,
      fontSize: 10,
      border: { pt: 1, color: 'DDDDDD' },
      fill: 'FFFFFF',
      color: '111111',
    },
  );
  addFooter(summary, exportDate, 'All Issues', pageNo++);

  for (const record of records) {
    const problemChunks = splitText(record.problem);
    const solutionChunks = splitText(record.solution);

    for (let i = 0; i < problemChunks.length; i += 1) {
      const slide = pptx.addSlide();
      slide.background = { color: 'FFFFFF' };
      slide.addText(`Issue #${record.issueNo} - Problem (${i + 1}/${problemChunks.length})`, {
        x: 0.5,
        y: 0.2,
        w: 10,
        h: 0.4,
        fontSize: 18,
        bold: true,
      });
      slide.addShape(pptx.ShapeType.roundRect, { x: 10.7, y: 0.18, w: 1.2, h: 0.34, fill: { color: statusColor[record.status] }, line: { color: statusColor[record.status] } });
      slide.addText(record.status, { x: 10.72, y: 0.21, w: 1.16, h: 0.3, fontSize: 9, color: 'FFFFFF', align: 'center' });
      slide.addShape(pptx.ShapeType.roundRect, { x: 12, y: 0.18, w: 1.2, h: 0.34, fill: { color: seriousColor[record.seriousLevel] }, line: { color: seriousColor[record.seriousLevel] } });
      slide.addText(record.seriousLevel, { x: 12.02, y: 0.21, w: 1.16, h: 0.3, fontSize: 9, color: 'FFFFFF', align: 'center' });
      slide.addText(`Title: ${record.title}\nRaised By: ${record.raisedBy || '-'}\nResponsible: ${record.responsible || '-'}\nCreated: ${record.createdAt}\nUpdated: ${record.updatedAt}`, {
        x: 0.6,
        y: 0.8,
        w: 5.8,
        h: 1.3,
        fontSize: 10,
        color: '444444',
      });
      slide.addText('Problem', { x: 0.6, y: 2.2, w: 4, h: 0.3, fontSize: 14, bold: true });
      slide.addText(problemChunks[i], {
        x: 0.6,
        y: 2.5,
        w: 12.2,
        h: 4.2,
        fontSize: 11,
        valign: 'top',
        color: '111111',
      });
      addFooter(slide, exportDate, `Issue #${record.issueNo}`, pageNo++);
    }

    for (let i = 0; i < solutionChunks.length; i += 1) {
      const slide = pptx.addSlide();
      slide.background = { color: 'FFFFFF' };
      slide.addText(`Issue #${record.issueNo} - Solution (${i + 1}/${solutionChunks.length})`, {
        x: 0.5,
        y: 0.2,
        w: 10,
        h: 0.4,
        fontSize: 18,
        bold: true,
      });
      slide.addText('Solution', { x: 0.6, y: 1.0, w: 4, h: 0.3, fontSize: 14, bold: true });
      slide.addText(solutionChunks[i], {
        x: 0.6,
        y: 1.3,
        w: 12.2,
        h: 5.4,
        fontSize: 11,
        valign: 'top',
        color: '111111',
      });
      addFooter(slide, exportDate, `Issue #${record.issueNo}`, pageNo++);
    }

    const imageUrls = record.imageUrls ?? [];
    for (let i = 0; i < imageUrls.length; i += 4) {
      const batch = imageUrls.slice(i, i + 4);
      const slide = pptx.addSlide();
      slide.background = { color: 'FFFFFF' };
      const pages = Math.ceil(imageUrls.length / 4);
      slide.addText(`Issue #${record.issueNo} - Attached Images (${Math.floor(i / 4) + 1}/${pages})`, {
        x: 0.5,
        y: 0.2,
        w: 12,
        h: 0.4,
        fontSize: 18,
        bold: true,
      });

      for (let idx = 0; idx < batch.length; idx += 1) {
        const x = 0.6 + (idx % 2) * 6.2;
        const y = 0.9 + Math.floor(idx / 2) * 3.0;
        const data = await imageToData(batch[idx]);
        if (data) {
          slide.addImage({ data, x, y, w: 5.8, h: 2.8, sizing: { type: 'contain', x, y, w: 5.8, h: 2.8 } });
        } else {
          slide.addShape(pptx.ShapeType.rect, { x, y, w: 5.8, h: 2.8, fill: { color: 'F5F5F5' }, line: { color: 'CCCCCC' } });
          slide.addText(`Image could not be loaded\n${batch[idx]}`, { x: x + 0.1, y: y + 0.1, w: 5.6, h: 2.6, fontSize: 10, color: '666666' });
        }
      }
      addFooter(slide, exportDate, `Issue #${record.issueNo}`, pageNo++);
    }
  }

  const dateSuffix = exportDate.replaceAll('-', '');
  const fileName = records.length === 1
    ? `open_issue_#${records[0].issueNo}_${dateSuffix}.pptx`
    : `open_issue_report_${dateSuffix}.pptx`;

  await pptx.writeFile({ fileName });
}

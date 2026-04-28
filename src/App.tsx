import { useEffect, useMemo, useState } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Timestamp, addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db, storageEnabled } from './firebase';
import { LoginPage } from './components/LoginPage';
import { SearchFilterBar } from './components/SearchFilterBar';
import { Sidebar } from './components/Sidebar';
import { IssueEditor } from './components/IssueEditor';
import { ExportModal } from './components/ExportModal';
import { OpenIssue, SortOption, IssueStatus, SeriousLevel } from './types';
import { sortIssues } from './utils/issueSort';
import { uploadIssueImage } from './utils/uploadImage';
import { toExportIssueRecord } from './utils/exportModel';
import { exportIssuesToPptx } from './utils/exportPptx';
import { extractInlineImageUrls, removeInlineImage } from './utils/inlineImages';
import './styles.css';

function withId<T>(id: string, data: T): T & { id: string } {
  return { id, ...data };
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<OpenIssue[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<OpenIssue | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<SeriousLevel | 'all'>('all');
  const [sort, setSort] = useState<SortOption>('updated_desc');
  const [showArchived, setShowArchived] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportSelected, setExportSelected] = useState<Set<string>>(new Set());
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'openIssues'), orderBy('updatedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => {
        const data = d.data();
        return withId(d.id, {
          ...data,
          createdAt: data.createdAt ?? Timestamp.now(),
          updatedAt: data.updatedAt ?? Timestamp.now(),
        }) as OpenIssue;
      });
      setIssues(list);
      if (!selectedId && list.length > 0) {
        setSelectedId(list[0].id);
      }
    });
  }, [user, selectedId]);

  useEffect(() => {
    if (!dirty) return;
    const handle = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handle);
    return () => window.removeEventListener('beforeunload', handle);
  }, [dirty]);

  const selectedIssue = useMemo(() => issues.find((i) => i.id === selectedId) ?? null, [issues, selectedId]);
  const activeIssue = draft && draft.id === selectedIssue?.id ? draft : selectedIssue;

  const visibleIssues = useMemo(() => {
    const lower = queryText.trim().toLowerCase();
    const filtered = issues.filter((issue) => {
      if (!showArchived && issue.archived) return false;
      if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
      if (levelFilter !== 'all' && issue.seriousLevel !== levelFilter) return false;
      if (!lower) return true;
      return [issue.title, issue.raisedBy, issue.responsible, issue.problem].some((v) => (v ?? '').toLowerCase().includes(lower));
    });
    return sortIssues(filtered, sort);
  }, [issues, showArchived, statusFilter, levelFilter, queryText, sort]);

  const guardUnsaved = (): boolean => !dirty || window.confirm('You have unsaved changes. Continue without saving?');

  const handleSelect = (id: string) => {
    if (!guardUnsaved()) return;
    setSelectedId(id);
    setDraft(null);
    setDirty(false);
    setSaveMessage(null);
    setSaveError(null);
  };

  const changeDraft = <K extends keyof OpenIssue>(key: K, value: OpenIssue[K]) => {
    if (!activeIssue) return;
    setDraft((prev) => {
      const base = prev && prev.id === activeIssue.id ? prev : activeIssue;
      return { ...base, [key]: value };
    });
    setDirty(true);
    setSaveMessage(null);
    setSaveError(null);
  };

  const login = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password).then(() => undefined);

  const logout = async () => {
    if (!guardUnsaved()) return;
    await signOut(auth);
    setSelectedId(null);
    setDraft(null);
    setDirty(false);
  };

  const createIssue = async () => {
    if (!guardUnsaved()) return;
    const maxIssueNo = issues.reduce((max, issue) => Math.max(max, issue.issueNo), 0);
    const newIssueNo = maxIssueNo + 1;
    const payload = {
      issueNo: newIssueNo,
      title: 'New Open Issue',
      raisedBy: '',
      responsible: '',
      problem: '',
      solution: '',
      status: 'open',
      seriousLevel: 'medium',
      imageUrls: [],
      archived: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedBy: user?.email ?? '',
    };
    const ref = await addDoc(collection(db, 'openIssues'), payload);
    setSelectedId(ref.id);
    setDraft(null);
    setDirty(false);
  };

  const saveIssue = async () => {
    if (!activeIssue || !user) return;
    if (!activeIssue.title.trim() || !activeIssue.problem.trim()) {
      setSaveError('Title and Problem are required.');
      return;
    }
    const imageUrls = [
      ...new Set([
        ...activeIssue.imageUrls,
        ...extractInlineImageUrls(activeIssue.problem, activeIssue.solution),
      ]),
    ];
    setSaving(true);
    setSaveError(null);
    try {
      await updateDoc(doc(db, 'openIssues', activeIssue.id), {
        title: activeIssue.title,
        raisedBy: activeIssue.raisedBy,
        responsible: activeIssue.responsible,
        problem: activeIssue.problem,
        solution: activeIssue.solution,
        status: activeIssue.status,
        seriousLevel: activeIssue.seriousLevel,
        imageUrls,
        archived: activeIssue.archived,
        updatedAt: serverTimestamp(),
        updatedBy: user.email ?? '',
      });
      setDirty(false);
      setDraft(null);
      setSaveMessage('Saved successfully.');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasteImage = async (file: File): Promise<string> => {
    if (!activeIssue) throw new Error('Select an issue before adding images.');
    setSaveMessage('Uploading image...');
    try {
      const url = await uploadIssueImage(file, activeIssue.id);
      setDraft((prev) => {
        const base = prev && prev.id === activeIssue.id ? prev : activeIssue;
        const imageUrls = base.imageUrls.includes(url) ? base.imageUrls : [...base.imageUrls, url];
        return { ...base, imageUrls };
      });
      setDirty(true);
      setSaveMessage('Image inserted. Click Save to persist.');
      return url;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Image upload failed.');
      throw err;
    }
  };

  const removeImage = (url: string) => {
    if (!activeIssue) return;
    setDraft((prev) => {
      const base = prev && prev.id === activeIssue.id ? prev : activeIssue;
      return {
        ...base,
        imageUrls: base.imageUrls.filter((item) => item !== url),
        problem: removeInlineImage(base.problem, url),
        solution: removeInlineImage(base.solution, url),
      };
    });
    setDirty(true);
    setSaveMessage(null);
    setSaveError(null);
  };

  const openExport = () => {
    setExportSelected(new Set(issues.map((issue) => issue.id)));
    setExportError(null);
    setExportOpen(true);
  };

  const downloadExport = async () => {
    if (exportSelected.size === 0) {
      setExportError('Please select at least one issue.');
      return;
    }
    setExportLoading(true);
    setExportError(null);
    try {
      const records = issues.filter((i) => exportSelected.has(i.id)).map(toExportIssueRecord);
      await exportIssuesToPptx(records);
      setExportOpen(false);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'PPTX export failed');
    } finally {
      setExportLoading(false);
    }
  };

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <button className="primary" onClick={() => void createIssue()}>New Open Issue</button>
          <button onClick={openExport}>Export to PPTX</button>
          <button onClick={() => void logout()}>Logout</button>
        </div>
        <SearchFilterBar
          query={queryText}
          status={statusFilter}
          level={levelFilter}
          sort={sort}
          showArchived={showArchived}
          onQuery={setQueryText}
          onStatus={setStatusFilter}
          onLevel={setLevelFilter}
          onSort={setSort}
          onArchived={setShowArchived}
        />
        <Sidebar issues={visibleIssues} selectedId={selectedId} onSelect={handleSelect} />
      </aside>

      <main className="main-panel">
        {dirty && <div className="unsaved-banner">Unsaved changes</div>}
        <IssueEditor
          issue={activeIssue}
          onChange={changeDraft}
          onSave={saveIssue}
          onImagePaste={handlePasteImage}
          onRemoveImage={removeImage}
          storageEnabled={storageEnabled}
          saving={saving}
          message={saveMessage}
          error={saveError}
        />
      </main>

      <ExportModal
        open={exportOpen}
        issues={issues}
        selected={exportSelected}
        onToggle={(id) =>
          setExportSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          })
        }
        onSelectAll={() => setExportSelected(new Set(issues.map((issue) => issue.id)))}
        onClear={() => setExportSelected(new Set())}
        onClose={() => setExportOpen(false)}
        onDownload={downloadExport}
        loading={exportLoading}
        error={exportError}
      />
    </div>
  );
}

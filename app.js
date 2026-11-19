/* ============================================================
   StoryVerse – Personal Story Writing Studio
   Complete client-side application with localStorage persistence
   ============================================================ */

const STORAGE_KEY = 'storyverse_data_v1';

// ---------- State ----------
let state = {
  projects: [],
  documents: [],
  characters: [],
  episodes: [],
  scenes: [],
  dialogues: [],
  ideas: [],
  notes: [],
  currentDocId: null,
  isDirty: false,
  autoSaveTimer: null,
  theme: 'light'
};

// ---------- Utilities ----------
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function now() {
  return new Date().toISOString();
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  return d.toLocaleDateString(undefined, opts);
}

function formatRelative(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

function wordCount(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

function charCount(html) {
  return html.replace(/<[^>]+>/g, '').length;
}

function toast(msg, duration = 2600) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('translate-y-20', 'opacity-0');
  el.classList.add('translate-y-0', 'opacity-100');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.classList.add('translate-y-20', 'opacity-0');
    el.classList.remove('translate-y-0', 'opacity-100');
  }, duration);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateStats();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { ...state, ...parsed };
    }
  } catch (e) {
    console.warn('Could not load state', e);
  }
}

// ---------- Seed Data (first visit) ----------
function seedIfEmpty() {
  if (state.projects.length > 0) return;

  const p1 = {
    id: uid(),
    title: 'Echoes of the Forgotten City',
    type: 'movie',
    genre: 'Mystery / Drama',
    logline: 'A reclusive archivist discovers that the city she mapped no longer exists on any modern chart.',
    status: 'writing',
    createdAt: now(),
    updatedAt: now()
  };
  const p2 = {
    id: uid(),
    title: 'Night Bus to Nowhere',
    type: 'series',
    genre: 'Thriller',
    logline: 'Six strangers board a midnight bus. Only five get off. The sixth is still riding.',
    status: 'draft',
    createdAt: now(),
    updatedAt: now()
  };

  state.projects = [p1, p2];

  state.documents = [
    {
      id: uid(),
      projectId: p1.id,
      title: 'Act I – Opening Sequence',
      content: `<p>The rain had been falling for three days when Elena first noticed the map was wrong.</p>
<p>She stood in the archive basement, fluorescent lights humming overhead, and traced the faded blue lines of District 7 with a white glove. According to every official survey since 1989, District 7 ended at the river. According to the map she held — dated 1974 and stamped with a seal she had never seen before — District 7 continued for another eleven blocks into what was now open water.</p>
<p>Elena closed the drawer carefully. She did not yet know that the city had been rewriting itself for decades. She only knew that someone had tried very hard to make sure no one ever found this particular piece of paper.</p>`,
      updatedAt: now(),
      createdAt: now()
    },
    {
      id: uid(),
      projectId: p2.id,
      title: 'Episode 1 – Boarding',
      content: `<p>The bus smelled of diesel and old vinyl. Mara took the seat by the window, third row, because it was the only one that still had both armrests intact.</p>
<p>She counted five other passengers. A man in a raincoat who never looked up from his phone. A woman with a violin case. Two teenagers sharing earbuds. And someone in the back whose face stayed in shadow.</p>
<p>The driver checked his mirror once, then pulled away from the curb without asking for tickets.</p>`,
      updatedAt: now(),
      createdAt: now()
    }
  ];

  state.characters = [
    {
      id: uid(),
      name: 'Elena Voss',
      age: '42',
      role: 'Protagonist – Archivist',
      personality: 'Meticulous, quietly stubborn, emotionally reserved. Speaks precisely. Distrusts institutions but trusts paper.',
      background: 'Raised by her grandmother in the old port district. Lost her parents young. Has worked in the municipal archive for 18 years.',
      strengths: 'Photographic memory for spatial layouts. Patience. Integrity.',
      weaknesses: 'Difficulty asking for help. Tendency to isolate. Can be rigid.',
      goals: 'To understand what happened to District 7 — and why the official record erased it.',
      fears: 'That the truth will destroy the only life she knows. That she is already too late.',
      arc: 'Begins as a careful observer of the past. Becomes an active force who must decide whether to protect the lie or expose it.',
      appearance: 'Dark hair usually pinned back. Wire-rim glasses. Favors muted coats. Always carries a notebook.',
      createdAt: now(),
      updatedAt: now()
    },
    {
      id: uid(),
      name: 'Mara Chen',
      age: '29',
      role: 'Protagonist – Night Bus',
      personality: 'Sharp-tongued, observant, carries quiet grief. Humor as armor.',
      background: 'Former investigative journalist who left the city after a story went wrong. Returning for reasons she has not told anyone.',
      strengths: 'Reads people quickly. Resourceful under pressure.',
      weaknesses: 'Impulsive when cornered. Trust issues.',
      goals: 'To reach the end of the line and confront what she left behind.',
      fears: 'That the past is still waiting for her on the other side of the night.',
      arc: 'From someone running away to someone who chooses to stay and face the cost.',
      appearance: 'Short dark hair, worn leather jacket, always one bag too many.',
      createdAt: now(),
      updatedAt: now()
    }
  ];

  state.ideas = [
    {
      id: uid(),
      title: 'The map that lies',
      type: 'plot',
      description: 'What if every official map of a city is deliberately wrong in one small, consistent way — and only people who notice start disappearing?',
      tags: ['mystery', 'urban', 'conspiracy'],
      favourite: true,
      createdAt: now()
    },
    {
      id: uid(),
      title: 'Driver never speaks',
      type: 'character',
      description: 'The bus driver has not spoken in years. Passengers who try to talk to him hear only the engine. One night someone hears him whisper a name.',
      tags: ['thriller', 'supernatural'],
      favourite: false,
      createdAt: now()
    },
    {
      id: uid(),
      title: 'Rain as character',
      type: 'scene',
      description: 'A scene where the rain is so heavy it becomes a character — it hides, reveals, and forces people into proximity they would otherwise avoid.',
      tags: ['atmosphere', 'mood'],
      favourite: true,
      createdAt: now()
    }
  ];

  state.episodes = [
    {
      id: uid(),
      projectId: p2.id,
      number: 1,
      title: 'Boarding',
      description: 'Six strangers board the midnight bus. The driver does not collect fares.',
      status: 'draft',
      wordCount: 0,
      createdAt: now(),
      updatedAt: now()
    },
    {
      id: uid(),
      projectId: p2.id,
      number: 2,
      title: 'The Fifth Stop',
      description: 'One passenger is missing. No one remembers them getting off.',
      status: 'idea',
      wordCount: 0,
      createdAt: now(),
      updatedAt: now()
    }
  ];

  state.scenes = [
    {
      id: uid(),
      title: 'Archive Discovery',
      location: 'Municipal Archive – Basement',
      intExt: 'INT',
      time: 'NIGHT',
      tone: 'Quiet dread',
      description: 'Elena finds the 1974 map that contradicts every modern survey.',
      purpose: 'Inciting incident – the first crack in the official record.',
      createdAt: now()
    }
  ];

  state.dialogues = [
    {
      id: uid(),
      characterId: state.characters[0].id,
      characterName: 'Elena Voss',
      tone: 'Serious',
      scene: 'Archive – late night',
      text: 'Maps are supposed to be honest. This one is not. And someone made sure it survived when the others did not.',
      notes: 'Keep her voice measured. No panic yet.',
      createdAt: now()
    }
  ];

  state.notes = [
    {
      id: uid(),
      title: 'District 7 historical notes',
      category: 'research',
      content: 'Pre-1989 river course was different. Flood control projects in the early 90s. Several residential blocks were supposedly "relocated" but no relocation records exist in the public archive.',
      createdAt: now()
    }
  ];

  saveState();
}

// ---------- Navigation ----------
function navigate(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const target = document.getElementById(`view-${view}`);
  if (target) target.classList.add('active');

  const nav = document.querySelector(`.nav-item[data-view="${view}"]`);
  if (nav) nav.classList.add('active');

  // Render the view
  switch (view) {
    case 'dashboard': renderDashboard(); break;
    case 'projects': renderProjects(); break;
    case 'editor': prepareEditor(); break;
    case 'episodes': renderEpisodes(); break;
    case 'characters': renderCharacters(); break;
    case 'dialogues': renderDialogues(); break;
    case 'scenes': renderScenes(); break;
    case 'ideas': renderIdeas(); break;
    case 'notes': renderNotes(); break;
  }

  // Close mobile search focus etc.
  window.scrollTo(0, 0);
}

// ---------- Stats ----------
function updateStats() {
  const totalWords = state.documents.reduce((sum, d) => sum + wordCount(d.content || ''), 0);
  document.getElementById('statTotalWords').textContent = totalWords.toLocaleString();
  document.getElementById('statProjects').textContent = state.projects.length;
  document.getElementById('statCharacters').textContent = state.characters.length;
  document.getElementById('statIdeas').textContent = state.ideas.length;

  // Dashboard mirrors
  const dashWords = document.getElementById('dashTotalWords');
  const dashProj = document.getElementById('dashProjects');
  const dashChar = document.getElementById('dashCharacters');
  const dashIdeas = document.getElementById('dashIdeas');
  if (dashWords) dashWords.textContent = totalWords.toLocaleString();
  if (dashProj) dashProj.textContent = state.projects.length;
  if (dashChar) dashChar.textContent = state.characters.length;
  if (dashIdeas) dashIdeas.textContent = state.ideas.length;
}

// ---------- Dashboard ----------
function renderDashboard() {
  updateStats();

  // Recent projects
  const recent = [...state.projects]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6);

  const container = document.getElementById('recentProjects');
  if (recent.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 text-ink-400">
        <i class="fa-solid fa-folder-open text-4xl mb-3 opacity-40"></i>
        <p>No projects yet. Create your first story.</p>
        <button onclick="openNewProjectModal()" class="btn-primary mt-4">Create Project</button>
      </div>`;
  } else {
    container.innerHTML = recent.map(p => projectCardHTML(p)).join('');
  }

  // Recently edited docs
  const recentDocs = [...state.documents]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  const docsEl = document.getElementById('recentDocs');
  if (recentDocs.length === 0) {
    docsEl.innerHTML = `<div class="p-6 text-center text-ink-400 text-sm">No documents yet. Open the Writing Desk to start.</div>`;
  } else {
    docsEl.innerHTML = recentDocs.map(d => {
      const proj = state.projects.find(p => p.id === d.projectId);
      return `
        <div class="flex items-center gap-4 px-5 py-4 hover:bg-ink-50 cursor-pointer transition" onclick="openDocument('${d.id}')">
          <div class="w-10 h-10 rounded-xl bg-ink-100 flex items-center justify-center text-ink-500">
            <i class="fa-solid fa-file-lines"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-ink-900 truncate">${escapeHtml(d.title)}</p>
            <p class="text-xs text-ink-400">${proj ? escapeHtml(proj.title) : 'Unassigned'} · ${formatRelative(d.updatedAt)}</p>
          </div>
          <span class="text-xs text-ink-400 font-mono">${wordCount(d.content || '')} words</span>
        </div>`;
    }).join('');
  }

  // Ideas snapshot
  const ideasSnap = [...state.ideas]
    .sort((a, b) => (b.favourite ? 1 : 0) - (a.favourite ? 1 : 0) || new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const ideasEl = document.getElementById('ideasSnapshot');
  if (ideasSnap.length === 0) {
    ideasEl.innerHTML = `<div class="col-span-full text-center py-8 text-ink-400 text-sm">No ideas captured yet.</div>`;
  } else {
    ideasEl.innerHTML = ideasSnap.map(i => `
      <div class="idea-card ${i.favourite ? 'favourite' : ''}">
        <div class="flex items-start justify-between gap-2 mb-2">
          <h4 class="font-medium text-ink-900">${escapeHtml(i.title)}</h4>
          ${i.favourite ? '<i class="fa-solid fa-star text-amber-400 text-sm"></i>' : ''}
        </div>
        <p class="text-sm text-ink-500 line-clamp-2">${escapeHtml(i.description || '')}</p>
        <div class="mt-3 flex items-center gap-2">
          <span class="text-[10px] uppercase tracking-wide font-semibold text-ink-400">${i.type}</span>
        </div>
      </div>`).join('');
  }
}

function projectCardHTML(p) {
  const typeLabel = { movie: 'Movie', series: 'Series', story: 'Story' }[p.type] || p.type;
  const statusClass = `status-${p.status || 'draft'}`;
  return `
    <div class="project-card" onclick="openProject('${p.id}')">
      <div class="cover">
        <span class="type-badge">${typeLabel}</span>
        <div class="relative z-10 text-white">
          <h4 class="font-serif font-semibold text-lg leading-tight">${escapeHtml(p.title)}</h4>
        </div>
      </div>
      <div class="p-4">
        <p class="text-sm text-ink-500 line-clamp-2 mb-3">${escapeHtml(p.logline || 'No description yet.')}</p>
        <div class="flex items-center justify-between">
          <span class="status-pill ${statusClass}">${p.status || 'draft'}</span>
          <span class="text-xs text-ink-400">${formatRelative(p.updatedAt)}</span>
        </div>
      </div>
    </div>`;
}

function openProject(id) {
  // For now, open the first document of the project or create one
  const docs = state.documents.filter(d => d.projectId === id);
  if (docs.length > 0) {
    openDocument(docs[0].id);
  } else {
    navigate('editor');
    createNewDocument(id);
  }
}

// ---------- Projects View ----------
function renderProjects() {
  const filter = document.getElementById('projectFilter')?.value || 'all';
  let list = [...state.projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  if (filter !== 'all') list = list.filter(p => p.type === filter);

  const grid = document.getElementById('allProjectsGrid');
  if (list.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16 text-ink-400">
        <i class="fa-solid fa-folder-open text-5xl mb-4 opacity-30"></i>
        <p class="mb-4">No projects match this filter.</p>
        <button onclick="openNewProjectModal()" class="btn-primary">Create Project</button>
      </div>`;
  } else {
    grid.innerHTML = list.map(p => projectCardHTML(p)).join('');
  }
}

// ---------- Project Modal ----------
function openNewProjectModal() {
  document.getElementById('projectForm').reset();
  document.getElementById('projectModal').classList.remove('hidden');
}

function saveProject(e) {
  e.preventDefault();
  const project = {
    id: uid(),
    title: document.getElementById('projectTitle').value.trim(),
    type: document.getElementById('projectType').value,
    genre: document.getElementById('projectGenre').value.trim(),
    logline: document.getElementById('projectLogline').value.trim(),
    status: document.getElementById('projectStatus').value,
    createdAt: now(),
    updatedAt: now()
  };
  state.projects.unshift(project);
  saveState();
  closeModal('projectModal');
  toast('Project created');
  renderDashboard();
  renderProjects();
}

// ---------- Editor ----------
function prepareEditor() {
  const sel = document.getElementById('docSelector');
  sel.innerHTML = '<option value="">Select document...</option>' +
    state.documents
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map(d => {
        const proj = state.projects.find(p => p.id === d.projectId);
        return `<option value="${d.id}">${escapeHtml(d.title)}${proj ? ' — ' + escapeHtml(proj.title) : ''}</option>`;
      }).join('');

  if (state.currentDocId) {
    sel.value = state.currentDocId;
    loadDocument(state.currentDocId);
  } else if (state.documents.length > 0) {
    loadDocument(state.documents[0].id);
  } else {
    document.getElementById('docTitle').value = '';
    document.getElementById('editorArea').innerHTML = '';
    updateWordCount();
  }
}

function loadDocument(id) {
  if (!id) return;
  const doc = state.documents.find(d => d.id === id);
  if (!doc) return;

  state.currentDocId = id;
  document.getElementById('docTitle').value = doc.title || '';
  document.getElementById('editorArea').innerHTML = doc.content || '';
  document.getElementById('docSelector').value = id;
  state.isDirty = false;
  document.getElementById('saveStatus').textContent = 'All changes saved';
  updateWordCount();
}

function openDocument(id) {
  state.currentDocId = id;
  navigate('editor');
}

function createNewDocument(projectId = null) {
  const doc = {
    id: uid(),
    projectId: projectId || (state.projects[0]?.id || null),
    title: 'Untitled Document',
    content: '',
    createdAt: now(),
    updatedAt: now()
  };
  state.documents.unshift(doc);
  state.currentDocId = doc.id;
  saveState();
  prepareEditor();
  loadDocument(doc.id);
  toast('New document created');
}

function markDirty() {
  state.isDirty = true;
  document.getElementById('saveStatus').textContent = 'Unsaved changes';
}

function autoSave() {
  clearTimeout(state.autoSaveTimer);
  state.autoSaveTimer = setTimeout(() => {
    if (state.isDirty && state.currentDocId) {
      saveCurrentDocument(true);
    }
  }, 1800);
}

function saveCurrentDocument(silent = false) {
  if (!state.currentDocId) {
    // Create new if none
    createNewDocument();
    return;
  }
  const doc = state.documents.find(d => d.id === state.currentDocId);
  if (!doc) return;

  doc.title = document.getElementById('docTitle').value.trim() || 'Untitled Document';
  doc.content = document.getElementById('editorArea').innerHTML;
  doc.updatedAt = now();

  // Update parent project timestamp
  const proj = state.projects.find(p => p.id === doc.projectId);
  if (proj) proj.updatedAt = now();

  state.isDirty = false;
  saveState();
  document.getElementById('saveStatus').textContent = 'All changes saved · ' + formatRelative(doc.updatedAt);
  if (!silent) toast('Document saved');
  prepareEditor(); // refresh selector titles
}

function updateWordCount() {
  const html = document.getElementById('editorArea').innerHTML;
  const words = wordCount(html);
  const chars = charCount(html);
  document.getElementById('wordCount').textContent = words.toLocaleString() + ' words';
  document.getElementById('charCount').textContent = chars.toLocaleString() + ' characters';
}

function execCmd(cmd, value = null) {
  document.execCommand(cmd, false, value);
  document.getElementById('editorArea').focus();
  markDirty();
  updateWordCount();
}

function toggleFullscreenEditor() {
  const view = document.getElementById('view-editor');
  view.classList.toggle('editor-fullscreen');
  const icon = document.querySelector('[onclick="toggleFullscreenEditor()"] i');
  if (view.classList.contains('editor-fullscreen')) {
    icon.className = 'fa-solid fa-compress';
  } else {
    icon.className = 'fa-solid fa-expand';
  }
}

function toggleExportMenu() {
  document.getElementById('exportMenu').classList.toggle('hidden');
}

function exportDoc(format) {
  document.getElementById('exportMenu').classList.add('hidden');
  const title = document.getElementById('docTitle').value || 'Untitled';
  const content = document.getElementById('editorArea').innerText || '';

  if (format === 'txt') {
    const blob = new Blob([content], { type: 'text/plain' });
    downloadBlob(blob, `${title}.txt`);
    toast('Exported as TXT');
  } else if (format === 'pdf') {
    // Simple print-to-PDF approach
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>${escapeHtml(title)}</title>
      <style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;line-height:1.7;font-size:12pt;}
      h1{font-size:18pt;}</style></head>
      <body><h1>${escapeHtml(title)}</h1><pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(content)}</pre>
      <script>window.onload=()=>{window.print();}</script></body></html>`);
    printWindow.document.close();
    toast('Opening print dialog for PDF');
  } else if (format === 'docx') {
    // Minimal DOCX-like HTML download (users can open in Word)
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
      <head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
      <body><h1>${escapeHtml(title)}</h1>${document.getElementById('editorArea').innerHTML}</body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    downloadBlob(blob, `${title}.doc`);
    toast('Exported as DOC (open in Word)');
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- Characters ----------
function renderCharacters() {
  const grid = document.getElementById('charactersGrid');
  if (state.characters.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16 text-ink-400">
        <i class="fa-solid fa-users text-5xl mb-4 opacity-30"></i>
        <p class="mb-4">No characters yet. Bring your first one to life.</p>
        <button onclick="openCharacterModal()" class="btn-primary">New Character</button>
      </div>`;
    return;
  }

  grid.innerHTML = state.characters.map(c => `
    <div class="character-card" onclick="openCharDrawer('${c.id}')">
      <div class="flex items-center gap-3 mb-3">
        <div class="avatar-circle">${(c.name || '?')[0].toUpperCase()}</div>
        <div class="min-w-0">
          <h4 class="font-semibold text-ink-900 truncate">${escapeHtml(c.name)}</h4>
          <p class="text-xs text-ink-400 truncate">${escapeHtml(c.role || '')}</p>
        </div>
      </div>
      <p class="text-sm text-ink-500 line-clamp-3">${escapeHtml(c.personality || c.background || 'No details yet.')}</p>
      ${c.age ? `<p class="text-xs text-ink-400 mt-3">Age ${escapeHtml(c.age)}</p>` : ''}
    </div>`).join('');
}

function openCharacterModal(id = null) {
  document.getElementById('characterForm').reset();
  document.getElementById('charId').value = '';
  document.getElementById('charModalTitle').textContent = 'New Character';

  if (id) {
    const c = state.characters.find(x => x.id === id);
    if (c) {
      document.getElementById('charId').value = c.id;
      document.getElementById('charModalTitle').textContent = 'Edit Character';
      document.getElementById('charName').value = c.name || '';
      document.getElementById('charAge').value = c.age || '';
      document.getElementById('charRole').value = c.role || '';
      document.getElementById('charPersonality').value = c.personality || '';
      document.getElementById('charBackground').value = c.background || '';
      document.getElementById('charStrengths').value = c.strengths || '';
      document.getElementById('charWeaknesses').value = c.weaknesses || '';
      document.getElementById('charGoals').value = c.goals || '';
      document.getElementById('charFears').value = c.fears || '';
      document.getElementById('charArc').value = c.arc || '';
      document.getElementById('charAppearance').value = c.appearance || '';
    }
  }
  document.getElementById('characterModal').classList.remove('hidden');
}

function saveCharacter(e) {
  e.preventDefault();
  const id = document.getElementById('charId').value;
  const data = {
    name: document.getElementById('charName').value.trim(),
    age: document.getElementById('charAge').value.trim(),
    role: document.getElementById('charRole').value.trim(),
    personality: document.getElementById('charPersonality').value.trim(),
    background: document.getElementById('charBackground').value.trim(),
    strengths: document.getElementById('charStrengths').value.trim(),
    weaknesses: document.getElementById('charWeaknesses').value.trim(),
    goals: document.getElementById('charGoals').value.trim(),
    fears: document.getElementById('charFears').value.trim(),
    arc: document.getElementById('charArc').value.trim(),
    appearance: document.getElementById('charAppearance').value.trim(),
    updatedAt: now()
  };

  if (id) {
    const idx = state.characters.findIndex(c => c.id === id);
    if (idx >= 0) state.characters[idx] = { ...state.characters[idx], ...data };
  } else {
    state.characters.unshift({ id: uid(), ...data, createdAt: now() });
  }
  saveState();
  closeModal('characterModal');
  toast(id ? 'Character updated' : 'Character created');
  renderCharacters();
  updateStats();
}

function openCharDrawer(id) {
  const c = state.characters.find(x => x.id === id);
  if (!c) return;
  window._drawerCharId = id;

  document.getElementById('drawerCharName').textContent = c.name;
  document.getElementById('drawerCharContent').innerHTML = `
    ${fieldBlock('Role', c.role)}
    ${fieldBlock('Age', c.age)}
    ${fieldBlock('Personality', c.personality)}
    ${fieldBlock('Background', c.background)}
    ${fieldBlock('Strengths', c.strengths)}
    ${fieldBlock('Weaknesses', c.weaknesses)}
    ${fieldBlock('Goals & Motivations', c.goals)}
    ${fieldBlock('Fears & Secrets', c.fears)}
    ${fieldBlock('Character Arc', c.arc)}
    ${fieldBlock('Appearance', c.appearance)}
  `;

  document.getElementById('charDetailDrawer').classList.remove('translate-x-full');
  document.getElementById('drawerOverlay').classList.remove('hidden');
}

function fieldBlock(label, value) {
  if (!value) return '';
  return `<div><p class="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-1">${label}</p><p class="text-ink-800 whitespace-pre-wrap">${escapeHtml(value)}</p></div>`;
}

function closeCharDrawer() {
  document.getElementById('charDetailDrawer').classList.add('translate-x-full');
  document.getElementById('drawerOverlay').classList.add('hidden');
}

function editCharacterFromDrawer() {
  closeCharDrawer();
  openCharacterModal(window._drawerCharId);
}

function deleteCharacterFromDrawer() {
  if (!confirm('Delete this character?')) return;
  state.characters = state.characters.filter(c => c.id !== window._drawerCharId);
  saveState();
  closeCharDrawer();
  toast('Character deleted');
  renderCharacters();
  updateStats();
}

// ---------- Ideas ----------
let ideaFilter = 'all';

function filterIdeas(type) {
  ideaFilter = type;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  document.querySelector(`.filter-chip[data-filter="${type}"]`)?.classList.add('active');
  renderIdeas();
}

function renderIdeas() {
  let list = [...state.ideas].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (ideaFilter === 'favourite') list = list.filter(i => i.favourite);
  else if (ideaFilter !== 'all') list = list.filter(i => i.type === ideaFilter);

  const grid = document.getElementById('ideasGrid');
  if (list.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16 text-ink-400">
        <i class="fa-solid fa-lightbulb text-5xl mb-4 opacity-30"></i>
        <p class="mb-4">No ideas here yet. Capture one while it's hot.</p>
        <button onclick="openIdeaModal()" class="btn-primary">Capture Idea</button>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(i => `
    <div class="idea-card ${i.favourite ? 'favourite' : ''}">
      <div class="flex items-start justify-between gap-2 mb-2">
        <h4 class="font-medium text-ink-900">${escapeHtml(i.title)}</h4>
        <button onclick="event.stopPropagation(); toggleFavourite('${i.id}')" class="text-ink-300 hover:text-amber-400 transition">
          <i class="fa-${i.favourite ? 'solid' : 'regular'} fa-star"></i>
        </button>
      </div>
      <p class="text-sm text-ink-500 line-clamp-4 mb-3">${escapeHtml(i.description || '')}</p>
      <div class="flex items-center justify-between">
        <span class="text-[10px] uppercase tracking-wide font-semibold text-ink-400">${i.type}</span>
        <div class="flex gap-2">
          <button onclick="convertIdeaToProject('${i.id}')" class="text-xs text-accent hover:underline" title="Convert to project">→ Project</button>
          <button onclick="deleteIdea('${i.id}')" class="text-xs text-ink-400 hover:text-red-500"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
      ${i.tags && i.tags.length ? `<div class="mt-2 flex flex-wrap gap-1">${i.tags.map(t => `<span class="text-[10px] px-1.5 py-0.5 bg-ink-100 rounded text-ink-500">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
    </div>`).join('');
}

function openIdeaModal() {
  document.getElementById('ideaForm').reset();
  document.getElementById('ideaModal').classList.remove('hidden');
}

function saveIdea(e) {
  e.preventDefault();
  const tagsRaw = document.getElementById('ideaTags').value;
  const idea = {
    id: uid(),
    title: document.getElementById('ideaTitle').value.trim(),
    type: document.getElementById('ideaType').value,
    description: document.getElementById('ideaDesc').value.trim(),
    tags: tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
    favourite: document.getElementById('ideaFavourite').checked,
    createdAt: now()
  };
  state.ideas.unshift(idea);
  saveState();
  closeModal('ideaModal');
  toast('Idea captured');
  renderIdeas();
  updateStats();
}

function toggleFavourite(id) {
  const idea = state.ideas.find(i => i.id === id);
  if (idea) {
    idea.favourite = !idea.favourite;
    saveState();
    renderIdeas();
  }
}

function deleteIdea(id) {
  if (!confirm('Delete this idea?')) return;
  state.ideas = state.ideas.filter(i => i.id !== id);
  saveState();
  toast('Idea deleted');
  renderIdeas();
  updateStats();
}

function convertIdeaToProject(id) {
  const idea = state.ideas.find(i => i.id === id);
  if (!idea) return;
  const project = {
    id: uid(),
    title: idea.title,
    type: 'story',
    genre: '',
    logline: idea.description || '',
    status: 'idea',
    createdAt: now(),
    updatedAt: now()
  };
  state.projects.unshift(project);
  saveState();
  toast('Idea converted to project');
  navigate('projects');
}

// ---------- Episodes ----------
function renderEpisodes() {
  // Populate project filter
  const sel = document.getElementById('episodeProjectFilter');
  const current = sel.value;
  sel.innerHTML = '<option value="">All Projects</option>' +
    state.projects.filter(p => p.type === 'series' || p.type === 'story')
      .map(p => `<option value="${p.id}">${escapeHtml(p.title)}</option>`).join('');
  sel.value = current;

  let list = [...state.episodes].sort((a, b) => (a.number || 0) - (b.number || 0));
  if (current) list = list.filter(e => e.projectId === current);

  const container = document.getElementById('episodesList');
  if (list.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 text-ink-400">
        <i class="fa-solid fa-clapperboard text-5xl mb-4 opacity-30"></i>
        <p class="mb-4">No episodes yet.</p>
        <button onclick="openEpisodeModal()" class="btn-primary">New Episode</button>
      </div>`;
    return;
  }

  container.innerHTML = list.map(ep => {
    const proj = state.projects.find(p => p.id === ep.projectId);
    return `
      <div class="list-row">
        <div class="w-12 h-12 rounded-xl bg-ink-100 flex items-center justify-center font-serif font-semibold text-ink-600">
          ${ep.number || '–'}
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-ink-900">${escapeHtml(ep.title)}</h4>
          <p class="text-sm text-ink-500 truncate">${escapeHtml(ep.description || '')}</p>
          <p class="text-xs text-ink-400 mt-0.5">${proj ? escapeHtml(proj.title) : ''}</p>
        </div>
        <span class="status-pill status-${ep.status || 'idea'}">${ep.status || 'idea'}</span>
      </div>`;
  }).join('');
}

function openEpisodeModal() {
  document.getElementById('episodeForm').reset();
  const sel = document.getElementById('episodeProject');
  sel.innerHTML = state.projects.map(p => `<option value="${p.id}">${escapeHtml(p.title)}</option>`).join('');
  document.getElementById('episodeModal').classList.remove('hidden');
}

function saveEpisode(e) {
  e.preventDefault();
  const ep = {
    id: uid(),
    projectId: document.getElementById('episodeProject').value,
    number: parseInt(document.getElementById('episodeNumber').value) || 1,
    title: document.getElementById('episodeTitle').value.trim(),
    description: document.getElementById('episodeDesc').value.trim(),
    status: document.getElementById('episodeStatus').value,
    wordCount: 0,
    createdAt: now(),
    updatedAt: now()
  };
  state.episodes.push(ep);
  saveState();
  closeModal('episodeModal');
  toast('Episode created');
  renderEpisodes();
}

// ---------- Scenes ----------
function renderScenes() {
  const container = document.getElementById('scenesList');
  if (state.scenes.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 text-ink-400">
        <i class="fa-solid fa-film text-5xl mb-4 opacity-30"></i>
        <p class="mb-4">No scenes yet. Build your story beat by beat.</p>
        <button onclick="openSceneModal()" class="btn-primary">New Scene</button>
      </div>`;
    return;
  }

  container.innerHTML = state.scenes.map((s, idx) => `
    <div class="list-row">
      <div class="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center text-sm font-mono text-ink-500">
        ${idx + 1}
      </div>
      <div class="flex-1 min-w-0">
        <h4 class="font-medium text-ink-900">${escapeHtml(s.title)}</h4>
        <p class="text-sm text-ink-500">
          <span class="font-mono text-xs">${s.intExt || ''} ${escapeHtml(s.location || '')} – ${s.time || ''}</span>
          ${s.tone ? ' · ' + escapeHtml(s.tone) : ''}
        </p>
        <p class="text-xs text-ink-400 mt-0.5 line-clamp-1">${escapeHtml(s.description || '')}</p>
      </div>
      <button onclick="deleteScene('${s.id}')" class="p-2 text-ink-300 hover:text-red-500"><i class="fa-solid fa-trash text-sm"></i></button>
    </div>`).join('');
}

function openSceneModal() {
  document.getElementById('sceneForm').reset();
  document.getElementById('sceneModal').classList.remove('hidden');
}

function saveScene(e) {
  e.preventDefault();
  const scene = {
    id: uid(),
    title: document.getElementById('sceneTitle').value.trim(),
    location: document.getElementById('sceneLocation').value.trim(),
    intExt: document.getElementById('sceneIntExt').value,
    time: document.getElementById('sceneTime').value,
    tone: document.getElementById('sceneTone').value.trim(),
    description: document.getElementById('sceneDesc').value.trim(),
    purpose: document.getElementById('scenePurpose').value.trim(),
    createdAt: now()
  };
  state.scenes.push(scene);
  saveState();
  closeModal('sceneModal');
  toast('Scene created');
  renderScenes();
}

function deleteScene(id) {
  if (!confirm('Delete this scene?')) return;
  state.scenes = state.scenes.filter(s => s.id !== id);
  saveState();
  toast('Scene deleted');
  renderScenes();
}

// ---------- Dialogues ----------
function renderDialogues() {
  const container = document.getElementById('dialoguesList');
  if (state.dialogues.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 text-ink-400">
        <i class="fa-solid fa-comments text-5xl mb-4 opacity-30"></i>
        <p class="mb-4">No dialogues yet. Write the words that define your characters.</p>
        <button onclick="openDialogueModal()" class="btn-primary">New Dialogue</button>
      </div>`;
    return;
  }

  container.innerHTML = state.dialogues.map(d => `
    <div class="bg-white rounded-2xl border border-ink-200 p-5">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="font-semibold text-ink-900 uppercase tracking-wide text-sm">${escapeHtml(d.characterName || 'Unknown')}</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-ink-100 text-ink-500">${escapeHtml(d.tone || '')}</span>
        </div>
        <button onclick="deleteDialogue('${d.id}')" class="text-ink-300 hover:text-red-500 text-sm"><i class="fa-solid fa-trash"></i></button>
      </div>
      <p class="font-mono text-[15px] leading-relaxed text-ink-800 whitespace-pre-wrap">${escapeHtml(d.text)}</p>
      ${d.scene ? `<p class="text-xs text-ink-400 mt-3 italic">${escapeHtml(d.scene)}</p>` : ''}
      ${d.notes ? `<p class="text-xs text-ink-500 mt-1">${escapeHtml(d.notes)}</p>` : ''}
    </div>`).join('');
}

function openDialogueModal() {
  document.getElementById('dialogueForm').reset();
  const sel = document.getElementById('dialogueCharacter');
  sel.innerHTML = state.characters.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('') ||
    '<option value="">No characters yet</option>';
  document.getElementById('dialogueModal').classList.remove('hidden');
}

function saveDialogue(e) {
  e.preventDefault();
  const charId = document.getElementById('dialogueCharacter').value;
  const char = state.characters.find(c => c.id === charId);
  const d = {
    id: uid(),
    characterId: charId,
    characterName: char ? char.name : 'Unknown',
    tone: document.getElementById('dialogueTone').value,
    scene: document.getElementById('dialogueScene').value.trim(),
    text: document.getElementById('dialogueText').value.trim(),
    notes: document.getElementById('dialogueNotes').value.trim(),
    createdAt: now()
  };
  state.dialogues.unshift(d);
  saveState();
  closeModal('dialogueModal');
  toast('Dialogue saved');
  renderDialogues();
}

function deleteDialogue(id) {
  if (!confirm('Delete this dialogue?')) return;
  state.dialogues = state.dialogues.filter(d => d.id !== id);
  saveState();
  toast('Dialogue deleted');
  renderDialogues();
}

// ---------- Notes ----------
function renderNotes() {
  const container = document.getElementById('notesList');
  if (state.notes.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 text-ink-400">
        <i class="fa-solid fa-book-open text-5xl mb-4 opacity-30"></i>
        <p class="mb-4">No notes yet. Capture research, world-building, or stray thoughts.</p>
        <button onclick="openNoteModal()" class="btn-primary">New Note</button>
      </div>`;
    return;
  }

  container.innerHTML = state.notes.map(n => `
    <div class="list-row">
      <div class="w-10 h-10 rounded-xl bg-ink-100 flex items-center justify-center text-ink-500">
        <i class="fa-solid fa-sticky-note"></i>
      </div>
      <div class="flex-1 min-w-0">
        <h4 class="font-medium text-ink-900">${escapeHtml(n.title)}</h4>
        <p class="text-sm text-ink-500 line-clamp-2">${escapeHtml(n.content || '')}</p>
        <p class="text-xs text-ink-400 mt-0.5 capitalize">${n.category} · ${formatRelative(n.createdAt)}</p>
      </div>
      <button onclick="deleteNote('${n.id}')" class="p-2 text-ink-300 hover:text-red-500"><i class="fa-solid fa-trash text-sm"></i></button>
    </div>`).join('');
}

function openNoteModal() {
  document.getElementById('noteForm').reset();
  document.getElementById('noteModal').classList.remove('hidden');
}

function saveNote(e) {
  e.preventDefault();
  const note = {
    id: uid(),
    title: document.getElementById('noteTitle').value.trim(),
    category: document.getElementById('noteCategory').value,
    content: document.getElementById('noteContent').value.trim(),
    createdAt: now()
  };
  state.notes.unshift(note);
  saveState();
  closeModal('noteModal');
  toast('Note saved');
  renderNotes();
}

function deleteNote(id) {
  if (!confirm('Delete this note?')) return;
  state.notes = state.notes.filter(n => n.id !== id);
  saveState();
  toast('Note deleted');
  renderNotes();
}

// ---------- Search ----------
function handleGlobalSearch(q) {
  // Simple client-side search – for a full app we would navigate to results
  // For now we just log; could expand to a results panel
  if (!q || q.length < 2) return;
  // Future: show a dropdown of matches
}

// ---------- Theme ----------
function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  state.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  saveState();
}

// ---------- Modal helpers ----------
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

// ---------- Escape ----------
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  seedIfEmpty();

  if (state.theme === 'dark') {
    document.documentElement.classList.add('dark');
  }

  updateStats();
  navigate('dashboard');

  // Close export menu on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[onclick="toggleExportMenu()"]') && !e.target.closest('#exportMenu')) {
      document.getElementById('exportMenu')?.classList.add('hidden');
    }
  });

  // Keyboard shortcut: Ctrl/Cmd + S to save
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (document.getElementById('view-editor').classList.contains('active')) {
        saveCurrentDocument();
      }
    }
  });
});

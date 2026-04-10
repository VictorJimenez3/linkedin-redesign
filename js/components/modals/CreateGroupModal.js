/* ============================================================
   CREATEGROUPMODAL.JS — Create a new group
   ============================================================ */
function CreateGroupModal() {
  const { closeModal, joinGroup, showToast } = React.useContext(AppContext);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    privacy: 'Public',
    category: 'Technology',
  });

  function update(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function handleSave() {
    if (!form.name.trim()) { showToast('Group name is required', 'error'); return; }
    if (saving) return;
    setSaving(true);
    API.createGroup({
      name: form.name.trim(),
      description: form.description.trim(),
      privacy: form.privacy,
      category: form.category,
    })
      .then(newGroup => {
        joinGroup(String(newGroup.id));
        showToast(`Group "${newGroup.name}" created!`, 'success');
        closeModal();
      })
      .catch(() => {
        showToast('Failed to create group', 'error');
        setSaving(false);
      });
  }

  return (
    <div className="li-modal-overlay" style={{ display: 'flex' }}
      onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
      <div className="li-modal li-modal--lg">
        <div className="li-modal__header">
          <span className="li-modal__title">Create group</span>
          <button className="li-modal__close" onClick={closeModal}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div className="li-modal__body">
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Group name *</label>
            <input className="li-settings-input" value={form.name} onChange={e => update('name', e.target.value)} style={{ width: '100%' }} placeholder="e.g. Frontend Developers Network" maxLength={100} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Description</label>
            <textarea className="li-settings-input" value={form.description} onChange={e => update('description', e.target.value)} style={{ width: '100%', minHeight: 72, resize: 'vertical' }} placeholder="What is this group about?" maxLength={500} />
          </div>
          <div className="li-settings-form-row">
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Privacy</label>
              <select className="li-settings-input" style={{ width: '100%' }} value={form.privacy} onChange={e => update('privacy', e.target.value)}>
                {['Public', 'Private'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Category</label>
              <select className="li-settings-input" style={{ width: '100%' }} value={form.category} onChange={e => update('category', e.target.value)}>
                {['Technology', 'Product', 'Design', 'Marketing', 'Finance', 'Entrepreneurship', 'Alumni', 'Lifestyle', 'Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="li-modal__footer">
          <button className="li-btn li-btn--ghost li-btn--sm" onClick={closeModal}>Cancel</button>
          <button className="li-btn li-btn--primary li-btn--sm" onClick={handleSave} disabled={saving}>{saving ? 'Creating…' : 'Create group'}</button>
        </div>
      </div>
    </div>
  );
}

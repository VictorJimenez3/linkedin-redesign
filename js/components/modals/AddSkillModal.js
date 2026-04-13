/* ============================================================
   ADDSKILLMODAL.JS — Add a skill to the user's profile
   ============================================================ */
function AddSkillModal() {
  const { closeModal, currentUser, setCurrentUser, showToast } = React.useContext(AppContext);
  const [saving, setSaving] = React.useState(false);
  const [skill, setSkill] = React.useState('');

  const existingSkills = (currentUser && currentUser.skills) ? currentUser.skills.map(s => typeof s === 'string' ? s : s.name) : [];

  function handleSave() {
    const trimmed = skill.trim();
    if (!trimmed) { showToast('Skill name is required', 'error'); return; }
    if (existingSkills.includes(trimmed)) { showToast('You already have this skill', 'info'); return; }
    if (saving) return;
    setSaving(true);
    API.addSkill(trimmed)
      .then(updated => {
        setCurrentUser(updated);
        showToast('Skill added!', 'success');
        closeModal();
      })
      .catch(() => {
        showToast('Failed to save skill', 'error');
        setSaving(false);
      });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave();
  }

  return (
    <div className="li-modal-overlay" style={{ display: 'flex' }}
      onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
      <div className="li-modal">
        <div className="li-modal__header">
          <span className="li-modal__title">Add skill</span>
          <button className="li-modal__close" onClick={closeModal}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div className="li-modal__body">
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Skill *</label>
            <input
              className="li-settings-input"
              value={skill}
              onChange={e => setSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ width: '100%' }}
              placeholder="e.g. React, Python, Project Management"
              autoFocus
            />
          </div>
          {existingSkills.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
              <span style={{ fontWeight: 600 }}>Your skills: </span>
              {existingSkills.slice(0, 8).join(', ')}{existingSkills.length > 8 ? '…' : ''}
            </div>
          )}
        </div>
        <div className="li-modal__footer">
          <button className="li-btn li-btn--ghost li-btn--sm" onClick={closeModal}>Cancel</button>
          <button className="li-btn li-btn--primary li-btn--sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Add skill'}</button>
        </div>
      </div>
    </div>
  );
}

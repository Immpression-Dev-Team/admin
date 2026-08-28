import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "@/context/authContext";
import "@/styles/referrals.css";

const API_URL = import.meta.env.VITE_API_URL;

const EMPTY_FORM = { name: "", internalLabel: "" };

function Referrals() {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const token = authState?.token;

  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token]);

  useEffect(() => { fetchReferrals(); }, []);

  async function fetchReferrals() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/referrals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setReferrals(data.data);
    } catch { setError("Failed to load referrals."); }
    finally { setLoading(false); }
  }

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); setError(""); }

  function openEdit(r) {
    setForm({ name: r.name, internalLabel: r.internalLabel || "" });
    setEditId(r._id); setShowForm(true); setError("");
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true); setError("");
    try {
      const url = editId ? `${API_URL}/api/admin/referrals/${editId}` : `${API_URL}/api/admin/referrals`;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Save failed");
      setShowForm(false); fetchReferrals();
    } catch (err) { setError(err.message || "Save failed."); }
    finally { setSaving(false); }
  }

  async function handleRegenerate(id) {
    if (!window.confirm("Regenerate this referral's code? The old link will keep redirecting here, but the code shown will change.")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/referrals/${id}/regenerate`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) fetchReferrals();
      else setError(data.error || "Regenerate failed.");
    } catch { setError("Regenerate failed."); }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this referral? Its invite link (and any older regenerated links) will stop working.")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/referrals/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) fetchReferrals();
      else setError(data.error || "Delete failed.");
    } catch { setError("Delete failed."); }
  }

  async function handleCopy(id, url) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500);
    } catch { setError("Could not copy link."); }
  }

  return (
    <ScreenTemplate>
      <div className="ref-page">
        <header className="ref-header">
          <div>
            <h1 className="ref-title">Referrals</h1>
            <p className="ref-subtitle">Manage private invite links. Names are never shown on the public page or URL.</p>
          </div>
          <button className="ref-add-btn" onClick={openAdd}>+ New Referral</button>
        </header>

        {error && <div className="ref-error">{error}</div>}

        {showForm && (
          <div className="ref-form-card">
            <h2 className="ref-form-title">{editId ? "Edit Referral" : "New Referral"}</h2>
            <form className="ref-form" onSubmit={handleSave}>
              <div className="ref-form-row">
                <label>Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Brandon" />
              </div>
              <div className="ref-form-row">
                <label>Internal Label</label>
                <input value={form.internalLabel} onChange={(e) => setForm({ ...form, internalLabel: e.target.value })} placeholder="Brandon Outreach" />
              </div>
              {error && <div className="ref-error">{error}</div>}
              <div className="ref-form-actions">
                <button type="button" className="ref-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="ref-btn-save" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="ref-loading">Loading…</div>
        ) : referrals.length === 0 ? (
          <div className="ref-empty">No referrals yet. Click "New Referral" to get started.</div>
        ) : (
          <div className="ref-list">
            {referrals.map((r) => (
              <div key={r._id} className="ref-row">
                <div className="ref-row-info">
                  <span className="ref-row-label">{r.internalLabel || r.name}</span>
                  <span className="ref-row-name">{r.name}</span>
                  <a href={r.publicUrl} target="_blank" rel="noopener noreferrer" className="ref-row-url">{r.publicUrl}</a>
                  <span className="ref-row-date">Created {new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                </div>
                <div className="ref-row-actions">
                  <button className="ref-btn-copy" onClick={() => handleCopy(r._id, r.publicUrl)}>{copiedId === r._id ? "Copied!" : "Copy Link"}</button>
                  <button className="ref-btn-edit" onClick={() => openEdit(r)}>Edit</button>
                  <button className="ref-btn-regenerate" onClick={() => handleRegenerate(r._id)}>Regenerate Code</button>
                  <button className="ref-btn-delete" onClick={() => handleDelete(r._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScreenTemplate>
  );
}

export default Referrals;

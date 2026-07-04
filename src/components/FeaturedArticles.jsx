import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "@/context/authContext";
import "@/styles/featuredArticles.css";

const API_URL = import.meta.env.VITE_API_URL;

const EMPTY_FORM = { title: "", url: "", imageUrl: "", publication: "", publishedAt: "", order: "0" };

function FeaturedArticles() {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const token = authState?.token;

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchArticles();
  }, [token]);

  async function fetchArticles() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/articles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setArticles(data.data);
    } catch {
      setError("Failed to load articles.");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
    setError("");
  }

  function openEdit(article) {
    setForm({
      title: article.title,
      url: article.url,
      imageUrl: article.imageUrl,
      publication: article.publication || "",
      publishedAt: article.publishedAt ? article.publishedAt.slice(0, 10) : "",
      order: String(article.order ?? 0),
    });
    setEditId(article._id);
    setShowForm(true);
    setError("");
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title || !form.url || !form.imageUrl || !form.publishedAt) {
      setError("Title, URL, image URL, and date are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = { ...form, order: parseInt(form.order) || 0 };
      const url = editId
        ? `${API_URL}/api/admin/articles/${editId}`
        : `${API_URL}/api/admin/articles`;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Save failed");
      setShowForm(false);
      fetchArticles();
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this article?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/articles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) fetchArticles();
      else setError(data.error || "Delete failed.");
    } catch {
      setError("Delete failed.");
    }
  }

  return (
    <ScreenTemplate>
      <div className="fa-page">
        <header className="fa-header">
          <div>
            <h1 className="fa-title">Featured Articles</h1>
            <p className="fa-subtitle">Blog posts and guest features shown on the landing page</p>
          </div>
          <button className="fa-add-btn" onClick={openAdd}>+ Add Article</button>
        </header>

        {error && <div className="fa-error">{error}</div>}

        {showForm && (
          <div className="fa-form-card">
            <h2 className="fa-form-title">{editId ? "Edit Article" : "New Article"}</h2>
            <form className="fa-form" onSubmit={handleSave}>
              <div className="fa-form-row">
                <label>Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Article headline" />
              </div>
              <div className="fa-form-row">
                <label>Article URL *</label>
                <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="fa-form-row">
                <label>Cover Image URL *</label>
                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://... (image link)" />
              </div>
              <div className="fa-form-two-col">
                <div className="fa-form-row">
                  <label>Publication</label>
                  <input value={form.publication} onChange={(e) => setForm({ ...form, publication: e.target.value })} placeholder="Forbes, TechCrunch…" />
                </div>
                <div className="fa-form-row">
                  <label>Published Date *</label>
                  <input type="date" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} />
                </div>
              </div>
              <div className="fa-form-row fa-form-row-narrow">
                <label>Display Order</label>
                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} min="0" />
              </div>
              {form.imageUrl && (
                <div className="fa-preview">
                  <img src={form.imageUrl} alt="preview" onError={(e) => { e.target.style.display = "none"; }} />
                </div>
              )}
              {error && <div className="fa-error">{error}</div>}
              <div className="fa-form-actions">
                <button type="button" className="fa-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="fa-btn-save" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="fa-loading">Loading…</div>
        ) : articles.length === 0 ? (
          <div className="fa-empty">No articles yet. Click "Add Article" to get started.</div>
        ) : (
          <div className="fa-list">
            {articles.map((a) => (
              <div key={a._id} className="fa-row">
                <img
                  src={a.imageUrl}
                  alt={a.title}
                  className="fa-row-img"
                  onError={(e) => { e.target.src = ""; e.target.style.display = "none"; }}
                />
                <div className="fa-row-info">
                  <span className="fa-row-pub">{a.publication || "—"}</span>
                  <span className="fa-row-title">{a.title}</span>
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="fa-row-url">{a.url}</a>
                  <span className="fa-row-date">{new Date(a.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                </div>
                <div className="fa-row-actions">
                  <button className="fa-btn-edit" onClick={() => openEdit(a)}>Edit</button>
                  <button className="fa-btn-delete" onClick={() => handleDelete(a._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScreenTemplate>
  );
}

export default FeaturedArticles;

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "@/context/authContext";
import "@/styles/featuredArticles.css";

const API_URL = import.meta.env.VITE_API_URL;

/* ─── Press (guest posts) ─────────────────────────────── */
const EMPTY_PRESS = { title: "", url: "", imageUrl: "", publication: "", publishedAt: "", order: "0" };

function PressTab({ token }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_PRESS);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchArticles(); }, []);

  async function fetchArticles() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/articles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setArticles(data.data);
    } catch { setError("Failed to load articles."); }
    finally { setLoading(false); }
  }

  function openAdd() { setForm(EMPTY_PRESS); setEditId(null); setShowForm(true); setError(""); }

  function openEdit(a) {
    setForm({
      title: a.title, url: a.url, imageUrl: a.imageUrl,
      publication: a.publication || "",
      publishedAt: a.publishedAt ? a.publishedAt.slice(0, 10) : "",
      order: String(a.order ?? 0),
    });
    setEditId(a._id); setShowForm(true); setError("");
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title || !form.url || !form.imageUrl || !form.publishedAt) {
      setError("Title, URL, image URL, and date are required."); return;
    }
    setSaving(true); setError("");
    try {
      const body = { ...form, order: parseInt(form.order) || 0 };
      const url = editId ? `${API_URL}/api/admin/articles/${editId}` : `${API_URL}/api/admin/articles`;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Save failed");
      setShowForm(false); fetchArticles();
    } catch (err) { setError(err.message || "Save failed."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this article?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/articles/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) fetchArticles();
      else setError(data.error || "Delete failed.");
    } catch { setError("Delete failed."); }
  }

  return (
    <div>
      <div className="fa-tab-toolbar">
        <p className="fa-tab-desc">External articles and guest posts shown on the landing page.</p>
        <button className="fa-add-btn" onClick={openAdd}>+ Add Article</button>
      </div>

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
              <img src={a.imageUrl} alt={a.title} className="fa-row-img" onError={(e) => { e.target.src = ""; e.target.style.display = "none"; }} />
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
  );
}

/* ─── Blog posts ──────────────────────────────────────── */
const EMPTY_POST = { title: "", coverImageUrl: "", body: "", published: false };

function PostsTab({ token }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_POST);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/blog`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setPosts(data.data);
    } catch { setError("Failed to load posts."); }
    finally { setLoading(false); }
  }

  function openAdd() { setForm(EMPTY_POST); setEditId(null); setShowForm(true); setError(""); setPreview(false); }

  function openEdit(p) {
    setForm({ title: p.title, coverImageUrl: p.coverImageUrl, body: p.body, published: p.published });
    setEditId(p._id); setShowForm(true); setError(""); setPreview(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title || !form.body || !form.coverImageUrl) {
      setError("Title, cover image URL, and body are required."); return;
    }
    setSaving(true); setError("");
    try {
      const url = editId ? `${API_URL}/api/admin/blog/${editId}` : `${API_URL}/api/admin/blog`;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Save failed");
      setShowForm(false); fetchPosts();
    } catch (err) { setError(err.message || "Save failed."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this post?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/blog/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) fetchPosts();
      else setError(data.error || "Delete failed.");
    } catch { setError("Delete failed."); }
  }

  function wrapSelection(before, after = "") {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.substring(start, end);
    const newBody = ta.value.substring(0, start) + before + selected + after + ta.value.substring(end);
    setForm((f) => ({ ...f, body: newBody }));
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  }

  function insertAtLineStart(prefix) {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = ta.value.lastIndexOf("\n", start - 1) + 1;
    const newBody = ta.value.substring(0, lineStart) + prefix + ta.value.substring(lineStart);
    setForm((f) => ({ ...f, body: newBody }));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + prefix.length, start + prefix.length); }, 0);
  }

  const toolbar = [
    { label: "B", title: "Bold",       action: () => wrapSelection("**", "**") },
    { label: "I", title: "Italic",     action: () => wrapSelection("*", "*"), italic: true },
    { label: "H1", title: "Heading 1", action: () => insertAtLineStart("# ") },
    { label: "H2", title: "Heading 2", action: () => insertAtLineStart("## ") },
    { label: "H3", title: "Heading 3", action: () => insertAtLineStart("### ") },
    { label: "—",  title: "Divider",   action: () => wrapSelection("\n\n---\n\n") },
    { label: "`",  title: "Inline code", action: () => wrapSelection("`", "`") },
    { label: "[ ]", title: "Link",     action: () => wrapSelection("[", "](url)") },
    { label: "•",  title: "Bullet list", action: () => insertAtLineStart("- ") },
    { label: "1.", title: "Numbered list", action: () => insertAtLineStart("1. ") },
  ];

  return (
    <div>
      <div className="fa-tab-toolbar">
        <p className="fa-tab-desc">Write your own blog posts published at immpression.art/blog.</p>
        <button className="fa-add-btn" onClick={openAdd}>+ New Post</button>
      </div>

      {error && <div className="fa-error">{error}</div>}

      {showForm && (
        <div className="fa-form-card">
          <h2 className="fa-form-title">{editId ? "Edit Post" : "New Post"}</h2>
          <form className="fa-form" onSubmit={handleSave}>
            <div className="fa-form-row">
              <label>Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Post title" />
            </div>
            <div className="fa-form-row">
              <label>Cover Image URL *</label>
              <input value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} placeholder="https://..." />
            </div>
            {form.coverImageUrl && (
              <div className="fa-preview">
                <img src={form.coverImageUrl} alt="cover preview" onError={(e) => { e.target.style.display = "none"; }} />
              </div>
            )}

            <div className="fa-form-row">
              <div className="fa-editor-header">
                <label>Body * <span className="fa-md-hint">(Markdown supported)</span></label>
                <button type="button" className="fa-preview-toggle" onClick={() => setPreview(!preview)}>
                  {preview ? "Edit" : "Preview"}
                </button>
              </div>
              {!preview ? (
                <>
                  <div className="fa-md-toolbar">
                    {toolbar.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        title={t.title}
                        className={`fa-md-btn${t.italic ? " fa-md-btn-italic" : ""}`}
                        onClick={t.action}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    ref={bodyRef}
                    className="fa-body-textarea"
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    placeholder="Write your post in Markdown…&#10;&#10;# Heading&#10;**bold**, *italic*, [link](url)"
                    rows={20}
                  />
                </>
              ) : (
                <div className="fa-md-preview" dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(form.body) }} />
              )}
            </div>

            <div className="fa-form-row fa-published-row">
              <label className="fa-checkbox-label">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                <span>Published</span>
                <span className="fa-publish-hint">{form.published ? "Live on the blog" : "Saved as draft"}</span>
              </label>
            </div>

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
      ) : posts.length === 0 ? (
        <div className="fa-empty">No posts yet. Click "New Post" to get started.</div>
      ) : (
        <div className="fa-list">
          {posts.map((p) => (
            <div key={p._id} className="fa-row">
              <img src={p.coverImageUrl} alt={p.title} className="fa-row-img" onError={(e) => { e.target.src = ""; e.target.style.display = "none"; }} />
              <div className="fa-row-info">
                <span className={`fa-status-badge ${p.published ? "fa-status-live" : "fa-status-draft"}`}>
                  {p.published ? "Published" : "Draft"}
                </span>
                <span className="fa-row-title">{p.title}</span>
                {p.publishedAt && (
                  <span className="fa-row-date">{new Date(p.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                )}
                <span className="fa-row-excerpt">{p.body.replace(/[#*`_\[\]]/g, "").slice(0, 120)}…</span>
              </div>
              <div className="fa-row-actions">
                <button className="fa-btn-edit" onClick={() => openEdit(p)}>Edit</button>
                <button className="fa-btn-delete" onClick={() => handleDelete(p._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Very minimal markdown → HTML for admin preview only */
function renderMarkdownPreview(md) {
  if (!md) return "";
  let html = md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^---$/gm, "<hr>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
  return `<p>${html}</p>`;
}

/* ─── Page shell ──────────────────────────────────────── */
function FeaturedArticles() {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [activeTab, setActiveTab] = useState("press");

  const token = authState?.token;

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token]);

  return (
    <ScreenTemplate>
      <div className="fa-page">
        <header className="fa-header">
          <div>
            <h1 className="fa-title">Blog</h1>
            <p className="fa-subtitle">Manage press features and write your own posts</p>
          </div>
        </header>

        <div className="fa-tabs">
          <button
            className={`fa-tab ${activeTab === "press" ? "fa-tab-active" : ""}`}
            onClick={() => setActiveTab("press")}
          >
            Press
          </button>
          <button
            className={`fa-tab ${activeTab === "posts" ? "fa-tab-active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            Posts
          </button>
        </div>

        <div className="fa-tab-content">
          {activeTab === "press" ? <PressTab token={token} /> : <PostsTab token={token} />}
        </div>
      </div>
    </ScreenTemplate>
  );
}

export default FeaturedArticles;

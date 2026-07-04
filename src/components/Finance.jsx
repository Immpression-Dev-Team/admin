import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "@/context/authContext";
import "@/styles/finance.css";

const API_URL = import.meta.env.VITE_API_URL;

const EMPTY_FORM = { name: "", price: "", source: "", date: "" };

function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function Finance() {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // separate add-forms per section
  const [showForm, setShowForm] = useState({ expense: false, revenue: false });
  const [form, setForm] = useState({ expense: EMPTY_FORM, revenue: EMPTY_FORM });
  const [saving, setSaving] = useState({ expense: false, revenue: false });
  const [editId, setEditId] = useState({ expense: null, revenue: null });

  const token = authState?.token;

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    load();
  }, [token]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/finance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setEntries(data.data);
      else setError(data.error || "Failed to load");
    } catch {
      setError("Failed to load entries.");
    } finally {
      setLoading(false);
    }
  }

  const expenses = entries.filter((e) => e.type === "expense");
  const revenue  = entries.filter((e) => e.type === "revenue");
  const totalExp = expenses.reduce((s, e) => s + e.price, 0);
  const totalRev = revenue.reduce((s, e) => s + e.price, 0);
  const net = totalRev - totalExp;

  function openAdd(type) {
    setForm((f) => ({ ...f, [type]: EMPTY_FORM }));
    setEditId((f) => ({ ...f, [type]: null }));
    setShowForm((f) => ({ ...f, [type]: true }));
    setError("");
  }

  function openEdit(entry) {
    const t = entry.type;
    setForm((f) => ({
      ...f,
      [t]: {
        name: entry.name,
        price: String(entry.price),
        source: entry.source,
        date: entry.date ? entry.date.slice(0, 10) : "",
      },
    }));
    setEditId((f) => ({ ...f, [t]: entry._id }));
    setShowForm((f) => ({ ...f, [t]: true }));
    setError("");
  }

  async function handleSave(type, e) {
    e.preventDefault();
    const f = form[type];
    if (!f.name || !f.price || !f.source || !f.date) {
      setError("All fields are required.");
      return;
    }
    setSaving((s) => ({ ...s, [type]: true }));
    setError("");
    try {
      const id = editId[type];
      const url = id ? `${API_URL}/api/admin/finance/${id}` : `${API_URL}/api/admin/finance`;
      const res = await fetch(url, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type, name: f.name, price: parseFloat(f.price), source: f.source, date: f.date }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Save failed");
      setShowForm((s) => ({ ...s, [type]: false }));
      load();
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving((s) => ({ ...s, [type]: false }));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this entry?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/finance/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) load();
      else setError(data.error || "Delete failed.");
    } catch {
      setError("Delete failed.");
    }
  }

  return (
    <ScreenTemplate>
      <div className="fin-page">

        <header className="fin-header">
          <div>
            <h1 className="fin-title">Finance</h1>
            <p className="fin-subtitle">Track platform expenses and revenue</p>
          </div>
        </header>

        {/* Summary KPIs */}
        <div className="fin-kpis">
          <div className="fin-kpi fin-kpi-rev">
            <span className="fin-kpi-label">Total Revenue</span>
            <span className="fin-kpi-value">{fmt(totalRev)}</span>
          </div>
          <div className="fin-kpi fin-kpi-exp">
            <span className="fin-kpi-label">Total Expenses</span>
            <span className="fin-kpi-value">{fmt(totalExp)}</span>
          </div>
          <div className={`fin-kpi fin-kpi-net ${net >= 0 ? "positive" : "negative"}`}>
            <span className="fin-kpi-label">Net</span>
            <span className="fin-kpi-value">{fmt(net)}</span>
          </div>
        </div>

        {error && <div className="fin-error">{error}</div>}

        {loading ? (
          <div className="fin-loading">Loading…</div>
        ) : (
          <div className="fin-sections">
            <Section
              type="revenue"
              label="Revenue"
              rows={revenue}
              total={totalRev}
              showForm={showForm.revenue}
              form={form.revenue}
              saving={saving.revenue}
              editId={editId.revenue}
              onOpenAdd={() => openAdd("revenue")}
              onEdit={openEdit}
              onDelete={handleDelete}
              onFormChange={(f) => setForm((s) => ({ ...s, revenue: f }))}
              onSave={(e) => handleSave("revenue", e)}
              onCancel={() => setShowForm((s) => ({ ...s, revenue: false }))}
            />
            <Section
              type="expense"
              label="Expenses"
              rows={expenses}
              total={totalExp}
              showForm={showForm.expense}
              form={form.expense}
              saving={saving.expense}
              editId={editId.expense}
              onOpenAdd={() => openAdd("expense")}
              onEdit={openEdit}
              onDelete={handleDelete}
              onFormChange={(f) => setForm((s) => ({ ...s, expense: f }))}
              onSave={(e) => handleSave("expense", e)}
              onCancel={() => setShowForm((s) => ({ ...s, expense: false }))}
            />
          </div>
        )}
      </div>
    </ScreenTemplate>
  );
}

function Section({ type, label, rows, total, showForm, form, saving, editId, onOpenAdd, onEdit, onDelete, onFormChange, onSave, onCancel }) {
  const isRevenue = type === "revenue";

  return (
    <div className={`fin-section ${isRevenue ? "fin-section-rev" : "fin-section-exp"}`}>
      <div className="fin-section-head">
        <div>
          <h2 className="fin-section-title">{label}</h2>
          <span className="fin-section-total">{fmt(total)}</span>
        </div>
        <button className="fin-add-btn" onClick={onOpenAdd}>+ Add</button>
      </div>

      {showForm && (
        <form className="fin-form" onSubmit={onSave}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => onFormChange({ ...form, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price (USD)"
            value={form.price}
            min="0"
            step="0.01"
            onChange={(e) => onFormChange({ ...form, price: e.target.value })}
          />
          <input
            placeholder="Source"
            value={form.source}
            onChange={(e) => onFormChange({ ...form, source: e.target.value })}
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => onFormChange({ ...form, date: e.target.value })}
          />
          <div className="fin-form-actions">
            <button type="button" className="fin-btn-cancel" onClick={onCancel}>Cancel</button>
            <button type="submit" className="fin-btn-save" disabled={saving}>
              {saving ? "Saving…" : editId ? "Update" : "Add"}
            </button>
          </div>
        </form>
      )}

      {rows.length === 0 ? (
        <div className="fin-empty">No {label.toLowerCase()} recorded yet.</div>
      ) : (
        <table className="fin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Source</th>
              <th>Date</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id}>
                <td className="fin-td-name">{r.name}</td>
                <td className="fin-td-source">{r.source}</td>
                <td className="fin-td-date">
                  {new Date(r.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </td>
                <td className={`fin-td-amount ${isRevenue ? "rev" : "exp"}`}>{fmt(r.price)}</td>
                <td className="fin-td-actions">
                  <button className="fin-btn-edit" onClick={() => onEdit(r)}>Edit</button>
                  <button className="fin-btn-delete" onClick={() => onDelete(r._id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

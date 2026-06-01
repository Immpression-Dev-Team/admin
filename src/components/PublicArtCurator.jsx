import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/authContext";
import { getFeaturedPublicArt, saveFeaturedPublicArt, searchAdminPublicArt } from "../api/API";
import ScreenTemplate from "./Template/ScreenTemplate";
import "@/styles/publicartcurator.css";

const MAX_FEATURED = 20;
const SOURCE_OPTIONS = [
  { value: "all", label: "All Sources" },
  { value: "met", label: "MET Museum" },
  { value: "chicago", label: "Art Institute of Chicago" },
];

export default function PublicArtCurator() {
  const { authState } = useAuth();
  const token = authState?.token;

  const [featured, setFeatured] = useState([]); // full artwork objects currently featured
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const noticeTimer = useRef(null);

  function showNotice(type, msg) {
    setNotice({ type, msg });
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 5000);
  }

  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  useEffect(() => {
    if (!token) return;
    getFeaturedPublicArt(token)
      .then((res) => { if (res.success) setFeatured(res.data); })
      .catch(() => showNotice("error", "Failed to load featured artworks."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchResults([]);
    const res = await searchAdminPublicArt(token, query.trim(), source, 20);
    if (res.success) setSearchResults(res.data);
    else showNotice("error", "Search failed. Try again.");
    setSearching(false);
  }

  function isAlreadyFeatured(artwork) {
    return featured.some((f) => f.id === artwork.id);
  }

  function addToFeatured(artwork) {
    if (featured.length >= MAX_FEATURED) {
      showNotice("error", `You can only feature up to ${MAX_FEATURED} artworks.`);
      return;
    }
    if (isAlreadyFeatured(artwork)) return;
    setFeatured((prev) => [...prev, artwork]);
  }

  function removeFromFeatured(artworkId) {
    setFeatured((prev) => prev.filter((f) => f.id !== artworkId));
  }

  function moveUp(index) {
    if (index === 0) return;
    setFeatured((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index) {
    if (index === featured.length - 1) return;
    setFeatured((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const refs = featured.map(({ id }) => {
        const [src, ...rest] = id.split(":");
        return { source: src, id: rest.join(":") };
      });
      await saveFeaturedPublicArt(token, refs);
      showNotice("success", `Saved ${featured.length} featured artworks.`);
    } catch (err) {
      showNotice("error", err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ScreenTemplate title="Public Art Curator">
        <p className="pac-loading">Loading current featured artworks…</p>
      </ScreenTemplate>
    );
  }

  return (
    <ScreenTemplate title="Public Art Curator">
      <div className="pac-root">
        {notice && (
          <div className={`pac-notice pac-notice--${notice.type}`}>{notice.msg}</div>
        )}

        {/* ── Left: Current Featured List ── */}
        <div className="pac-panel pac-panel--featured">
          <div className="pac-panel-header">
            <h2 className="pac-panel-title">Featured ({featured.length} / {MAX_FEATURED})</h2>
            <button
              className="pac-save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>

          {featured.length === 0 ? (
            <p className="pac-empty">No artworks featured yet. Search and add some.</p>
          ) : (
            <ul className="pac-featured-list">
              {featured.map((artwork, i) => (
                <li key={artwork.id} className="pac-featured-item">
                  <img
                    src={artwork.thumbnailUrl || artwork.imageUrl}
                    alt={artwork.title}
                    className="pac-featured-thumb"
                  />
                  <div className="pac-featured-info">
                    <span className="pac-featured-title">{artwork.title}</span>
                    <span className="pac-featured-artist">{artwork.artist}</span>
                  </div>
                  <div className="pac-featured-actions">
                    <button onClick={() => moveUp(i)} disabled={i === 0} className="pac-arrow-btn">▲</button>
                    <button onClick={() => moveDown(i)} disabled={i === featured.length - 1} className="pac-arrow-btn">▼</button>
                    <button onClick={() => removeFromFeatured(artwork.id)} className="pac-remove-btn">✕</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Right: Search ── */}
        <div className="pac-panel pac-panel--search">
          <h2 className="pac-panel-title">Search Public Domain Art</h2>

          <form className="pac-search-form" onSubmit={handleSearch}>
            <input
              className="pac-search-input"
              type="text"
              placeholder="Search artist, title, style…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="pac-source-select"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button className="pac-search-btn" type="submit" disabled={searching}>
              {searching ? "Searching…" : "Search"}
            </button>
          </form>

          {searchResults.length === 0 && !searching && (
            <p className="pac-empty">Search results will appear here.</p>
          )}

          <div className="pac-results-grid">
            {searchResults.map((artwork) => {
              const added = isAlreadyFeatured(artwork);
              return (
                <div key={artwork.id} className={`pac-result-card ${added ? "pac-result-card--added" : ""}`}>
                  <img
                    src={artwork.thumbnailUrl || artwork.imageUrl}
                    alt={artwork.title}
                    className="pac-result-img"
                  />
                  <div className="pac-result-info">
                    <span className="pac-result-title">{artwork.title}</span>
                    <span className="pac-result-artist">{artwork.artist}</span>
                    <span className="pac-result-source">{artwork.source === "met" ? "MET" : "Chicago"}</span>
                  </div>
                  <button
                    className="pac-add-btn"
                    onClick={() => addToFeatured(artwork)}
                    disabled={added || featured.length >= MAX_FEATURED}
                  >
                    {added ? "Added" : "+ Add"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ScreenTemplate>
  );
}

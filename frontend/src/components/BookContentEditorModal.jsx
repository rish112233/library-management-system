import { useState } from "react";
import { getBookChapters } from "../data/bookContent";
import API from "../api";

function BookContentEditorModal({ book, onClose, onUpdated }) {
  // Initialize with existing book.chapters or default category chapters
  const initialChapters = getBookChapters(book);
  const [chapters, setChapters] = useState(
    initialChapters.map((ch, idx) => ({
      number: ch.number || idx + 1,
      title: ch.title,
      content: ch.content,
    }))
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  if (!book) return null;

  const currentChapter = chapters[activeIdx] || chapters[0] || { number: 1, title: "", content: "" };

  const handleTitleChange = (newTitle) => {
    const updated = [...chapters];
    updated[activeIdx] = { ...updated[activeIdx], title: newTitle };
    setChapters(updated);
  };

  const handleContentChange = (newContent) => {
    const updated = [...chapters];
    updated[activeIdx] = { ...updated[activeIdx], content: newContent };
    setChapters(updated);
  };

  const handleAddChapter = () => {
    const newNum = chapters.length + 1;
    const newChapter = {
      number: newNum,
      title: `Chapter ${newNum}: New Chapter Title`,
      content: "Write chapter content here...",
    };
    const updated = [...chapters, newChapter];
    setChapters(updated);
    setActiveIdx(updated.length - 1);
  };

  const handleDeleteChapter = (idxToDelete) => {
    if (chapters.length <= 1) {
      alert("A book must have at least one chapter.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this chapter?")) return;
    const updated = chapters
      .filter((_, idx) => idx !== idxToDelete)
      .map((ch, i) => ({ ...ch, number: i + 1 }));
    setChapters(updated);
    setActiveIdx(Math.max(0, activeIdx - 1));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg("");
    try {
      const res = await API.put(`/books/${book._id}`, { chapters });
      setStatusMsg("✅ Chapters saved successfully to database!");
      if (onUpdated) onUpdated(res.data);
      setTimeout(() => setStatusMsg(""), 3500);
    } catch (err) {
      setStatusMsg("❌ Failed to save: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="reader-overlay" onClick={onClose}>
      <div 
        className="reader-modal theme-dark" 
        style={{ maxWidth: 1050, height: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="reader-header">
          <div>
            <span className="reader-category-pill">ADMIN CONTENT EDITOR</span>
            <h2>✏️ Edit Chapters & Content: {book.title}</h2>
            <p>Author: {book.author} | Category: {book.category}</p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {statusMsg && (
              <span style={{ fontSize: 13, fontWeight: 700, color: statusMsg.includes("✅") ? "#34d399" : "#fb7185" }}>
                {statusMsg}
              </span>
            )}

            <button 
              type="button" 
              className="sm success"
              onClick={handleSave}
              disabled={saving}
              style={{ padding: "8px 16px" }}
            >
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>

            <button 
              type="button" 
              className="reader-close-btn" 
              onClick={onClose}
              title="Close Editor"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="reader-body">
          {/* Chapter Selector Sidebar */}
          <aside className="reader-sidebar" style={{ width: 260 }}>
            <div style={{ padding: "14px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 className="sidebar-heading" style={{ padding: 0 }}>CHAPTERS</h4>
              <button 
                type="button" 
                className="sm ghost" 
                onClick={handleAddChapter}
                style={{ padding: "3px 8px", fontSize: 11 }}
                title="Add new chapter"
              >
                + Add
              </button>
            </div>

            <div className="sidebar-chapters">
              {chapters.map((ch, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button
                    type="button"
                    className={`chapter-nav-btn ${idx === activeIdx ? "active" : ""}`}
                    onClick={() => setActiveIdx(idx)}
                    style={{ flex: 1 }}
                  >
                    <span className="ch-num">{ch.number}</span>
                    <span className="ch-title" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {ch.title.replace(/^Chapter\s+\d+:\s*/i, "") || `Chapter ${ch.number}`}
                    </span>
                  </button>
                  {chapters.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleDeleteChapter(idx)}
                      title="Delete chapter"
                      style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: "4px" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="reader-sidebar-footer">
              <span>{chapters.length} Total Chapters</span>
            </div>
          </aside>

          {/* Chapter Edit Canvas */}
          <main style={{ flex: 1, padding: "24px 30px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                Chapter Title:
              </label>
              <input
                type="text"
                value={currentChapter.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Chapter 1: The Art of Clean Code"
                style={{ width: "100%", fontSize: 16, fontWeight: 700 }}
              />
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--text-secondary)" }}>
                  Chapter Content / Text:
                </label>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Separate paragraphs with double Enter
                </span>
              </div>
              <textarea
                value={currentChapter.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Write the full chapter content, story, or educational material here..."
                rows={16}
                style={{
                  width: "100%",
                  flex: 1,
                  resize: "vertical",
                  minHeight: 280,
                  fontSize: 14.5,
                  lineHeight: 1.7,
                  fontFamily: "'Lora', Georgia, serif",
                  padding: "16px",
                  borderRadius: "8px"
                }}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default BookContentEditorModal;

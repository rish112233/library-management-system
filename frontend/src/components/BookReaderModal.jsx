import { useState, useEffect } from "react";
import { getBookChapters } from "../data/bookContent";

function BookReaderModal({ book, onClose }) {
  const chapters = getBookChapters(book);
  const storageKey = book ? `nexlib_reader_${book._id || book.title}` : "nexlib_reader";

  // Load saved preferences and progress from localStorage
  const savedState = (() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch {
      return {};
    }
  })();

  const [currentChapterIdx, setCurrentChapterIdx] = useState(savedState.chapterIdx || 0);
  const [fontSize, setFontSize] = useState(savedState.fontSize || 16);
  const [fontFamily, setFontFamily] = useState(savedState.fontFamily || "serif");
  const [readerTheme, setReaderTheme] = useState(savedState.theme || "dark");
  const [bookmarked, setBookmarked] = useState(savedState.bookmarked || false);

  // Save progress whenever chapter or preferences change
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          chapterIdx: currentChapterIdx,
          fontSize,
          fontFamily,
          theme: readerTheme,
          bookmarked,
          lastReadAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn("Could not save reading progress:", e);
    }
  }, [storageKey, currentChapterIdx, fontSize, fontFamily, readerTheme, bookmarked]);

  if (!book) return null;

  const currentChapter = chapters[currentChapterIdx] || chapters[0] || {
    number: 1,
    title: "Chapter 1: Introduction",
    content: "No digital text preview is available for this volume currently. Please check out the physical copy from the library desk.",
  };

  const progressPercent = chapters.length > 0 ? Math.round(((currentChapterIdx + 1) / chapters.length) * 100) : 100;

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="reader-overlay" onClick={onClose}>
      <div 
        className={`reader-modal theme-${readerTheme} font-${fontFamily}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="reader-header">
          <div className="reader-book-info">
            <span className="reader-category-pill">{book.category}</span>
            <h2>{book.title}</h2>
            <p>by {book.author}</p>
          </div>

          <div className="reader-controls">
            {/* Font Family selector */}
            <div className="control-group" title="Font Style">
              <button
                type="button"
                className={`reader-btn sm ${fontFamily === "serif" ? "active" : ""}`}
                onClick={() => setFontFamily("serif")}
                title="Serif Book Type"
              >
                Serif
              </button>
              <button
                type="button"
                className={`reader-btn sm ${fontFamily === "sans" ? "active" : ""}`}
                onClick={() => setFontFamily("sans")}
                title="Modern Sans"
              >
                Sans
              </button>
            </div>

            {/* Font Size controls */}
            <div className="control-group" title="Adjust Font Size">
              <button 
                type="button" 
                className="reader-btn sm" 
                onClick={() => setFontSize((s) => Math.max(13, s - 1))}
              >
                A-
              </button>
              <span className="font-size-label">{fontSize}px</span>
              <button 
                type="button" 
                className="reader-btn sm" 
                onClick={() => setFontSize((s) => Math.min(24, s + 1))}
              >
                A+
              </button>
            </div>

            {/* Theme Switcher */}
            <div className="control-group">
              <button 
                type="button"
                className={`theme-btn dark ${readerTheme === "dark" ? "active" : ""}`}
                title="Dark Night Theme"
                onClick={() => setReaderTheme("dark")}
              >
                🌙
              </button>
              <button 
                type="button"
                className={`theme-btn sepia ${readerTheme === "sepia" ? "active" : ""}`}
                title="Warm Sepia Paper Theme"
                onClick={() => setReaderTheme("sepia")}
              >
                📜
              </button>
              <button 
                type="button"
                className={`theme-btn light ${readerTheme === "light" ? "active" : ""}`}
                title="Clean Daylight Theme"
                onClick={() => setReaderTheme("light")}
              >
                ☀️
              </button>
            </div>

            {/* Bookmark button */}
            <button 
              type="button" 
              className={`reader-btn ${bookmarked ? "bookmarked" : ""}`}
              onClick={() => setBookmarked(!bookmarked)}
              title={bookmarked ? "Bookmarked!" : "Bookmark this page"}
            >
              {bookmarked ? "🔖 Saved" : "🔖 Bookmark"}
            </button>

            {/* Print / Save PDF */}
            <button 
              type="button" 
              className="reader-btn pdf-btn"
              onClick={handlePrintPdf}
              title="Download or Print as PDF"
            >
              📄 Print
            </button>

            {/* Close */}
            <button 
              type="button" 
              className="reader-close-btn" 
              onClick={onClose}
              title="Close Reader"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="reader-progress-track">
          <div 
            className="reader-progress-bar" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Reader Body (Sidebar + Content) */}
        <div className="reader-body">
          {/* Chapter Navigation Sidebar */}
          <aside className="reader-sidebar">
            <h4 className="sidebar-heading">TABLE OF CONTENTS</h4>
            <div className="sidebar-chapters">
              {chapters.map((ch, idx) => (
                <button
                  key={ch.number || idx}
                  type="button"
                  className={`chapter-nav-btn ${idx === currentChapterIdx ? "active" : ""}`}
                  onClick={() => setCurrentChapterIdx(idx)}
                >
                  <span className="ch-num">{idx + 1}</span>
                  <span className="ch-title">{ch.title?.split(": ")[1] || ch.title}</span>
                </button>
              ))}
            </div>
            <div className="reader-sidebar-footer">
              <span>{currentChapterIdx + 1} of {chapters.length} Chapters</span>
              <span>{progressPercent}% Complete</span>
            </div>
          </aside>

          {/* Reading Canvas */}
          <main className="reader-canvas" style={{ fontSize: `${fontSize}px` }}>
            <div className="reading-content-container">
              <div className="chapter-badge">CHAPTER {currentChapter.number}</div>
              <h1 className="chapter-main-title">{currentChapter.title}</h1>

              <div className="chapter-divider" />

              <div className="chapter-text-body">
                {currentChapter.content?.split("\n\n").map((paragraph, pIdx) => {
                  if (paragraph.startsWith('"') && paragraph.endsWith('"')) {
                    return (
                      <blockquote key={pIdx} className="reader-quote">
                        {paragraph}
                      </blockquote>
                    );
                  }
                  return (
                    <p key={pIdx} className="reader-paragraph">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Bottom Chapter Next / Prev */}
              <div className="reader-footer-nav">
                <button
                  type="button"
                  className="nav-page-btn"
                  disabled={currentChapterIdx === 0}
                  onClick={() => {
                    setCurrentChapterIdx((i) => Math.max(0, i - 1));
                    document.querySelector(".reader-canvas")?.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  ← Previous Chapter
                </button>

                <span className="footer-progress-label">
                  Chapter {currentChapterIdx + 1} of {chapters.length}
                </span>

                <button
                  type="button"
                  className="nav-page-btn primary"
                  disabled={currentChapterIdx === chapters.length - 1}
                  onClick={() => {
                    setCurrentChapterIdx((i) => Math.min(chapters.length - 1, i + 1));
                    document.querySelector(".reader-canvas")?.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Next Chapter →
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default BookReaderModal;

import React from 'react'
import './Topbar.css'

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar__search">
        <svg className="topbar__search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search policies, claims..."
          className="topbar__search-input"
        />
      </div>

      <div className="topbar__actions">
        <button className="topbar__bell" aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span className="topbar__bell-dot" />
        </button>

        <div className="topbar__user">
          <div className="topbar__avatar">TC</div>
          <span className="topbar__username">Tenzin Choda</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
    </header>
  )
}
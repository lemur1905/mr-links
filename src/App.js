import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function MRLinksAggregator() {
  const [searchTerm, setSearchTerm] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [displayCount, setDisplayCount] = useState(50);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  // Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Theme toggle handler
  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // Theme definitions
  const themes = {
    dark: {
      bg: '#272822',
      bgSecondary: '#23241e',
      bgTertiary: '#1e1f1c',
      text: '#f8f8f2',
      textSecondary: '#75715e',
      primary: '#66d9ef',
      primaryHover: '#a6e22e',
      warning: '#e6db74',
      accent: '#ae81ff',
      error: '#f92672',
      border: '#3e3d32',
      borderAccent: '#66d9ef',
      borderHighlight: '#f92672',
      successDot: '#a6e22e',
      errorDot: '#f92672'
    },
    light: {
      bg: '#f8f8f2',
      bgSecondary: '#e8e8e3',
      bgTertiary: '#d8d8d3',
      text: '#272822',
      textSecondary: '#75715e',
      primary: '#0088cc',
      primaryHover: '#00aa44',
      warning: '#cc6600',
      accent: '#8844cc',
      error: '#cc0044',
      border: '#c8c8c0',
      borderAccent: '#0088cc',
      borderHighlight: '#cc0044',
      successDot: '#00aa44',
      errorDot: '#cc0044'
    }
  };

  const theme = isDarkMode ? themes.dark : themes.light;

  useEffect(() => {
    fetch(`${API_URL}/api/links?limit=1000`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch links');
        return res.json();
      })
      .then(data => {
        setLinks(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredLinks = links.map(day => ({
    ...day,
    links: day.links.filter(link =>
        link.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(day => day.links.length > 0);

  // Limit displayed posts based on displayCount
  const displayedLinks = filteredLinks.slice(0, displayCount);
  const hasMore = filteredLinks.length > displayCount;

  const loadMore = () => {
    setDisplayCount(prev => prev + 50);
  };

  return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: theme.bg,
        color: theme.text,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        fontSize: '13px',
        lineHeight: '1.5'
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: theme.bgTertiary,
          padding: '0.5rem 1rem',
          borderBottom: `1px solid ${theme.border}`
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <a
                href="https://marginalrevolution.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: theme.primaryHover,
                  fontWeight: 'normal',
                  fontSize: '13px',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.target.style.textDecoration = 'none';
                }}
              >
                Marginal Revolution Links
              </a>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={toggleTheme}
                style={{
                  backgroundColor: 'transparent',
                  color: theme.textSecondary,
                  border: 'none',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                  textDecoration: 'none',
                  padding: '0.25rem 0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = theme.primary;
                  e.target.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = theme.textSecondary;
                  e.target.style.textDecoration = 'none';
                }}
              >
                {isDarkMode ? 'light' : 'dark'}
              </button>
              <button
                onClick={() => setShowAbout(!showAbout)}
              style={{
                backgroundColor: 'transparent',
                color: theme.textSecondary,
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                textDecoration: 'none',
                padding: '0.25rem 0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = theme.primary;
                e.target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = theme.textSecondary;
                e.target.style.textDecoration = 'none';
              }}
            >
              {showAbout ? 'close' : 'about'}
            </button>
            </div>
          </div>
        </header>

        {/* Search */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0.5rem 1rem',
          backgroundColor: theme.bgSecondary,
          borderBottom: `1px solid ${theme.border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search links..."
                style={{
                  flex: 1,
                  backgroundColor: theme.bgTertiary,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  padding: '0.3rem 0.5rem',
                  fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                  fontSize: '12px',
                  borderRadius: '2px',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.borderAccent;
                  e.target.style.backgroundColor = theme.bg;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.border;
                  e.target.style.backgroundColor = theme.bgTertiary;
                }}
            />
          </div>
        </div>

        {/* About Section */}
        {showAbout && (
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: theme.bgSecondary,
              border: `1px solid ${theme.borderAccent}`,
              borderRadius: '3px',
              padding: '1.5rem',
              lineHeight: '1.8'
            }}>
              <h2 style={{
                color: theme.primary,
                fontSize: '16px',
                fontWeight: 'normal',
                marginTop: 0,
                marginBottom: '1rem'
              }}>
                About
              </h2>
              <p style={{
                margin: '0 0 1rem 0',
                color: theme.text,
                fontSize: '13px'
              }}>
                Created by <span style={{ color: theme.primaryHover }}>Ian Kahn</span>
              </p>
              <p style={{
                margin: '0 0 1rem 0',
                color: theme.text,
                fontSize: '13px',
                lineHeight: '1.6'
              }}>
                A searchable, scrollable archive of Marginal Revolution's "Assorted Links."
                <br />
                Updated hourly.
              </p>
              <p style={{
                margin: 0,
                color: theme.textSecondary,
                fontSize: '12px',
                fontStyle: 'italic'
              }}>
                * Not affiliated with MR
              </p>
            </div>
          </div>
        )}

        {/* Links Feed */}
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
          {loading ? (
              <div style={{ color: theme.textSecondary, padding: '1rem' }}>
                Loading links...
              </div>
          ) : error ? (
              <div style={{ color: theme.error, padding: '1rem' }}>
                Error: {error}
              </div>
          ) : filteredLinks.length === 0 ? (
              <div style={{ color: theme.textSecondary, padding: '1rem' }}>
                No links found matching search criteria
              </div>
          ) : (
              displayedLinks.map((day) => (
                  <div key={day.id} style={{ marginBottom: '1.5rem' }}>
                    {/* Date Header */}
                    <div style={{
                      marginBottom: '0.5rem',
                      padding: '0.3rem 0.5rem',
                      backgroundColor: theme.bgSecondary,
                      borderLeft: `3px solid ${theme.borderAccent}`
                    }}>
                      <a
                        href={day.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: theme.warning,
                          fontWeight: 'normal',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = theme.primary;
                          e.target.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = theme.warning;
                          e.target.style.textDecoration = 'none';
                        }}
                      >
                        {day.date}
                      </a>
                    </div>

                    {/* Links List */}
                    <div style={{ paddingLeft: '1.5rem' }}>
                      {day.links.map((link, idx) => (
                          <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'start',
                                gap: '0.5rem',
                                padding: '0.2rem 0.3rem',
                                margin: '0 -0.3rem',
                                borderLeft: '2px solid transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = theme.bgSecondary;
                                e.currentTarget.style.borderLeftColor = theme.borderHighlight;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.borderLeftColor = 'transparent';
                              }}
                          >
                    <span style={{ color: theme.accent, flexShrink: 0, fontWeight: 'bold' }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={link.title}
                                style={{
                                  color: theme.primary,
                                  textDecoration: 'none',
                                  flex: 1,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.color = theme.primaryHover;
                                  e.target.style.textDecoration = 'underline';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.color = theme.primary;
                                  e.target.style.textDecoration = 'none';
                                }}
                            >
                              {link.title}
                            </a>
                          </div>
                      ))}
                    </div>
                  </div>
              ))
          )}

          {/* Load More Button */}
          {!loading && !error && hasMore && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '2rem 0'
            }}>
              <button
                onClick={loadMore}
                style={{
                  backgroundColor: theme.bgSecondary,
                  color: theme.primary,
                  border: `1px solid ${theme.border}`,
                  padding: '0.5rem 1.5rem',
                  fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                  fontSize: '12px',
                  cursor: 'pointer',
                  borderRadius: '3px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.bgTertiary;
                  e.target.style.borderColor = theme.borderAccent;
                  e.target.style.color = theme.primaryHover;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = theme.bgSecondary;
                  e.target.style.borderColor = theme.border;
                  e.target.style.color = theme.primary;
                }}
              >
                Load 50 more ({filteredLinks.length - displayCount} remaining)
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={{
          backgroundColor: theme.bgTertiary,
          borderTop: `1px solid ${theme.border}`,
          padding: '0.5rem 1rem',
          marginTop: '2rem'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            color: theme.textSecondary,
            fontSize: '11px'
          }}>
            source: <a
              href="https://marginalrevolution.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: theme.primary, textDecoration: 'none' }}
          >
            marginalrevolution.com
          </a> | status: <span style={{ color: error ? theme.errorDot : theme.successDot }}>{error ? '●' : '●'}</span> {error ? 'disconnected' : 'connected'} | unofficial aggregator
          </div>
        </footer>
      </div>
  );
}
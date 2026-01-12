import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function MRLinksAggregator() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
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

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Track window resize for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      textSecondary: '#5c5c52',
      primary: '#0066a8',
      primaryHover: '#007a33',
      warning: '#b35500',
      accent: '#6b2fa0',
      error: '#b3003a',
      border: '#c8c8c0',
      borderAccent: '#0066a8',
      borderHighlight: '#b3003a',
      successDot: '#007a33',
      errorDot: '#b3003a'
    }
  };

  const theme = isDarkMode ? themes.dark : themes.light;

  // Fetch links from backend with search and pagination
  useEffect(() => {
    setLoading(true);
    setError(null);

    const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
    const url = `${API_URL}/api/links?limit=25${searchParam}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch links');
        return res.json();
      })
      .then(data => {
        setLinks(data);
        setHasMore(data.length === 25);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [debouncedSearch]);

  const loadMore = () => {
    if (loading) return;

    setLoading(true);
    const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
    const url = `${API_URL}/api/links?skip=${links.length}&limit=25${searchParam}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch more links');
        return res.json();
      })
      .then(data => {
        setLinks(prev => [...prev, ...data]);
        setHasMore(data.length === 25);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
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
            justifyContent: 'space-between',
            flexWrap: isMobile ? 'wrap' : 'nowrap'
          }}>
            <span style={{
              color: theme.primaryHover,
              fontWeight: 'normal',
              fontSize: '13px',
              lineHeight: 1.1,
              minWidth: 0
            }}>
              {isMobile ? (
                <>
                  <a
                    href="https://marginalrevolution.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: theme.primaryHover,
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.textDecoration = 'none';
                    }}
                  >
                    Marginal<br />Revolution
                  </a>
                  <br />Links
                </>
              ) : (
                <>
                  <a
                    href="https://marginalrevolution.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: theme.primaryHover,
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.textDecoration = 'none';
                    }}
                  >
                    Marginal Revolution
                  </a>
                  {' Links'}
                </>
              )}
            </span>
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
          {loading && links.length === 0 ? (
              <div style={{ color: theme.textSecondary, padding: '1rem' }}>
                Loading links...
              </div>
          ) : error ? (
              <div style={{ color: theme.error, padding: '1rem' }}>
                Error: {error}
              </div>
          ) : links.length === 0 ? (
              <div style={{ color: theme.textSecondary, padding: '1rem' }}>
                No links found matching search criteria
              </div>
          ) : (
              links.map((day) => (
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
                    <div style={{ paddingLeft: isMobile ? '0' : '1.5rem' }}>
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
                                  flex: 1
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

          {/* Load More and Top */}
          {!loading && !error && hasMore && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
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
                Load 25 more
              </button>
              <span
                onClick={() => window.scrollTo(0, 0)}
                style={{
                  color: theme.textSecondary,
                  fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                  fontSize: '11px',
                  cursor: 'pointer'
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
                ↑ top
              </span>
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
import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

export default function MRLinksAggregator() {
  const [searchTerm, setSearchTerm] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [displayCount, setDisplayCount] = useState(50);

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

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  };

  return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#272822',
        color: '#f8f8f2',
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        fontSize: '13px',
        lineHeight: '1.5'
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: '#1e1f1c',
          padding: '0.5rem 1rem',
          borderBottom: '1px solid #3e3d32'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: '#a6e22e', fontWeight: 'normal', fontSize: '13px' }}>
                Marginal Revolution Links
              </span>
              <span style={{ color: '#75715e', fontSize: '12px' }}>
                — daily aggregator
              </span>
            </div>
            <button
              onClick={() => setShowAbout(!showAbout)}
              style={{
                backgroundColor: 'transparent',
                color: '#75715e',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                textDecoration: 'none',
                padding: '0.25rem 0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#66d9ef';
                e.target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#75715e';
                e.target.style.textDecoration = 'none';
              }}
            >
              {showAbout ? 'close' : 'about'}
            </button>
          </div>
        </header>

        {/* Search */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0.5rem 1rem',
          backgroundColor: '#23241e',
          borderBottom: '1px solid #3e3d32'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search links..."
                style={{
                  flex: 1,
                  backgroundColor: '#1e1f1c',
                  color: '#f8f8f2',
                  border: '1px solid #3e3d32',
                  padding: '0.3rem 0.5rem',
                  fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                  fontSize: '12px',
                  borderRadius: '2px',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#66d9ef';
                  e.target.style.backgroundColor = '#272822';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#3e3d32';
                  e.target.style.backgroundColor = '#1e1f1c';
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
              backgroundColor: '#23241e',
              border: '1px solid #66d9ef',
              borderRadius: '3px',
              padding: '1.5rem',
              lineHeight: '1.8'
            }}>
              <h2 style={{
                color: '#66d9ef',
                fontSize: '16px',
                fontWeight: 'normal',
                marginTop: 0,
                marginBottom: '1rem'
              }}>
                About
              </h2>
              <p style={{
                margin: '0 0 1rem 0',
                color: '#f8f8f2',
                fontSize: '13px'
              }}>
                Created by <span style={{ color: '#a6e22e' }}>Ian Kahn</span>
              </p>
              <p style={{
                margin: '0 0 1rem 0',
                color: '#f8f8f2',
                fontSize: '13px',
                lineHeight: '1.6'
              }}>
                A searchable, scrollable archive of Marginal Revolution's "Assorted Links."
                <br />
                Updated hourly.
              </p>
              <p style={{
                margin: 0,
                color: '#75715e',
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
              <div style={{ color: '#75715e', padding: '1rem' }}>
                Loading links...
              </div>
          ) : error ? (
              <div style={{ color: '#f92672', padding: '1rem' }}>
                Error: {error}
              </div>
          ) : filteredLinks.length === 0 ? (
              <div style={{ color: '#75715e', padding: '1rem' }}>
                No links found matching search criteria
              </div>
          ) : (
              displayedLinks.map((day) => (
                  <div key={day.id} style={{ marginBottom: '1.5rem' }}>
                    {/* Date Header */}
                    <div style={{
                      marginBottom: '0.5rem',
                      padding: '0.3rem 0.5rem',
                      backgroundColor: '#23241e',
                      borderLeft: '3px solid #66d9ef'
                    }}>
                      <a
                        href={day.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#e6db74',
                          fontWeight: 'normal',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = '#66d9ef';
                          e.target.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = '#e6db74';
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
                                e.currentTarget.style.backgroundColor = '#23241e';
                                e.currentTarget.style.borderLeftColor = '#f92672';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.borderLeftColor = 'transparent';
                              }}
                          >
                    <span style={{ color: '#ae81ff', flexShrink: 0, fontWeight: 'bold' }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={link.title}
                                style={{
                                  color: '#66d9ef',
                                  textDecoration: 'none',
                                  flex: 1,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.color = '#a6e22e';
                                  e.target.style.textDecoration = 'underline';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.color = '#66d9ef';
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
                  backgroundColor: '#23241e',
                  color: '#66d9ef',
                  border: '1px solid #3e3d32',
                  padding: '0.5rem 1.5rem',
                  fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                  fontSize: '12px',
                  cursor: 'pointer',
                  borderRadius: '3px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1e1f1c';
                  e.target.style.borderColor = '#66d9ef';
                  e.target.style.color = '#a6e22e';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#23241e';
                  e.target.style.borderColor = '#3e3d32';
                  e.target.style.color = '#66d9ef';
                }}
              >
                Load 50 more ({filteredLinks.length - displayCount} remaining)
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={{
          backgroundColor: '#1e1f1c',
          borderTop: '1px solid #3e3d32',
          padding: '0.5rem 1rem',
          marginTop: '2rem'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            color: '#75715e',
            fontSize: '11px'
          }}>
            source: <a
              href="https://marginalrevolution.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#66d9ef', textDecoration: 'none' }}
          >
            marginalrevolution.com
          </a> | status: <span style={{ color: error ? '#f92672' : '#a6e22e' }}>{error ? '●' : '●'}</span> {error ? 'disconnected' : 'connected'} | unofficial aggregator
          </div>
        </footer>
      </div>
  );
}
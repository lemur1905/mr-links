import React, { useState } from 'react';

const mockLinks = [
  {
    id: 1,
    date: '2026-01-01',
    links: [
      { title: 'The economics of artificial general intelligence', url: 'https://example.com/agi-economics' },
      { title: 'Why are hospitals so expensive in the US?', url: 'https://example.com/hospital-costs' },
      { title: 'The return of industrial policy', url: 'https://example.com/industrial-policy' },
      { title: 'New data on remote work productivity', url: 'https://example.com/remote-work' },
      { title: 'The cultural impact of recommendation algorithms', url: 'https://example.com/algorithms-culture' },
      { title: 'How do you measure innovation?', url: 'https://example.com/measure-innovation' },
      { title: 'The psychology of procrastination', url: 'https://example.com/procrastination' }
    ]
  },
  {
    id: 2,
    date: '2025-12-31',
    links: [
      { title: 'Markets in everything: AI-generated music', url: 'https://example.com/ai-music' },
      { title: 'The great stagnation debate revisited', url: 'https://example.com/stagnation' },
      { title: 'Why are building costs so high?', url: 'https://example.com/building-costs' },
      { title: 'The future of space exploration', url: 'https://example.com/space-exploration' },
      { title: 'Understanding cryptocurrency markets', url: 'https://example.com/crypto-markets' },
      { title: 'The rise of vertical farming', url: 'https://example.com/vertical-farming' }
    ]
  },
  {
    id: 3,
    date: '2025-12-30',
    links: [
      { title: 'The future of higher education', url: 'https://example.com/higher-ed' },
      { title: 'New research on immigration and innovation', url: 'https://example.com/immigration-innovation' },
      { title: 'The economics of prediction markets', url: 'https://example.com/prediction-markets' },
      { title: 'Why did inflation fall so quickly?', url: 'https://example.com/inflation' },
      { title: 'The impact of social media on democracy', url: 'https://example.com/social-media-democracy' },
      { title: 'Climate change adaptation strategies', url: 'https://example.com/climate-adaptation' },
      { title: 'The neuroscience of decision making', url: 'https://example.com/neuroscience-decisions' }
    ]
  },
  {
    id: 4,
    date: '2025-12-29',
    links: [
      { title: 'Why are taxes so complicated?', url: 'https://example.com/tax-complexity' },
      { title: 'The history of central banking', url: 'https://example.com/central-banking' },
      { title: 'What makes cities vibrant?', url: 'https://example.com/vibrant-cities' },
      { title: 'The future of nuclear energy', url: 'https://example.com/nuclear-energy' },
      { title: 'Understanding behavioral economics', url: 'https://example.com/behavioral-econ' }
    ]
  },
  {
    id: 5,
    date: '2025-12-28',
    links: [
      { title: 'The economics of streaming services', url: 'https://example.com/streaming-economics' },
      { title: 'Why do some countries grow faster than others?', url: 'https://example.com/growth-rates' },
      { title: 'The rise of plant-based meat', url: 'https://example.com/plant-based-meat' },
      { title: 'Understanding quantum computing', url: 'https://example.com/quantum-computing' },
      { title: 'The future of transportation', url: 'https://example.com/future-transportation' },
      { title: 'How to fix the housing shortage', url: 'https://example.com/housing-shortage' }
    ]
  },
  {
    id: 6,
    date: '2025-12-27',
    links: [
      { title: 'The impact of automation on employment', url: 'https://example.com/automation-employment' },
      { title: 'Why are prescription drugs so expensive?', url: 'https://example.com/drug-prices' },
      { title: 'The economics of professional sports', url: 'https://example.com/sports-economics' },
      { title: 'Understanding monetary policy', url: 'https://example.com/monetary-policy' },
      { title: 'The future of work post-pandemic', url: 'https://example.com/future-work' },
      { title: 'How do financial bubbles form?', url: 'https://example.com/financial-bubbles' },
      { title: 'The role of luck in success', url: 'https://example.com/luck-success' }
    ]
  },
  {
    id: 7,
    date: '2025-12-26',
    links: [
      { title: 'The economics of restaurant pricing', url: 'https://example.com/restaurant-pricing' },
      { title: 'Why is productivity growth slowing?', url: 'https://example.com/productivity-growth' },
      { title: 'The future of gene editing', url: 'https://example.com/gene-editing' },
      { title: 'Understanding trade deficits', url: 'https://example.com/trade-deficits' },
      { title: 'The psychology of investing', url: 'https://example.com/investing-psychology' }
    ]
  },
  {
    id: 8,
    date: '2025-12-25',
    links: [
      { title: 'The economics of gift-giving', url: 'https://example.com/gift-giving' },
      { title: 'Why do monopolies form?', url: 'https://example.com/monopolies' },
      { title: 'The future of electric vehicles', url: 'https://example.com/electric-vehicles' },
      { title: 'Understanding income inequality', url: 'https://example.com/income-inequality' },
      { title: 'The impact of copyright on innovation', url: 'https://example.com/copyright-innovation' },
      { title: 'How do supply chains work?', url: 'https://example.com/supply-chains' }
    ]
  }
];

export default function MRLinksAggregator() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLinks = mockLinks.map(day => ({
    ...day,
    links: day.links.filter(link =>
        link.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(day => day.links.length > 0);

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
            gap: '1rem'
          }}>
          <span style={{ color: '#a6e22e', fontWeight: 'normal', fontSize: '13px' }}>
            marginal_revolution_links.txt
          </span>
            <span style={{ color: '#75715e', fontSize: '12px' }}>
            — daily aggregator
          </span>
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
            <span style={{ color: '#66d9ef' }}>🔍</span>
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

        {/* Links Feed */}
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
          {filteredLinks.length === 0 ? (
              <div style={{ color: '#75715e', padding: '1rem' }}>
                No links found matching search criteria
              </div>
          ) : (
              filteredLinks.map((day) => (
                  <div key={day.id} style={{ marginBottom: '1.5rem' }}>
                    {/* Date Header */}
                    <div style={{
                      marginBottom: '0.5rem',
                      padding: '0.3rem 0.5rem',
                      backgroundColor: '#23241e',
                      borderLeft: '3px solid #66d9ef'
                    }}>
                <span style={{ color: '#e6db74', fontWeight: 'normal' }}>
                  {day.date}
                </span>
                      <span style={{ color: '#75715e', marginLeft: '0.5rem' }}>
                  {day.links.length} links
                </span>
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
                            <span style={{ color: '#75715e', fontSize: '11px', flexShrink: 0 }}>
                      {getDomain(link.url)}
                    </span>
                          </div>
                      ))}
                    </div>
                  </div>
              ))
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
          </a> | status: <span style={{ color: '#a6e22e' }}>●</span> | unofficial aggregator
          </div>
        </footer>
      </div>
  );
}
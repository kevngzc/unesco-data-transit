import { useState, useEffect } from 'react';
import datasetsConfig from './datasets-config.json';
import subwayIcon from '/assets/icons/subway-icon.svg';
import mapBackground from '/assets/images/cartographic-background.png';

const UNESCO_API_URL = 'https://data.unesco.org/api/explore/v2.1/monitoring/datasets/ods-datasets-monitoring/exports/json?lang=en&timezone=Europe%2FBerlin';

interface Dataset {
  id: string;
  name: string;
  records: number;
  x: number;
  y: number;
  themes: string[];
  apiData?: any;
}

type LineColors = {
  culture: string;
  education: string;
  science: string;
  information: string;
  global: string;
}

const App = () => {
  const [discoveredStations, setDiscoveredStations] = useState(new Set(['whc001']));
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [animatingStations, setAnimatingStations] = useState(new Set());
  const [datasets, setDatasets] = useState<{ [key: string]: Dataset[] }>({});
  const [allStations, setAllStations] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Line colors from config
  const lineColors = datasetsConfig.lineColors as LineColors;
  const connections = datasetsConfig.connections;

  // Fetch and merge UNESCO API data with config
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(UNESCO_API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const apiData = await response.json();

        // Create a map of API data by dataset_id
        const apiDataMap = new Map();
        apiData.forEach((item: any) => {
          apiDataMap.set(item.dataset_id, item);
        });

        // Merge config with API data
        const mergedDatasets: Dataset[] = datasetsConfig.datasets.map(configItem => {
          const apiItem = apiDataMap.get(configItem.dataset_id);

          return {
            id: configItem.dataset_id,
            name: apiItem?.title || configItem.dataset_id,
            records: apiItem?.records_count || 0,
            x: configItem.position.x,
            y: configItem.position.y,
            themes: configItem.themes,
            apiData: apiItem
          };
        });

        // Organize datasets by theme
        const organizedDatasets: { [key: string]: Dataset[] } = {};
        mergedDatasets.forEach(dataset => {
          dataset.themes.forEach(theme => {
            if (!organizedDatasets[theme]) {
              organizedDatasets[theme] = [];
            }
            // Only add once per theme (avoid duplicates)
            if (!organizedDatasets[theme].find(d => d.id === dataset.id)) {
              organizedDatasets[theme].push(dataset);
            }
          });
        });

        setDatasets(organizedDatasets);
        setAllStations(mergedDatasets);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching UNESCO data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalStations = allStations.length;

  const discoverStation = (stationId: string) => {
    if (!discoveredStations.has(stationId)) {
      setAnimatingStations(prev => new Set(prev).add(stationId));
      setTimeout(() => {
        setDiscoveredStations(prev => new Set(prev).add(stationId));
        setAnimatingStations(prev => {
          const next = new Set(prev);
          next.delete(stationId);
          return next;
        });
      }, 300);
    }
    setSelectedStation(stationId);
  };

  const getConnectedStations = (stationId: string) => {
    return connections
      .filter(conn => conn.from === stationId || conn.to === stationId)
      .map(conn => conn.from === stationId ? conn.to : conn.from);
  };

  const isStationAccessible = (stationId: string) => {
    if (discoveredStations.has(stationId)) return true;
    const connected = getConnectedStations(stationId);
    return connected.some(id => discoveredStations.has(id));
  };

  const getStationInfo = (stationId: string) => {
    return allStations.find(s => s.id === stationId);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTop: '3px solid #00FFFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#888', fontSize: '16px' }}>Loading UNESCO datasets...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{
          background: 'rgba(255,0,0,0.1)',
          border: '1px solid rgba(255,0,0,0.3)',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#ff4444', margin: '0 0 10px 0' }}>Failed to load data</h2>
          <p style={{ color: '#888', margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0a0a0a',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 30px',
        background: 'linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0) 100%)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src={subwayIcon}
            alt="Subway"
            style={{
              width: '48px',
              height: '48px',
              filter: 'brightness(0) invert(1) drop-shadow(0 0 8px rgba(255,255,255,0.3))'
            }}
          />
          <div>
            <h1 style={{
              color: '#fff',
              fontSize: '28px',
              fontWeight: '700',
              margin: 0,
              letterSpacing: '-0.5px'
            }}>
              UNESCO Data Transit
            </h1>
            <p style={{
              color: '#888',
              fontSize: '14px',
              margin: '5px 0 0 0'
            }}>
              Explore the network · Discover datasets
            </p>
          </div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '12px 24px'
        }}>
          <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
            PROGRESS
          </div>
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: '700' }}>
            {discoveredStations.size} / {totalStations}
          </div>
        </div>
      </div>

      {/* Cartographic Background Map */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}>
        <img
          src={mapBackground}
          alt="Cartographic map background"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.5
          }}
        />
      </div>

      {/* Darkening Overlay for Transit Line Visibility */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      {/* SVG Transit Map */}
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 3 }}
        viewBox="0 0 900 700"
      >
        {/* Define glow filters */}
        <defs>
          {Object.entries(lineColors).map(([line]) => (
            <filter key={line} id={`glow-${line}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Draw connections */}
        {connections.map((conn, idx) => {
          const fromStation = getStationInfo(conn.from);
          const toStation = getStationInfo(conn.to);
          const isVisible = discoveredStations.has(conn.from) && discoveredStations.has(conn.to);

          if (!fromStation || !toStation) return null;

          return (
            <line
              key={idx}
              x1={fromStation.x}
              y1={fromStation.y}
              x2={toStation.x}
              y2={toStation.y}
              stroke={lineColors[conn.line as keyof LineColors]}
              strokeWidth="8"
              opacity={isVisible ? 0.9 : 0.1}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={isVisible ? `url(#glow-${conn.line})` : undefined}
              style={{
                transition: 'opacity 0.5s ease'
              }}
            />
          );
        })}

        {/* Draw stations */}
        {allStations.map(station => {
          const isDiscovered = discoveredStations.has(station.id);
          const isAccessible = isStationAccessible(station.id);
          const isAnimating = animatingStations.has(station.id);
          const isSelected = selectedStation === station.id;

          // Find which lines this station belongs to
          const stationLines = Object.entries(datasets)
            .filter(([_, stations]) => stations.some(s => s.id === station.id))
            .map(([line]) => line);

          const isTransferStation = stationLines.length > 1;
          const baseRadius = isTransferStation ? 14 : 12;
          const selectedRadius = isTransferStation ? 18 : 16;

          return (
            <g key={station.id}>
              {/* Station outer glow */}
              {isDiscovered && (
                <circle
                  cx={station.x}
                  cy={station.y}
                  r={isSelected ? (isTransferStation ? 28 : 25) : (isTransferStation ? 24 : 20)}
                  fill={lineColors[stationLines[0] as keyof LineColors]}
                  opacity={isAnimating ? 0.6 : 0.3}
                  style={{
                    transition: 'all 0.3s ease'
                  }}
                />
              )}

              {/* Transfer station indicator - multiple rings */}
              {isDiscovered && isTransferStation && stationLines.length > 1 && (
                <>
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r={isSelected ? 20 : 18}
                    fill="none"
                    stroke={lineColors[stationLines[1] as keyof LineColors]}
                    strokeWidth="2"
                    opacity="0.7"
                  />
                  {stationLines.length > 2 && (
                    <circle
                      cx={station.x}
                      cy={station.y}
                      r={isSelected ? 24 : 22}
                      fill="none"
                      stroke={lineColors[stationLines[2] as keyof LineColors]}
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                  )}
                </>
              )}

              {/* Station circle */}
              <circle
                cx={station.x}
                cy={station.y}
                r={isSelected ? selectedRadius : baseRadius}
                fill={isDiscovered ? '#fff' : isAccessible ? '#444' : '#222'}
                stroke={isDiscovered ? lineColors[stationLines[0] as keyof LineColors] : '#333'}
                strokeWidth={isSelected ? 3 : (isTransferStation ? 2.5 : 2)}
                style={{
                  cursor: isAccessible ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  filter: isDiscovered ? `drop-shadow(0 0 12px ${lineColors[stationLines[0] as keyof LineColors]})` : 'none'
                }}
                onClick={() => isAccessible && discoverStation(station.id)}
              />

              {/* Station label */}
              {isDiscovered && (
                <text
                  x={station.x}
                  y={station.y - (isTransferStation ? 30 : 25)}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="11"
                  fontWeight="600"
                  stroke="#000"
                  strokeWidth="0.5"
                  paintOrder="stroke"
                  style={{
                    pointerEvents: 'none',
                    textShadow: '0 0 6px rgba(0,0,0,1), 0 2px 12px rgba(0,0,0,0.9)'
                  }}
                >
                  {station.name.length > 30 ? station.name.substring(0, 27) + '...' : station.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Station Details Panel */}
      {selectedStation && (
        <div style={{
          position: 'absolute',
          bottom: 30,
          left: 30,
          width: '400px',
          background: 'rgba(20,20,20,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '24px',
          zIndex: 100,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          {(() => {
            const station = getStationInfo(selectedStation);
            if (!station) return null;

            const stationLines = Object.entries(datasets)
              .filter(([_, stations]) => stations.some(s => s.id === selectedStation))
              .map(([line]) => line);

            return (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: lineColors[stationLines[0] as keyof LineColors],
                    boxShadow: `0 0 12px ${lineColors[stationLines[0] as keyof LineColors]}`
                  }} />
                  <h2 style={{
                    color: '#fff',
                    fontSize: '22px',
                    fontWeight: '700',
                    margin: 0
                  }}>
                    {station.name}
                  </h2>
                </div>
                
                <div style={{
                  color: '#888',
                  fontSize: '13px',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Dataset ID: {station.id}
                </div>
                
                {/* Stats Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>
                      RECORDS
                    </div>
                    <div style={{ color: '#fff', fontSize: '20px', fontWeight: '700' }}>
                      {station.records.toLocaleString()}
                    </div>
                  </div>

                  {station.apiData?.popularity_score && (
                    <div style={{
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>
                        POPULARITY
                      </div>
                      <div style={{ color: '#fff', fontSize: '20px', fontWeight: '700' }}>
                        {station.apiData.popularity_score.toFixed(1)}
                      </div>
                    </div>
                  )}

                  {station.apiData?.download_count !== undefined && (
                    <div style={{
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>
                        DOWNLOADS
                      </div>
                      <div style={{ color: '#fff', fontSize: '20px', fontWeight: '700' }}>
                        {station.apiData.download_count.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {station.apiData?.api_call_count !== undefined && (
                    <div style={{
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>
                        API CALLS
                      </div>
                      <div style={{ color: '#fff', fontSize: '20px', fontWeight: '700' }}>
                        {station.apiData.api_call_count.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>
                    TOPICS
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {stationLines.map(line => (
                      <span
                        key={line}
                        style={{
                          background: `${lineColors[line as keyof LineColors]}20`,
                          border: `1px solid ${lineColors[line as keyof LineColors]}`,
                          color: lineColors[line as keyof LineColors],
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}
                      >
                        {line}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Publisher and Last Modified */}
                {station.apiData && (
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '16px',
                    fontSize: '12px',
                    color: '#999'
                  }}>
                    {station.apiData.publisher && (
                      <div style={{ marginBottom: '4px' }}>
                        <strong style={{ color: '#bbb' }}>Publisher:</strong> {station.apiData.publisher}
                      </div>
                    )}
                    {station.apiData.modified && (
                      <div>
                        <strong style={{ color: '#bbb' }}>Updated:</strong> {new Date(station.apiData.modified).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => window.open(`https://data.unesco.org/explore/dataset/${station.id}/`, '_blank')}
                  style={{
                    width: '100%',
                    background: lineColors[stationLines[0] as keyof LineColors],
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                    (e.target as HTMLButtonElement).style.boxShadow = `0 6px 20px ${lineColors[stationLines[0] as keyof LineColors]}60`;
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                    (e.target as HTMLButtonElement).style.boxShadow = 'none';
                  }}
                >
                  Explore Dataset →
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute',
        top: 120,
        right: 30,
        background: 'rgba(20,20,20,0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '20px',
        zIndex: 100,
        minWidth: '180px'
      }}>
        <div style={{
          color: '#888',
          fontSize: '12px',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Transit Lines
        </div>
        {Object.entries(lineColors).map(([line, color]) => (
          <div
            key={line}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '10px'
            }}
          >
            <div style={{
              width: '24px',
              height: '4px',
              backgroundColor: color,
              borderRadius: '2px',
              boxShadow: `0 0 8px ${color}60`
            }} />
            <span style={{
              color: '#fff',
              fontSize: '14px',
              textTransform: 'capitalize',
              fontWeight: '500'
            }}>
              {line}
            </span>
          </div>
        ))}
      </div>

      {/* Instructions */}
      {discoveredStations.size === 1 && (
        <div style={{
          position: 'absolute',
          bottom: 30,
          right: 30,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '12px',
          padding: '16px 20px',
          maxWidth: '300px',
          color: '#fff',
          fontSize: '14px',
          lineHeight: '1.6',
          animation: 'pulse 2s infinite'
        }}>
          <strong>💡 Getting Started</strong><br/>
          Click on connected stations (gray dots) to discover new datasets and expand the network!
        </div>
      )}

      {/* Completion message */}
      {discoveredStations.size === totalStations && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(20,20,20,0.98)',
          backdropFilter: 'blur(30px)',
          border: '2px solid rgba(255,255,255,0.2)',
          borderRadius: '24px',
          padding: '40px 50px',
          textAlign: 'center',
          zIndex: 200,
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{
            color: '#fff',
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 12px 0'
          }}>
            Network Complete!
          </h2>
          <p style={{
            color: '#888',
            fontSize: '16px',
            margin: 0
          }}>
            You've discovered all {totalStations} UNESCO datasets
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
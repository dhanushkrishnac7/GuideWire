import React from 'react';
import './Charts.css';

const userGrowthData = [
  { name: 'Jan', users: 4000, active: 2400 },
  { name: 'Feb', users: 5000, active: 3100 },
  { name: 'Mar', users: 6500, active: 4200 },
  { name: 'Apr', users: 8200, active: 5800 },
  { name: 'May', users: 11000, active: 7900 },
  { name: 'Jun', users: 14500, active: 10500 },
];

const claimTypesData = [
  { name: 'Heavy Rain', count: 142, color: '#1A1B4B' },
  { name: 'Extreme Heat', count: 98, color: '#E8472A' },
  { name: 'Flood', count: 67, color: '#2D2E7A' },
  { name: 'High AQI', count: 54, color: '#F39C12' },
  { name: 'Strike/Curfew', count: 31, color: '#2ECC71' },
  { name: 'Zone Closure', count: 18, color: '#9B59B6' },
];

const maxUsers = Math.max(...userGrowthData.map(d => d.users));

export const UserGrowthChart = () => {
  const w = 520, h = 200;
  const pad = { left: 40, right: 20, top: 10, bottom: 30 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  const toX = (i) => pad.left + (i / (userGrowthData.length - 1)) * chartW;
  const toY = (val) => pad.top + chartH - (val / maxUsers) * chartH;

  const usersPath = userGrowthData.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d.users)}`).join(' ');
  const activePath = userGrowthData.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d.active)}`).join(' ');

  const usersArea = `${usersPath} L${toX(userGrowthData.length - 1)},${pad.top + chartH} L${pad.left},${pad.top + chartH} Z`;
  const activeArea = `${activePath} L${toX(userGrowthData.length - 1)},${pad.top + chartH} L${pad.left},${pad.top + chartH} Z`;

  return (
    <div className="chart-container animate-fade-in" style={{ animationDelay: '300ms' }}>
      <h3 className="chart-title">User Growth & Active Drivers</h3>
      <div className="chart-legend">
        <span className="legend-item"><span className="legend-dot" style={{ background: '#1A1B4B' }}></span>Total Users</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#E8472A' }}></span>Active Drivers</span>
      </div>
      <div className="chart-wrapper svg-chart">
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1A1B4B" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1A1B4B" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8472A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#E8472A" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((frac, i) => (
            <line key={i}
              x1={pad.left} y1={pad.top + chartH * (1 - frac)}
              x2={w - pad.right} y2={pad.top + chartH * (1 - frac)}
              stroke="#E8E8F0" strokeWidth="1"
            />
          ))}
          {/* Area fills */}
          <path d={usersArea} fill="url(#gradUsers)" />
          <path d={activeArea} fill="url(#gradActive)" />
          {/* Lines */}
          <path d={usersPath} fill="none" stroke="#1A1B4B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={activePath} fill="none" stroke="#E8472A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* X axis labels */}
          {userGrowthData.map((d, i) => (
            <text key={i} x={toX(i)} y={h - 6} textAnchor="middle" fontSize="11" fill="#9B9BB5">{d.name}</text>
          ))}
        </svg>
      </div>
    </div>
  );
};

const maxCount = Math.max(...claimTypesData.map(d => d.count));

export const ClaimTypesChart = () => {
  return (
    <div className="chart-container animate-fade-in" style={{ animationDelay: '400ms' }}>
      <h3 className="chart-title">Claims by Category</h3>
      <div className="bar-chart-list">
        {claimTypesData.map((d) => (
          <div key={d.name} className="bar-row">
            <div className="bar-label">{d.name}</div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(d.count / maxCount) * 100}%`, backgroundColor: d.color }}
              ></div>
            </div>
            <div className="bar-value">{d.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

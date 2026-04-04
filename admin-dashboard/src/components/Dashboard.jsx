import React from 'react';
import MetricCard from './MetricCard';
import { UserGrowthChart, ClaimTypesChart } from './Charts';
import './Dashboard.css';

// Inline SVG icons
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const UserCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <polyline points="16 11 18 13 22 9"/>
  </svg>
);
const ShieldAlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

const Dashboard = () => {
  return (
    <div className="dashboard-main animate-fade-in">
      <header className="dashboard-header animate-fade-in">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="header-actions">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>
          <button className="icon-btn">
            <BellIcon />
            <span className="badge">3</span>
          </button>
        </div>
      </header>

      <div className="metrics-grid">
        <MetricCard
          title="Total Users"
          value="14,500"
          change="+12.5%"
          svgIcon={<UsersIcon />}
          colorClass="bg-primary"
          delay={100}
        />
        <MetricCard
          title="Active Drivers"
          value="10,500"
          change="+8.2%"
          svgIcon={<UserCheckIcon />}
          colorClass="bg-success"
          delay={150}
        />
        <MetricCard
          title="Active Claims"
          value="310"
          change="-4.1%"
          svgIcon={<ShieldAlertIcon />}
          colorClass="bg-warning"
          delay={200}
        />
        <MetricCard
          title="Policy Research"
          value="8.2K"
          change="+18.4%"
          svgIcon={<TrendingUpIcon />}
          colorClass="bg-accent"
          delay={250}
        />
      </div>

      <div className="charts-grid">
        <div className="chart-span-2">
          <UserGrowthChart />
        </div>
        <div>
          <ClaimTypesChart />
        </div>
      </div>

      <div className="recent-activity animate-fade-in" style={{ animationDelay: '500ms' }}>
        <h3 className="section-title">Recent Claim Activity</h3>
        <div className="activity-list">
          {[
            { id: 'C-8921', user: 'Rahul K.', type: 'Heavy Rain (>50mm)', status: 'Approved', amount: '₹480', time: '10 mins ago' },
            { id: 'C-8920', user: 'Amit P.', type: 'Extreme Heat (46°C)', status: 'Approved', amount: '₹320', time: '2 hours ago' },
            { id: 'C-8919', user: 'Suresh D.', type: 'High AQI (AQI 340)', status: 'In Review', amount: '₹260', time: '5 hours ago' },
            { id: 'C-8918', user: 'Vikram S.', type: 'Strike / Curfew', status: 'Rejected', amount: '—', time: '1 day ago' },
          ].map((claim, idx) => (
            <div className="activity-item" key={claim.id} style={{ animationDelay: `${550 + idx * 50}ms` }}>
              <div className="activity-icon"><FileTextIcon /></div>
              <div className="activity-details">
                <div className="activity-user">{claim.user}</div>
                <div className="activity-meta">{claim.id} • {claim.type}</div>
              </div>
              <div className="activity-status">
                <span className={`status-badge ${claim.status.toLowerCase().replace(' ', '-')}`}>
                  {claim.status}
                </span>
                <div className="activity-amount">{claim.amount}</div>
              </div>
              <div className="activity-time">{claim.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

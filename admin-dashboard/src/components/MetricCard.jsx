import React from 'react';
import './MetricCard.css';

const MetricCard = ({ title, value, change, svgIcon, colorClass, delay = 0 }) => {
  const isPositive = change && change.startsWith('+');
  return (
    <div className="metric-card animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="metric-header">
        <h3 className="metric-title">{title}</h3>
        <div className={`metric-icon-wrapper ${colorClass}`}>
          {svgIcon}
        </div>
      </div>
      <div className="metric-body">
        <div className="metric-value">{value}</div>
        {change && (
          <div className={`metric-change ${isPositive ? 'positive' : 'negative'}`}>
            {change} <span className="change-text">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;

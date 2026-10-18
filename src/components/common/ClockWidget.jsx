import React, { useState, useEffect } from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { getIndonesianLiveTime } from '../../utils/formatDate';

export default function ClockWidget({ quote = '✦ Proses hari ini adalah hasil esok nanti.' }) {
  const [liveData, setLiveData] = useState(() => getIndonesianLiveTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveData(getIndonesianLiveTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="clock-widget animate-pulse-glow" role="timer" aria-live="off">
      <div className="clock-time-row">
        <Clock size={18} className="text-ice" />
        <span className="clock-time">{liveData.timeWithSeconds}</span>
      </div>
      <div className="clock-date">
        {liveData.dateStr}
      </div>
      {quote && (
        <div className="clock-quote">
          <Sparkles size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
          {quote}
        </div>
      )}
    </div>
  );
}

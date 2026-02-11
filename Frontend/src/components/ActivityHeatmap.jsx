import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';

const buildHeatmapValues = (data) => {
  const items = Array.isArray(data) ? data : data?.heatmap || [];
  

  const activityMap = {};
  items.forEach((item) => {
    const dateKey = item.date.split('T')[0]; 
    activityMap[dateKey] = item.activityCount || 0;
  });
  

  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  oneYearAgo.setDate(oneYearAgo.getDate() + 1); 
  
  const allDays = [];
  const currentDate = new Date(oneYearAgo);
  
  while (currentDate <= today) {
    const dateKey = currentDate.toISOString().split('T')[0];
    allDays.push({
      date: dateKey,
      count: activityMap[dateKey] || 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return allDays;
};

const resolveRange = () => {
  const end = new Date();
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1);
  start.setDate(start.getDate() + 1);
  return { start, end };
};

export const ActivityHeatmap = ({ data, loading }) => {
  const heatmapData = buildHeatmapValues(data);
  const { start, end } = resolveRange();

  return (
    <div className="py-8 border-t border-neutral-700/30">
      <div className="mb-6">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Activity Heatmap</p>
        <p className="text-lg font-semibold text-white">Activity</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-white/50">Loading activity...</p>
        </div>
      ) : heatmapData.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <style>{`
            .react-calendar-heatmap {
              font-family: monospace;
              font-size: 8px;
              width: 100%;
              max-width: 800px;
            }
            .react-calendar-heatmap svg {
              width: 100%;
              height: auto;
              display: block;
            }
            .react-calendar-heatmap text {
              fill: rgba(255, 255, 255, 0.75);
              font-weight: 400;
            }
            .react-calendar-heatmap .react-calendar-heatmap-small-text {
              font-size: 6px;
              fill: rgba(255, 255, 255, 0.65);
            }
            .react-calendar-heatmap .react-calendar-heatmap-month-label {
              fill: rgba(7px;
              fill: rgba(255, 255, 255, 0.65);
            }
            .react-calendar-heatmap .react-calendar-heatmap-month-label {
              fill: rgba(251, 191, 36, 0.9);
              font-weight: 600;
              font-size: 9px;
            }
            .react-calendar-heatmap .react-calendar-heatmap-weekday-label {
              fill: rgba(168, 85, 247, 0.8);
              font-weight: 500;
              font-size: 8px;
            }
            .react-calendar-heatmap rect {
              rx: 2ar-heatmap rect:hover {
              stroke: rgba(255, 255, 255, 0.3);
              stroke-width: 1;
            }
          `}</style>
          <CalendarHeatmap
            startDate={start}
            endDate={end}
            values={heatmapData}
            gutterSize={3}
            showWeekdayLabels={true}
            classForValue={(value) => {
              const count = value?.count || 0;
              if (!value || count === 0) return 'fill-neutral-800';
              if (count < 2) return 'fill-neutral-700';
              if (count < 5) return 'fill-neutral-600';
              if (count < 10) return 'fill-yellow-500/50';
              return 'fill-yellow-300/70';
            }}
            tooltipDataAttrs={(value) => {
              if (!value || !value.date) {
                return { 'data-tooltip': 'No activity' };
              }
              const dateLabel = new Date(value.date).toLocaleDateString();
              return {
                'data-tooltip': `${value.count} problem${value.count !== 1 ? 's' : ''} on ${dateLabel}`
              };
            }}
          />
        </div>
      ) : (
        <div className="flex justify-center items-center py-12">
          <p className="text-white/50">No activity data yet. Start solving problems!</p>
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <p className="text-xs text-white/50">Less</p>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded bg-neutral-800" />
          <div className="w-3 h-3 rounded bg-neutral-700" />
          <div className="w-3 h-3 rounded bg-neutral-600" />
          <div className="w-3 h-3 rounded bg-yellow-500/50" />
          <div className="w-3 h-3 rounded bg-yellow-300/70" />
        </div>
        <p className="text-xs text-white/50">More</p>
      </div>
    </div>
  );
};
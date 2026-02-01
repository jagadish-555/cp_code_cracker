import React, { useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';

export const ActivityHeatmap = ({ data, loading }) => {
  const [hoveredValue, setHoveredValue] = useState(null);

  const heatmapData = data?.heatmap?.map((item) => ({
    date: new Date(item.date),
    count: item.activityCount || 0,
  })) || [];

  const endDate = data?.endDate ? new Date(data.endDate) : new Date();
  const startDate = data?.startDate ? new Date(data.startDate) : (() => {
    const date = new Date(endDate);
    date.setFullYear(date.getFullYear() - 1);
    return date;
  })();

  const getColor = (count) => {
    if (!count) return '#262626';
    if (count < 2) return '#1f2937';
    if (count < 5) return '#374151';
    if (count < 10) return '#4b5563';
    return '#fbbf24';
  };

  return (
    <div className="py-8 border-t border-neutral-700/30">
      <div className="mb-6">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Activity Heatmap</p>
        <p className="text-lg font-semibold text-white">Last 365 Days</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-white/50">Loading activity...</p>
        </div>
      ) : heatmapData.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <style>{`
            .react-calendar-heatmap {
              font-size: 12px;
              font-family: monospace;
            }
            .react-calendar-heatmap text {
              fill: rgba(255, 255, 255, 0.9);
              font-weight: 500;
            }
            .react-calendar-heatmap .react-calendar-heatmap-small-text {
              font-size: 10px;
              fill: rgba(255, 255, 255, 0.7);
            }
            .react-calendar-heatmap .react-calendar-heatmap-month-label {
              fill: rgba(251, 191, 36, 0.9);
              font-weight: 600;
            }
            .react-calendar-heatmap .react-calendar-heatmap-weekday-label {
              fill: rgba(168, 85, 247, 0.8);
              font-weight: 500;
            }
            .react-calendar-heatmap rect {
              rx: 2;
              stroke: rgba(255, 255, 255, 0.1);
              stroke-width: 0.5;
            }
            .react-calendar-heatmap rect:hover {
              stroke: rgba(255, 255, 255, 0.3);
              stroke-width: 1;
            }
          `}</style>
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={heatmapData}
            classForValue={(value) => {
              const count = value?.count || 0;
              if (!value) {
                return 'fill-neutral-800';
              }
              if (count === 0) return 'fill-neutral-800';
              if (count < 2) return 'fill-neutral-700';
              if (count < 5) return 'fill-neutral-600';
              if (count < 10) return 'fill-yellow-500/50';
              return 'fill-yellow-300/70';
            }}
            tooltipDataAttrs={{
              'data-tooltip': (value) => {
                if (!value) return `No activity`;
                return `${value.count} problem${value.count !== 1 ? 's' : ''} on ${value.date.toLocaleDateString()}`;
              },
            }}
            showWeekdayLabels={true}
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

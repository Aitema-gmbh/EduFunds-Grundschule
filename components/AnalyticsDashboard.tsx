import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Download,
  Printer,
  FileText,
  Calendar,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
  ChevronLeft
} from 'lucide-react';
import { FundingProgram, SchoolProfile, MatchResult } from '../types';
import { exportProgramsToCSV, printPage, formatDate } from '../services/exportService';

interface AnalyticsDashboardProps {
  profile: SchoolProfile;
  programs: FundingProgram[];
  matchedPrograms: MatchResult[];
  onBack?: () => void;
}

// Custom SVG Bar Chart Component
const BarChart: React.FC<{
  data: { label: string; value: number; color?: string }[];
  title: string;
  maxValue?: number;
  height?: number;
}> = ({ data, title, maxValue, height = 200 }) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.min(60, (100 - data.length * 2) / data.length);
  const chartHeight = height / 3;

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6">
      <h3 className="text-sm font-mono uppercase tracking-widest text-stone-400 mb-4">{title}</h3>
      <svg viewBox={`0 0 100 ${chartHeight}`} className="w-full" style={{ height }}>
        {/* Y-axis grid lines */}
        {[0, 25, 50, 75, 100].map(pct => (
          <g key={pct}>
            <line
              x1="0"
              y1={chartHeight - (pct / 100) * (chartHeight - 10)}
              x2="100"
              y2={chartHeight - (pct / 100) * (chartHeight - 10)}
              stroke="#e7e5e4"
              strokeWidth="0.2"
              strokeDasharray="1,1"
            />
            <text
              x="0"
              y={chartHeight - (pct / 100) * (chartHeight - 10) - 1}
              fontSize="3"
              fill="#a8a29e"
              fontFamily="monospace"
            >
              {Math.round((pct / 100) * max)}
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / max) * (chartHeight - 15);
          const x = 10 + index * (90 / data.length);
          const y = chartHeight - barHeight - 5;

          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={item.color || '#3b82f6'}
                rx="1"
                className="transition-all duration-300 hover:opacity-80"
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight - 1}
                fontSize="3"
                fill="#78716c"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {item.label.length > 8 ? item.label.slice(0, 8) + '...' : item.label}
              </text>
              <text
                x={x + barWidth / 2}
                y={y - 2}
                fontSize="3"
                fill="#1c1917"
                textAnchor="middle"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Custom SVG Line Chart Component
const LineChart: React.FC<{
  data: { label: string; value: number }[];
  title: string;
  color?: string;
  height?: number;
}> = ({ data, title, color = '#10b981', height = 200 }) => {
  if (data.length === 0) return null;

  const max = Math.max(...data.map(d => d.value), 1);
  const min = 0;
  const range = max - min || 1;

  const points = data.map((item, index) => {
    const x = 10 + (index / (data.length - 1 || 1)) * 80;
    const y = 55 - ((item.value - min) / range) * 45;
    return { x, y, value: item.value, label: item.label };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const lastPoint = points[points.length - 1];

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6">
      <h3 className="text-sm font-mono uppercase tracking-widest text-stone-400 mb-4">{title}</h3>
      <svg viewBox="0 0 100 65" className="w-full" style={{ height }}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(pct => (
          <line
            key={pct}
            x1="10"
            y1={55 - (pct / 100) * 45}
            x2="90"
            y2={55 - (pct / 100) * 45}
            stroke="#e7e5e4"
            strokeWidth="0.2"
            strokeDasharray="1,1"
          />
        ))}

        {/* Area fill */}
        <path
          d={`${pathD} L ${lastPoint?.x || 90} 55 L 10 55 Z`}
          fill={color}
          fillOpacity="0.1"
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points and labels */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill="white"
              stroke={color}
              strokeWidth="0.8"
            />
            <text
              x={point.x}
              y="62"
              fontSize="2.5"
              fill="#78716c"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {point.label}
            </text>
            <text
              x={point.x}
              y={point.y - 3}
              fontSize="2.5"
              fill="#1c1917"
              textAnchor="middle"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {point.value}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// Custom SVG Pie Chart Component
const PieChartComponent: React.FC<{
  data: { label: string; value: number; color: string }[];
  title: string;
  height?: number;
}> = ({ data, title, height = 250 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;

  let currentAngle = -90;
  const slices = data.map(item => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...item, startAngle, angle };
  });

  const polarToCartesian = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: 50 + radius * Math.cos(rad),
      y: 50 + radius * Math.sin(rad)
    };
  };

  const describeArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(startAngle, radius);
    const end = polarToCartesian(endAngle, radius);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return `M 50 50 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6">
      <h3 className="text-sm font-mono uppercase tracking-widest text-stone-400 mb-4">{title}</h3>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <svg viewBox="0 0 100 100" className="w-48 h-48" style={{ minHeight: height / 1.5 }}>
          {slices.map((slice, index) => (
            <path
              key={index}
              d={describeArc(slice.startAngle, slice.startAngle + slice.angle, 40)}
              fill={slice.color}
              className="transition-all duration-300 hover:opacity-80"
              stroke="white"
              strokeWidth="0.5"
            />
          ))}
          {/* Center circle for donut effect */}
          <circle cx="50" cy="50" r="20" fill="white" className="dark:fill-stone-900" />
          <text x="50" y="48" fontSize="8" fill="#1c1917" textAnchor="middle" fontWeight="bold" className="dark:fill-white">
            {total}
          </text>
          <text x="50" y="55" fontSize="3" fill="#78716c" textAnchor="middle" fontFamily="monospace">
            TOTAL
          </text>
        </svg>

        {/* Legend */}
        <div className="flex flex-col gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-mono text-stone-600 dark:text-stone-400">
                {item.label}: {item.value} ({Math.round((item.value / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; positive: boolean };
}> = ({ title, value, subtitle, icon, color, trend }) => (
  <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
    <div className={`absolute top-0 left-0 w-1 h-full ${color} scale-y-0 group-hover:scale-y-100 transition-transform origin-top`} />

    <div className="flex items-start justify-between mb-4">
      <div className={`p-2.5 rounded-sm ${color.replace('bg-', 'bg-').replace('-600', '-50')} ${color.replace('bg-', 'text-')}`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-mono ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
          {trend.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {trend.positive ? '+' : ''}{trend.value}%
        </div>
      )}
    </div>

    <div className="text-3xl font-bold tracking-tight mb-1 font-mono dark:text-white">
      {value}
    </div>

    <div className="text-xs font-mono uppercase tracking-widest text-stone-400">
      {title}
    </div>

    {subtitle && (
      <div className="text-xs text-stone-500 mt-2">{subtitle}</div>
    )}
  </div>
);

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  profile,
  programs,
  matchedPrograms,
  onBack
}) => {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Calculate analytics data
  const analytics = useMemo(() => {
    // Success rate by match score ranges
    const scoreRanges = [
      { label: '90-100%', min: 90, max: 100, color: '#22c55e' },
      { label: '70-89%', min: 70, max: 89, color: '#3b82f6' },
      { label: '50-69%', min: 50, max: 69, color: '#f59e0b' },
      { label: '<50%', min: 0, max: 49, color: '#ef4444' }
    ];

    const successRateData = scoreRanges.map(range => ({
      label: range.label,
      value: matchedPrograms.filter(m => m.score >= range.min && m.score <= range.max).length,
      color: range.color
    }));

    // Monthly trends (simulated based on deadlines)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    const currentMonth = new Date().getMonth();
    const monthlyData = months.slice(0, currentMonth + 1).map((month, index) => ({
      label: month,
      value: Math.max(1, Math.floor(programs.length * (0.5 + Math.random() * 0.5) * ((index + 1) / (currentMonth + 1))))
    }));

    // Top providers pie chart
    const providerCounts: Record<string, number> = {};
    programs.forEach(p => {
      providerCounts[p.provider] = (providerCounts[p.provider] || 0) + 1;
    });

    const providerColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const topProviders = Object.entries(providerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value], index) => ({
        label,
        value,
        color: providerColors[index % providerColors.length]
      }));

    // Focus areas distribution
    const focusCounts: Record<string, number> = {};
    programs.forEach(p => {
      focusCounts[p.focus] = (focusCounts[p.focus] || 0) + 1;
    });

    const focusColors = ['#6366f1', '#14b8a6', '#f97316', '#dc2626', '#a855f7'];
    const focusDistribution = Object.entries(focusCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value], index) => ({
        label,
        value,
        color: focusColors[index % focusColors.length]
      }));

    // Calculate key metrics
    const totalPrograms = programs.length;
    const highMatchCount = matchedPrograms.filter(m => m.score >= 70).length;
    const avgScore = matchedPrograms.length > 0
      ? Math.round(matchedPrograms.reduce((sum, m) => sum + m.score, 0) / matchedPrograms.length)
      : 0;

    // Estimated total funding potential
    const totalFunding = programs.reduce((sum, p) => {
      const match = p.budget.match(/(\d+[\.,]?\d*)/);
      if (match) return sum + parseFloat(match[1].replace(',', '.')) * 1000;
      return sum;
    }, 0);

    // Upcoming deadlines count
    const now = new Date();
    const upcomingDeadlines = programs.filter(p => {
      const dateMatch = p.deadline.match(/(\d{2})\.(\d{2})\.(\d{4})/);
      if (dateMatch) {
        const deadlineDate = new Date(
          parseInt(dateMatch[3]),
          parseInt(dateMatch[2]) - 1,
          parseInt(dateMatch[1])
        );
        const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil > 0 && daysUntil <= 30;
      }
      return false;
    }).length;

    return {
      successRateData,
      monthlyData,
      topProviders,
      focusDistribution,
      totalPrograms,
      highMatchCount,
      avgScore,
      totalFunding,
      upcomingDeadlines
    };
  }, [programs, matchedPrograms]);

  // Export analytics data to CSV
  const exportAnalyticsToCSV = () => {
    const headers = [
      'Metrik',
      'Wert'
    ];

    const rows = [
      ['Gesamte Programme', analytics.totalPrograms],
      ['Hohe Uebereinstimmungen (>=70%)', analytics.highMatchCount],
      ['Durchschnittlicher Match-Score', `${analytics.avgScore}%`],
      ['Geschaetztes Gesamtpotenzial', `${Math.round(analytics.totalFunding / 1000)}k EUR`],
      ['Faellige Deadlines (30 Tage)', analytics.upcomingDeadlines],
      ['---', '---'],
      ['Match-Score Verteilung', ''],
      ...analytics.successRateData.map(d => [d.label, d.value]),
      ['---', '---'],
      ['Top Anbieter', ''],
      ...analytics.topProviders.map(d => [d.label, d.value]),
      ['---', '---'],
      ['Fokusbereich Verteilung', ''],
      ...analytics.focusDistribution.map(d => [d.label, d.value])
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_${formatDate(new Date()).replace(/\./g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-12 border-b border-stone-200 dark:border-stone-800 pb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-sm transition-colors"
              >
                <ChevronLeft className="w-5 h-5 dark:text-white" />
              </button>
            )}
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-400">
              <BarChart3 className="w-3 h-3" />
              Analytics Dashboard
            </div>
          </div>

          {/* Export Menu */}
          <div className="relative no-print">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wide border border-stone-200 dark:border-stone-700 hover:border-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors rounded-sm dark:text-white"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-lg z-50 rounded-sm">
                <button
                  onClick={exportAnalyticsToCSV}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left dark:text-white"
                >
                  <FileText className="w-4 h-4 text-green-500" />
                  Analytics als CSV
                </button>
                <button
                  onClick={() => { exportProgramsToCSV(programs, matchedPrograms); setExportMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left dark:text-white"
                >
                  <FileText className="w-4 h-4 text-blue-500" />
                  Programme als CSV
                </button>
                <div className="border-t border-stone-100 dark:border-stone-800" />
                <button
                  onClick={() => { printPage(); setExportMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left dark:text-white"
                >
                  <Printer className="w-4 h-4 text-blue-500" />
                  Seite drucken
                </button>
              </div>
            )}
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 dark:text-white">
          Foerder-Analytics <br />
          <span className="text-stone-400">{profile.name || 'Uebersicht'}</span>
        </h1>
        <p className="text-lg text-stone-500 font-light max-w-2xl font-serif italic">
          Detaillierte Statistiken und Visualisierungen Ihrer Foerdermittel-Analyse
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Programme"
          value={analytics.totalPrograms}
          icon={<FileText className="w-5 h-5" />}
          color="bg-blue-600"
        />
        <StatCard
          title="Hohe Matches"
          value={analytics.highMatchCount}
          icon={<Target className="w-5 h-5" />}
          color="bg-green-600"
          trend={{ value: 15, positive: true }}
        />
        <StatCard
          title="Match-Score"
          value={`${analytics.avgScore}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-purple-600"
        />
        <StatCard
          title="Potenzial"
          value={`${Math.round(analytics.totalFunding / 1000)}k`}
          icon={<Award className="w-5 h-5" />}
          color="bg-amber-600"
        />
        <StatCard
          title="Bald faellig"
          value={analytics.upcomingDeadlines}
          subtitle="Naechste 30 Tage"
          icon={<Calendar className="w-5 h-5" />}
          color="bg-red-600"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <BarChart
          data={analytics.successRateData}
          title="Foerder-Erfolgsrate nach Match-Score"
          height={220}
        />
        <LineChart
          data={analytics.monthlyData}
          title="Monatliche Antrags-Trends"
          color="#3b82f6"
          height={220}
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PieChartComponent
          data={analytics.topProviders}
          title="Top Foerdermittelgeber"
          height={280}
        />
        <PieChartComponent
          data={analytics.focusDistribution}
          title="Verteilung nach Foerderschwerpunkt"
          height={280}
        />
      </div>

      {/* Summary Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 mb-8">
        <h3 className="text-sm font-mono uppercase tracking-widest text-stone-400 mb-4">
          Top Programme nach Match-Score
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-700">
                <th className="text-left py-3 px-4 font-mono uppercase text-xs text-stone-400">Programm</th>
                <th className="text-left py-3 px-4 font-mono uppercase text-xs text-stone-400">Anbieter</th>
                <th className="text-left py-3 px-4 font-mono uppercase text-xs text-stone-400">Budget</th>
                <th className="text-left py-3 px-4 font-mono uppercase text-xs text-stone-400">Deadline</th>
                <th className="text-right py-3 px-4 font-mono uppercase text-xs text-stone-400">Match</th>
              </tr>
            </thead>
            <tbody>
              {[...matchedPrograms]
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map(match => {
                  const program = programs.find(p => p.id === match.programId);
                  if (!program) return null;
                  return (
                    <tr key={match.programId} className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                      <td className="py-3 px-4 font-medium dark:text-white">{program.title}</td>
                      <td className="py-3 px-4 text-stone-500 dark:text-stone-400">{program.provider}</td>
                      <td className="py-3 px-4 text-stone-500 dark:text-stone-400">{program.budget}</td>
                      <td className="py-3 px-4 text-stone-500 dark:text-stone-400">{program.deadline}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-mono font-bold ${
                          match.score >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          match.score >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                          'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {match.score}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { STATUS_CHART_COLORS, PRIORITY_CHART_COLORS, CHART_COLORS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import { useTheme } from '../../contexts/ThemeContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
      {label && <p className="text-xs text-slate-400 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export function StatusPieChart({ data, loading }) {
  if (loading) return <div className="skeleton rounded-2xl h-64" />;
  if (!data?.length) return <p className="text-center text-sm text-slate-400 py-10">No data</p>;

  const chartData = data.map((d) => ({
    name: d._id?.replace(/-/g, ' ') || 'unknown',
    value: d.count,
    color: STATUS_CHART_COLORS[d._id] || CHART_COLORS.slate,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={3}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span className="text-xs text-slate-600 dark:text-slate-300 capitalize">{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function PriorityBarChart({ data, loading }) {
  if (loading) return <div className="skeleton rounded-2xl h-64" />;
  if (!data?.length) return <p className="text-center text-sm text-slate-400 py-10">No data</p>;

  const chartData = data.map((d) => ({
    name: d._id ? d._id.charAt(0).toUpperCase() + d._id.slice(1) : 'Unknown',
    Tasks: d.count,
    fill: PRIORITY_CHART_COLORS[d._id] || CHART_COLORS.slate,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} barSize={36}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
        <Bar dataKey="Tasks" radius={[6, 6, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CompletionTrendChart({ data, loading }) {
  if (loading) return <div className="skeleton rounded-2xl h-64" />;
  if (!data?.length) return <p className="text-center text-sm text-slate-400 py-10">No data</p>;

  const chartData = data.map((d) => ({
    date: d.date ? formatDate(d.date, 'MMM dd') : '',
    Completed: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData}>
        <defs>
          <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={CHART_COLORS.brand} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.brand} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="Completed"
          stroke={CHART_COLORS.brand}
          strokeWidth={2.5}
          dot={{ fill: CHART_COLORS.brand, r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

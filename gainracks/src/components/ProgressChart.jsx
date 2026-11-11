import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function ProgressChart({ data, metricKey, metricLabel, formatValue }) {
  return (
    <div className="progress-chart"><ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 14, left: 0, bottom: 4 }}>
        <CartesianGrid stroke="#343a36" strokeDasharray="3 3" />
        <XAxis dataKey="sessionLabel" stroke="#9da69f" tick={{ fill: '#9da69f', fontSize: 11 }} />
        <YAxis width={48} stroke="#9da69f" tick={{ fill: '#9da69f', fontSize: 10 }} />
        <Tooltip contentStyle={{ background: '#171918', border: '1px solid #454d47', borderRadius: 4, color: '#f0f2ed' }} formatter={(value) => [formatValue(value), metricLabel]} />
        <Line type="monotone" dataKey={metricKey} name={metricLabel} stroke="#d22626" strokeWidth={2.5} dot={{ r: 4, fill: '#d22626', stroke: '#171918', strokeWidth: 2 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer></div>
  );
}

export default ProgressChart;
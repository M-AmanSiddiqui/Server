import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = { up: '#22c55e', slow: '#eab308', down: '#ef4444' }

export default function StatusChart({ statuses }) {
  const counts = statuses.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {})

  const data = Object.entries(counts).map(([name, value]) => ({ name, value }))

  return (
    <div className="app-panel rounded-xl border p-4 sm:rounded-2xl sm:p-6">
      <div className="app-panel-header -m-4 mb-3 rounded-t-xl px-4 py-3 sm:-m-6 sm:mb-4 sm:rounded-t-2xl sm:px-6 sm:py-4">
        <h3 className="text-base sm:text-lg font-bold text-white">Status Distribution</h3>
      </div>
      {data.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="app-muted font-medium">No data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[entry.name] || '#9ca3af'} stroke="#fff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #cfdceb',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 10px 24px rgba(15, 39, 61, 0.16)',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ResponseChart({ logs }) {
  const data = logs.slice(0, 50).reverse().map(log => ({
    time: new Date(log.logged_at).toLocaleTimeString(),
    response: log.response_time_ms || 0,
    status: log.status
  }))

  return (
    <div className="app-panel rounded-xl border p-4 sm:rounded-2xl sm:p-6">
      <div className="app-panel-header -m-4 mb-3 rounded-t-xl px-4 py-3 sm:-m-6 sm:mb-4 sm:rounded-t-2xl sm:px-6 sm:py-4">
        <h3 className="text-base sm:text-lg font-bold text-white">Response Time History</h3>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d3dfeb" opacity={0.7} />
          <XAxis dataKey="time" fontSize={11} stroke="#5f738c" />
          <YAxis unit="ms" fontSize={11} stroke="#5f738c" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: '1px solid #cfdceb', 
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 10px 24px rgba(15, 39, 61, 0.16)'
            }} 
          />
          <Line 
            type="monotone" 
            dataKey="response" 
            stroke="#0f6d8f" 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 6, fill: '#0f6d8f' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

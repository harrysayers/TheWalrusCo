import { useState } from 'react'

export const StreamingCalculator = () => {
  const [streams, setStreams] = useState(1000000)
  const perStreamRate = 0.004
  const revenue = (streams * perStreamRate).toFixed(2)

  return (
    <div className="my-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Streaming Revenue Calculator</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-2">Number of Streams: {streams.toLocaleString()}</label>
          <input
            type="range"
            min="0"
            max="10000000"
            step="100000"
            value={streams}
            onChange={(e) => setStreams(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          Estimated Revenue: ${revenue}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Based on average rate of ${perStreamRate} per stream
        </p>
      </div>
    </div>
  )
}

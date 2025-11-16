import { useState } from 'react'

export const ToggleInsight = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="my-6 border border-gray-300 dark:border-gray-700 rounded-lg p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left font-semibold"
      >
        <span>💡 Deep Dive: The Playlist Economy</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && (
        <div className="mt-4 text-sm space-y-2">
          <p>Getting placed on major playlists like "Today's Top Hits" can generate millions of streams overnight. However:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Only 1% of tracks get playlist placements</li>
            <li>Average playlist boost: 500,000-2M streams</li>
            <li>Editorial playlists convert 3x better than algorithmic ones</li>
          </ul>
        </div>
      )}
    </div>
  )
}

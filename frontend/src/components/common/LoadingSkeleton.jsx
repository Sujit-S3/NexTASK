// Light-mode glass skeleton components

const skeletonBase = {
  background: 'rgba(255,255,255,0.68)',
  border: '1px solid rgba(255,255,255,0.82)',
  backdropFilter: 'blur(16px)',
};

export function CardSkeleton({ className = '' }) {
  return (
    <div
      className={`rounded-3xl p-5 space-y-3.5 ${className}`}
      style={skeletonBase}
    >
      <div className="skeleton h-3.5 w-3/4 rounded-xl" />
      <div className="skeleton h-3 w-full rounded-lg" />
      <div className="skeleton h-3 w-5/6 rounded-lg" />
      <div className="flex gap-2 pt-1">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-5 py-3.5" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
              <div
                className="skeleton rounded-xl"
                style={{ height: '14px', width: j === 0 ? '9rem' : j === cols - 1 ? '3rem' : '6rem' }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-3xl p-5" style={skeletonBase}>
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton h-3 w-24 rounded-lg" />
        <div className="skeleton w-11 h-11 rounded-2xl" />
      </div>
      <div className="skeleton h-9 w-20 rounded-xl mb-2.5" />
      <div className="skeleton h-3 w-28 rounded-lg" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="skeleton h-7 w-52 rounded-xl mb-2" />
        <div className="skeleton h-4 w-36 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map((i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="rounded-3xl p-5 space-y-3.5" style={skeletonBase}>
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="skeleton h-4 rounded-xl" style={{ width: `${92 - i * 5}%` }} />
        ))}
      </div>
    </div>
  );
}

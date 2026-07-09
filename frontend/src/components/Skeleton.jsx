export const Skeleton = ({ width, height, borderRadius = 8, style }) => (
    <div
        className="skeleton"
        style={{ width: width || '100%', height: height || 20, borderRadius, ...style }}
    />
);

export const CardSkeleton = () => (
    <div className="skeleton-card">
        <Skeleton height={14} width="60%" />
        <Skeleton height={28} width="40%" style={{ marginTop: 8 }} />
        <Skeleton height={12} width="30%" style={{ marginTop: 6 }} />
    </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
    <div className="skeleton-table">
        <div className="skeleton-tr">
            {Array.from({ length: cols }).map((_, i) => (
                <Skeleton key={i} height={14} width={`${80 / cols}%`} />
            ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="skeleton-tr">
                {Array.from({ length: cols }).map((_, c) => (
                    <Skeleton key={c} height={14} width={`${Math.min(40 + c * 15, 90)}%`} />
                ))}
            </div>
        ))}
    </div>
);

export const ListSkeleton = ({ rows = 4 }) => (
    <div className="skeleton-list">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="skeleton-list-row">
                <div style={{ flex: 1 }}>
                    <Skeleton height={14} width="50%" />
                    <Skeleton height={12} width="30%" style={{ marginTop: 4 }} />
                </div>
                <Skeleton height={22} width={60} borderRadius={20} />
                <Skeleton height={14} width={50} />
            </div>
        ))}
    </div>
);

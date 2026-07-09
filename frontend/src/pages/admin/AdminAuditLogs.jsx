import { useState, useEffect, useCallback } from 'react';
import { getAuditLogs } from '../../api/auditLogs';
import '../../styles/Admin.css';

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);

    const fetchLogs = useCallback(async (p = 1, q = '') => {
        setLoading(true);
        try {
            const params = { page: p };
            if (q) params.search = q;
            const data = await getAuditLogs(params);
            setLogs(data.data);
            setMeta({ current: data.current_page, last: data.last_page, total: data.total });
        } catch {
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs(page, search); // eslint-disable-line react-hooks/set-state-in-effect
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, fetchLogs]);

    const handleSearch = () => {
        setPage(1);
        fetchLogs(1, search);
    };

    const actionColors = {
        CREATE: '#059669',
        UPDATE: '#d97706',
        DELETE: '#dc2626',
    };

    return (
        <div className="admin-page">
            <div className="admin-page-head">
                <h2>Audit Logs</h2>
            </div>

            <div className="admin-toolbar" style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
                <input
                    type="text"
                    placeholder="Search by user or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #d1d5db', flex: 1, maxWidth: '360px', fontSize: '14px' }}
                />
                <button className="admin-btn-ghost" type="button" onClick={handleSearch}>
                    Search
                </button>
            </div>

            <div className="admin-table-wrap">
                {loading ? (
                    <div className="admin-loading">Loading audit logs...</div>
                ) : logs.length === 0 ? (
                    <div className="admin-loading">No audit logs found.</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Admin</th>
                                <th>Action</th>
                                <th>Model</th>
                                <th>Description</th>
                                <th>IP</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td><strong>{log.user_name}</strong></td>
                                    <td>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '3px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            background: `${actionColors[log.action] || '#6b7280'}18`,
                                            color: actionColors[log.action] || '#6b7280',
                                        }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td>{log.model_type}</td>
                                    <td style={{ maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                        {log.description}
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{log.ip_address || '-'}</td>
                                    <td style={{ whiteSpace: 'nowrap', fontSize: '13px', color: '#6b7280' }}>
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {meta && meta.last > 1 && (
                <div className="admin-pagination" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button
                        className="admin-btn-ghost"
                        type="button"
                        disabled={meta.current <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Previous
                    </button>
                    <span style={{ padding: '6px 12px', fontSize: '14px', color: '#374151' }}>
                        Page {meta.current} of {meta.last}
                    </span>
                    <button
                        className="admin-btn-ghost"
                        type="button"
                        disabled={meta.current >= meta.last}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminAuditLogs;

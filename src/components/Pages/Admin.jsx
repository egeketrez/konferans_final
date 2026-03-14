import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';

const STATUS_CONFIG = {
  receipt_pending: { label: 'Dekont Bekleniyor', badge: 'warning text-dark' },
  approved:        { label: 'Onaylandı',         badge: 'success' },
  declined:        { label: 'Reddedildi',        badge: 'danger' },
  pending:         { label: 'Beklemede',          badge: 'info' },
  failed:          { label: 'Başarısız',          badge: 'secondary' },
  no_payment:      { label: 'Ödeme Yok',         badge: 'dark' },
};

const Field = ({ label, value, full = false }) => (
  <div className={full ? 'col-12' : 'col-md-6 col-12'}>
    <div className="p-2 rounded" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
      <small className="text-muted d-block mb-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</small>
      <span style={{ fontSize: '0.9rem', wordBreak: 'break-word' }}>{value || <span className="text-muted">—</span>}</span>
    </div>
  </div>
);

export default function Admin() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [actionLoading, setActionLoading] = useState('');

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, bookings(*)')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setRecords(data.map((order) => ({
        ...order,
        booking: order.bookings?.[0] || null,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/admin/giris');
      else fetchRecords();
    });
  }, [navigate, fetchRecords]);

  const updateStatus = async (orderId, newStatus) => {
    setActionLoading(orderId + newStatus);
    await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('order_id', orderId);
    await fetchRecords();
    setSelectedRecord(null);
    setActionLoading('');
  };

  const deleteRecord = async (orderId) => {
    if (!window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return;
    setActionLoading(orderId + 'delete');
    await supabase.from('orders').delete().eq('order_id', orderId);
    await fetchRecords();
    setSelectedRecord(null);
    setActionLoading('');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/giris');
  };

  const exportToExcel = () => {
    const rows = filtered.map((r) => ({
      'Sipariş No':    r.order_id,
      'Ad Soyad':      r.booking?.full_name || '',
      'E-posta':       r.booking?.email || r.customer_email || '',
      'Alt E-posta':   r.booking?.alt_email || '',
      'Telefon':       r.booking?.phone_number || r.customer_phone || '',
      'TC / Pasaport': r.booking?.passport_id || '',
      'Kulüp':         r.booking?.club_name || '',
      'Dönem Görevi':  r.booking?.term_assignment || '',
      'Paket':         r.booking?.palace_choice || '',
      'Tutar (TRY)':   r.amount || '',
      'Para Birimi':   r.currency || 'TRY',
      'Ulaşım':        r.booking?.transportation || '',
      'Giriş Günü':    r.booking?.early_stay || '',
      'Çıkış Günü':    r.booking?.checkout_day || '',
      'Oda Arkadaşı':  r.booking?.roommate || '',
      'Acil Kişi':     r.booking?.emergency_contact_name || '',
      'Acil Tel':      r.booking?.emergency_contact_phone || '',
      'Ek Notlar':     r.booking?.additional_notes || '',
      'KVKK Onayı':    r.booking?.kvkk_consent ? 'Evet' : 'Hayır',
      'Ödeme Yöntemi': r.booking?.payment_method || '',
      'Dekont URL':    r.booking?.payment_receipt_url || '',
      'Durum':         STATUS_CONFIG[r.status]?.label || r.status,
      'Kayıt Tarihi':  new Date(r.created_at).toLocaleString('tr-TR'),
      'Güncelleme':    new Date(r.updated_at).toLocaleString('tr-TR'),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kayıtlar');
    XLSX.writeFile(wb, `konferans-kayitlar-${Date.now()}.xlsx`);
  };

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (r.booking?.full_name || '').toLowerCase().includes(q) ||
      (r.booking?.email || r.customer_email || '').toLowerCase().includes(q) ||
      (r.booking?.club_name || '').toLowerCase().includes(q) ||
      (r.booking?.passport_id || '').toLowerCase().includes(q) ||
      (r.booking?.phone_number || '').toLowerCase().includes(q) ||
      r.order_id.toLowerCase().includes(q);
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:       records.length,
    pending:     records.filter((r) => r.status === 'receipt_pending').length,
    approved:    records.filter((r) => r.status === 'approved').length,
    totalAmount: records.filter((r) => r.status === 'approved').reduce((s, r) => s + (r.amount || 0), 0),
  };

  const b = selectedRecord?.booking;

  return (
    <div style={{ backgroundColor: '#f1f3f5', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav className="navbar navbar-dark px-4 py-3" style={{ backgroundColor: '#220d1c' }}>
        <span className="navbar-brand fw-bold">Admin Paneli</span>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-light btn-sm" onClick={fetchRecords}>Yenile</button>
          <button className="btn btn-outline-warning btn-sm" onClick={exportToExcel}>Excel İndir</button>
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Çıkış</button>
        </div>
      </nav>

      <div className="container-fluid px-4 py-4">

        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card text-center p-3">
              <div className="h2 mb-0 fw-bold">{stats.total}</div>
              <small className="text-muted">Toplam Kayıt</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-center p-3 border-warning">
              <div className="h2 mb-0 fw-bold text-warning">{stats.pending}</div>
              <small className="text-muted">Bekleyen Dekont</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-center p-3 border-success">
              <div className="h2 mb-0 fw-bold text-success">{stats.approved}</div>
              <small className="text-muted">Onaylanan</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-center p-3">
              <div className="h2 mb-0 fw-bold">₺{stats.totalAmount.toLocaleString('tr-TR')}</div>
              <small className="text-muted">Onaylanan Tutar</small>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-2">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ad, e-posta, kulüp, TC/pasaport, telefon veya sipariş no ile ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">Tüm Durumlar</option>
                  {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status" />
            <p className="mt-2 text-muted">Yükleniyor...</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover table-sm mb-0" style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Ad Soyad</th>
                    <th>E-posta</th>
                    <th>Telefon</th>
                    <th>TC / Pasaport</th>
                    <th>Kulüp</th>
                    <th>Dönem Görevi</th>
                    <th>Paket</th>
                    <th>Tutar</th>
                    <th>Ulaşım</th>
                    <th>Giriş</th>
                    <th>Çıkış</th>
                    <th>Oda Arkadaşı</th>
                    <th>Acil Kişi</th>
                    <th>Acil Tel</th>
                    <th>Ödeme</th>
                    <th>KVKK</th>
                    <th>Durum</th>
                    <th>Dekont</th>
                    <th>Tarih</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={21} className="text-center py-4 text-muted">Kayıt bulunamadı.</td>
                    </tr>
                  ) : filtered.map((r, i) => {
                    const sc = STATUS_CONFIG[r.status] || { label: r.status, badge: 'secondary' };
                    return (
                      <tr key={r.id}>
                        <td className="text-muted">{i + 1}</td>
                        <td>
                          <button className="btn btn-link p-0 text-start" style={{ fontSize: '0.82rem' }} onClick={() => setSelectedRecord(r)}>
                            {r.booking?.full_name || r.customer_name || '—'}
                          </button>
                        </td>
                        <td>{r.booking?.email || r.customer_email || '—'}</td>
                        <td>{r.booking?.phone_number || r.customer_phone || '—'}</td>
                        <td>{r.booking?.passport_id || '—'}</td>
                        <td>{r.booking?.club_name || '—'}</td>
                        <td>{r.booking?.term_assignment || '—'}</td>
                        <td>{r.booking?.palace_choice || '—'}</td>
                        <td>₺{(r.amount || 0).toLocaleString('tr-TR')}</td>
                        <td>{r.booking?.transportation || '—'}</td>
                        <td>{r.booking?.early_stay || '—'}</td>
                        <td>{r.booking?.checkout_day || '—'}</td>
                        <td>{r.booking?.roommate || '—'}</td>
                        <td>{r.booking?.emergency_contact_name || '—'}</td>
                        <td>{r.booking?.emergency_contact_phone || '—'}</td>
                        <td>{r.booking?.payment_method || '—'}</td>
                        <td>{r.booking?.kvkk_consent ? '✓' : '✗'}</td>
                        <td><span className={`badge bg-${sc.badge}`}>{sc.label}</span></td>
                        <td>
                          {r.booking?.payment_receipt_url
                            ? <a href={r.booking.payment_receipt_url} target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-sm py-0">Gör</a>
                            : '—'}
                        </td>
                        <td className="text-muted">{new Date(r.created_at).toLocaleDateString('tr-TR')}</td>
                        <td>
                          <div className="d-flex gap-1">
                            {r.status !== 'approved' && (
                              <button className="btn btn-success btn-sm py-0" disabled={!!actionLoading} onClick={() => updateStatus(r.order_id, 'approved')}>Onayla</button>
                            )}
                            {r.status !== 'declined' && (
                              <button className="btn btn-danger btn-sm py-0" disabled={!!actionLoading} onClick={() => updateStatus(r.order_id, 'declined')}>Reddet</button>
                            )}
                            <button className="btn btn-outline-danger btn-sm py-0" disabled={!!actionLoading} onClick={() => deleteRecord(r.order_id)}>Sil</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="card-footer text-muted small">{filtered.length} kayıt gösteriliyor</div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setSelectedRecord(null)}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#220d1c', color: '#fff' }}>
                <div>
                  <h5 className="modal-title mb-0">{b?.full_name || selectedRecord.customer_name}</h5>
                  <small style={{ opacity: 0.6 }}>{selectedRecord.order_id}</small>
                </div>
                <button className="btn-close btn-close-white" onClick={() => setSelectedRecord(null)} />
              </div>

              <div className="modal-body">

                {/* Section: Kişisel Bilgiler */}
                <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>Kişisel Bilgiler</h6>
                <div className="row g-2 mb-4">
                  <Field label="Ad Soyad"      value={b?.full_name} />
                  <Field label="E-posta"        value={b?.email || selectedRecord.customer_email} />
                  <Field label="Alt E-posta"    value={b?.alt_email} />
                  <Field label="Telefon"        value={b?.phone_number || selectedRecord.customer_phone} />
                  <Field label="TC / Pasaport"  value={b?.passport_id} />
                  <Field label="Kulüp"          value={b?.club_name} />
                  <Field label="Dönem Görevi"   value={b?.term_assignment} />
                </div>

                {/* Section: Konaklama */}
                <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>Konaklama & Ulaşım</h6>
                <div className="row g-2 mb-4">
                  <Field label="Paket"          value={b?.palace_choice} />
                  <Field label="Ulaşım"         value={b?.transportation} />
                  <Field label="Giriş Günü"     value={b?.early_stay} />
                  <Field label="Çıkış Günü"     value={b?.checkout_day} />
                  <Field label="Oda Arkadaşı"   value={b?.roommate} />
                </div>

                {/* Section: Acil Durum */}
                <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>Acil Durum</h6>
                <div className="row g-2 mb-4">
                  <Field label="Acil Kişi İsmi"    value={b?.emergency_contact_name} />
                  <Field label="Acil Kişi Telefon"  value={b?.emergency_contact_phone} />
                </div>

                {/* Section: Ödeme */}
                <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>Ödeme</h6>
                <div className="row g-2 mb-4">
                  <Field label="Tutar"          value={`₺${(selectedRecord.amount || 0).toLocaleString('tr-TR')} ${selectedRecord.currency || 'TRY'}`} />
                  <Field label="Ödeme Yöntemi"  value={b?.payment_method} />
                  <Field label="Durum"          value={STATUS_CONFIG[selectedRecord.status]?.label || selectedRecord.status} />
                  <Field label="KVKK Onayı"     value={b?.kvkk_consent ? '✓ Onaylandı' : '✗ Onaylanmadı'} />
                  {b?.additional_notes && (
                    <Field label="Ek Notlar" value={b.additional_notes} full />
                  )}
                  {b?.payment_receipt_url && (
                    <div className="col-12">
                      <div className="p-2 rounded" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                        <small className="text-muted d-block mb-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Dekont</small>
                        <a href={b.payment_receipt_url} target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-sm">
                          Dekontu Görüntüle →
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section: Sistem */}
                <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>Sistem</h6>
                <div className="row g-2">
                  <Field label="Sipariş No"     value={selectedRecord.order_id} />
                  <Field label="Kayıt Tarihi"   value={new Date(selectedRecord.created_at).toLocaleString('tr-TR')} />
                  <Field label="Son Güncelleme" value={new Date(selectedRecord.updated_at).toLocaleString('tr-TR')} />
                </div>

              </div>

              <div className="modal-footer">
                <button className="btn btn-success" disabled={!!actionLoading} onClick={() => updateStatus(selectedRecord.order_id, 'approved')}>Onayla</button>
                <button className="btn btn-danger" disabled={!!actionLoading} onClick={() => updateStatus(selectedRecord.order_id, 'declined')}>Reddet</button>
                <button className="btn btn-outline-secondary" onClick={() => setSelectedRecord(null)}>Kapat</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

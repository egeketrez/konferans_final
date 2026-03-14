import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateOrderId, fileToBase64 } from '../../lib/generateOrderId';

const CLUBS = [
  'Adana Rotaract Kulübü',
  'Adana 5 Ocak Rotaract Kulübü',
  'Adana Çukurova Rotaract Kulübü',
  'Adana Güney Rotaract Kulübü',
  'Adana Seyhan Rotaract Kulübü',
  'Alanya Rotaract Kulübü',
  'Amasya Yeşilırmak Rotaract Kulübü',
  'Anatolia Rotaract Kulübü',
  'Ankara Rotaract Kulübü',
  'Ankara Anıttepe Rotaract Kulübü',
  'Ankara Bahçelievler Rotaract Kulübü',
  'Ankara Başkent Rotaract Kulübü',
  'Ankara Beysukent Rotaract Kulübü',
  'Ankara Çayyolu Rotaract Kulübü',
  'Ankara Gaziosmanpaşa Rotaract Kulübü',
  'Ankara İncek Rotaract Kulübü',
  'Ankara International Rotaract Kulübü',
  'Ankara Kavaklıdere Rotaract Kulübü',
  'Ankara Kızılay Rotaract Kulübü',
  'Ankara Kocatepe Rotaract Kulübü',
  'Ankara Koru Rotaract Kulübü',
  'Ankara Maltepe Rotaract Kulübü',
  'Ankara Tandoğan Rotaract Kulübü',
  'Ankara Ulus Rotaract Kulübü',
  'Antakya Rotaract Kulübü',
  'Antalya Rotaract Kulübü',
  'Antalya Aspendos Rotaract Kulübü',
  'Antalya Falez Rotaract Kulübü',
  'Antalya Kaleiçi Rotaract Kulübü',
  'Antalya Perge Rotaract Kulübü',
  'Atakum Rotaract Kulübü',
  'Canik Rotaract Kulübü',
  'Çankaya Rotaract Kulübü',
  'E-Club of Korykos Rotaract Kulübü',
  'Eskişehir Rotaract Kulübü',
  'Eskişehir Gordion Rotaract Kulübü',
  'Eskişehir Yazılıkaya Rotaract Kulübü',
  'Eskişehir Yunus Emre Rotaract Kulübü',
  'Gaziantep Alleben Rotaract Kulübü',
  'Gaziantep İpekyolu Rotaract Kulübü',
  'Gaziantep Kavaklık Rotaract Kulübü',
  'Gaziantep Yesemek Rotaract Kulübü',
  'Gazi Rotaract Kulübü',
  'İlkadım 1919 Rotaract Kulübü',
  'Kayseri Rotaract Kulübü',
  'Kızkalesi Rotaract Kulübü',
  'Konya Meram Rotaract Kulübü',
  'Mersin Rotaract Kulübü',
  'Mersin Akdeniz Rotaract Kulübü',
  'Mersin Toros Rotaract Kulübü',
  'Ordu Rotaract Kulübü',
  'Samsun Rotaract Kulübü',
  'Tarsus Rotaract Kulübü',
  'Trabzon Ortahisar Rotaract Kulübü',
  'Bölge 2420',
  'Bölge 2440',
  'Rotaryen',
  'Misafir',
];

const POSITIONS = [
  'Bölge Rotaract Temsilcisi',
  'Bölge Görevlisi',
  'Başkan',
  'Asbaşkan',
  'Sekreter',
  'Sayman',
  'Yönetim Kurulu Üyesi',
  'Hizmet Projeleri Komitesi Başkanı',
  'Üyelik ve Üyeliği Geliştirme Komitesi Başkanı',
  'Halkla İlişkiler Komitesi Başkanı',
  'Uluslararası Hizmetler ve Vakıf Komitesi Başkanı',
  'Kulüp Yönetim Komitesi Başkanı',
  'Afet Komitesi Başkanı',
  'DEI Komitesi Başkanı',
  'Meslek Hizmetleri Komitesi Başkanı',
  'Hobi Komitesi Başkanı',
  'Interact Komitesi Başkanı',
  'Üye',
  'Misafir',
  'Guvernör',
  'Rotaryen',
];

const TRANSPORTS = ['Araba', 'Otobüs', 'Konferans Otobüsü', 'Uçak'];
const CHECKIN_DAYS = ['Perşembe', 'Cuma', 'Cumartesi'];
const CHECKOUT_DAYS = ['Cumartesi', 'Pazar', 'Pazartesi'];

const SELECTIONS = [
  '3 Kişi 2 Gece - 3 Silahşörler',
  '2 Kişi 2 Gece - Hansel ve Gretel',
  "1 Kişi 2 Gece - Alice'in Anahtarı",
  '3 Kişi 1 Gece Cuma - Aslan, Cadı ve Dolap',
  '3 Kişi 1 Gece Cumartesi - Camelot Konseyi',
  '2 Kişi 1 Gece Cuma - Küçük Prens ve Tilki',
  '2 Kişi 1 Gece Cumartesi - Ay Işığı Balosu',
  "1 Kişi 1 Gece Cuma - Rapunzel'in Kulesi",
  '1 Kişi 1 Gece Cumartesi - Büyülü Balkabağı',
];

const PACKAGE_PRICES = {
  '3 Kişi 2 Gece - 3 Silahşörler': 12000,
  '2 Kişi 2 Gece - Hansel ve Gretel': 12300,
  "1 Kişi 2 Gece - Alice'in Anahtarı": 15750,
  '3 Kişi 1 Gece Cuma - Aslan, Cadı ve Dolap': 6150,
  '3 Kişi 1 Gece Cumartesi - Camelot Konseyi': 8750,
  '2 Kişi 1 Gece Cuma - Küçük Prens ve Tilki': 6500,
  '2 Kişi 1 Gece Cumartesi - Ay Işığı Balosu': 9100,
  "1 Kişi 1 Gece Cuma - Rapunzel'in Kulesi": 8500,
  '1 Kişi 1 Gece Cumartesi - Büyülü Balkabağı': 10750,
};

export default function KayitOl() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    tcNo: '',
    phone: '',
    clubName: '',
    position: '',
    transport: '',
    accommodation: '',
    checkoutDay: '',
    roommate: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    selection: '',
    kvkkConsent: false,
  });

  const [errors, setErrors] = useState({});
  const [receiptFile, setReceiptFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [viewedDocs, setViewedDocs] = useState({
    consent: false,
    clarification: false,
    application: false,
  });

  const allDocsViewed = viewedDocs.consent && viewedDocs.clarification && viewedDocs.application;

  const KVKK_DOCS = [
    {
      key: 'consent',
      number: 1,
      title: 'KVKK Açık Rıza Metni',
      url: '/kvkk/acik-riza-metni.pdf',
    },
    {
      key: 'clarification',
      number: 2,
      title: 'KVKK Aydınlatma Metni - Bir Zamanlar Konferans',
      url: '/kvkk/aydinlatma-metni.pdf',
    },
    {
      key: 'application',
      number: 3,
      title: 'İlgili Kişi Başvuru Formu - Bir Zamanlar Konferans',
      url: '/kvkk/ilgili-kisi-basvuru-formu.pdf',
    },
  ];

  const handleDocOpen = (key, url) => {
    window.open(url, '_blank');
    setViewedDocs((prev) => ({ ...prev, [key]: true }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email || !validateEmail(formData.email))
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    if (!formData.fullName)
      newErrors.fullName = 'Ad ve soyad gereklidir';
    if (!formData.tcNo)
      newErrors.tcNo = 'TC Kimlik Numarası / Passport ID gereklidir';
    if (!formData.phone)
      newErrors.phone = 'Telefon numarası gereklidir';
    if (!formData.clubName)
      newErrors.clubName = 'Kulüp adı seçilmelidir';
    if (!formData.position)
      newErrors.position = 'Pozisyon seçilmelidir';
    if (!formData.transport)
      newErrors.transport = 'Ulaşım tercihi seçilmelidir';
    if (!formData.accommodation)
      newErrors.accommodation = 'Otele giriş günü seçilmelidir';
    if (!formData.checkoutDay)
      newErrors.checkoutDay = 'Otel çıkış günü seçilmelidir';
    if (!formData.emergencyContactName)
      newErrors.emergencyContactName = 'Acil durum kişisi ismi gereklidir';
    if (!formData.emergencyContactPhone)
      newErrors.emergencyContactPhone = 'Acil durum kişisi numarası gereklidir';
    if (!formData.selection)
      newErrors.selection = 'Paket seçimi gereklidir';
    if (!receiptFile)
      newErrors.receipt = 'Dekont dosyası yüklenmelidir';
    if (!formData.kvkkConsent)
      newErrors.kvkkConsent = 'KVKK onayı gereklidir';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (value || checked) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Sadece PDF, JPG, PNG veya WEBP dosyaları yüklenebilir');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Dosya boyutu 10MB\'dan küçük olmalıdır');
      return;
    }
    setReceiptFile(file);
    setErrors((prev) => { const next = { ...prev }; delete next.receipt; return next; });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const base64 = await fileToBase64(receiptFile);
      const orderId = generateOrderId();
      const amount = PACKAGE_PRICES[formData.selection] || 0;

      const functionUrl = process.env.REACT_APP_SUPABASE_FUNCTION_URL;
      const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

      const res = await fetch(`${functionUrl}/paratika-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          saveBookingOnly: true,
          orderId,
          amount,
          currency: 'TRY',
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          bookingData: {
            email: formData.email,
            full_name: formData.fullName,
            passport_id: formData.tcNo,
            club_name: formData.clubName,
            term_assignment: formData.position,
            phone_number: formData.phone,
            palace_choice: formData.selection,
            transportation: formData.transport,
            early_stay: formData.accommodation,
            checkout_day: formData.checkoutDay,
            roommate: formData.roommate,
            emergency_contact_name: formData.emergencyContactName,
            emergency_contact_phone: formData.emergencyContactPhone,
            kvkk_consent: formData.kvkkConsent,
            payment_method: 'receipt',
            payment_receipt_base64: base64,
            payment_receipt_filename: receiptFile.name,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        navigate('/tesekkurler');
      } else {
        setSubmitError(data.error || 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setSubmitError('Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">

            {submitError && (
              <div className="alert alert-danger" role="alert">
                {submitError}
              </div>
            )}

            <h2 className="mb-4" style={{ marginTop: '50px' }}>Kişisel Bilgiler</h2>

            <div className="mb-4">
              <label htmlFor="email" className="form-label">
                E-posta <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="fullName" className="form-label">
                Adı &amp; Soyadı <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                value={formData.fullName}
                onChange={handleInputChange}
              />
              {errors.fullName && <div className="invalid-feedback d-block">{errors.fullName}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="tcNo" className="form-label">
                T.C. Kimlik Numarası / Passport ID <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="tcNo"
                name="tcNo"
                className={`form-control ${errors.tcNo ? 'is-invalid' : ''}`}
                value={formData.tcNo}
                onChange={handleInputChange}
              />
              {errors.tcNo && <div className="invalid-feedback d-block">{errors.tcNo}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="form-label">
                Telefon Numarası <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                placeholder="05xx xxx xx xx"
                value={formData.phone}
                onChange={handleInputChange}
              />
              {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="clubName" className="form-label">
                Kulüp Adı <span className="text-danger">*</span>
              </label>
              <select
                id="clubName"
                name="clubName"
                className={`form-select ${errors.clubName ? 'is-invalid' : ''}`}
                value={formData.clubName}
                onChange={handleInputChange}
              >
                <option value="">Kulübünüzü Seçin</option>
                {CLUBS.map((club) => (
                  <option key={club} value={club}>{club}</option>
                ))}
              </select>
              {errors.clubName && <div className="invalid-feedback d-block">{errors.clubName}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="position" className="form-label">
                2025-2026 Dönem Görevi <span className="text-danger">*</span>
              </label>
              <select
                id="position"
                name="position"
                className={`form-select ${errors.position ? 'is-invalid' : ''}`}
                value={formData.position}
                onChange={handleInputChange}
              >
                <option value="">Görevinizi Seçin</option>
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
              {errors.position && <div className="invalid-feedback d-block">{errors.position}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="transport" className="form-label">
                Ulaşım Tercihi <span className="text-danger">*</span>
              </label>
              <select
                id="transport"
                name="transport"
                className={`form-select ${errors.transport ? 'is-invalid' : ''}`}
                value={formData.transport}
                onChange={handleInputChange}
              >
                <option value="">Ulaşım Seçin</option>
                {TRANSPORTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.transport && <div className="invalid-feedback d-block">{errors.transport}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="accommodation" className="form-label">
                Hangi gün otele giriş yapacaksınız? <span className="text-danger">*</span>
              </label>
              <select
                id="accommodation"
                name="accommodation"
                className={`form-select ${errors.accommodation ? 'is-invalid' : ''}`}
                value={formData.accommodation}
                onChange={handleInputChange}
              >
                <option value="">Gün seçin</option>
                {CHECKIN_DAYS.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              {errors.accommodation && <div className="invalid-feedback d-block">{errors.accommodation}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="checkoutDay" className="form-label">
                Hangi gün çıkış yapacaksınız? <span className="text-danger">*</span>
              </label>
              <select
                id="checkoutDay"
                name="checkoutDay"
                className={`form-select ${errors.checkoutDay ? 'is-invalid' : ''}`}
                value={formData.checkoutDay}
                onChange={handleInputChange}
              >
                <option value="">Gün seçin</option>
                {CHECKOUT_DAYS.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              {errors.checkoutDay && <div className="invalid-feedback d-block">{errors.checkoutDay}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="roommate" className="form-label">Oda Arkadaşı</label>
              <input
                type="text"
                id="roommate"
                name="roommate"
                className="form-control"
                placeholder="İsteğe bağlı"
                value={formData.roommate}
                onChange={handleInputChange}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="emergencyContactName" className="form-label">
                Acil Durumda Ulaşılacak Kişi İsmi <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="emergencyContactName"
                name="emergencyContactName"
                className={`form-control ${errors.emergencyContactName ? 'is-invalid' : ''}`}
                value={formData.emergencyContactName}
                onChange={handleInputChange}
              />
              {errors.emergencyContactName && (
                <div className="invalid-feedback d-block">{errors.emergencyContactName}</div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="emergencyContactPhone" className="form-label">
                Acil Durumda Ulaşılacak Kişi Numarası <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                className={`form-control ${errors.emergencyContactPhone ? 'is-invalid' : ''}`}
                value={formData.emergencyContactPhone}
                onChange={handleInputChange}
              />
              {errors.emergencyContactPhone && (
                <div className="invalid-feedback d-block">{errors.emergencyContactPhone}</div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="selection" className="form-label">
                Paket Seçimi <span className="text-danger">*</span>
              </label>
              <select
                id="selection"
                name="selection"
                className={`form-select ${errors.selection ? 'is-invalid' : ''}`}
                value={formData.selection}
                onChange={handleInputChange}
              >
                <option value="">Seçin</option>
                {SELECTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} — ₺{(PACKAGE_PRICES[opt] || 0).toLocaleString('tr-TR')}
                  </option>
                ))}
              </select>
              {errors.selection && <div className="invalid-feedback d-block">{errors.selection}</div>}
            </div>

            <div className="card p-4 mt-5 kayit-odeme-box">
              <h3 className="mb-4">Ödeme — Havale / EFT</h3>

              <div className="alert alert-light border mb-4" role="alert">
                <p className="mb-2"><strong>IBAN:</strong> TR17 0001 0019 3795 9466 3050 01</p>
                <p className="mb-2"><strong>Hesap İsmi:</strong> Yusuf Ufuk Altınöz</p>
                <p className="mb-0"><strong>Not:</strong> Lütfen açıklamayı boş bırakınız.</p>
              </div>

              <div className="mb-4">
                <label htmlFor="receipt" className="form-label">
                  Dekont Dosyası (PDF, JPG, PNG) <span className="text-danger">*</span>
                </label>
                <input
                  type="file"
                  id="receipt"
                  className={`form-control ${errors.receipt ? 'is-invalid' : ''}`}
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileUpload}
                />
                {receiptFile && (
                  <small className="text-success d-block mt-2">
                    ✓ {receiptFile.name} yüklenmeye hazır
                  </small>
                )}
                {errors.receipt && <div className="invalid-feedback d-block">{errors.receipt}</div>}
              </div>

              <div className="mb-4">
                <div className="p-4 rounded" style={{ backgroundColor: 'rgba(116, 38, 64, 0.25)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#db9e37" viewBox="0 0 16 16">
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                    </svg>
                    <strong style={{ color: '#ffffff' }}>KVKK - Kişisel Verilerin Korunması</strong>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }} className="mb-3">
                    Kayıt formunu göndermeden önce lütfen aşağıdaki belgeleri okuyunuz:
                  </p>

                  <div className="d-flex flex-column gap-2 mb-3">
                    {KVKK_DOCS.map((doc) => (
                      <button
                        key={doc.key}
                        type="button"
                        className="btn text-start p-0 d-flex align-items-center gap-2 border-0 bg-transparent"
                        style={{ color: viewedDocs[doc.key] ? 'rgba(255,255,255,0.45)' : '#db9e37' }}
                        onClick={() => handleDocOpen(doc.key, doc.url)}
                      >
                        {viewedDocs[doc.key] ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#4ade80" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                          </svg>
                        ) : (
                          <span
                            className="d-inline-flex align-items-center justify-content-center rounded"
                            style={{ width: 22, height: 22, backgroundColor: 'rgba(219,158,55,0.2)', color: '#db9e37', fontSize: 12, fontWeight: 700, flexShrink: 0, border: '1px solid rgba(219,158,55,0.4)' }}
                          >
                            {doc.number}
                          </span>
                        )}
                        <span style={{ textDecoration: viewedDocs[doc.key] ? 'line-through' : 'underline' }}>
                          {doc.title}
                        </span>
                      </button>
                    ))}
                  </div>

                  {!allDocsViewed && (
                    <div className="d-flex align-items-center gap-2 rounded px-3 py-2 mb-3 small"
                      style={{ backgroundColor: 'rgba(219,158,55,0.15)', border: '1px solid rgba(219,158,55,0.3)', color: '#db9e37' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                      </svg>
                      Lütfen onay kutusunu işaretlemeden önce tüm KVKK belgelerini görüntüleyin.
                    </div>
                  )}

                  <div className="form-check">
                    <input
                      className={`form-check-input ${errors.kvkkConsent ? 'is-invalid' : ''}`}
                      type="checkbox"
                      id="kvkkConsent"
                      name="kvkkConsent"
                      checked={formData.kvkkConsent}
                      onChange={handleInputChange}
                      disabled={!allDocsViewed}
                    />
                    <label className="form-check-label" htmlFor="kvkkConsent"
                      style={{ color: allDocsViewed ? '#ffffff' : 'rgba(255,255,255,0.35)' }}>
                      Yukarıdaki tüm KVKK belgelerini okudum, anladım ve kabul ediyorum.{' '}
                      <span className="text-danger">*</span>
                    </label>
                    {errors.kvkkConsent && (
                      <div className="invalid-feedback d-block">{errors.kvkkConsent}</div>
                    )}
                  </div>
                </div>
              </div>

              <button
                className="btn btn-success w-100 py-3"
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{ fontSize: '1.1rem' }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Kaydediliyor...
                  </>
                ) : (
                  'Kaydı Tamamla'
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

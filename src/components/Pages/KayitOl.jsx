import React, { useState } from 'react';

export default function KayitOl() {
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
  });

  const [errors, setErrors] = useState({});
  const [receiptFile, setReceiptFile] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardData, setCardData] = useState({
    cardHolder: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const clubs = [
    'ANKARA KAVAKLIDERE ROTARACT KULÜBÜ',
    'ANKARA İNCEK ROTARACT KULÜBÜ',
    'ANKARA GAZİOSMANPAŞA ROTARACT KULÜBÜ',
    'ÇANKAYA ROTARACT KULÜBÜ',
    'ANKARA KIZILAY ROTARACT KULÜBÜ',
    'ANKARA ULUS ROTARACT KULÜBÜ',
    'ANKARA ÇAYYOLU ROTARACT KULÜBÜ',
    'ANKARA BEYSUKENT ROTARACT KULÜBÜ',
    'ANKARA ANITTEPE ROTARACT KULÜBÜ',
    'GAZİ ROTARACT KULÜBÜ',
    'ANKARA BAHÇELİEVLER ROTARACT KULÜBÜ',
    'ANKARA INTERNATIONAL ROTARACT KULÜBÜ',
    'ANKARA BAŞKENT ROTARACT KULÜBÜ',
    'ANKARA KOCATEPE ROTARACT KULÜBÜ',
    'ANKARA MALTEPE ROTARACT KULÜBÜ',
    'ANKARA TANDOĞAN ROTARACT KULÜBÜ',
    'ANKARA ROTARACT KULÜBÜ',
    'ANKARA KORU ROTARACT KULÜBÜ',
    'MERSİN TOROS ROTARACT KULÜBÜ',
    'MERSİN ROTARACT KULÜBÜ',
    'MERSİN AKDENİZ ROTARACT KULÜBÜ',
    'TARSUS ROTARACT KULÜBÜ',
    'MERSİN KIZKALESİ ROTARACT KULÜBÜ',
    'CANİK ROTARACT KULÜBÜ',
    'İLKADIM 1919 ROTARACT KULÜBÜ',
    'ORDU ROTARACT KULÜBÜ',
    'TRABZON ORTAHİSAR ROTARACT KULÜBÜ',
    'SAMSUN ATAKUM ROTARACT KULÜBÜ',
    'SAMSUN ROTARACT KULÜBÜ',
    'ANTALYA FALEZ ROTARACT KULÜBÜ',
    'ALANYA ROTARACT KULÜBÜ',
    'ANTALYA ROTARACT KULÜBÜ',
    'ANTALYA ASPENDOS ROTARACT KULÜBÜ',
    'ANTALYA KALEİÇİ ROTARACT KULÜBÜ',
    'ANTALYA PERGE ROTARACT KULÜBÜ',
    'GAZİANTEP YESEMEK ROTARACT KULÜBÜ',
    'GAZİANTEP KAVAKLIK ROTARACT KULÜBÜ',
    'GAZİANTEP İPEKYOLU ROTARACT KULÜBÜ',
    'GAZİANTEP ALLEBEN ROTARACT KULÜBÜ',
    'ADANA GÜNEY ROTARACT',
    'ANATOLIA ROTARACT KULÜBÜ',
    'KAYSERİ ROTARACT KULÜBÜ',
    'ADANA ROTARACT KULÜBÜ',
    'ADANA ÇUKUROVA ROTARACT KULÜBÜ',
    'ANTAKYA ROTARACT KULÜBÜ',
    'ADANA 5 OCAK ROTARACT KULÜBÜ',
    'ESKİŞEHİR GORDİON ROTARACT KULÜBÜ',
    'ESKİŞEHİRYUNUS EMRE ROTARACT KULÜBÜ',
    'ESKİŞEHİR YAZILIKAYA ROTARACT KULÜBÜ',
    'ESKİŞEHİR ROTARACT KULÜBÜ',
    'KONYA MERAM ROTARACT KULÜBÜ',
    'ADANA SEYHAN ROTARACT KULÜBÜ',
    'AMASYA YEŞİLIRMAK ROTARACT KULÜBÜ',
    'ROTARY KULÜBÜ',
    'MİSAFİR'
  ];
  const positions = [
    'Bölge Rotaract Temsilcisi',
    'Bölge Görevlisi',
    'Başkan',
    'Sekreter',
    'Sayman',
    'Yönetim Kurulu Üyesi',
    'Asbaşkan',
    'Hizmet Projeleri Komitesi Başkanı',
    'Üyelik ve Üyeliği Geliştirme Komitesi Başkanı',
    'Halkla İlişkiler Komitesi Başkanı',
    'Uluslarası Hizmetler ve Vakıf Komitesi Başkanı',
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
  const transports = ['Araba', 'Otobüs', 'Konferans Otobüsü', 'Uçak'];
  const hotelCheckinDays = ['Perşembe', 'Cuma', 'Cumartesi'];
  const hotelCheckoutDays = ['Cumartesi','Pazar', 'Pazartesi'];
  const selections = [
    '3 Kişi 2 Gece - 3 Silahşörler',
    '2 Kişi 2 Gece - Hansel ve Gretel',
    "1 Kişi 2 Gece - Alice'in Anahtarı",
    '3 Kişi 1 Gece Cuma - Aslan, Cadı ve Dolap',
    '3 Kişi 1 Gece Cumartesi - Camelot Konseyi',
    '2 Kişi 1 Gece Cuma - Küçük Prens ve Tilki',
    '2 Kişi 1 Gece Cumartesi - Ay Işığı Balosu',
    '1 Kişi 1 Gece Cuma - Rapunzel’in Kulesi',
    '1 Kişi 1 Gece Cumartesi - Büyülü Balkabağı',
  ];

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    if (!formData.fullName) {
      newErrors.fullName = 'Ad ve soyad gereklidir';
    }
    if (!formData.tcNo) {
      newErrors.tcNo = 'TC Kimlik Numarası / Passport ID gereklidir';
    }
    if (!formData.phone) {
      newErrors.phone = 'Telefon numarası gereklidir';
    }
    if (!formData.clubName) {
      newErrors.clubName = 'Kulüp adı seçilmelidir';
    }
    if (!formData.position) {
      newErrors.position = 'Pozisyon seçilmelidir';
    }
    if (!formData.transport) {
      newErrors.transport = 'Ulaşım tercihi seçilmelidir';
    }
    if (!formData.accommodation) {
      newErrors.accommodation = 'Otele giriş günü seçilmelidir';
    }
    if (!formData.checkoutDay) {
      newErrors.checkoutDay = 'Otel çıkış günü seçilmelidir';
    }
    // roommate is optional
    if (!formData.emergencyContactName) {
      newErrors.emergencyContactName = 'Acil durum kişisi ismi gereklidir';
    }
    if (!formData.emergencyContactPhone) {
      newErrors.emergencyContactPhone = 'Acil durum kişisi numarası gereklidir';
    }
    if (!formData.selection) {
      newErrors.selection = 'Seçim yapılması gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (value.trim()) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (validTypes.includes(file.type)) {
        setReceiptFile(file);
      } else {
        alert('Sadece PDF, JPG veya PNG dosyaları yüklenebilir');
      }
    }
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const validateCardForm = () => {
    if (!cardData.cardHolder.trim()) {
      alert('Lutfen kart uzerindeki isim bilgisini girin');
      return false;
    }

    const cardNumber = cardData.cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cardNumber)) {
      alert('Kart numarasi 16 haneli olmalidir');
      return false;
    }

    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(cardData.expiry)) {
      alert('Son kullanma tarihi AA/YY formatinda olmalidir');
      return false;
    }

    if (!/^\d{3,4}$/.test(cardData.cvv)) {
      alert('CVV 3 veya 4 haneli olmalidir');
      return false;
    }

    return true;
  };

  const handlePaymentSubmit = (method) => {
    if (!validateForm()) {
      return;
    }

    if (method === 'card') {
      if (!validateCardForm()) {
        return;
      }
      // Existing checkout logic would be triggered here
      console.log('Card payment selected', formData, cardData);
      // TODO: Redirect to existing checkout page with formData
      alert('Kart ödeme sayfasına yönlendiriliyorsunuz...');
    } else if (method === 'receipt') {
      if (!receiptFile) {
        alert('Lütfen dekont dosyası yükleyin');
        return;
      }
      console.log('Receipt payment selected', formData, receiptFile);
      // TODO: Submit form with receipt file
      setFormSubmitted(true);
      alert('Dekont başarıyla yüklendi. Ödemeniz doğrulanmak üzere beklenmektedir.');
    }
  };

  console.log('Form state:', formData);
  console.log('Errors:', errors);

  return (
    <section className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Form Section */}
            <div className="mb-5">
              <h2 className="mb-4" style={{marginTop: '50px'}}>Kişisel Bilgiler</h2>

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
                  required
                />
                {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
              </div>

              <div className="mb-4">
                <label htmlFor="fullName" className="form-label">
                  Adı & Soyadı <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
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
                  required
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
                  required
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
                  required
                >
                  <option value="">Kulübünüzü Seçin</option>
                  {clubs.map((club) => (
                    <option key={club} value={club}>
                      {club}
                    </option>
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
                  required
                >
                  <option value="">Görevinizi Seçin</option>
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
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
                  required
                >
                  <option value="">Ulaşım Seçin</option>
                  {transports.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
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
                  required
                >
                  <option value="">Gün seçin</option>
                  {hotelCheckinDays.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
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
                  required
                >
                  <option value="">Gün seçin</option>
                  {hotelCheckoutDays.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                {errors.checkoutDay && <div className="invalid-feedback d-block">{errors.checkoutDay}</div>}
              </div>

              <div className="mb-4">
                <label htmlFor="roommate" className="form-label">
                  Oda Arkadaşı
                </label>
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
                  required
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
                  required
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
                  required
                >
                  <option value="">Seçin</option>
                  {selections.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {errors.selection && <div className="invalid-feedback d-block">{errors.selection}</div>}
              </div>
            </div>

            {/* Payment Section */}
            <div className="card p-4 mt-5 kayit-odeme-box">
              <h3 className="mb-4">Ödeme</h3>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <button
                    className="btn w-100"
                    style={{
                      backgroundColor: paymentMethod === 'card' ? '#742640' : 'transparent',
                      borderColor: '#742640',
                      color: '#fff',
                    }}
                    onClick={() => {
                      setPaymentMethod('card');
                      setTimeout(() => {
                        document.getElementById('card-payment-section')?.scrollIntoView({ behavior: 'smooth' });
                      }, 0);
                    }}
                  >
                    Kart ile Öde
                  </button>
                </div>
                <div className="col-md-6 mb-3">
                  <button
                    className="btn w-100"
                    style={{
                      backgroundColor: paymentMethod === 'receipt' ? '#742640' : 'transparent',
                      borderColor: '#742640',
                      color: '#fff',
                    }}
                    onClick={() => {
                      setPaymentMethod('receipt');
                      setTimeout(() => {
                        document.getElementById('receipt-upload-section')?.scrollIntoView({ behavior: 'smooth' });
                      }, 0);
                    }}
                  >
                    Havale/EFT
                  </button>
                </div>
              </div>
            </div>

            {paymentMethod === 'card' && (
              <div id="card-payment-section" className="card p-4 mt-4 kayit-odeme-box">
                <h4 className="mb-3">Kart ile Ödeme</h4>

                <div className="mb-3">
                  <label htmlFor="cardHolder" className="form-label">
                    Kart Üzerindeki İsim
                  </label>
                  <input
                    type="text"
                    id="cardHolder"
                    name="cardHolder"
                    className="form-control"
                    placeholder="Ad Soyad"
                    value={cardData.cardHolder}
                    onChange={handleCardInputChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="cardNumber" className="form-label">
                    Kart Numarası
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    className="form-control"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={cardData.cardNumber}
                    onChange={handleCardInputChange}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="expiry" className="form-label">
                      Son Kullanma Tarihi
                    </label>
                    <input
                      type="text"
                      id="expiry"
                      name="expiry"
                      className="form-control"
                      placeholder="AA/YY"
                      maxLength={5}
                      value={cardData.expiry}
                      onChange={handleCardInputChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="cvv" className="form-label">
                      CVV
                    </label>
                    <input
                      type="password"
                      id="cvv"
                      name="cvv"
                      className="form-control"
                      placeholder="123"
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={handleCardInputChange}
                    />
                  </div>
                </div>

                <button
                  className="btn btn-success w-100"
                  onClick={() => handlePaymentSubmit('card')}
                >
                  Kart ile Kaydı Tamamla
                </button>
              </div>
            )}

            {/* Receipt Upload Section */}
            {paymentMethod === 'receipt' && (
              <div id="receipt-upload-section" className="card p-4 mt-4 kayit-odeme-box">
                <h4 className="mb-3">Havale/EFT</h4>
                <div className="alert alert-light border mb-3" role="alert">
                  <p className="mb-2"><strong>IBAN:</strong> TR22 0015 7000 0000 0202 1914 69</p>
                  <p className="mb-2"><strong>Hesap İsmi:</strong> Nejat Ege Ketrez</p>
                  <p className="mb-0"><strong>Not:</strong> Lütfen açıklamayı boş bırakınız.</p>
                </div>
                <div className="mb-3">
                  <label htmlFor="receipt" className="form-label">
                    Dekont Dosyası (PDF, JPG, PNG)
                  </label>
                  <input
                    type="file"
                    id="receipt"
                    className="form-control"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                  />
                  {receiptFile && (
                    <small className="text-success d-block mt-2">✓ {receiptFile.name} yüklenerek hazır</small>
                  )}
                </div>
                <button
                  className="btn btn-success w-100"
                  onClick={() => handlePaymentSubmit('receipt')}
                  disabled={!receiptFile}
                >
                  Dekont ile Kaydı Tamamla
                </button>
              </div>
            )}

            {formSubmitted && (
              <div className="alert alert-success mt-4" role="alert">
                ✓ Kaydınız alınmıştır! Dekont doğrulanmak üzere beklenmektedir.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import React, { useState } from 'react';

export default function KayitOl() {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    tcNo: '',
    clubName: '',
    position: '',
    transport: '',
    accommodation: '',
    roommate: '',
    selection: '',
  });

  const [errors, setErrors] = useState({});
  const [receiptFile, setReceiptFile] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const clubs = ['Kulüp 1', 'Kulüp 2', 'Kulüp 3', 'Kulüp 4'];
  const positions = ['Başkan', 'Başkan Yardımcısı', 'Sekreter', 'Sayman'];
  const transports = ['Araba', 'Otobüs', 'Tren', 'Uçak'];
  const selections = ['option1', 'option2', 'option3', 'option4', 'option5', 'option6', 'option7', 'option8', 'option9'];

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
    if (!formData.clubName) {
      newErrors.clubName = 'Kulüp adı seçilmelidir';
    }
    if (!formData.position) {
      newErrors.position = 'Pozisyon seçilmelidir';
    }
    if (!formData.transport) {
      newErrors.transport = 'Ulaşım tercihi seçilmelidir';
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

  const handlePaymentSubmit = (method) => {
    if (!validateForm()) {
      return;
    }

    if (method === 'card') {
      // Existing checkout logic would be triggered here
      console.log('Card payment selected', formData);
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
                  2026-2027 Dönem Görevi <span className="text-danger">*</span>
                </label>
                <select
                  id="position"
                  name="position"
                  className={`form-select ${errors.position ? 'is-invalid' : ''}`}
                  value={formData.position}
                  onChange={handleInputChange}
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
                  Konferans Başlangıç Zamanından Önce otelde konaklama sağlayacak mısınız? Evet ise kaç gün kalmayı
                  planlıyorsunuz?
                </label>
                <input
                  type="text"
                  id="accommodation"
                  name="accommodation"
                  className="form-control"
                  placeholder="İsteğe bağlı"
                  value={formData.accommodation}
                  onChange={handleInputChange}
                />
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
            <div className="card p-4 mt-5">
              <h3 className="mb-4">Ödeme</h3>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => handlePaymentSubmit('card')}
                  >
                    Kart ile Öde
                  </button>
                </div>
                <div className="col-md-6 mb-3">
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => {
                      // Show receipt upload form
                      document.getElementById('receipt-upload-section').scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Dekont ile Öde
                  </button>
                </div>
              </div>
            </div>

            {/* Receipt Upload Section */}
            <div id="receipt-upload-section" className="card p-4 mt-4">
              <h4 className="mb-3">Dekont ile Ödeme</h4>
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

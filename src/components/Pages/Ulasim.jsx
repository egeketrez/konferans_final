import React, { useState } from 'react';

export default function Ulasim() {
  const [formData, setFormData] = useState({
    fullName: '',
    tcNo: '',
    phone: '',
    email: '',
    busCity: '',
  });

  const cities = [
    'Ankara',
    'Adana',
    'Antalya',
    'Eskişehir',
    'Gaziantep',
    'İstanbul',
    'İzmir',
    'Kayseri',
    'Konya',
    'Mersin',
    'Samsun',
    'Trabzon',
    'Diğer',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder submit flow until backend/form action is defined.
    console.log('Ulaşım form data:', formData);
    alert('Ulaşım formunuz alınmıştır.');
  };

  return (
    <section className="py-5 ulasim-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="mb-4" style={{ marginTop: '50px' }}>Ulaşım</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="fullName" className="form-label">Ad ve Soyad</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="form-control"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="tcNo" className="form-label">TC Kimlik No</label>
                <input
                  id="tcNo"
                  name="tcNo"
                  type="text"
                  className="form-control"
                  value={formData.tcNo}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="form-label">Telefon Numarası</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="form-label">Mail Adresi</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="busCity" className="form-label">
                  Konferans Otobüsü kullanmak istediğiniz şehir
                </label>
                <select
                  id="busCity"
                  name="busCity"
                  className="form-select"
                  value={formData.busCity}
                  onChange={handleChange}
                >
                  <option value="">Şehir seçiniz</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-light">
                Gönder
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

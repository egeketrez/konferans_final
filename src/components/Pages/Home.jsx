import React from 'react';

export default function Home() {
  return (
    <>
      {/* Main banner */}
      <section id="main-banner" className="mb-5">
        <img
          src="/images/konf_banner.jpeg"
          alt="Konf Banner"
          className="img-fluid w-100"
        />
      </section>

      {/* Konferans Ekibi Section */}
      <section id="konferans-ekibi" className="py-5">
        <div className="container">
          <h2 className="text-center mb-4">Konferans Ekibi</h2>
          <div className="row">
            {[...Array(6)].map((_, idx) => (
              <div className="col-md-4 mb-4" key={idx}>
                <div className="card">
                  <img
                    src="https://via.placeholder.com/300x200"
                    className="card-img-top"
                    alt="Team member"
                  />
                  <div className="card-body">
                    <h5 className="card-title">İsim {idx + 1}</h5>
                    <p className="card-text">Rol</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hakkımızda Section */}
      <section id="hakkimizda" className="py-5 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h2>Hakkımızda</h2>
              <p>
                Buraya şirketiniz veya konferans hakkında bilgi ekleyin. Bu metin
                iki kolon düzeninde görünecektir.
              </p>
            </div>
            <div className="col-md-6">
              <img
                src="https://via.placeholder.com/500x300"
                alt="About"
                className="img-fluid"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Kayıt Ol Section */}
      <section id="kayit-ol" className="py-5">
        <div className="container">
          <h2 className="text-center mb-4">Kayıt Ol</h2>
          <form className="mx-auto" style={{ maxWidth: '600px' }}>
            <div className="mb-3">
              <label className="form-label">İsim</label>
              <input type="text" className="form-control" placeholder="İsim" />
            </div>
            <div className="mb-3">
              <label className="form-label">E-posta</label>
              <input
                type="email"
                className="form-control"
                placeholder="E-posta"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Telefon</label>
              <input
                type="tel"
                className="form-control"
                placeholder="Telefon"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Gönder
            </button>
          </form>
        </div>
      </section>

      {/* Paketler Section */}
      <section id="paketler" className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-4">Paketler</h2>
          <div className="row">
            {[
              { title: 'Bronz', price: '₺199', features: ['Özellik 1', 'Özellik 2'] },
              { title: 'Gümüş', price: '₺299', features: ['Özellik 1', 'Özellik 2'] },
              { title: 'Altın', price: '₺399', features: ['Özellik 1', 'Özellik 2'] },
            ].map((pkg, idx) => (
              <div className="col-md-4 mb-4" key={idx}>
                <div className="card h-100">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{pkg.title}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">
                      {pkg.price}
                    </h6>
                    <ul>
                      {pkg.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                    <a href="#kayit-ol" className="btn btn-outline-primary mt-auto">
                      Seç
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* İletişim Section */}
      <section id="iletisim" className="py-5">
        <div className="container">
          <h2 className="text-center mb-4">İletişim</h2>
          <div className="row">
            <div className="col-md-6">
              <form>
                <div className="mb-3">
                  <label className="form-label">İsim</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">E-posta</label>
                  <input type="email" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mesaj</label>
                  <textarea className="form-control" rows={4}></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                  Gönder
                </button>
              </form>
            </div>
            <div className="col-md-6">
              <p><strong>Email:</strong> info@site.com</p>
              <p><strong>Telefon:</strong> +90 123 456 7890</p>
              <p><strong>Adres:</strong> Örnek Mah., İstanbul</p>
              <div style={{height:'200px',background:'#e9ecef',textAlign:'center',lineHeight:'200px'}}>
                Harita Placeholder
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

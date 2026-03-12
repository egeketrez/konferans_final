import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Spacing from '../Spacing';
import About from '../About';

export default function AnaSayfa() {
  const [sliderIndex, setSliderIndex] = useState(0);

  const packages = [
    {
      id: 1,
      subTitle: '3 kişi 2 gece',
      title: '3 Silahşörler',
      price: '₺12000',
      description: '',
      features: [
        'Ultra her şey dahil',
        '2 gece konaklama',
        'Bayrak Töreni katılımı',
        'Gala yemeği katılımı',
      ],
      image: '/images/silahşör.PNG',
      cta: 'Seç',
    },
    {
      id: 2,
      subTitle: '2 kişi 2 gece',
      title: 'Hansel ve Gretel',
      price: '₺12300',
      description: '',
      features: [
        'Ultra her şey dahil',
        '2 gece konaklama',
        'Bayrak Töreni katılımı',
        'Gala yemeği katılımı',
      ],
      image: '/images/hansel.PNG',
      cta: 'Seç',
      featured: true,
    },
    {
      id: 3,
      subTitle: '1 kişi 2 gece',
      title: "Alice'in Anahtarı",
      price: '₺15750',
      description: '',
      features: [
        'Ultra her şey dahil',
        '2 gece konaklama',
        'Bayrak Töreni katılımı',
        'Gala yemeği katılımı',
      ],
      image: '/images/alice.png',
      cta: 'Seç',
    },
    {
      id: 4,
      subTitle: '3 kişi 1 gece cuma',
      title: 'Aslan, Cadı ve Dolap',
      price: '₺6150',
      description: '',
      features: [
        'Ultra her şey dahil',
        '1 gece konaklama',
        'Bayrak Töreni katılımı',
      ],
      image: '/images/aslan.PNG',
      cta: 'Seç',
    },
    {
      id: 5,
      subTitle: '3 kişi 1 gece cumartesi',
      title: 'Camelot Konseyi',
      price: '₺8750',
      description: '',
      features: [
        'Ultra her şey dahil',
        '1 gece konaklama',
        'Gala yemeği katılımı',
      ],
      image: '/images/camelot%20konseyi.PNG',
      cta: 'Seç',
    },
    {
      id: 6,
      subTitle: '2 kişi 1 gece cuma',
      title: 'Küçük Prens ve Tilki',
      price: '₺6500',
      description: '',
      features: [
        'Ultra her şey dahil',
        '1 gece konaklama',
        'Bayrak Töreni katılımı',
      ],
      image: '/images/küçük prens.PNG',
      cta: 'Seç',
    },
    {
      id: 7,
      subTitle: '2 kişi 1 gece cumartesi',
      title: 'Ay Işığı Balosu',
      price: '₺9100',
      description: '',
      features: [
        'Ultra her şey dahil',
        '1 gece konaklama',
        'Gala yemeği katılımı',
      ],
      image: '/images/ay ışığo.PNG',
      cta: 'Seç',
    },
    {
      id: 8,
      subTitle: '1 kişi 1 gece cuma',
      title: 'Rapunzel’in Kulesi',
      price: '₺8500',
      description: '',
      features: [
        'Ultra her şey dahil',
        '1 gece konaklama',
        'Bayrak Töreni katılımı',
      ],
      image: '/images/rapunzel.PNG',
      cta: 'Seç',
    },
    {
      id: 9,
      subTitle: '1 kişi 1 gece cumartesi',
      title: 'Büyülü Balkabağı',
      price: '₺10750',
      description: '',
      features: [
        'Ultra her şey dahil',
        '1 gece konaklama',
        'Gala yemeği katılımı',
      ],
      image: '/images/balkabağı.PNG',
      cta: 'Seç',
    },
  ];

  const handleSliderNext = () => {
    if (sliderIndex + 1 < packages.length - 2) {
      setSliderIndex(sliderIndex + 1);
    }
  };

  const handleSliderPrev = () => {
    if (sliderIndex > 0) {
      setSliderIndex(sliderIndex - 1);
    }
  };

  return (
    <main
      className="ana-sayfa-bg"
      style={{ '--ana-mobile-bg': "url('/images/mobile_bg.jpg')" }}
    >
      {/* Main banner */}
      <section
        id="main-banner"
        className="mb-5"
        role="img"
        aria-label="Konf Banner"
        style={{
          backgroundImage: "url('/images/konf_banner.jpeg')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top',
        }}
      >
        <img
          src="/images/yuvarlak_logolu_banner.png"
          alt=""
          aria-hidden="true"
          className="ana-mobile-banner-bg"
        />
        <img
          src="/images/konf_logo.png"
          alt="Konf Logo"
          className="ana-mobile-banner-logo"
        />
      </section>

      <div className="ana-mobile-first-logo" aria-hidden="true">
        <img src="/images/Logo%20vek.svg" alt="" />
      </div>

      {/* About Section */}
      <div className="ana-about-mobile-textonly">
        <About
          thumbnail="/images/konf_logo.png"
          uperTitle=""
          title="Bir Zamanlar Konferans"
          subTitle={`Rotaract Konferansı, bölgemizin kapsadığı 7 farklı ülkeden
Rotaractör’lerin bir araya geldiği, yıl boyunca yapılan çalışmaların
değerlendirildiği ve başarıların ödüllendirildiği özel bir organizasyondur.
Bu etkinlikler, sadece resmi törenlerden ibaret olmamakla birlikte; aynı
zamanda sosyalleşme, eğlenme ve ilham alma alanları sunar.
Konferans süresince, yıl boyunca hayata geçirilen projeler paylaşılır,
sosyalleşilir ve başkalarının hikâyelerinden ilham alınır. Gerçekleştirilen
ödül törenleri, Rotaractörlerin emeklerinin takdir edildiği anlamlı anlara
sahne olur.
Gün boyunca düzenlenen takım oyunları, eğlenceli aktiviteler ve sosyal
etkinlikler sayesinde katılımcılar kaynaşır, dostluklar pekişir. Bu atmosfer,
Rotaract ruhunu canlı tutar ve kulüpler arası bağı güçlendirir.`}
        />
      </div>

      <Spacing lg="80" md="60" />

      <Spacing lg="80" md="60" />

      {/* Packages Slider Section */}
      <section className="py-4 ana-paketler-slider">
        <div className="container">
          <h2 className="text-center mb-4" style={{ color: '#fff' }}>Paketler</h2>
          <div className="position-relative">
            <div className="row">
              {packages.slice(sliderIndex, sliderIndex + 3).map((pkg) => (
                <div className="col-lg-4 mb-3" key={pkg.id}>
                  <div
                    className={`card h-100 ${pkg.featured ? 'shadow-lg' : ''}`}
                    style={{
                      backgroundColor: '#742640',
                      borderColor: '#742640',
                    }}
                  >
                    {pkg.id <= 3 && (
                      <div
                        className="badge position-absolute top-0 start-50 translate-middle-x mt-2"
                        style={{ backgroundColor: '#220d1c', color: '#fff', zIndex: 2 }}
                      >
                        İndirimli Fiyat
                      </div>
                    )}
                    <img src={pkg.image} alt={pkg.title} className="card-img-top" />
                    <div className="card-body d-flex flex-column" style={{ color: '#fff' }}>
                      <p className="small mb-1" style={{ color: '#fff' }}>{pkg.subTitle}</p>
                      <h5 className="card-title" style={{ color: '#fff' }}>{pkg.title}</h5>
                      {pkg.description && (
                        <p className="small ana-paketler-desc" style={{ color: '#fff' }}>{pkg.description}</p>
                      )}
                      <div className="mb-4">
                        <span className="h3" style={{ color: '#fff' }}>{pkg.price}</span>
                      </div>
                      <ul className="list-unstyled mb-4 flex-grow-1">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="mb-2" style={{ color: '#fff' }}>
                            <i className="bi bi-check-circle-fill text-white me-2"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Link
                        to="/kayit-ol"
                        className="btn w-100"
                        style={{
                          backgroundColor: pkg.featured ? '#742640' : 'transparent',
                          color: '#fff',
                          borderColor: '#fff',
                        }}
                      >
                        {pkg.cta}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Slider Navigation */}
            <button
              className="btn ana-slider-nav ana-slider-nav-prev"
              onClick={handleSliderPrev}
              disabled={sliderIndex === 0}
              aria-label="Önceki paketler"
            >
              <span aria-hidden="true">&#10094;</span>
            </button>
            <button
              className="btn ana-slider-nav ana-slider-nav-next"
              onClick={handleSliderNext}
              disabled={sliderIndex + 1 >= packages.length - 2}
              aria-label="Sonraki paketler"
            >
              <span aria-hidden="true">&#10095;</span>
            </button>
            <div className="text-center mt-2">
              <span className="ana-slider-index" style={{ color: '#742640' }}>
                {sliderIndex + 1} / {Math.ceil(packages.length - 2)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="container text-center mb-4">
        <Link
          to="/paketler"
          className="btn ana-main-cta-btn"
          style={{
            borderColor: '#742640',
            color: '#742640',
            backgroundColor: '#ffffff',
          }}
        >
          Tüm Paketleri Görüntüle
        </Link>
      </div>

      <Spacing lg="80" md="60" />

      {/* Final Section Image */}
      <section className="py-5 ana-main-cta-section" style={{ backgroundColor: '#220d1c' }}>
        <div className="container d-flex justify-content-center">
          <div
            style={{
              position: 'relative',
              maxWidth: '420px',
              width: '100%',
              borderRadius: '20px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(34, 13, 28, 0.4)',
                zIndex: 1,
              }}
            />
            <div style={{ position: 'relative', zIndex: 2, padding: '10px' }}>
              <img
                src="/images/trans_silah.png"
                alt="Trans Silah"
                className="img-fluid"
                style={{
                  width: '100%',
                  display: 'block',
                  borderRadius: '14px',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <Spacing lg="50" md="40" />
    </main>
  );
}

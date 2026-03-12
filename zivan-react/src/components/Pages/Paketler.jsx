import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';

export default function Paketler() {
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

  return (
    <section className="py-5 paketler-page" style={{ backgroundColor: '#220d1c' }}>
      <div className="container">
        <h1 className="text-center mb-5" style={{marginTop: '50px'}}>Paketler</h1>
        <div className="row">
          {packages.map((pkg) => (
            <div className="col-lg-4 mb-4" key={pkg.id}>
              <div
                className={`card h-100 ${pkg.featured ? 'shadow-lg' : ''}`}
                style={{
                  backgroundColor: 'rgba(116, 38, 64, 0.5)', /* Semi-transparent */
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '24px',
                  backdropFilter: 'blur(12px)', /* Strong glassmorphism effect */
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  overflow: 'hidden', /* Ensure image doesn't break border radius */
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
                }}
              >
                {pkg.id <= 3 && (
                  <div className="ana-paketler-ribbon" aria-hidden="true">
                    <span className="ana-paketler-ribbon-line">İndirimli</span>
                    <span className="ana-paketler-ribbon-line">Fiyat!</span>
                  </div>
                )}
                <h5 className="card-title ana-paketler-card-title" style={{ color: '#fff' }}>{pkg.title}</h5>
                <img src={pkg.image} alt={pkg.title} className="card-img-top" />
                <div className="card-body d-flex flex-column text-center" style={{ color: '#fff' }}>
                  <p className="ana-paketler-subtitle mb-2" style={{ color: '#fff' }}>{pkg.subTitle}</p>
                  {pkg.description && (
                    <p className="small" style={{ color: '#fff' }}>{pkg.description}</p>
                  )}
                  <div className="mb-4">
                    <span className="h3" style={{ color: '#fff' }}>{formatPrice(pkg.price)}</span>
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
      </div>
    </section>
  );
}

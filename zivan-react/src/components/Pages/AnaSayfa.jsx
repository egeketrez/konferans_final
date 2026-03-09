import React, { useState } from 'react';
import Hero from '../Hero';
import Spacing from '../Spacing';
import About from '../About';

export default function AnaSayfa() {
  const [sliderIndex, setSliderIndex] = useState(0);

  const packages = [
    {
      id: 1,
      title: 'Lorem Ipsum Dolor',
      price: '₺199',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      features: ['Lorem ipsum dolor sit', 'Amet consectetur', 'Adipiscing elit'],
      image: '/images/placeholder.png',
      cta: 'Seç',
    },
    {
      id: 2,
      title: 'Sit Amet Consectetur',
      price: '₺399',
      description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      features: [
        'Lorem ipsum dolor sit',
        'Amet consectetur',
        'Adipiscing elit',
        'Sed do eiusmod',
        'Tempor incididunt',
      ],
      image: '/images/placeholder.png',
      cta: 'Seç',
      featured: true,
    },
    {
      id: 3,
      title: 'Adipiscing Elit Sed',
      price: '₺599',
      description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
      features: [
        'Lorem ipsum dolor sit',
        'Amet consectetur',
        'Adipiscing elit',
        'Sed do eiusmod',
        'Tempor incididunt',
        'Ut enim ad minim',
        'Veniam quis nostrud',
      ],
      image: '/images/placeholder.png',
      cta: 'Seç',
    },
    {
      id: 4,
      title: 'Do Eiusmod Tempor',
      price: '₺149',
      description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
      features: ['Lorem ipsum dolor sit', 'Amet consectetur', 'Adipiscing elit'],
      image: '/images/placeholder.png',
      cta: 'Seç',
    },
    {
      id: 5,
      title: 'Incididunt Ut Labore',
      price: '₺499',
      description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
      features: [
        'Lorem ipsum dolor sit',
        'Amet consectetur',
        'Adipiscing elit',
        'Sed do eiusmod',
        'Tempor incididunt',
      ],
      image: '/images/placeholder.png',
      cta: 'Seç',
    },
    {
      id: 6,
      title: 'Et Dolore Magna',
      price: '₺699',
      description: 'Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor.',
      features: [
        'Lorem ipsum dolor sit',
        'Amet consectetur',
        'Adipiscing elit',
        'Sed do eiusmod',
        'Tempor incididunt',
        'Ut enim ad minim',
      ],
      image: '/images/placeholder.png',
      cta: 'Seç',
    },
    {
      id: 7,
      title: 'Aliquam Quis Nostrud',
      price: '₺899',
      description: 'In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      features: [
        'Lorem ipsum dolor sit',
        'Amet consectetur',
        'Adipiscing elit',
        'Sed do eiusmod',
        'Tempor incididunt',
      ],
      image: '/images/placeholder.png',
      cta: 'Seç',
    },
    {
      id: 8,
      title: 'Exercitation Ullamco',
      price: '₺99',
      description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
      features: ['Lorem ipsum dolor sit', 'Amet consectetur', 'Adipiscing elit'],
      image: '/images/placeholder.png',
      cta: 'Seç',
    },
    {
      id: 9,
      title: 'Laboris Nisi Ut',
      price: '₺1299',
      description: 'Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.',
      features: [
        'Lorem ipsum dolor sit',
        'Amet consectetur',
        'Adipiscing elit',
        'Sed do eiusmod',
        'Tempor incididunt',
      ],
      image: '/images/placeholder.png',
      cta: 'Seç',
    },
  ];

  const features = [
    'Lorem ipsum dolor sit amet',
    'Consectetur adipiscing elit',
    'Sed do eiusmod tempor',
    'Incididunt ut labore et dolore',
  ];

  const facts = [
    { number: '500+', title: 'Lorem Ipsum' },
    { number: '50+', title: 'Dolor Sit' },
    { number: '100+', title: 'Amet Consectetur' },
    { number: '8', title: 'Adipiscing Elit' },
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
    <>
      {/* Main banner */}
      <section id="main-banner" className="mb-5">
        <img
          src="/images/konf_banner.jpeg"
          alt="Konf Banner"
          className="img-fluid w-100"
        />
      </section>

      {/* About Section */}
      <About
        thumbnail="https://via.placeholder.com/500x600?text=Konferans"
        uperTitle="Lorem Ipsum"
        title="Dolor Sit Amet"
        subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        featureList={features}
        btnText="Daha Fazla Bilgi"
        btnUrl="#iletisim"
      />

      <Spacing lg="80" md="60" />

      {/* Fun Facts Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row text-center">
            {facts.map((fact, index) => (
              <div className="col-md-3 col-sm-6 mb-4" key={index}>
                <h3 className="cs_primary_color" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                  {fact.number}
                </h3>
                <p className="text-muted">{fact.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Spacing lg="80" md="60" />

      {/* Packages Slider Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-5">Lorem Ipsum Paketler</h2>
          <div className="position-relative">
            <div className="row">
              {packages.slice(sliderIndex, sliderIndex + 3).map((pkg) => (
                <div className="col-lg-4 mb-4" key={pkg.id}>
                  <div className={`card h-100 ${pkg.featured ? 'border-primary shadow-lg' : ''}`}>
                    {pkg.featured && (
                      <div className="badge bg-primary position-absolute top-0 start-50 translate-middle-x mt-2">
                        En Popüler
                      </div>
                    )}
                    <img src={pkg.image} alt={pkg.title} className="card-img-top" />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{pkg.title}</h5>
                      <p className="text-muted small">{pkg.description}</p>
                      <div className="mb-4">
                        <span className="h3 text-primary">{pkg.price}</span>
                      </div>
                      <ul className="list-unstyled mb-4 flex-grow-1">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="mb-2">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <a href="/paketler" className={`btn ${pkg.featured ? 'btn-primary' : 'btn-outline-primary'} w-100`}>
                        {pkg.cta}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Slider Navigation */}
            <div className="d-flex justify-content-between mt-4">
              <button
                className="btn btn-outline-primary"
                onClick={handleSliderPrev}
                disabled={sliderIndex === 0}
              >
                ← Önceki
              </button>
              <span className="align-self-center text-muted">
                {sliderIndex + 1} / {Math.ceil(packages.length - 2)}
              </span>
              <button
                className="btn btn-outline-primary"
                onClick={handleSliderNext}
                disabled={sliderIndex + 1 >= packages.length - 2}
              >
                Sonraki →
              </button>
            </div>
          </div>
        </div>
      </section>

      <Spacing lg="80" md="60" />

      {/* CTA Section */}
      <section className="py-5 text-white" style={{ backgroundColor: '#742640' }}>
        <div className="container text-center">
          <h2 className="mb-3">Lorem Ipsum Dolor Sit Amet</h2>
          <p className="mb-4 fs-5">
            Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <a href="/kayit-ol" className="btn btn-light btn-lg">
            Şimdi Kayıt Ol
          </a>
        </div>
      </section>

      <Spacing lg="50" md="40" />
    </>
  );
}

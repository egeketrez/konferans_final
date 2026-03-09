import React from 'react';

export default function Paketler() {
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

  return (
    <section className="py-5 bg-light">
      <div className="container">
        <h1 className="text-center mb-5" style={{marginTop: '50px'}}>Paketler</h1>
        <div className="row">
          {packages.map((pkg) => (
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
                  <a href="/kayit-ol" className={`btn ${pkg.featured ? 'btn-primary' : 'btn-outline-primary'} w-100`}>
                    {pkg.cta}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

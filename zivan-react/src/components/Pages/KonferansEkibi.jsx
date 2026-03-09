import React from 'react';

export default function KonferansEkibi() {
  const teamMembers = [
    { id: 1, image: '/images/ufuk_ekip.PNG' },
    { id: 2, image: '/images/ufuk_ekip.PNG' },
    { id: 3, image: '/images/ufuk_ekip.PNG' },
    { id: 4, image: '/images/ufuk_ekip.PNG' },
    { id: 5, image: '/images/ufuk_ekip.PNG' },
    { id: 6, image: '/images/ufuk_ekip.PNG' },
    { id: 7, image: '/images/ufuk_ekip.PNG' },
    { id: 8, image: '/images/ufuk_ekip.PNG' },
    { id: 9, image: '/images/ufuk_ekip.PNG' },
    { id: 10, image: '/images/ufuk_ekip.PNG' },
  ];

  return (
    <section className="py-5">
      <div className="container">
        <h1 className="text-center mb-5" style={{marginTop: '50px'}}>Konferans Ekibi</h1>
        <div className="row">
          {teamMembers.map((member) => (
            <div className="col-md-6 mb-4" key={member.id}>
              <img
                src={member.image}
                className="img-fluid"
                alt="Team member"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

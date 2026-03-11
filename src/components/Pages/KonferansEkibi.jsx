import React from 'react';

export default function KonferansEkibi() {
  const teamMembers = [
    { id: 1, image: '/images/ekip/cemre.png' },
    { id: 2, image: '/images/ekip/pınar.png' },
    { id: 3, image: '/images/ekip/ufuk.png' },
    { id: 4, image: '/images/ekip/kagan.png' },
    { id: 5, image: '/images/ekip/ege.png' },
    { id: 6, image: '/images/ekip/eda.png' },
    { id: 7, image: '/images/ekip/janset.png' },
    { id: 8, image: '/images/ekip/arın.png' },
    { id: 9, image: '/images/ekip/dilem.png' },
    { id: 10, image: '/images/ekip/görkay.png' },
    { id: 11, image: '/images/ekip/sarper.png' },
  ];

  return (
    <section className="py-5">
      <div className="container">
        <h1 className="text-center mb-5" style={{marginTop: '50px'}}>Konferans Ekibi</h1>
        <div className="row">
          {teamMembers.map((member, idx) => (
            <div
              className={`col-md-6 mb-4 ${teamMembers.length % 2 === 1 && idx === teamMembers.length - 1 ? 'offset-md-3' : ''}`}
              key={member.id}
            >
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

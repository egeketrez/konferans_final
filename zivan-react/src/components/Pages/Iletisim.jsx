import React, { useState } from 'react';

export default function Iletisim() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [contactErrors, setContactErrors] = useState({});

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateContactForm = () => {
    const errors = {};
    if (!contactForm.name) errors.name = 'Ad gereklidir';
    if (!contactForm.email) errors.email = 'E-posta gereklidir';
    if (!contactForm.subject) errors.subject = 'Konu gereklidir';
    if (!contactForm.message) errors.message = 'Mesaj gereklidir';
    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateContactForm()) {
      console.log('Contact form submitted:', contactForm);
      alert('Mesajınız başarıyla gönderildi. Teşekkürler!');
      setContactForm({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <section className="py-5">
      <div className="container">
        <h1 className="mb-5" style={{marginTop: '50px'}}>İletişim</h1>
        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="card p-4 h-100">
              <h3 className="mb-4">Bize Ulaşın</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Ad <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`form-control ${contactErrors.name ? 'is-invalid' : ''}`}
                    value={contactForm.name}
                    onChange={handleContactChange}
                    placeholder="Adınız"
                  />
                  {contactErrors.name && <div className="invalid-feedback d-block">{contactErrors.name}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="contact-email" className="form-label">
                    E-posta <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    className={`form-control ${contactErrors.email ? 'is-invalid' : ''}`}
                    value={contactForm.email}
                    onChange={handleContactChange}
                    placeholder="example@email.com"
                  />
                  {contactErrors.email && <div className="invalid-feedback d-block">{contactErrors.email}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="subject" className="form-label">
                    Konu <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className={`form-control ${contactErrors.subject ? 'is-invalid' : ''}`}
                    value={contactForm.subject}
                    onChange={handleContactChange}
                    placeholder="Konu"
                  />
                  {contactErrors.subject && <div className="invalid-feedback d-block">{contactErrors.subject}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="message" className="form-label">
                    Mesaj <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className={`form-control ${contactErrors.message ? 'is-invalid' : ''}`}
                    rows="5"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    placeholder="Mesajınız"
                  ></textarea>
                  {contactErrors.message && <div className="invalid-feedback d-block">{contactErrors.message}</div>}
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Gönder
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-6 mb-4">
            <div className="card p-4">
              <h3 className="mb-4">İletişim Bilgileri</h3>
              <div className="mb-4">
                <h5 className="mb-2">📧 E-posta</h5>
                <p>
                  <a href="mailto:anktandoganrac@gmail.com">anktandoganrac@gmail.com</a>
                </p>
              </div>
              <div className="mt-5" style={{ height: '400px' }}>
                <iframe
                  title="Pegasos Royal Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBPphyMe91Twgiuf3654gUMOlu6JSTlzsA&q=Pegasos+Royal+36.63687882642511%2C31.74900605295145"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

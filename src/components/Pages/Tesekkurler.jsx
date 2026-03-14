import React from 'react';
import { Link } from 'react-router-dom';

export default function Tesekkurler() {
  return (
    <section className="py-5" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center">
            <div
              className="p-5 mt-5 mb-5 rounded"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <div className="mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="80"
                  height="80"
                  fill="#4ade80"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                </svg>
              </div>
              <h2 className="mb-3" style={{ color: '#fff' }}>Teşekkür Ederiz!</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)' }} className="mb-2">
                Kaydınız başarıyla tamamlanmıştır.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.7)' }} className="mb-4">
                UR Bölge 2430 37. Rotaract Konferansı'nda görüşmek üzere!
              </p>
              <Link to="/" className="btn btn-primary">
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

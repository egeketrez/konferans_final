import React from 'react';

export default function Hakkimizda() {
  return (
    <section className="py-5">
      <div className="container">
        <h1 className="mb-5" style={{marginTop: '50px'}}>Hakkımızda</h1>
        <div className="row">
          <div className="col-lg-6 mb-4">
            <h2 className="h3 mb-3">Konferans Hakkında</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt 
              ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco 
              laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
          <div className="col-lg-6 mb-4">
            <img
              src="/images/placeholder.png"
              alt="Hakkımızda"
              className="img-fluid rounded"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

import React from 'react';

export default function Hakkimizda() {
  return (
    <section className="py-5">
      <div className="container">
        <h1 className="mb-5" style={{marginTop: '50px'}}>Hakkımızda</h1>
        <div className="row">
          <div className="col-lg-6 mb-4">
            <h2 className="h3 mb-3">Ankara Tandoğan Rotaract Kulübü</h2>
            <p>
              Ankara Tandoğan Rotaract Kulübü, Rotary'nin kuruluşunun 100. yılında, 24 Şubat 2004 tarihinde, charterını almıştır. Bu sayede,
              başlamış olan 2. Rotary yüzyılının ilk Rotaract kulübü sıfatına haiz olmuştur. Kuruluş hikayesinden aldığı güçle bugünlere gelen
              kulübümüz birçok toplantı, proje ve etkinliğe ev sahipliği yapmıştır. O günlerden bugüne kadar gelenekselleşmiş birçok projesiyle
              yaşadığı ülkeye ve bölgesine hizmet etmiş,
              'Hizmet Yoluyla Dostluk' idealine uygun olarak bu esnada da en çok üyeler arasındaki
              bağ ile ön plana çıkmış; üyelerinin kişisel gelişimini de öncelik olarak belirlemiştir.
            </p>
            <p>
              Projelerin planlama aşamasında, büyük küçük demeden, toplumun ihtiyaçlarına yönelik hedefler koyarak ve her zaman bir adım
              öteye götürüp, bu projeyi nasıl daha iyi yaparız sorusuyla ekip ruhunu geliştirmiş; bu süreçlerde de üyelerinin liderlik özelliklerinin
              gelişmesine katkıda bulunmuştur. Bunu bazen kütüphane yapmak için duvar boyayarak, bazen de yabancı ülkelerden gelen genç
              arkadaşlarına şehrimizi ve kültürümüzü tanıtarak yapmıştır. Tüm projelerini, büyük önder Mustafa Kemal Atatürk'ün 'Ülkesini en
              çok seven onun için en çok çalışandır' sözünü ilke haline getirerek yapmaktadır.
            </p>
          </div>
          <div className="col-lg-6 mb-4">
            <img
              src="/images/hakkimizda_foto.jpeg"
              alt="Hakkımızda"
              className="img-fluid rounded"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

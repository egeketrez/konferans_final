import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import AnaSayfa from './components/Pages/AnaSayfa';
import KonferansEkibi from './components/Pages/KonferansEkibi';
import Hakkimizda from './components/Pages/Hakkimizda';
import KayitOl from './components/Pages/KayitOl';
import Paketler from './components/Pages/Paketler';
import Iletisim from './components/Pages/Iletisim';
import Ulasim from './components/Pages/Ulasim';

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<AnaSayfa />} />
        <Route path="konferans-ekibi" element={<KonferansEkibi />} />
        <Route path="hakkimizda" element={<Hakkimizda />} />
        <Route path="kayit-ol" element={<KayitOl />} />
        <Route path="paketler" element={<Paketler />} />
        <Route path="iletisim" element={<Iletisim />} />
        <Route path="ulasim" element={<Ulasim />} />
      </Route>
    </Routes>
  );
}

export default App;

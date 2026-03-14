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
import Tesekkurler from './components/Pages/Tesekkurler';
import Admin from './components/Pages/Admin';
import AdminLogin from './components/Pages/AdminLogin';

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      <Route path="/admin/giris" element={<AdminLogin />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<AnaSayfa />} />
        <Route path="konferans-ekibi" element={<KonferansEkibi />} />
        <Route path="hakkimizda" element={<Hakkimizda />} />
        <Route path="kayit-ol" element={<KayitOl />} />
        <Route path="paketler" element={<Paketler />} />
        <Route path="iletisim" element={<Iletisim />} />
        <Route path="ulasim" element={<Ulasim />} />
        <Route path="tesekkurler" element={<Tesekkurler />} />
      </Route>
    </Routes>
  );
}

export default App;

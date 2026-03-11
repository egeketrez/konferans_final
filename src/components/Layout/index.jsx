import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header';

export default function Layout({ darkMode }) {
  return (
    <div className={`${darkMode ? 'cs_dark' : ''} konf-page-bg`}>
      <Header
        logoUrl="/images/konf_logo.png"
        actionBtnText="Kayıt Ol"
        actionBtnUrl="/kayit-ol"
      />
      <Outlet />
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Link may not be needed but kept for logo


export default function Header({
  logoUrl,
  colorVariant,
  actionBtnText,
  actionBtnUrl,
}) {
  const [isSticky, setIsSticky] = useState(false);
  const [mobileToggle, setMobileToggle] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <header
      className={`cs_site_header cs_style_1 cs_sticky_header ${
        colorVariant ? colorVariant : 'cs_primary_color'
      } ${isSticky ? 'cs_gescout_show' : ''}`}
      style={{
        backgroundColor: '#220d1c',
      }}
    >
      <div className="cs_main_header">
        <div className="container">
          <div className="cs_main_header_in">
            <div
              className="cs_main_header_left d-none d-lg-block"
              style={{ display: 'flex', alignItems: 'center', height: '100%' }}
            >
              <Link className="cs_site_branding" to="/" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{ maxHeight: '208px', width: 'auto', display: 'block', transform: 'translateY(18px)' }}
                />
              </Link>
            </div>
            <div className="cs_main_header_center">
              <div className="cs_nav cs_medium cs_primary_font" style={{ color: '#ffffff' }}>
                <ul
                  className={`${
                    mobileToggle ? 'cs_nav_list cs_active' : 'cs_nav_list'
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  <li>
                    <Link to="/" onClick={() => setMobileToggle(false)} style={{ color: '#ffffff' }}>
                      Ana Sayfa
                    </Link>
                  </li>
                  <li>
                    <Link to="/konferans-ekibi" onClick={() => setMobileToggle(false)} style={{ color: '#ffffff' }}>
                      Konferans Ekibi
                    </Link>
                  </li>
                  <li>
                    <Link to="/hakkimizda" onClick={() => setMobileToggle(false)} style={{ color: '#ffffff' }}>
                      Hakkımızda
                    </Link>
                  </li>
                  <li>
                    <Link to="/kayit-ol" onClick={() => setMobileToggle(false)} style={{ color: '#ffffff' }}>
                      Kayıt Ol
                    </Link>
                  </li>
                  <li>
                    <Link to="/paketler" onClick={() => setMobileToggle(false)} style={{ color: '#ffffff' }}>
                      Paketler
                    </Link>
                  </li>
                  <li>
                    <Link to="/iletisim" onClick={() => setMobileToggle(false)} style={{ color: '#ffffff' }}>
                      İletişim
                    </Link>
                  </li>
                </ul>
                <span
                  className={
                    mobileToggle
                      ? 'cs_menu_toggle cs_teggle_active'
                      : 'cs_menu_toggle'
                  }
                  onClick={() => setMobileToggle(!mobileToggle)}
                >
                  <span></span>
                </span>
              </div>
            </div>
            <div className="cs_main_header_right">
              <Link
                to={actionBtnUrl}
                className={`cs_btn cs_style_1  ${
                  colorVariant ? 'cs_btn_white' : ''
                }`}
                style={{
                  backgroundColor: '#db9e37',
                  color: '#ffffff',
                  width: '100%',
                  textDecoration: 'none',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  display: 'inline-block',
                  textAlign: 'center'
                }}
              >
                {actionBtnText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import Dropdown from '../utils/Dropdown';

const Header = () =>  {

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const trigger = useRef(null);
  const mobileNav = useRef(null);

  // close the mobile menu on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!mobileNav.current || !trigger.current) return;
      if (!mobileNavOpen || mobileNav.current.contains(target) || trigger.current.contains(target)) return;
      setMobileNavOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close the mobile menu if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!mobileNavOpen || keyCode !== 27) return;
      setMobileNavOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <header className="relative w-full z-30  bg-gray-600">
      <div className="max-w-6xl mx-4 px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">

          {/* Site branding */}

          {/* Mobile menu */}
          <div className="">

            {/* Hamburger button */}
            <button ref={trigger} className={`hamburger ${mobileNavOpen && 'active'}`} aria-controls="mobile-nav" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(!mobileNavOpen)}>
              <span className="sr-only">Menu</span>
              <svg className="w-6 h-6 fill-current text-gray-300 hover:text-gray-200 transition duration-150 ease-in-out" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect y="4" width="24" height="2" rx="1" />
                <rect y="11" width="24" height="2" rx="1" />
                <rect y="18" width="24" height="2" rx="1" />
              </svg>
            </button>

            {/*Mobile navigation */}
            <nav id="mobile-nav" ref={mobileNav} className="absolute top-full z-20 -left-6 w-1/6 px-4 sm:px-6 overflow-hidden transition-all duration-300 ease-in-out" style={mobileNavOpen ? { maxHeight: mobileNav.current.scrollHeight, opacity: 1 } : { maxHeight: 0, opacity: .8 } }>
              <ul className="bg-gray-800 px-2 py-2">
                <li>
                  <Link to={"/tradingchart"}> 
                    <div className="flex font-medium w-full text-purple-600 hover:text-gray-200 py-2 justify-center active:text-gray-200">Charts</div>
                  </Link>
                </li>
                <li>
                  <Link to={"/heatmap"}> 
                    <div className="flex font-medium w-full text-purple-600 hover:text-gray-200 py-2 justify-center active:text-gray-200">Heatmap</div>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

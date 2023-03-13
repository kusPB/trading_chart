import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import EventBus from './pages/common/EventBus';
//import css
import './App.css';
//import pages
import Header from './pages/common/header';
import TradingViewChart from './pages/tradingchart/components/tradingViewChart'
import HeatMap from './pages/heatmap/heatmap'

function App() {
  const [showModeratorBoard, setShowModeratorBoard] = useState(false);
  const [showAdminBoard, setShowAdminBoard] = useState(false);
  const [currentUser, setCurrentUser] = useState(undefined);

  // useEffect(() => {
  //   // const user = AuthService.getCurrentUser();

  //   if (user) {
  //     setCurrentUser(user);
  //     setShowModeratorBoard(user.roles.includes("ROLE_MODERATOR"));
  //     setShowAdminBoard(user.roles.includes("ROLE_ADMIN"));
  //   }

  //   EventBus.on("logout", () => {
  //     logOut();
  //   });

  //   return () => {
  //     EventBus.remove("logout");
  //   };
  // }, []);

  const logOut = () => {
    // AuthService.logout();
    setShowModeratorBoard(false);
    setShowAdminBoard(false);
    setCurrentUser(undefined);
  };

  return (
    <div className="App">
      {/* <Header /> */}
      <Routes>
          <Route index element={<Navigate to='/tradingchart' />} />
          <Route path = "tradingchart" element = { <TradingViewChart/> } />
          <Route path = "heatmap" element = { <HeatMap/> } />
      </Routes>
    </div>
  );
}

export default App;

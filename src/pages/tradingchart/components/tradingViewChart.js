import React, { useEffect } from "react";
import Datafeed from "../trading-view/datafeed";
// import TradingView from "../charting_library/charting_library.standalone";
import {widget} from "../charting_library";

const TradingViewChart = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "text/jsx";
    script.src = "%PUBLIC_URL%/charting_library/charting_library.js";
    document.head.appendChild(script);

    window.tvWidget = new widget({
      symbol: "NASDAQ:AAPL", // default symbol
      interval: "1", // default interval
      fullscreen: true, // displays the chart in the fullscreen mode
      container: "tv_chart_container",
      datafeed: Datafeed,
      library_path: "/charting_library/",
      debug: true
    });
    //Do not forget to remove the script on unmounting the component!
    return () => script.remove();
  }, []); //eslint-disable-line

  return <div id="tv_chart_container"></div>;
};

export default TradingViewChart;
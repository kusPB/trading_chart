import { makeApiRequest, generateSymbol, parseFullSymbol } from "./helpers.js";
import { subscribeOnStream, unsubscribeFromStream } from "./streaming.js";

const lastBarsCache = new Map();
const twelveInterval = { "1":"1min", "5":"5min", "15":"15min" ,"30":"30min", "45":"45min" ,"60":"1hour", "120":"2hours", "240":"4hour", "1D":"1day", "1W":"1week", "1M":"1month" }
const configurationData = {
  supported_resolutions: [ "1","5","15","30","45","60","120","240", "1D", "1W", "1M"],
  exchanges: [
    {
      value: "NSE",
      name: "NSE",
      desc: "NSE",
    },
  ],
  symbols_types: [
    {
      name: "Common Stock",

      // `symbolType` argument for the `searchSymbols` method, if a user selects this symbol type
      value: "Common Stock",
    },
    // ...
  ],
};

async function getAllSymbols() {
  const data = await makeApiRequest("stocks?exchange=NSE&show_plan=true");
      const symbols = data.data.map((data,index) => {
        return  {
          symbol: data.symbol,
          full_name: data.exchange+':'+data.symbol,
          description: data.name,
          exchange: data.exchange,
          type: data.type,
        };
      });
  return symbols;
}

const output =  {
  onReady: (callback) => {
    console.log("[onReady]: Method call");
    setTimeout(() => callback(configurationData));
  },
  searchSymbols: async (
    userInput,
    exchange,
    symbolType,
    onResultReadyCallback
  ) => {
    console.log("[searchSymbols]: Method call");
    const symbols = await getAllSymbols();
    const newSymbols = symbols.filter((symbol) => {
      const isExchangeValid = exchange === "" || symbol.exchange === exchange;
      const isFullSymbolContainsInput =
        symbol.full_name.toLowerCase().indexOf(userInput.toLowerCase()) !== -1;
      return isExchangeValid && isFullSymbolContainsInput;
    });
    onResultReadyCallback(newSymbols);
  },

  resolveSymbol: async (
    symbolName,
    onSymbolResolvedCallback,
    onResolveErrorCallback
  ) => {
    console.log("[resolveSymbol]: Method call", symbolName);
    const symbols = await getAllSymbols();
    const symbolItem = symbols.find(
      ({ full_name }) => full_name === symbolName
    );
    if (!symbolItem) {
      console.log("[resolveSymbol]: Cannot resolve symbol", symbolName);
      onResolveErrorCallback("cannot resolve symbol");
      return;
    }
    console.log('symbolitem',symbolItem)
    const symbolInfo = {
      ticker: symbolItem.full_name,
      name: symbolItem.symbol,
      description: symbolItem.description,
      type: symbolItem.type,
      session: "24x7",
      timezone: "Etc/UTC",
      exchange: symbolItem.exchange,
      listed_exchange:symbolItem.exchange,
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_no_volume: true,
      has_weekly_and_monthly: false,
      supported_resolutions: configurationData.supported_resolutions,
      volume_precision: 2,
      data_status: "streaming",
    };

    console.log("[resolveSymbol]: Symbol resolved", symbolName);
    onSymbolResolvedCallback(symbolInfo);
  },

  getBars: async (
    symbolInfo,
    resolution,
    periodParams,
    onHistoryCallback,
    onErrorCallback
  ) => {
    console.log('123',resolution)
    const { from, to, firstDataRequest } = periodParams;
    let end_date = new Date(to*1000);
    console.log("[getBars]: Method call", symbolInfo, resolution, from, to);
    console.log("twelveInterval[resolution]", resolution);
    const urlParameters = {
      symbol: symbolInfo.name,
      type: 'stock',
      interval:twelveInterval[resolution],
      exchange: symbolInfo.exchange,
      outputsize: 100,
      end_date: ((end_date.getFullYear()<10)?'0':'')+end_date.getFullYear()+'-'+((end_date.getMonth()<9)?'0':'')+(end_date.getMonth()+1)+'-'+((end_date.getDate()<10)?'0':'')+end_date.getDate()+' '+((end_date.getHours()<10)?'0':'')+end_date.getHours()+':'+((end_date.getMinutes()<10)?'0':'')+end_date.getMinutes()+':'+((end_date.getSeconds()<10)?'0':'')+end_date.getSeconds()
    }
      let query = Object.keys(urlParameters)
      .map((name) => `${name}=${(urlParameters[name])}`)
      .join("&");
    try {
      const data = await makeApiRequest(`time_series?${query}`);
      if (
        (data.status && data.status === "error") ||
        data.values.length === 0
      ) {
        // "noData" should be set if there is no data in the requested period.
        onHistoryCallback([], {
          noData: true,
        });
        return;
      }
      let bars = [];
      data.values = data.values.reverse();
      data.values.forEach((bar) => {
        let time = new Date(bar.datetime);
        let mtime = time.getTime()/1000;
        if (mtime>= from && mtime < to) {
          bars = [
            ...bars,
            {
              time: mtime * 1000,
              low: bar.low,
              high: bar.high,
              open: bar.open,
              close: bar.close,
            },
          ];
        }
      });
      if (firstDataRequest) {
        lastBarsCache.set(symbolInfo.full_name, {
          ...bars[bars.length - 1],
        });
      }
      console.log(`[getBars]: returned ${bars.length} bar(s)`);
      onHistoryCallback(bars, {
        noData: false,
      });
      return;
    } catch (error) {
      console.log("[getBars]: Get error", error);
      onErrorCallback(error);
    }
  },

  subscribeBars: (
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscribeUID,
    onResetCacheNeededCallback
  ) => {
    console.log(
      "[subscribeBars]: Method call with subscribeUID:",
      subscribeUID
    );
    subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscribeUID,
      onResetCacheNeededCallback,
      lastBarsCache.get(symbolInfo.full_name)
    );
  },

  unsubscribeBars: (subscriberUID) => {
    console.log(
      "[unsubscribeBars]: Method call with subscriberUID:",
      subscriberUID
    );
    unsubscribeFromStream(subscriberUID);
  },
};

export default output;
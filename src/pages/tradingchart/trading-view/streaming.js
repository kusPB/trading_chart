const { parseFullSymbol } = require("./helpers.js");
// const WebSocket = require('ws');
const socket = new WebSocket(`wss://test.lisuns.com:4576`);
const password = "bc4824f9-3adc-49e4-95d5-fc1583660f66";
const channelToSubscription = new Map();
const Authenticate = () =>{
  const message ={
      MessageType: "Authenticate",
      Password: password
  }
   const jsonmessage = JSON.stringify(message);
            socket.send(jsonmessage);
}
socket.onopen = function(e) {
  console.log("[open] Connection established");
  console.log("Sending to server");
  Authenticate();
  socket.send("My name is John");
};

socket.onmessage = function(event) {
  // console.log(`[message] Data received from server: ${event.data}`);
  const data = JSON.parse(event.data);
  const tradePrice = parseFloat(data.SellPrice);
  const tradeTime = parseInt(data.ServerTime);
  const channelString = data.InstrumentIdentifier;
  if (data.status === 'error') {
    // skip all non-TRADE events
    return;
  }
  const subscriptionItem = channelToSubscription.get(channelString);
  if (subscriptionItem === undefined) {
    return;
  }
  const lastDailyBar = subscriptionItem.lastDailyBar;
  const nextDailyBarTime = getNextDailyBarTime(lastDailyBar.time);

  let bar;
  if (tradeTime >= nextDailyBarTime) {
    bar = {
      time: nextDailyBarTime,
      open: tradePrice,
      high: tradePrice,
      low: tradePrice,
      close: tradePrice,
    };
    console.log("[socket] Generate new bar", bar);
  } else {
    bar = {
      ...lastDailyBar,
      high: Math.max(lastDailyBar.high, tradePrice),
      low: Math.min(lastDailyBar.low, tradePrice),
      close: tradePrice,
    };
    console.log("[socket] Update the latest bar by price", tradePrice);
  }
  subscriptionItem.lastDailyBar = bar;

  // send data to every subscriber of that symbol
  subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
  
};

socket.onclose = function(event) {
  if (event.wasClean) {
    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    console.log('[close] Connection died');
  }
};

socket.onerror = function(error) {
  console.log(`[error]`);
};

function getNextDailyBarTime(barTime) {
  const date = new Date(barTime * 1000);
  date.setDate(date.getDate() + 1);
  return date.getTime() / 1000;
}

export function subscribeOnStream(
  symbolInfo,
  resolution,
  onRealtimeCallback,
  subscribeUID,
  onResetCacheNeededCallback,
  lastDailyBar
) {
  const channelString = symbolInfo.name;;
  const handler = {
    id: subscribeUID,
    callback: onRealtimeCallback,
  };
  let subscriptionItem = channelToSubscription.get(channelString);
  if (subscriptionItem) {
    // already subscribed to the channel, use the existing subscription
    subscriptionItem.handlers.push(handler);
    return;
  }
  subscriptionItem = {
    subscribeUID,
    resolution,
    lastDailyBar,
    handlers: [handler],
  };
  channelToSubscription.set(channelString, subscriptionItem);
  console.log(
    "[subscribeBars]: Subscribe to streaming. Channel:",
    channelString
  );

  socket.send(JSON.stringify( {
    MessageType: "SubscribeRealtime",
    Exchange: "NSE",					//GFDL : Supported values : NSE (stocks), NSE_IDX (Indices), NFO (F&O), MCX & CDS (Currency)
    InstrumentIdentifier: `${channelString}`,		//GFDL : NIFTY-I always represents current month Futures. 
    Unsubscribe:false
  }));
}

export function unsubscribeFromStream(subscriberUID) {
  // find a subscription with id === subscriberUID
  for (const channelString of channelToSubscription.keys()) {
    const subscriptionItem = channelToSubscription.get(channelString);
    const handlerIndex = subscriptionItem.handlers.findIndex(
      (handler) => handler.id === subscriberUID
    );

    if (handlerIndex !== -1) {
      // remove from handlers
      subscriptionItem.handlers.splice(handlerIndex, 1);

      if (subscriptionItem.handlers.length === 0) {
         //unsubscribe from the channel, if it was the last handler
        console.log(
          "[unsubscribeBars]: Unsubscribe from streaming. Channel:",
          channelString
        );
        socket.send(JSON.stringify( {
          MessageType: "SubscribeRealtime",
          Exchange: "NSE",					//GFDL : Supported values : NSE (stocks), NSE_IDX (Indices), NFO (F&O), MCX & CDS (Currency)
          InstrumentIdentifier: `${channelString}`,		//GFDL : NIFTY-I always represents current month Futures. 
          Unsubscribe:true
        }));
        channelToSubscription.delete(channelString);
        break;
      }
    }
  }
}

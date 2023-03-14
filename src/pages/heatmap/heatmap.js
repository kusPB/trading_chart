import React, { useState, useEffect } from 'react';

const HeatMap = () => {
    const [data, setData ] = useState([]);
    const [liveData, setLiveData] = useState([]);
    const socket = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=94e90972c5b84ffba64257cd5d054710`);
    const symbols = async()=> { 
        try {
            const response = await fetch(`https:/api.twelvedata.com/stocks?exchange=NASDAQ&apikey=94e90972c5b84ffba64257cd5d054710`)
            .then((data) => {
                return data.json();
            })
            .then((data) => {
                setData(data.data);
                return data.data;
            })
          } catch (error) {
            throw new Error(`twelvedata request error: ${error.status}`);
          }        
    }
    socket.onopen = function(e) {
        console.log("[open] Connection established");
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
    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.status === 'error') {
            // skip all non-TRADE events
            return;
          }
        // setLiveData(data);
    }

    useEffect(() => {
        symbols();
        socket.send(JSON.stringify({
            "action": "subscribe",
            "params": {
            "symbols": `AAPL`
            }
          }));
    },[])
    console.log('123',data);
    return(
        <>
            <div className = "grid grid-cols-9 gap-4 p-4">
                <div className = 'p-4 rounded-lg shadow-lg bg-fuchsia-500'>

                </div>
            </div>
        </>
    )
}

export default HeatMap;
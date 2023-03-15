
import React, { useState, useEffect } from 'react';
const HeatMap = () => {
    const [message, setMessage] = useState('');
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [endprice, setEndPrice] = useState(0);
    const [color, setColor] = useState( 'rgb(242,231,19)');
    const [stocks,setStocks] = useState([]);
    const [stockInfor,setStockInfor] = useState({});
    const a = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
    const b = [1,2,3,4,5,6,7,8,9,10,11,12,13];
    const sectors = ['AUTO', 'BANK', 'ENERGY', 'FINANCE', 'FMCG', 'IT', 'MEDIA', 'METAL', 'PHARAMA', 'PSU BANK', 'REALTY', 'PRIVATE BANK', 'HEALTHCARE INDEX', 'CONSUMER DRABLES', 'OIL & GAS'];
    //const symbols = async()=> { 
        //     try {
        //         const response = await fetch(`https:/api.twelvedata.com/stocks?exchange=NASDAQ&apikey=94e90972c5b84ffba64257cd5d054710`)
        //         .then((data) => {
        //             return data.json();
        //         })
        //         .then((data) => {
        //             setData(data.data);
        //             return data.data;
        //         })
        //       } catch (error) {
        //         throw new Error(`twelvedata request error: ${error.status}`);
        //       }        
        // }
        //get last day's close price
    const endPrice = async()=> { 
        try {
            const response = await fetch(`https:/api.twelvedata.com/eod?symbol=AAPL&apikey=94e90972c5b84ffba64257cd5d054710`)
            .then((data) => {
                return data.json();
            })
            .then((data) => {
                setEndPrice(data.close)
                console.log('dd',endprice)
                return data.close;
            })
            } catch (error) {
            throw new Error(`twelvedata request error: ${error.status}`);
            }        
    }
    const selectSector = () => {
        setStocks(b);
    }
    const changeColor = (percent) =>{
        percent = (percent>20)?20:percent;
        percent = (percent<-20)?-20:percent;
        if(percent>0){
            return 'rgb('+(242-10*percent)+','+(231-4.5*percent)+','+(19-0.5*percent)+')'
        }
        if(percent<0){
            return 'rgb('+(242+0.25*percent)+','+(231+10*percent)+','+(19+0.65*percent)+')'
        }
    }
    useEffect(() => {
        const socket = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=94e90972c5b84ffba64257cd5d054710`);
        socket.onopen = () => {
            console.log('Connected to WebSocket');
            socket.send(JSON.stringify({
                "action": "subscribe",
                    "params": {
                    "symbols": `AAPL`
                    }
                }));
        };

        socket.onmessage = (event) => {
          const message = JSON.parse(event.data);
          setReceivedMessages( message);
          console.log('mmmm',receivedMessages.price);

        };
        setSocket(socket);
        endPrice();
        setStocks(a);
        setInterval(() => {
            const percent = (Math.random()*10-5)*4;
            setColor(changeColor(percent));
            const stock = {'symbol':'AAPL','price':(152.32+1.2*percent).toFixed(2),'percent':percent.toFixed(2),'diff':(2.4*percent).toFixed(2)}
            setStockInfor(stock)
              }, 3000);
        // setColor()
        console.log('endPrice',endprice);
        return () => {
          socket.onclose = (event) => {
            if (event.wasClean) {
                    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
                } else {
                    // e.g. server process killed or network down
                    // event.code is usually 1006 in this case
                    console.log('[close] Connection died');
                }
          }
        };
      }, []);
    return(
        <>
            {/* <div className = 'p-4 rounded-lg shadow-lg bg-[rgb(180,75,25)]'>
                <h2>{receivedMessages?'':receivedMessages.symbol}</h2>
                <p>{receivedMessages?'':(receivedMessages.price).toFixed(2)}{receivedMessages.currency}</p>
                <p>{(endprice === 0)?'':((receivedMessages.price-parseFloat(endprice))/parseFloat(endprice)*100).toFixed(2)}</p>
                <p>{(endprice === 0)?'':(receivedMessages.price-parseFloat(endprice)).toFixed(2)}</p>
            </div> */}
            <div className = 'flex flex-row'>
                <div className = 'basis-1/6 md:bg-[#334155]  max-h-96 m-4 rounded-lg align-middle p-4 '>
                    {sectors.map((sector) => (
                        <p className = 'text-lg text-white font-sans hover:text-purple-300 activce:text-purple-400' onClick={selectSector}>{sector}</p>
                    ))}
                </div>
                <div className = "grow grid 2xl:grid-cols-9 gap-4 p-4 lg:grid-cols-6 sm:grid-cols-3">
                    {stocks.map((item) => (        
                        <div className = {'p-4 rounded-lg shadow-lg '} style = {{backgroundColor:color}} >
                            {/* //
                            'rgb(42,141,8)'
                            242,231,19
                            /247,30, 6 */}
                            <div >
                                <h2>{stockInfor.symbol}</h2>
                                <p>{stockInfor.price}USD</p>
                                <p>{stockInfor.percent}%</p>
                                <p>{stockInfor.diff}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
export default HeatMap;


import React, { useState, useEffect } from 'react';
import stock_list from '../common/stocks.json'
const HeatMap = () => {
    const [isAuthenticate,setIsAnthenticate] = useState(false);
    const [realData, setRealData] = useState({});
    const sectors = ['AUTO', 'BANK', 'ENERGY', 'FINANCE', 'FMCG', 'IT', 'MEDIA', 'METAL', 'PHARAMA', 'PSU BANK', 'REALTY', 'PRIVATE BANK', 'HEALTHCARE INDEX', 'CONSUMER DRABLES', 'OIL & GAS'];
    const selectSector = () => {
       
    }
    const getStocks = (length) => {
        let stocks = [];
        for (let i=0;i<length;i++)
            stocks = [...stocks, stock_list.data[i].symbol];
        return stocks;
    }
    useEffect( () => {
        const stocks = getStocks(50);
        const socket = new WebSocket(`wss://test.lisuns.com:4576`);
        const password = "bc4824f9-3adc-49e4-95d5-fc1583660f66";
        socket.onopen = (event) => { onOpen(event) };
        socket.onclose = (event) => { onClose(event) };
        socket.onmessage = (event) => { onMessage(event) };
        // socket.onerror = (event) => { onError(event) };
        const changeColor = (percent = 0) =>{
            percent = (percent>10)?10:percent;
            percent = (percent<-10)?-10:percent;
            if(percent>0){
                // return 'rgb('+(242-10*percent*2)+','+(231-4.5*percent*2)+','+(19-0.5*percent*2)+')'
                return 'rgba(42,141,9,'+(1-percent*2/100)+')'
            }
            else if(percent<0){
                //return 'rgb('+(242+0.25*percent*2)+','+(231+10*percent*2)+','+(19+0.65*percent*2)+')'
                return 'rgba(237,31,6,'+(1+percent*2/100)+')'
            }
            else return 'rgb(242,231,19)'
        }
        const onOpen = (event) => { 
            console.log('websocket connected');
            Authenticate(); 
        }
        const onClose = (event) => {
            console.log('disconnected by'+event.reason+','+event.code );
        }
        const onMessage = (evt) => {
            const event = JSON.parse(evt.data);
            if (event.MessageType === "AuthenticateResult")
                if (event.Complete){
                    setIsAnthenticate(true);
                    setTimeout(doTest,500);
                }
            const realdata = JSON.parse(evt.data);
            if(realdata.SellPrice){
                const value = {
                    InstrumentIdentifier:realdata.InstrumentIdentifier,
                    Close:realdata.Close,
                    PriceChange:realdata.PriceChange,
                    PriceChangePercentage:realdata.PriceChangePercentage,
                    price:realdata.SellPrice,
                    color:changeColor(realdata.PriceChangePercentage?realdata.PriceChangePercentage:0)
                }
                handleUpdateRealData(realdata.InstrumentIdentifier,value);
            }
            //console.log('data',realData)
        }
        const handleUpdateRealData = (key, value) => {
            setRealData(prevRealData => ({...prevRealData, [key]: value}));
          };
        const Authenticate = () =>{
            const message ={
                MessageType: "Authenticate",
                Password: password
            }
            doSend(message);
        }
        const doSend = (message) =>{
            const jsonmessage = JSON.stringify(message);
            socket.send(jsonmessage);
        }
        const doTest = () =>{
            SubscribeRealtime();
        }
        const GetInstrumentTypes = () =>{
            const request = 
                {
                    MessageType: "GetInstrumentTypes",
                    Exchange: "NSE"					//GFDL : Supported Values : NFO, NSE, NSE_IDX, CDS, MCX. Mandatory Parameter
                };
            doSend(request);
        }
        const GetInstruments = () =>{
            const request = 
                    {
                        MessageType: "GetInstruments",
                        Exchange: "NSE",			//GFDL : Supported Values : NFO, NSE, NSE_IDX, CDS, MCX. Mandatory Parameter
                        //InstrumentType: "FUTSTK",	//GFDL : Optional argument to filter the search by products like FUTIDX, FUTSTK, OPTIDX, OPTSTK, 	
                                                    //		 FUTCUR, FUTCOM, etc.
                        //Product:"NIFTY",			//GFDL : Optional argument to filter the search by products like NIFTY, RELIANCE, etc.
                        //OptionType:"PE",			//GFDL : Optional argument to filter the search by OptionTypes like CE, PE
                        //Expiry:"30JUL2020",		//GFDL : Optional argument to filter the search by Expiry like 30JUL2020
                        //StrikePrice: 10000, 		//GFDL : Optional argument to filter the search by Strike Price like 10000, 75.5, 1250, etc.
                        //OnlyActive:"TRUE",		//GFDL : Optional argument (default=True) to control returned data. If false, 
                                                    //		 If false, even expired contracts are returned
                    };
            doSend(request);
        }
        const  SubscribeRealtime = () =>{  
            stocks.map((stock, key) => {
                doSend({
                  MessageType: "SubscribeRealtime",
                  Exchange: "NSE",
                  InstrumentIdentifier: stock,
                });
              });
        }
        //console.log('data',realData)
        return () => {
          }
      }, []);
    let keys = Object.keys(realData);
    return (
        <>
          
            <div className = 'flex flex-row'>
                {/* <div className = 'basis-1/6 md:bg-[#334155]  max-h-96 m-4 rounded-lg align-middle p-4 '>
                    {sectors.map((sector,key) => (
                        <p key={key} className = 'text-lg text-white font-sans hover:text-purple-300 activce:text-purple-400' onClick={selectSector}>{sector}</p>
                    ))}
                </div> */}
                <div className = "grow grid 2xl:grid-cols-9 gap-4 p-4 lg:grid-cols-6 sm:grid-cols-3">
                    {  
                             (realData && keys.length>0)?keys.map((symbol,key) => (        
                                 <div key ={key} className = {'p-4 rounded-lg shadow-lg '} style = {{ backgroundColor: realData[symbol].color}} >
                                    <div >
                                        <h2>{realData[symbol].InstrumentIdentifier?realData[symbol].InstrumentIdentifier:''}</h2>
                                        <p>{realData[symbol]?.price?realData[symbol].price:''}</p>
                                        <p>{realData[symbol]?.PriceChangePercentage?realData[symbol].PriceChangePercentage:''}%</p>
                                        <p>{realData[symbol]?.PriceChange?realData[symbol].PriceChange:''}</p>
                                    </div>
                                    {/* <h2>{item.symbol}</h2>
                                    <p>{receivedMessages?'':(receivedMessages.price).toFixed(2)}{receivedMessages.currency}</p>
                                    <p>{(endprice === 0)?'':((receivedMessages.price-parseFloat(endprice))/parseFloat(endprice)*100).toFixed(2)}</p>
                                    <p>{(endprice === 0)?'':(receivedMessages.price-parseFloat(endprice)).toFixed(2)}</p> */}
                                </div>
                            )):<></>
                    }
                </div>
            </div>
        </>
    )
}
export default HeatMap;

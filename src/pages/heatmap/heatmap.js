import React, { useState, useEffect } from 'react';
const HeatMap = () => {
    const  [data, setData ] = useState([]);
    const symbols = async()=> { 
        // await fetch(`https:/api.twelvedata.com/stocks?exchange=NSE&apikey=94e90972c5b84ffba64257cd5d054710`)
        // .then((data)=> {
        //     let datadata = data.json();
        //     console.log('dsds', datadata.data);
        // })

        try {
            const response = await fetch(`https:/api.twelvedata.com/stocks?exchange=NSE&apikey=94e90972c5b84ffba64257cd5d054710`)
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
    useEffect(() => {
        symbols();
    },[])
    console.log('123',data);
    return(
        <>
        {/* {data} */}
        </>
    )
}

export default HeatMap;
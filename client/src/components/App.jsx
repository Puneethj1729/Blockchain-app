import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import logo from './images/blockchain.svg';
function App() {
  const [walletInfo, setWalletInfo] = useState({});
  useEffect(() => {
    let isMounted = true;
    axios
      .get('http://localhost:4000/api/wallet-info')
      .then((response) => {
        if(isMounted){
        setWalletInfo(response.data);}
      })
      .catch((error) => console.log(error));
     return () => {
       isMounted = false;
     };
  });
  return (
    <div className='app'>
      <img className='logo' src={logo} alt='logo' />
      <h1>Welcome to Blockchain!</h1>
      <br />
      <Link className='btn btn-primary my-2 ' to='/blocks'>
        Blocks
      </Link>
      <Link className='btn btn-primary my-2 ' to='/conduct-transaction'>
        Conduct a Transaction
      </Link>
      <Link className='btn btn-primary my-2 ' to='/transaction-pool'>
        Transaction Pool
      </Link>

      <div className='walletInfo'>
        <p>Address: {walletInfo.address}</p>
        <p>Balance: {walletInfo.balance}</p>
      </div>
      <br />
    </div>
  );
}
export default App;

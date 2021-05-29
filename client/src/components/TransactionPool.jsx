import axios from 'axios';
import React,{useState,useEffect} from 'react';
import Transaction from './Transaction';
import {Link, useHistory} from 'react-router-dom';
function TransactionPool() {
  const [poolMap, setpoolMap] = useState({});
  const history=useHistory();
  function handleMine(){
      axios.get('http://localhost:4000/api/mine-transactions').then((response)=>{
          if(response.status===200){
              alert('success');
              history.push('/blocks');
          }
      })
  }
  useEffect(() => {
    let isMounted = true;       
    axios
      .get('http://localhost:4000/api/transaction-pool-map')
      .then((response) => {if(isMounted){setpoolMap(response.data)}})
    return () => {
       isMounted = false;
     };
  });
  return (
    <div className='transaction-pool'>
      <Link className='btn btn-primary  my-4' to='/'>
        Home
      </Link>
      <h1>Transaction Pool</h1>
      {Object.values(poolMap).map((transaction)=>{
          return <div key={transaction.id}>
              <hr/>
              <Transaction transaction={transaction}/>
          </div>
      })}
      <hr/>
      <button  className="btn btn-primary" onClick={handleMine}>
          Mine Transactions
      </button>
    </div>
  );

}
export default TransactionPool;

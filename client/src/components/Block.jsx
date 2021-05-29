import React,{useState} from 'react';
import Transaction from './Transaction';
function Block(props) {
 const [toggledata, setToggledata] = useState(false);
 function toggleTransaction(){
      setToggledata((toggledata)=>{return !toggledata; });
 }
  const { timestamp, data, hash } = props.block;
  const hashDisplay = hash.substring(0, 15) + '...';
  const stringifiedData = JSON.stringify(data);
  
  return (
    <div className='blocks'>
      <h5>Hash: {hashDisplay}</h5>
      <h5>Timestamp: {new Date(timestamp).toLocaleString()}</h5>
      <h5>Data :{!toggledata?stringifiedData.substring(0,20)+'...':data.map((transaction)=>(
        <div key={transaction.id}>
        <hr/>
        <Transaction   transaction={transaction}/>
        </div>
      ))}
      </h5>
      <button onClick={toggleTransaction} className="btn btn-primary">{toggledata?'Show less':'Show More'}</button>
    </div>
  );
}
export default Block;

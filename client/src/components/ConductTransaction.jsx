import axios from 'axios';
import React, { useState} from 'react';
import { Link, useHistory } from 'react-router-dom';
function ConductTransaction() {
  const history = useHistory();
  const [data, setData] = useState({
    recipient: '',
    amount: 0,
    knownAddress: [],
  });
  
  function handleChange(event) {
    const { name, value } = event.target;
    setData((data) => {
      return {
        ...data,
        [name]: value,
      };
    });
  }
  function handleSubmit(event) {
    event.preventDefault();
    const transaction = {
      recipient: data.recipient,
      amount: data.amount,
    };
    axios
      .post('http://localhost:4000/api/transact', transaction)
      .then((response) => {
        handleClear();
        history.push('/transaction-pool');
      })
      .catch((error) => console.log(error));
  }
  function handleClear() {
    setData({
      recipient: '',
      amount: 0,
    });
  }
  return (
    <div className='conduct' onSubmit={handleSubmit}>
      <Link className='btn btn-primary  my-4' to='/'>
        Home
      </Link>
      
      <h1>Conduct a Transaction</h1>
      <form>
        <input
          className='form-control'
          type='text'
          name='recipient'
          placeholder='Recipient'
          value={data.recipient}
          onChange={handleChange}
        />
        <input
          className='form-control'
          type='number'
          name='amount'
          placeholder='Amount'
          value={data.amount}
          onChange={handleChange}
        />
        <button className='btn btn-primary my-2' type='submit'>
          Send
        </button>
      </form>
    </div>
  );
}
export default ConductTransaction;

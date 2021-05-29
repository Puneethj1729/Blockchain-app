import React from 'react';
function Transaction(props){
    const {input,outputMap}=props.transaction;
    const recipients=Object.keys(outputMap);
    return (
    <div className="transaction">
        <h5>From: {input.address.substring(0,20)+'...'} | Balance: {input.amount}</h5>
        {recipients.map((recipient)=>{
            return <h5 key={recipient}> To: {recipient.substring(0,20)+'...'} | Sent: {outputMap[recipient]}</h5>
        })}

    </div>)
}
export default Transaction;
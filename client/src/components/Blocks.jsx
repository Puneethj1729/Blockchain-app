import axios from 'axios';
import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import Block from './Block';
function Blocks(){
    const [blocks,setBlocks]=useState([]);
    useEffect(()=>{
         let isMounted = true; 
        axios.get('http://localhost:4000/api/blocks').then((response)=>{
        if(isMounted){    
        setBlocks(response.data);}
        }).catch((error)=>console.log(error));
    return () => {
      isMounted = false;
    };
    });
    return (
      <div>
        <Link className="btn btn-primary  my-4" to='/'>Home</Link>
        <h1>Blocks</h1>
        {blocks.map((block) => {
          return <Block key={block.hash} block={block} />;
        })}
      </div>
    );
}
export default Blocks;
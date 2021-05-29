import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Blocks from './components/Blocks';
import ConductTransaction from './components/ConductTransaction';
import {BrowserRouter as Router,Route,Switch} from 'react-router-dom';
import TransactionPool from './components/TransactionPool';


ReactDOM.render(
  <Router>
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/blocks" component={Blocks}/>
      <Route path="/conduct-transaction" component={ConductTransaction}/>
      <Route path="/transaction-pool" component={TransactionPool}/>
    </Switch>
  </Router>,
  document.getElementById('root')
);



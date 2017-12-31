import './style/style.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route } from 'react-router-dom';

import App from './components/app';

const Root = () => {
  return (
    <HashRouter>
      <Route path="/" component={App} />
    </HashRouter>
  );
};

ReactDOM.render(
  <Root />,
  document.querySelector("#react-app")
);

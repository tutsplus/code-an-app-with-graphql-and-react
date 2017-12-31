import React, { Component } from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';

import TransportMap from './transport-map';
import TripPlanner from './trip-planner';
import Mutations from './mutations';

class App extends Component {
  render() {
    return (
      <div className="container">
        <nav className="navigation">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <NavLink exact to={`/`} activeClassName="active" className="nav-link">
                Map
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to={`/navigation`} activeClassName="active" className="nav-link">
                Trip Planner
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to={`/mutations`} activeClassName="active" className="nav-link">
                Mutations
              </NavLink>
            </li>
          </ul>
        </nav>

        <h1>Helsinki Transport</h1>
        <hr />

        <Switch>
          <Route exact path="/" component={TransportMap} />
          <Route path="/navigation" component={TripPlanner} />
          <Route path="/Mutations" component={Mutations} />
        </Switch>
      </div>
    );
  }
}

export default App;

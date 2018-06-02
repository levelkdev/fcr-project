
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import './App.css'
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom"
import Home from "./Home"

class App extends Component {

  constructor(props) {
    super(props)
  }

  render() {

    return (
      <HashRouter>
        <div className="appContainer">

          <div className="topnav">
            <div className="header-brand nav-left">Registry</div>

            <div className="nav-right">
              <NavLink to="/home">Home</NavLink>
              <NavLink to="/rules">Two</NavLink>
            </div>
          </div>

          <div className="content">
            <Route exact path="/" component={Home}/>
            <Route exact path="/home" component={Home}/>
          </div>

        </div>
      </HashRouter>
    )
  }
}

export default App

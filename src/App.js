import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSearch, faSync, faPlus, faCog, faUserSlash, faUserEdit, faSave, faUserAstronaut, faTimes, faEdit } from '@fortawesome/free-solid-svg-icons'

import CosmonautsPage from './pages/Cosmonauts'
import Navbar from './components/Navbar/Navbar'
import Spinner from './components/Spinner/Spinner'

import Context from './Context';

import './App.css';

library.add(faSearch, faSync, faCog, faPlus, faUserEdit, faUserSlash, faSave, faUserAstronaut, faTimes, faEdit);

class App extends Component {
  state = {
    loading: false
  }

  beginLoading = () => {
    this.setState({ loading: true });
  }

  endLoading = () => {
    this.setState({ loading: false });
  }

  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <Context.Provider
            value={{
              loading: this.state.loading,
              beginLoading: this.beginLoading,
              endLoading: this.endLoading
            }}>

            <Navbar />
            {this.state.loading && <Spinner />}
            <main className='main'>
              <Switch>
                <Redirect from="/" to="/cosmonauts" exact />
                <Route path="/cosmonauts" component={CosmonautsPage} />
              </Switch>
            </main>
          </Context.Provider>
        </React.Fragment>
      </BrowserRouter >
    );
  }
}

export default App;

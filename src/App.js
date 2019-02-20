import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSearch, faSync, faPlus, faCog, faUserSlash, faUserEdit, faSave, faUserAstronaut, faTimes, faEdit } from '@fortawesome/free-solid-svg-icons'

import CosmonautsPage from './pages/Cosmonauts'
import Navbar from './components/Navbar/Navbar'
import Spinner from './components/Spinner/Spinner'

import Context from './Context';

import './App.css';
import Modal from './components/Modal/Modal';

library.add(faSearch, faSync, faCog, faPlus, faUserEdit, faUserSlash, faSave, faUserAstronaut, faTimes, faEdit);

class App extends Component {
  state = {
    loading: false,
    error: false,
    errorText: ''
  }

  beginLoading = () => {
    this.setState({ loading: true });
  }

  endLoading = () => {
    this.setState({ loading: false });
  }

  errorHandler = (errorText) => {
    this.setState({ error: true, errorText: errorText });
  }

  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <Context.Provider
            value={{
              loading: this.state.loading,
              beginLoading: this.beginLoading,
              endLoading: this.endLoading,
              errorHandler: this.errorHandler
            }}>

            <Navbar />
            {this.state.loading && <Spinner />}
            {this.state.error && (
              <Modal
                headerText='Error occured'
                modalSize='huge'
                isError
                onCancel={() => { window.location.reload() }} cancelText='Reload'>
                Please, try to reload the page.
                <pre>
                  {this.state.errorText.toString()}
                </pre>
              </Modal>
            )}
            <main className='main'>
              <Switch>
                <Route path="/" component={CosmonautsPage} />
              </Switch>
            </main>
          </Context.Provider>
        </React.Fragment>
      </BrowserRouter >
    );
  }
}

export default App;

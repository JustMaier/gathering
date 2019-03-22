import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { ThemeProvider } from 'styled-components/macro';
import { GlobalStyle } from './components/styled-components/global';
import { theme } from './components/styled-components/theme';

import Layout from './hoc/Layout';
import { checkGatheringState, loadGatherings } from './store/actions/gatherings';
import Gatherings from './containers/Gatherings';
import Connect from './containers/Connect';
import Gathering from './containers/Gathering';
import EditContact from './containers/EditContact';
import Contact from './containers/Contact';
import JoinGathering from './containers/JoinGathering';

import Spinner from './components/UI/Spinner';

const routes = [
	{ path: '/', component: Gatherings, exact: true, inGathering: false },
	{ path: '/', component: Gathering, exact: true, inGathering: true },
	{ path: '/edit', component: EditContact, exact: true, inGathering: true },
	{ path: '/connect', component: Connect, exact: true, inGathering: true },
	{ path: '/contacts/:id', component: Contact, exact: true, inGathering: true },
	{ path: '/gatherings/:type(create|join)', component: JoinGathering, inGathering: false },
];

class App extends React.Component {
  componentDidMount(){
    this.props.loadGatherings();
    this.props.checkGatheringState();
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <BrowserRouter>
            <GlobalStyle/>
            <Layout>
              { this.props.loadingGathering ? <Spinner /> :
                <Switch>
                  {routes
                    .filter(x => x.inGathering == null || x.inGathering === (this.props.activeGathering != null))
                    .map(x => (
                      <Route
                        key={x.path}
                        path={x.path}
                        exact={x.exact}
                        component={x.component}
                      />
                    ))}
                  <Redirect to="/" />
                </Switch>
              }
            </Layout>
        </BrowserRouter>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  loadingGathering: state.gatherings.loading || (state.gatherings.activeGathering != null && state.contacts.contacts.length === 0),
  activeGathering: state.gatherings.activeGathering,
});
const mapDispatchToProps = {
  checkGatheringState,
  loadGatherings
};

export default connect(mapStateToProps, mapDispatchToProps)(App);

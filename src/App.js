import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import { ThemeProvider } from 'styled-components/macro';
import { GlobalStyle } from './components/styled-components/global';
import { theme } from './components/styled-components/theme';

import { useGatheringContext, useNetworkContext } from './contexts';

import Layout from './hoc/Layout';
import Gatherings from './containers/Gatherings';
import Connect from './containers/Connect';
import Gathering from './containers/Gathering';
import EditContact from './containers/EditContact';
import Contact from './containers/Contact';
import JoinGathering from './containers/JoinGathering';
import {Spinner, Alert} from './components/UI';

const routes = [
	{ path: '/', component: Gatherings, exact: true, inGathering: false },
	{ path: '/', component: Gathering, exact: true, inGathering: true },
	{ path: '/edit', component: EditContact, exact: true, inGathering: true },
	{ path: '/connect', component: Connect, exact: true, inGathering: true },
	{ path: '/contacts/:id', component: Contact, exact: true, inGathering: true },
	{ path: '/gatherings/:type(create|join)', component: JoinGathering, inGathering: false },
];

const App = () => {
  const { loading, gathering } = useGatheringContext();
  const { recommendation } = useNetworkContext();

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
          <GlobalStyle/>
          <Layout>
            {recommendation && <Alert>{recommendation.recommender.name} recommended <strong>{recommendation.name}</strong></Alert>}
            { loading ? <Spinner /> :
              <Switch>
                {routes
                  .filter(x => x.inGathering == null || x.inGathering === (gathering != null))
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

export default App;

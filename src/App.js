import React, { useEffect, useState } from 'react'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import queryString from 'query-string'
import { hot } from 'react-hot-loader'

import { ThemeProvider } from 'styled-components/macro'
import { GlobalStyle } from './components/styled-components/global'
import { theme } from './components/styled-components/theme'

import Layout from './hoc/Layout'
import Gatherings from './containers/Gatherings'
import Connect from './containers/Connect'
import Gathering from './containers/Gathering'
import EditContact from './containers/EditContact'
import Contact from './containers/Contact'
import CreateGathering from './containers/CreateGathering'
import { Spinner } from './components/UI'
import db from './db'

const routes = [
  { path: '/', component: Gatherings, exact: true, inGathering: false },
  { path: '/', component: Gathering, exact: true, inGathering: true },
  { path: '/edit', component: EditContact, exact: true, inGathering: true },
  { path: '/connect', component: Connect, exact: true, inGathering: true },
  { path: '/contacts/:id', component: Contact, exact: true, inGathering: true },
  { path: '/gatherings/create', component: CreateGathering, inGathering: false }
]

const App = () => {
  const [loading, setLoading] = useState(true)
  const [gathering, setGathering] = useState(null)
  useEffect(() => {
    // Watch for Gathering Loading
    const onActivated = async (gathering) => {
      setGathering(gathering)
    }
    const onDeactivated = () => {
      setGathering(null)
    }
    db.on('gathering:activated', onActivated)
    db.on('gathering:deactivated', onDeactivated)
    db.once('ready', async () => {
      const activeGatheringKey = db.appSettings.get('activeGathering')

      // Watch for join Gathering
      const qs = queryString.parse(window.location.search)
      if (qs.g) {
        const key = await db.joinGathering(window.atob(qs.g))
        await db.activateGathering(key)
        setLoading(false)
      } else if (activeGatheringKey) {
        await db.activateGathering(activeGatheringKey)
        setLoading(false)
      } else {
        setLoading(false)
      }
    })

    return () => {
      // Remove watch for Gathering Loading
      db.off('gathering:activated', onActivated)
      db.off('gathering:deactivated', onDeactivated)
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <GlobalStyle />
        <Layout>
          {/* {recommendation && <Alert>{recommendation.recommender.name} recommended <strong>{recommendation.name}</strong></Alert>} */}
          { loading ? <Spinner />
            : <Switch>
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
              <Redirect to='/' />
            </Switch>
          }
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default hot(module)(App)

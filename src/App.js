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
import Debug from './containers/Debug'
import { Spinner, Alert } from './components/UI'
import db from './db'

const routes = [
  { path: '/', component: Gatherings, exact: true, inGathering: false },
  { path: '/', component: Gathering, exact: true, inGathering: true },
  { path: '/debug', component: Debug, exact: true, inGathering: true },
  { path: '/edit', component: EditContact, exact: true, inGathering: true },
  { path: '/connect', component: Connect, exact: true, inGathering: true },
  { path: '/contacts/:id', component: Contact, exact: true, inGathering: true },
  { path: '/gatherings/create', component: CreateGathering, inGathering: false }
]

const App = () => {
  const [loading, setLoading] = useState({ active: true, message: 'Starting IPFS' })
  const updateLoading = (update) => setLoading(x => ({ ...x, ...update }))
  const [error, setError] = useState(null)
  const [gathering, setGathering] = useState(null)
  useEffect(() => {
    // Watch for Gathering Loading
    const onActivated = async (gathering) => {
      setGathering(gathering)
    }
    const onDeactivated = () => {
      setGathering(null)
    }
    const sendRequest = async (memberId, attempts) => {
      try {
        await db.sendRequest(memberId)
      } catch (err) {
        attempts--
        if (attempts > 0) sendRequest(memberId, attempts)
        else setError('Failed to connect with the user you scanned. Please refresh to try again.')
      }
    }
    db.on('gathering:activated', onActivated)
    db.on('gathering:deactivated', onDeactivated)
    db.on('loading:message', message => updateLoading({ message }))
    db.once('ready', async () => {
      const activeGatheringKey = db.appSettings.get('activeGathering')

      // Watch for join Gathering
      const qs = queryString.parse(window.location.search)
      if (qs.g) {
        try {
          const key = await db.joinGathering(window.atob(qs.g), qs.p)
          await db.activateGathering(key)
          if (qs.m) sendRequest(window.atob(qs.m), 3)
          updateLoading({ active: false })
        } catch (err) {
          updateLoading({ active: false })
        }
      } else if (activeGatheringKey) {
        await db.activateGathering(activeGatheringKey)
        updateLoading({ active: false })
      } else {
        updateLoading({ active: false })
      }
    })
    db.on('error', (err) => setError(err.message))

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
          {error && <Alert variant='danger' onClick={() => setError(null)}>{error}</Alert>}
          { loading.active ? <Spinner>{loading.message}</Spinner>
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

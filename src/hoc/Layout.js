import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import { Main } from '../components/UI'
import Help from '../components/Help'

const Layout = ({ children }) => {
  return (
    <React.Fragment>
      <Navbar />
      <Main>{children}</Main>
      <Help />
    </React.Fragment>
  )
}

export default Layout

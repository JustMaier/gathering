import React from 'react'
import Navbar from '../components/Navbar/Navbar';
import {Main} from '../components/UI';

const Layout = ({children}) => {
  return (
    <React.Fragment>
      <Navbar/>
      <Main>{children}</Main>
    </React.Fragment>
  )
}

export default Layout;

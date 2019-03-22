import React from 'react'
import Navbar from '../components/Navbar/Navbar';
import styled from 'styled-components/macro';
import { math } from 'polished';
import { connect } from 'react-redux';
import { deactivateGathering } from '../store/actions/gatherings';

const Main = styled.main`
  padding-top: ${p=>math(`${p.theme.gutter} + 45px`)};
`

const Layout = ({children, gathering, deactivateGathering}) => {
  return (
    <React.Fragment>
      <Navbar gathering={gathering} deactivateGathering={deactivateGathering}/>
      <Main>{children}</Main>
    </React.Fragment>
  )
}

const mapStateToProps = (state) => ({
  gathering: state.gatherings.activeGathering
});

const mapDispatchToProps = {
  deactivateGathering
}

export default connect(mapStateToProps, mapDispatchToProps)(Layout);

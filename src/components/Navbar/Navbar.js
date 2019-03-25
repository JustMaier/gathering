import React from 'react'
import styled from 'styled-components/macro';
import { Link } from 'react-router-dom';
import { rgba } from 'polished';
import { Button } from '../UI';
import { useGatheringContext } from '../../contexts';

const Nav = styled.nav`
  position: fixed;
  width:400px;
  z-index: 100;
  display:flex;
  justify-content: space-between;
`;

const Logo = styled.a`
  color:#fff;
  text-decoration:none;
  background: ${p=>p.theme.primary};
  display: block;
  border-radius: 0 0 5px 5px;
  width: 130px;
  height: 45px;
  line-height: 42px;
  padding: 0 10px;
  text-align: center;
  box-shadow: 0px 3px 10px ${rgba('#000', .3)};

  text-transform: uppercase;
  font-weight: 700;
  font-size:1.25em;
`;

const Navbar = () => {
  const {gathering, actions} = useGatheringContext();

  return (
    <Nav>
      <Logo as={Link} to="/">Gathering</Logo>
      {gathering && <Button as={Link} to="/connect">Connect</Button>}
    </Nav>
  )
}

export default Navbar

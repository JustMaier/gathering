import React from 'react'
import styled from 'styled-components/macro';
import { Link } from 'react-router-dom';
import { rgba, math } from 'polished';
import { LinkButton } from '../UI';
import { useGatheringContext } from '../../contexts';
import { MdAddCircle } from 'react-icons/md';

const Nav = styled.nav`
  position: fixed;
  width:calc(100vw - ${p=>math(`${p.theme.sizes.gutter} * 2`)});
  z-index: 100;
  display:flex;
  align-items:flex-start;
  justify-content: space-between;

  @media(min-width: ${p=>p.theme.sizes.breakpoint}){
    width:${p=>p.theme.sizes.container};
  }
`;

const Logo = styled.a`
  color:#fff;
  text-decoration:none;
  background: ${p=>p.theme.colors.primary};
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
  const {gathering} = useGatheringContext();

  return (
    <Nav>
      <Logo as={Link} to="/">Gathering</Logo>
      {gathering && <LinkButton to="/connect" sm borderRadius='0 0 5px 5px'><MdAddCircle size="1.5em"/></LinkButton>}
    </Nav>
  )
}

export default Navbar

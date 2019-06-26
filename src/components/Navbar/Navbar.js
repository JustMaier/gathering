import React, { useState, useEffect } from 'react'
import { ReactComponent as LogoSVG } from './logo.svg'
import styled from 'styled-components/macro'
import { Link } from 'react-router-dom'
import { rgba, math } from 'polished'
import { LinkButton, Badge } from '../UI'
import { MdAddCircle } from 'react-icons/md'
import db from '../../db'

const Nav = styled.nav`
  position: fixed;
  width:calc(100vw - ${p => math(`${p.theme.sizes.gutter} * 2`)});
  z-index: 100;
  display:flex;
  justify-content: space-between;

  @media(min-width: ${p => p.theme.sizes.breakpoint}){
    width:${p => p.theme.sizes.container};
  }

  .add {
    display:flex;
    justify-content:center;
    align-items:center;
  }
`

const Logo = styled.a`
  color:#fff;
  text-decoration:none;
  background: ${p => p.theme.colors.primary};
  display: block;
  border-radius: 0 0 5px 5px;
  height: 45px;
  line-height: 42px;
  padding: 0 10px;
  text-align: center;
  box-shadow: 0px 3px 10px ${rgba('#000', 0.3)};

  svg {
    vertical-align:middle;
    height: 25px;
    fill: #fff
  }
`

const Navbar = () => {
  const [inGathering, setInGathering] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  useEffect(() => {
    const updateNotificationCount = () => {
      setNotificationCount(db.getRecommendationCount() + db.getRequestsCount())
    }
    const onActivated = () => {
      setInGathering(true)
      db.gathering.events.on('replicated', updateNotificationCount)
      db.gathering.events.on('write', updateNotificationCount)
      updateNotificationCount()
    }
    const onDeactivated = () => {
      setInGathering(false)
    }
    db.on('gathering:activated', onActivated)
    db.on('gathering:deactivated', onDeactivated)

    return () => {
      db.off('gathering:activated', onActivated)
      db.off('gathering:deactivated', onDeactivated)
    }
  }, [])

  return (
    <Nav>
      <Logo as={Link} to='/'><LogoSVG /></Logo>
      {inGathering &&
        <LinkButton to='/connect' sm borderRadius='0 0 5px 5px' className='add'>
          <MdAddCircle size='1.5em' />
          {notificationCount ? <Badge>{notificationCount}</Badge> : null}
        </LinkButton>
      }
    </Nav>
  )
}

export default Navbar

import React from 'react'
import styled from 'styled-components/macro'
import { MdHelp } from 'react-icons/md'

const HelpBox = styled.a`
  position: fixed;
  bottom: 8px;
  left: 10px;
  opacity: .3;
  color: #fff;
  &:hover {
    opacity: .7
  }
`

const Help = () => (
  <HelpBox href='https://medium.com/the-gathering/the-gathering-in-a-nutshell-eb5c81572b9c' target='_blank'><MdHelp size='2em' /></HelpBox>
)

export default Help

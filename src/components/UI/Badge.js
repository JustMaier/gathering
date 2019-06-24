import styled from 'styled-components/macro'
import { themeGet as _ } from 'styled-system'

export const Badge = styled.span`
  display:block;
  position:absolute;
  min-width:20px;
  padding:0 6px;
  height:20px;
  border-radius:10px;
  letter-spacing:-0.05em;
  text-align:center;
  line-height:20px;
  background-color: ${_('colors.secondary')};
  z-index:2;
  bottom: -5px;
  right: -5px;
  box-shadow: 2px 2px 3px 0px rgba(0,0,0, .3)
`

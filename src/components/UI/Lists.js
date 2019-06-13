import styled from 'styled-components/macro'
import { space, themeGet as _ } from 'styled-system'

export const ListGroup = styled.div`
  ${space}

  border: 1px solid ${_('list.border')};
  border-radius: 5px;
  overflow: hidden;
  background: ${_('list.bg')};
  box-shadow: 0px 1px 5px rgba(0,0,0,.3);
`

ListGroup.propTypes = {
  ...space.propTypes
}
ListGroup.defaultProps = {
}

export const ListGroupItem = styled.a`
  display: grid;
  grid-template-columns: ${p => p.size} 1fr;
  grid-template-rows: ${p => p.size};
  grid-template-areas: "icon content";
  align-items: center;
  font-size: 1em;
  font-weight: 300;
  color: inherit;
  text-decoration:none;
  cursor: pointer;

  &:hover, &:active, &:focus {
    background: ${_('list.hover')};
  }

  & + & {
    border-top: 1px solid ${_('list.border')};
  }

  >svg:first-child {
    grid-area: icon;
    font-size: 24px;
    justify-self: center;
    color: ${_('colors.primary')};
  }
`
ListGroupItem.defaultProps = {
  size: '50px'
}

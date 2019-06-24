import styled, { css } from 'styled-components/macro'
import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { darken, rgba } from 'polished'
import { space, color, borderRadius, themeGet } from 'styled-system'
import { __RouterContext as RouterContext } from 'react-router-dom'

export const Button = styled.a`
  ${space}
  ${color}
  ${borderRadius}

  display:${p => p.block ? 'block' : 'inline-block'};
  ${p => p.block && css`
    width: 100%;
    text-align: center;
  `}

  line-height: 1;
  padding: ${p => p.sm ? '6px 10px' : p.lg ? '18px 20px' : '15px 12px'};
  cursor: pointer;
  border: none;
  box-shadow: 0px 1px 5px ${rgba('#000', 0.3)};
  text-decoration: none;
  position: relative;
  ${p => p.lg && css`
    font-size: 2em;
    font-weight: 300;
  `}

  &:hover, &:focus, &:active {
    background: ${p => darken(0.05, themeGet(`colors.${p.bg}`, '#555')(p))};
    outline: none;
  }

  &[disabled]{
    background: #555;
    opacity:.5;

  }
`

Button.propTypes = {
  ...space.propTypes,
  ...color.propTypes,
  ...borderRadius.propTypes,
  sm: PropTypes.bool,
  lg: PropTypes.bool,
  block: PropTypes.bool
}

Button.defaultProps = {
  bg: 'primary',
  color: '#fff',
  borderRadius: '5px'
}

export const LinkButton = ({ to, ...props }) => {
  const { history } = useContext(RouterContext)
  const handleClick = (e) => {
    if (props.onClick) props.onClick(e)
    e.preventDefault()
    history.push(to)
  }
  return <Button href={to} onClick={handleClick} {...props} />
}

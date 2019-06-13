import React from 'react'
import styled from 'styled-components/macro'
import { space, color, size } from 'styled-system'

export const Spinner = styled(p => (
  <div className={p.className}>
    <div />
    <div />
  </div>
))`
  ${space}
  ${size}

  position: relative;

  div{
    width: 100%;
    height: 100%;
    border-radius: 50%;
    ${color}
    opacity: 0.6;
    position: absolute;
    top: 0;
    left: 0;
    animation: bounce 2.0s infinite ease-in-out;

    &:last-child{
      animation-delay: -1.0s;
    }
  }

  @keyframes bounce {
    0%, 100% { transform: scale(0.0) }
    50% { transform: scale(1.0) }
  }
`

Spinner.defaultProps = {
  mt: 5,
  mb: 5,
  ml: 'auto',
  mr: 'auto',
  size: '60px',
  bg: 'primary'
}

import React from 'react'
import styled, { css } from 'styled-components/macro'
import { space, color, size } from 'styled-system'

export const Spinner = styled(({ className, children }) => (
  <div className={className}>
    <div className='spinner'>
      <div />
      <div />
    </div>
    { children && <p className='message'>{children}</p>}
  </div>
))`
  ${space}
  

  .spinner {
    position: relative;
    margin: 0 auto 10px;
    ${size}
  
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
  }

  ${p => p.right && css`
    display:flex;
    align-items:center;
    .spinner {
      width:30px;
      height:30px;
      margin:0 10px 0 0;
    }
    .message {
      margin: 0;
    }
  `}

  .message {
    text-align:center;
    animation: blink 2.0s infinite ease-in-out;
  }


  @keyframes bounce {
    0%, 100% { transform: scale(0.0) }
    50% { transform: scale(1.0) }
  }

  @keyframes blink {
    0%, 100% { opacity: .3 }
    50% { opacity: 1 }
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

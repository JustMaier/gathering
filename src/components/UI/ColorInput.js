import React from 'react'
import styled from 'styled-components/macro'
import { borderRadius } from 'styled-system'

export const ColorInput = styled(({ className, children, borderRadius, ...props }) => (
  <label className={className} style={{ backgroundColor: props.value || '#000000' }} onClick={() => {}}>
    <input type='color' {...props} />
  </label>
))`
  ${borderRadius}
  position:relative;
  overflow:hidden;

  input {
    height: 100%;
    position:relative;
    z-index:-1;
  }
`

ColorInput.propTypes = {
  ...borderRadius.propTypes
}

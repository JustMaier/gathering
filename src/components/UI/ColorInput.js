import React from 'react'
import styled from 'styled-components/macro'
import { borderRadius } from 'styled-system'

export const ColorInput = styled(({ className, children, ...props }) => (
  <label className={className} style={{ backgroundColor: props.value || '#000000' }}>
    <input type='color' {...props} />
  </label>
))`
  ${borderRadius}
  input {
    visibility: hidden;
  }
`

ColorInput.propTypes = {
  ...borderRadius.propTypes
}

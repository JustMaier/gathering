import styled from 'styled-components'
import { space, size, boxShadow, borderRadius, border } from 'styled-system'

export const Image = styled.img`
  ${space}
  ${size}
  ${boxShadow}
  ${borderRadius}
  ${border}
`
Image.propTypes = {
  ...space.propTypes,
  ...size.propTypes,
  ...boxShadow.propTypes,
  ...borderRadius.propTypes,
  ...border.propTypes
}

export const Photo = styled(Image)`
`
Photo.defaultProps = {
  size: '180px',
  border: 'faint',
  boxShadow: 'lg',
  borderRadius: '5px'
}

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { space, size, boxShadow, borderRadius, border } from 'styled-system'
import db from '../../db'

export const Image = styled(({ src, alt, className }) => (
  <div className={className}>
    <img src={src} alt={alt} />
  </div>
))`
  ${space}
  ${size}
  ${boxShadow}
  ${borderRadius}
  ${border}
  overflow:hidden;
  position:relative;

  img {
    position:absolute;
    top:50%;
    left:50%;
    width:100%;
    transform: translate(-50%, -50%);
  }
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

export const CIDPhoto = ({ src: cid, placeholder = '/img/placeholder.jpg', ...props }) => {
  const [src, setSrc] = useState(placeholder)
  useEffect(() => {
    db.getImageFromCid(cid).then(setSrc)
  }, [cid])

  return (
    <Photo src={src} {...props} />
  )
}

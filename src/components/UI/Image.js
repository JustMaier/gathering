import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { space, size, boxShadow, borderRadius, border } from 'styled-system'
import db from '../../db'
import placeholderImage from './placeholder.jpg'

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

const CIDPhotoCache = {}
export const CIDPhoto = ({ src: cid, placeholder = placeholderImage, ...props }) => {
  const [src, setSrc] = useState(CIDPhotoCache[cid] || placeholder)
  useEffect(() => {
    db.getImageFromCid(cid).then(src => {
      if (!src) return

      CIDPhotoCache[cid] = src
      setSrc(CIDPhotoCache[cid])
    })
  }, [cid])

  return (
    <Photo src={src} {...props} />
  )
}

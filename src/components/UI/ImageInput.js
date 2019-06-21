import React, { useState, useEffect } from 'react'
import styled from 'styled-components/macro'
import { space, size, boxShadow, borderRadius, border } from 'styled-system'

const ImageInputEl = ({ className, value, onChange, ...props }) => {
  const [displayImage, setDisplayImage] = useState(null)

  useEffect(() => {
    setDisplayImage(value)
  }, [value])

  const updateDisplayImage = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new window.FileReader()
      reader.onload = (e) => {
        setDisplayImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
    if (onChange) onChange(e)
  }

  return (
    <label className={className} style={{ backgroundImage: displayImage ? `url(${displayImage})` : null }}>
      <input type='file' onChange={updateDisplayImage} accept='image/*' />
    </label>
  )
}

export const ImageInput = styled(ImageInputEl)`
  ${space}
  ${size}
  ${boxShadow}
  ${borderRadius}
  ${border}

  cursor: pointer;
  background: #eee;
  position: relative;
  display:block;
  background-size: cover;
  background-position: 50% 50%;

  &:before{
    content: 'Select image';
    position:absolute;
    top:50%;
    left:0;
    right:0;
    text-align:center;
    transform:translateY(-50%);
    color:#fff;
    text-shadow: 0px 0px 3px rgba(0,0,0,.5);
  }


  input {
    visibility: hidden;
  }
`

ImageInput.propTypes = {
  ...space.propTypes,
  ...size.propTypes,
  ...boxShadow.propTypes,
  ...borderRadius.propTypes,
  ...border.propTypes
}

ImageInput.defaultProps = {
  size: '180px',
  border: 'faint',
  boxShadow: 'lg',
  borderRadius: '5px'
}

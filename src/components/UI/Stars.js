import React from 'react';
import {Box} from './Box';
import {MdStarBorder, MdStar} from 'react-icons/md'

export const Stars = ({count, ...props}) => {
  return (
    <Box {...props}>
      {[...Array(count)].map((_,i) => <MdStar key={i} size='1.5em'/>)}
      {props.onClick && <MdStarBorder size='1.5em' />}
    </Box>
  )
}

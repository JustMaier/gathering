import React from 'react'
import { Link } from 'react-router-dom';
import { Image, Box, Text, Photo, Header, LinkButton } from './UI';
import { MdEdit } from 'react-icons/md';

const Me = ({name, img, organization}) => {
  return (
    <Box alignItems="center" justifyContent="center">
        <Photo src={img} size="60px"/>
        <Box ml="2" flexDirection="column">
          <Header fontSize="4">{name}</Header>
          <Text fontSize="1" color="muted">{organization}</Text>
        </Box>
        <LinkButton to="/edit" ml="auto"><MdEdit/></LinkButton>
      </Box>
  )
}

export default Me

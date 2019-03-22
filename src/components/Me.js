import React from 'react'
import { Link } from 'react-router-dom';

const Me = ({name, codename}) => {
  return (
    <Link to="/edit">
      {name} | {codename}
    </Link>
  )
}

export default Me

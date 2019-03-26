import React from 'react';
import {css} from 'styled-components/macro';
import { Box, Text } from './UI'

const StatusIndicator = ({isOnline}) => {

  return (
    <Box alignItems='center'>
      <span
        css={css`
          border-radius: 50%;
          width:10px;
          height:10px;
          display:block;
          margin-right:5px;
          background-color: ${p=>p.isOnline ? p.theme.colors.success : p.theme.colors.danger}
        `}
      ></span>
      <Text fontSize='0'>{isOnline?'online':'offline'}</Text>
    </Box>
  )
}

export default StatusIndicator;

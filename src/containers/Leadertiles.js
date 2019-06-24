import styled from 'styled-components/macro'
import { space, themeGet as _ } from 'styled-system'

import React, { useEffect, useState } from 'react'
import { Text, Box } from '../components/UI'
import db from '../db'
import getOrdinal from '../shared/getOrdinal'

const tileSettings = {
  width: '100px',
  gutter: '4px'
}

const TileContainer = styled(({ className, children }) => (
  <div className={className}>
    <div className='viewport'>{children}</div>
  </div>
))`
  display:flex;
  flex-direction:row;
  width:100%;
  overflow-x: hidden;
  padding-bottom:10px;
  margin: 0 -${tileSettings.gutter};
  ${space}

  .viewport {
    display:inline-flex;
  }
`
const Tile = styled(({ header, children, className }) => (
  <div className={className}>
    <div className='header'>{header}</div>
    <div className='pages'>
      <div className='viewport'>{children}</div>
    </div>
  </div>
))`
  display: flex;
  flex-direction: column;
  width: ${tileSettings.width};
  border-radius: 5px;
  background: ${_('list.bg')};
  margin: 0 ${tileSettings.gutter};
  white-space: nowrap;
  overflow: hidden;
  box-shadow: ${_('shadows.sm')};

  .header {
    padding: 5px 5px;
    font-size:.75em;
    color: #fff;
    text-align: center;
    white-space:nowrap;
    text-overflow: ellipsis;
    overflow:hidden;
    background-color: ${_('colors.primary')};
  }

  .pages {
    display: flex;
    overflow:hidden;
    width:100%;
    border: 1px solid ${_('list.border')};
    border-top:none;

    .viewport {
      display: inline-flex;
      animation: slide 10s ease infinite alternate;
      > div {
        width: ${tileSettings.width};
      }
    }
  }

  &:nth-child(3n+2){
    .pages .viewport {
      animation-duration: 8.75s;
      animation-delay: .75s;
    }
  }

  &:nth-child(3n+3){
    .pages .viewport {
      animation-duration: 9s;
      animation-delay: .5s;
    }
  }

  @keyframes slide {
    22.5%, 77.5% { margin-left: 0 }
    27.5%, 72.5% { margin-left: -${tileSettings.width} }
  }
`
const TilePage = styled.div`
  text-align: center;

  .score {
    font-size: 1.5em;
    line-height:1;
    font-weight: 100;
    padding: 8px 0 10px;
    &:after{
      content: ' pts';
      font-size: .5em;
      color:${_('colors.muted')}
    }
  }

  .holder {
    font-size: .75em;
    color: #fff;
    padding: 3px 5px;
    background-color: ${_('list.border')};
  }

  .rank {
    margin-right:5px;
  }

  .name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space:nowrap;
    text-align:right;
  }
`

const Leadertiles = () => {
  const [awards, setAwards] = useState(db.awards || [])
  useEffect(() => {
    db.on('awards:updated', setAwards)
    db.updateAwards(true)

    return () => {
      db.off('awards:updated', setAwards)
    }
  }, [])

  if (!awards.length) return null
  return (
    <TileContainer mt='5'>
      { awards.filter(x => x.rank.length > 0).map(award => (
        <Tile header={award.name} key={award.name}>
          <TilePage>
            <Text className='score'>{award.your ? award.your.score : 0}</Text>
            <Box className='holder'>
              <Text className='rank'>{award.your ? getOrdinal(award.your.rank) : 'N/A'}</Text>
              <Text className='name'>You</Text>
            </Box>
          </TilePage>
          <TilePage>
            <Text className='score'>{award.rank[0].score}</Text>
            <Box className='holder'>
              <Text className='rank'>{getOrdinal(award.rank[0].rank)}</Text>
              <Text className='name'>{award.rank[0].name}</Text>
            </Box>
          </TilePage>
        </Tile>
      ))}
    </TileContainer>
  )
}

export default Leadertiles

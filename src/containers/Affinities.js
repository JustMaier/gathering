import React, { useState, useEffect } from 'react'

import { FloatLabelInput, Button, Tag, TagList, Box, ColorInput } from '../components/UI'
import { MdAddCircle } from 'react-icons/md'
import db from '../db'

const initialAffinity = { color: '#666666', name: '' }

const Affinities = ({ canEdit, onToggle, value = [] }) => {
  const [affinities, setAffinities] = useState(db.getAffinities())
  if (!canEdit) {
    return (
      <TagList>
        { value.map(aKey => {
          const { color, name } = affinities[aKey]
          return <Tag key={aKey} band={color}>{name}</Tag>
        })}
      </TagList>
    )
  }

  useEffect(() => {
    const updateAffinities = () => setAffinities(db.getAffinities())
    db.affinities.events.on('replicated', updateAffinities)
    db.affinities.events.on('write', updateAffinities)

    return () => {
      db.affinities.events.off('replicated', updateAffinities)
    }
  }, [])

  const [addingAffinity, setAddingAffinity] = useState(false)
  const [affinity, setAffinity] = useState(initialAffinity)
  const createAffinity = async () => {
    setAddingAffinity(false)
    await db.addAffinity(affinity)
    onToggle(affinity)
    setAffinity(initialAffinity)
  }
  const updateAffinity = e => setAffinity({ ...affinity, [e.target.name]: e.target.value })

  return (
    <>
      <TagList mb={addingAffinity ? 2 : 4}>
        {affinities.map(a => <Tag key={a.name} band={a.color} onClick={() => onToggle(a)} active={value.includes(a.name)}>{a.name}</Tag>)}
        <Tag onClick={() => setAddingAffinity(x => !x)}>Add <MdAddCircle /></Tag>
      </TagList>
      {!addingAffinity ? null : (
        <Box mb='4'>
          <ColorInput style={{ width: '46px' }} borderRadius='left' name='color' type='color' onChange={updateAffinity} value={affinity.color} />
          <FloatLabelInput label='Affinity name' name='name' type='text' onChange={updateAffinity} value={affinity.name} />
          <Button as='button' type='button' sm onClick={createAffinity} borderRadius='right'><MdAddCircle /></Button>
        </Box>
      )}
    </>
  )
}

export default Affinities

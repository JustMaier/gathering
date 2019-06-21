import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'
import { ListGroup, ListGroupItem, Box, Text, Stars, Spinner, Button, CIDPhoto } from './UI'
import { MdCheckCircle, MdCancel } from 'react-icons/md'

export const ContactList = styled(ListGroup)`
`

const ContactListGroupItem = styled(ListGroupItem)`
  text-decoration:none;
  grid-gap: 0 10px;

  .img{
    grid-area: icon;
    padding:3px;
    height:100%;

    img {
      border-radius:4px;
      width:100%;
      height:auto;
    }
  }
`
ContactListGroupItem.defaultProps = {
  size: '60px'
}

const ReviewableListGroupItem = styled.div`
  display: flex;
  .decline, .approve {
    width: 60px;
    display:flex;
    justify-content:center;
    align-items:center;
    text-align:center;
  }
  .decline + div {
    margin-left: 5px
  }
  > div {
    flex:1;
    & + .approve {
      margin-left: 5px
    }
  }
`

export const ContactListItem = ({ id, name, organization, avatar, stars, status, onClick = null, onApprove = null, onDecline = null, approveIcon: ApproveIcon = MdCheckCircle }) => {
  const content = (
    <React.Fragment>
      <div className='img'>
        <CIDPhoto src={avatar} />
      </div>
      <Box alignItems='center'>
        <Box flexDirection='column'>
          <Text fontWeight='800'>{name}</Text>
          <Text fontSize='1' color='muted'>{organization}</Text>
        </Box>
        {status === 'sending' && <Spinner size='40px' mt='0' mb='0' ml='4' />}
        {status === 'sent' && <Box color='primary' ml='4'><MdCheckCircle size='2em' /></Box>}
        <Stars ml='auto' mr='2' count={stars} />
      </Box>
    </React.Fragment>
  )

  if (onClick) return <ContactListGroupItem onClick={() => onClick(id)}>{content}</ContactListGroupItem>
  else if (onApprove || onDecline) {
    return (
      <ReviewableListGroupItem>
        {onDecline ? <Button className='decline' bg='danger' borderRadius='left' onClick={onDecline}><MdCancel size='1.75em' /></Button> : null}
        <ContactListGroupItem as='div' selectable={false}>
          {content}
        </ContactListGroupItem>
        {onApprove ? <Button className='approve' bg='success' borderRadius='right' onClick={onApprove}><ApproveIcon size='1.75em' /></Button> : null}
      </ReviewableListGroupItem>
    )
  } else return <ContactListGroupItem as={Link} to={'/contacts/' + id}>{content}</ContactListGroupItem>
}

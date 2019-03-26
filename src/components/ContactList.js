import React from 'react';
import {Link} from 'react-router-dom';
import styled from 'styled-components/macro';
import {ListGroup, ListGroupItem, Image, Box, Text} from './UI';

export const ContactList = styled(ListGroup)`
`;

const ContactListGroupItem = styled(ListGroupItem)`
  text-decoration:none;
  grid-gap: 0 10px;

  .img{
    grid-area: icon;
    padding:3px;
    height:100%;

    ${Image}{
      border-radius:4px;
      width:100%;
    }
  }
`;
ContactListGroupItem.defaultProps = {
  size: '60px'
};

export const ContactListItem = ({id, name, organization, img, status, onSelect = null}) => {
  const content = (
    <React.Fragment>
      <div className="img">
        <Image src={img}/>
      </div>
      <Box flexDirection='column'>
        <Text fontWeight="800">{name}</Text>
        <Text fontSize="1" color="muted">{organization}</Text>
      </Box>
    </React.Fragment>
  );
  return !onSelect ? (
    <ContactListGroupItem as={Link} to={'/contacts/' + id}>{content}</ContactListGroupItem>
  ) : (
    <ContactListGroupItem onClick={() => onSelect(id)}>{content}</ContactListGroupItem>
  );
};



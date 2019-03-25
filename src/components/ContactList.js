import React from 'react';
import {Link} from 'react-router-dom';
import Styled from 'styled-components/macro';

const ListItem = Styled.button`
  color:#fff;
  &:visited,&:active{
    color:#fff;
  }
`;

export const ContactListItem = ({id, name, status, onSelect = null}) => {
  const content = <React.Fragment>{name}</React.Fragment>;
  return !onSelect ? (
    <ListItem as={Link} to={'/contacts/' + id}>{content}</ListItem>
  ) : (
    <ListItem onClick={() => onSelect(id)}>{content}</ListItem>
  );
};

export const ContactList = Styled.div`
`;

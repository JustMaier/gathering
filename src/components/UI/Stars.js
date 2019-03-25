import React from 'react';

export const Stars = ({count, ...props}) => {
  if(!count || count === 0) return null;
  return (
    <span {...props}>{[...Array(count)].map((_,i) =>
      <span role="img" aria-label="star" key={i}>⭐</span>)}
    </span>
  )
}

import React from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { activateGathering } from '../store/actions/gatherings';
import { LinkList, LinkListItem } from '../components/UI/LinkList';
import Button from '../components/UI/Button';



const Gatherings = ({gatherings, activateGathering}) => {
  let gatheringsList = null;
  if(gatherings.length > 0)
    gatheringsList = <LinkList>{gatherings.map(x=><LinkListItem as="button" key={x.id} onClick={()=>activateGathering(x.id)}>{x.name}</LinkListItem>)}</LinkList>

  return (
    <React.Fragment>
      {gatheringsList}
      <Button as={Link} to="/gatherings/create">Create Gathering</Button>
    </React.Fragment>
  )
}

const mapStateToProps = state => ({
  gatherings: state.gatherings.gatherings
});
const mapDispatchToProps = {
  activateGathering: activateGathering
};

export default connect(mapStateToProps, mapDispatchToProps)(Gatherings);

import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import queryString from 'query-string';
import ContactForm from '../components/ContactForm';
import GatheringForm from '../components/GatheringForm';
import {
  createGathering,
  joinGathering,
  activateGathering
} from '../store/actions/gatherings';

const JoinGathering = props => {
  const [gathering, setGathering] = useState({});
  const [contact, setContact] = useState({});

  const joinGathering = async () => {
    const method = (gathering.id ? 'join' : 'create') + 'Gathering';
    const {id: gatheringId} = await props[method](gathering, contact);
    props.activateGathering(gatheringId);
  };

  // Check the query string to see if we already have a gathering
  useEffect(() => {
    const qs = queryString.parse(props.location.search);
    if (qs.id) setGathering(qs);
  }, []);
  useEffect(() => {
    if (contact.name) joinGathering();
  }, [contact]);

  return (
    <React.Fragment>
      {!gathering.name ? (
        <GatheringForm onFinished={data => setGathering(data)} />
      ) : (
        <ContactForm onFinished={data => setContact(data)} />
      )}
    </React.Fragment>
  );
};

const mapStateToProps = state => ({});

const mapDispatchToProps = {
  createGathering,
  joinGathering,
  activateGathering
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(JoinGathering);

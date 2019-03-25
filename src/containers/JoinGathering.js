import React, {useState, useEffect} from 'react';
import queryString from 'query-string';
import ContactForm from '../components/ContactForm';
import GatheringForm from '../components/GatheringForm';
import { useGatheringContext } from '../contexts';

const JoinGathering = ({location}) => {
  const { actions } = useGatheringContext();
  const [gathering, setGathering] = useState({});

  // Check the query string to see if we already have a gathering
  useEffect(() => {
    const qs = queryString.parse(location.search);
    if (qs.id) setGathering(qs);
  }, []);

  const joinGathering = async (contact) => {
    const gatheringId = await actions.addGathering(gathering, contact);
    await actions.activate(gatheringId);
  }

  return (
    <React.Fragment>
      {!gathering.name ? (
        <GatheringForm onFinished={setGathering} />
      ) : (
        <ContactForm onFinished={joinGathering} />
      )}
    </React.Fragment>
  );
};

export default JoinGathering;

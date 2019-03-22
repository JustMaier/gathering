import React, { Component } from 'react'
import {Link} from 'react-router-dom';
import { connect } from 'react-redux'
import { connect as connectWith, connectInit } from '../store/actions/contacts';
import { Form, Fieldset, FloatLabelInput } from '../components/UI/Form';
import Button from '../components/UI/Button';
import Header from '../components/UI/Header';
import Spinner from '../components/UI/Spinner';

export class Connect extends Component {
  state = {
    codename: ''
  };

  componentWillMount(){
    const { connectInit } = this.props;
    connectInit();
  }

  startConnection = (e) => {
    e.preventDefault();
    const { connectWith } = this.props;
    connectWith(this.state.codename);
  }

  render() {
    const { codename } = this.state;
    const { gathering, loading, error, connected } = this.props;

    if(loading)
      return <Spinner />

    if(connected)
      return (
        <div>
          <p>You've connected successfully</p>
          <Button as={Link} to="/">Done</Button>
        </div>
      )

    return (
      <Form onSubmit={this.startConnection}>
        <Header>Connect</Header>
        <p>Your codename is {gathering.codename}</p>
        {error && <div>{error}</div>}
        <Fieldset>
          <FloatLabelInput name="codename" value={codename} label="Their Code Name" onChange={(e) => this.setState({codename: e.target.value})} required />
        </Fieldset>
        <Button as="button" type="submit" block>Connect</Button>
      </Form>
    )
  }
}

const mapStateToProps = (state) => ({
  gathering: state.gatherings.activeGathering,
  loading: state.contacts.loading,
  connected: state.contacts.connected,
  error: state.contacts.error
});

const mapDispatchToProps = {
  connectWith,
  connectInit
}

export default connect(mapStateToProps, mapDispatchToProps)(Connect)

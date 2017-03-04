import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux'
import Relay from 'react-relay';
import {Field, reduxForm} from 'redux-form';
import styled from 'styled-components';

import DeletePropositionMutation from '../../mutations/delete-proposition';
import SavePropositionMutation from '../../mutations/save-proposition';
import {Card, CardSection, CardTitle, Input, TextArea} from '../ui';
import {StatsBar, TypeTag} from './components';


const InvisibleInput = styled.input`
  display: none;
`;

const ClickLabel = styled.label`
  cursor: pointer;
  user-select: none;
`;

const TypeRadio = ({input, type}) => {
  const checked = input.value === type;
  return (
    <TypeTag {...{type}} style={checked ? {} : {color: 'lightgrey'}}><ClickLabel>
      {type}
      <InvisibleInput {...input} type="radio" value={type} checked={checked}/>
    </ClickLabel></TypeTag>
  );
};

const FormTextArea = ({input, label}) => <TextArea {...input} placeholder={label}/>

class Form extends React.Component {

  static defaultProps = {
    onCancel: _.noop
  };

  save = (values) => {
    const {parentID, proposition} = this.props;
    const {id} = proposition || {};

    const data = {id, ..._.pick(values, 'name', 'source_url', 'published', 'text', 'type')};
    if (parentID && parentID !== 'viewer') {
      data.parent_id = parentID;
    }
    return new Promise((resolve) => Relay.Store.commitUpdate(new SavePropositionMutation(data), {
      onSuccess: () => {
        this.props.reset();
        this.props.onCancel();
        resolve();
      }
    }));
  };

  del = () => {
    const {parentID, proposition} = this.props;
    const {id, name} = proposition;
    if (!confirm(`Do you really want to delete "${name}"?`)) return;
    Relay.Store.commitUpdate(new DeletePropositionMutation({id, parent_id: parentID}));
  };

  render() {
    const {
      dirty, handleSubmit, onCancel, parentID, proposition, submitting, viewer: {user}
    } = this.props;
    return (
      <Card>
        <form onSubmit={handleSubmit(this.save)}>

          <CardTitle>
            <Field component={Input} type="text" name="name" label="Make a concise argument"/>
          </CardTitle>

          <div style={{display: (proposition || dirty) ? 'block' : 'none'}}>

            <CardSection>
              <Field component={FormTextArea} name="text" label="(Optional) extra text"/>
            </CardSection>

            <CardSection>
              <Field component={Input} name="source_url" type="text" label="(OptionaL) Source URL"/>
            </CardSection>

            {parentID && (
              <Field name="type" component={(props) => (
                <CardSection>
                  <TypeRadio {...props} type="PRO"/>
                  <span style={{padding: '0 4px'}}>|</span>
                  <TypeRadio {...props} type="CONTRA"/>
                </CardSection>
              )}/>
            )}

            {user.can_publish && (
              <CardSection>
                <label>
                  <Field component="input" name="published" type="checkbox"/>
                  Published
                </label>
              </CardSection>
            )}

            <StatsBar>
              <div/>
              <div>
                {proposition && [
                  <button key="cancel" type="button" onClick={onCancel}>Cancel</button>,
                  (user.can_publish || (!proposition.published && proposition.user.id)) && (
                    <button key="delete" type="button" onClick={this.del}>Delete</button>
                  )
                ]}
                <button key="save" type="submit" disabled={submitting}>
                  {proposition ? 'Save' : 'Create'}
                </button>
              </div>
            </StatsBar>

          </div>

        </form>
      </Card>
    );
  }

}

export default _.flow([

  reduxForm(),

  connect(
    (state, {proposition, parentID}) => ({
      form: 'proposition' + (proposition ? proposition.id : ''),
      initialValues: {
        name: '',
        published: true,
        source_url: '',
        text: '',
        type: parentID ? 'PRO' : null,
        ...proposition
      }
    })
  ),

  (Form) => Relay.createContainer(Form, {

    fragments: {

      proposition: () => Relay.QL`
        fragment on Proposition {
          id
          name
          published
          source_url
          text
          type
          user {
            id
          }
        }
      `,

      viewer: () => Relay.QL`
        fragment on Viewer {
          user {
            can_publish
          }
        }
      `

    }

  })

])(Form);
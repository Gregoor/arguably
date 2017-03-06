import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux'
import Relay from 'react-relay';
import {Field, reduxForm} from 'redux-form';
import styled from 'styled-components';

import DeletePropositionMutation from '../../mutations/delete-proposition';
import SavePropositionMutation from '../../mutations/save-proposition';
import {StatsBar, TypeTag} from './components';
import {getTypeLabel} from '../../helpers';
import {CardSection, CardTitle, Input, TextArea} from '../ui';


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
      {getTypeLabel(type)}
      <InvisibleInput {...input} type="radio" value={type} checked={checked}/>
    </ClickLabel></TypeTag>
  );
};

const LanguageRadio = ({input, language}) => {
  const checked = input.value === language.id;
  return (
    <label>
      <input {...input} type="radio" value={language.id} checked={checked}/>
      {language.name}
    </label>
  );
};

const FormTextArea = ({input, label}) => <TextArea {...input} placeholder={label}/>;

class Form extends React.Component {

  static defaultProps = {
    onCancel: _.noop
  };

  getParentID = () => {
    const {parentID, proposition} = this.props;
    const {parent} = proposition || {};
    return parent ? parent.id : parentID;
  };

  save = (values) => {
    const {id} = this.props.proposition || {};

    const data = {id, ...values};
    const parentID = this.getParentID();
    if (parentID) {
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
    const {id, name} = this.props.proposition;
    if (!confirm(`Do you really want to delete "${name}"?`)) return;
    Relay.Store.commitUpdate(new DeletePropositionMutation({id, parent_id: this.getParentID()}));
  };

  render() {
    const {
      dirty, handleSubmit, onCancel, proposition, submitting, viewer: {languages, user}
    } = this.props;
    return (
      <div>
        <form onSubmit={handleSubmit(this.save)}>

          <CardTitle>
            <Field name="name" component={Input} type="text" label="Make a concise argument"/>
          </CardTitle>

          <div style={{display: (proposition || dirty) ? 'block' : 'none'}}>

            <CardSection>
              <Field name="text" component={FormTextArea} label="(Optional) extra text"/>
            </CardSection>

            <CardSection>
              <Field name="source_url" component={Input} type="text" label="(Optional) Source URL"/>
            </CardSection>

            {this.getParentID() && (
              <Field name="type" component={(props) => (
                <CardSection>
                  <TypeRadio {...props} type="PRO"/>
                  <span style={{padding: '0 4px'}}>|</span>
                  <TypeRadio {...props} type="CONTRA"/>
                </CardSection>
              )}/>
            )}

            <CardSection>
              {languages.map((language) => (
                <Field key={language.id} name="language_id" component={LanguageRadio}
                       language={language} />
              ))}
            </CardSection>

            {user.can_publish && (
              <CardSection>
                <label>
                  <Field name="published" component="input" type="checkbox"/>
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
      </div>
    );
  }

}

export default _.flow([

  reduxForm(),

  connect(
    (state, {proposition, parentID, viewer}) => ({
      form: 'proposition' + (proposition ? proposition.id : ''),
      initialValues: {
        language_id: proposition
          ? proposition.language.id
          : viewer.languages.find((language) => language.name === 'English').id,
        name: '',
        published: true,
        source_url: '',
        text: '',
        type: parentID ? 'PRO' : null,
        ..._.pick(proposition, 'name', 'published', 'source_url', 'text', 'type')
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
          language {
            id
          }
          user {
            id
          }
          parent {
            id
          }
        }
      `,

      viewer: () => Relay.QL`
        fragment on Viewer {
          user {
            can_publish
          }
          languages {
            id
            name
          }
        }
      `

    }

  })

])(Form);
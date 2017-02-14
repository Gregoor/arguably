import React, {Component} from 'react';
import Relay from 'react-relay';
import _ from 'lodash';
import Router from 'next/router';
import styled from 'styled-components';

import DeletePropositionMutation from '../mutations/delete-proposition';
import CreatePropositionMutation from '../mutations/create-proposition';
import UpdatePropositionMutation from '../mutations/update-proposition';
import {Card, CardSection, CardTitle} from './ui';

const TypeTagBar = styled(CardSection)`
  padding-bottom: 0;
`;

const StatsBar = styled(CardSection)`
  display: flex;
  justify-content: space-between;
  padding-top: 0;
`;

const typeColors = {
  PRO: '#81C784',
  CONTRA: '#FF8A80'
};

const TypeTag = styled.span`
  margin-right: 16px;
  padding-bottom: 0;
  font-weight: bold;
  color: ${(props) => typeColors[props.type] || '#aab8c2'};
`;

let PropositionLink = ({children, id, ...props}) => (
  <div onClick={() => Router.push(`/proposition?id=${id}`)} {...props}>
    {children}
  </div>
);

PropositionLink = styled(PropositionLink)`
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

const SourceSection = ({children}) => (
  <CardSection style={{paddingTop: 0}}>
    <b style={{marginRight: 5}}>Source:</b>
    {children}
  </CardSection>
);

class PropositionCard extends Component {

  constructor(props) {
    super(props);
    const {proposition} = props;
    this.state = {
      isEditing: false,
      name: '',
      text: '',
      type: 'PRO',
      ...proposition,
      source_url: (proposition && proposition.source_url) || ''
    }
  }

  state = {
    isEditing: false
  };

  del = () => {
    const {id, name, parent} = this.props.proposition;
    if (!confirm(`Do you really want to delete "${name}"?`)) return;
    Relay.Store.commitUpdate(new DeletePropositionMutation({id, parent_id: parent.id}));
  };

  toggleIsEditing = () => {
    if (this.props.proposition) {
      this.setState((state) => ({isEditing: !state.isEditing}))
    } else {
      this.props.onCancel();
    }
  };

  handleInputChange = (event) => {
    const {target} = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  toggleType = () => {
    this.setState(({type}) => ({type: type === 'PRO' ? 'CONTRA' : 'PRO'}));
  };

  save = (event) => {
    event.preventDefault();

    const {id, parent} = this.props.proposition || {};
    const {name, source_url, text, type} = this.state;

    const proposition = {
      id, name, source_url, text, type,
      parent_id: parent ? parent.id : this.props.parentID
    };
    if (!proposition.parent_id) delete proposition.parent_id;
    Relay.Store.commitUpdate(
      new (id ? UpdatePropositionMutation : CreatePropositionMutation)({proposition})
    );
    this.toggleIsEditing();
  };

  render() {
    const {proposition, viewer, withParent, relay: {variables: {withStats}}} = this.props;
    const {isEditing} = proposition ? this.state : {isEditing : true};
    const {id, childContraCount, childProCount, parent} = proposition || {};
    const {name, source_url, text, type} = isEditing ? this.state : proposition;

    return (
      <Card><form onSubmit={this.save}>

        {withParent && parent && (
          <CardTitle><PropositionLink id={parent.id} style={{opacity: .5}}>
            {parent.name}
          </PropositionLink></CardTitle>
        )}

        {type && (
          <TypeTagBar>
            <TypeTag {...{type}} onClick={this.toggleType}
                     style={{cursor: isEditing ? 'pointer' : 'inherit'}}>
              {type}
            </TypeTag>
          </TypeTagBar>
        )}

        <CardTitle>
          {isEditing
            ? <input type="text" name="name" value={name} style={{width: '100%'}}
                     onChange={this.handleInputChange}/>
            : <PropositionLink id={id}>{name}</PropositionLink>
          }
        </CardTitle>

        {isEditing
          ? (
            <CardSection style={{paddingTop: 0}}>
              <textarea name="text" value={text} style={{width: '100%'}}
                        onChange={this.handleInputChange}/>
            </CardSection>
          )
          : text && <CardSection style={{paddingTop: 0}}>{text}</CardSection>
        }

        {isEditing
          ? (
            <SourceSection>
              <input name="source_url" type="text" value={source_url}
                     onChange={this.handleInputChange} style={{width: '100%'}}/>
            </SourceSection>
          )
          : source_url && <SourceSection><a href={source_url}>{source_url}</a></SourceSection>
        }

      <StatsBar>
        <div>
          {withStats && [
            <TypeTag key="pro" type="PRO">✔ {childProCount}</TypeTag>,
            <TypeTag key="contra" type="CONTRA">✖ {childContraCount}</TypeTag>
          ]}
        </div>
        {viewer.is_god && (
          <div>
            <button type="button" onClick={this.toggleIsEditing}>
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            {isEditing && [
              proposition && <button key="delete" type="button" onClick={this.del}>Delete</button>,
              <button key="save" type="submit">{proposition ? 'Save' : 'Create'}</button>
            ]}
          </div>
        )}
      </StatsBar>

      </form></Card>
    );
  }

}

PropositionCard.defaultProps = {
  onCancel: _.noop
};

export default Relay.createContainer(PropositionCard, {

  initialVariables: {withStats: false},

  fragments: {

    proposition: () => Relay.QL`
      fragment on Proposition {
        id
        childContraCount: child_count(type: CONTRA) @include(if: $withStats)
        childProCount:    child_count(type: PRO)    @include(if: $withStats)
        name
        source_url
        text
        type
        parent {  
          id
          name
        }
      }
    `,

    viewer: () => Relay.QL`
      fragment on Viewer {
        is_god
      }
    `

  }

});
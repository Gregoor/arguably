import {propType} from 'graphql-anywhere'
import gql from 'graphql-tag';
import _ from 'lodash';
import React, {Component} from 'react';

// import DeletePropositionMutation from '../mutations/delete-proposition';
// import CreatePropositionMutation from '../mutations/create-proposition';
// import UpdatePropositionMutation from '../mutations/update-proposition';
import {Card, CardSection, CardTitle} from '../ui';
import {PropositionLink, StatsBar, TypeTag, TypeTagBar} from './components';

const SourceSection = ({children}) => (
  <CardSection style={{paddingTop: 0}}>
    <b style={{marginRight: 5}}>Source:</b>
    {children}
  </CardSection>
);


export default class PropositionCard extends Component {

  static fragments = {
    proposition: gql`
      fragment propositionCardProposition on Proposition {
        id
        childContraCount: child_count(type: CONTRA)
        childProCount:    child_count(type: PRO)
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
    viewer: gql`
      fragment propositionCardViewer on Viewer {
        is_god
      }
    `
  };

  static propTypes = {
    proposition: propType(PropositionCard.fragments.proposition).isRequired,
    viewer: propType(PropositionCard.fragments.viewer).isRequired
  };

  static defaultProps = {
    onCancel: _.noop
  };

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
    const {proposition, viewer, withParent, withStats} = this.props;
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
import React from 'react';
import Relay from 'react-relay';

import Form from './form';
import View from './view';


export default Relay.createContainer(
  class extends React.Component {

    state = {
      isEditing: false
    };

    toggleIsEditing = () => {
      this.setState((state) => ({isEditing: !state.isEditing}));
    };

    render() {
      const {props, state} = this;
      const Component = !props.proposition || state.isEditing ? Form : View;
      return <Component {...props} onEdit={this.toggleIsEditing} onCancel={this.toggleIsEditing}/>;
    }

  },
  {

    fragments: {

      proposition: () => Relay.QL`
        fragment on Proposition {
          ${Form.getFragment('proposition')}
          ${View.getFragment('proposition')}
        }
      `,

      viewer: () => Relay.QL`
        fragment on Viewer {
          ${Form.getFragment('viewer')}
          ${View.getFragment('viewer')}
        }
      `

    }

  }
);
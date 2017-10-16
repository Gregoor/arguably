import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {Provider} from 'react-redux'
import {fetchQuery} from 'react-relay'
import {Environment, Network, RecordSource, Store} from 'relay-runtime'
import fetch from 'isomorphic-fetch'
import store from '../../store'

let relayEnvironment = null

function initEnvironment({records = {}} = {}) {
  const store = new Store(new RecordSource(records))
  const network = Network.create(
    function fetchQuery(operation, variables) {
      return fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({query: operation.text, variables})
      }).then((response) => response.json())
    }
  )

  if (!process.browser) {
    return new Environment({
      network,
      store
    })
  }

  if (!relayEnvironment) {
    relayEnvironment = new Environment({
      network,
      store
    })
  }

  return relayEnvironment
}

class RelayProvider extends React.Component {

  static childContextTypes = {
    relay: PropTypes.object.isRequired
  }

  static propTypes = {
    environment: PropTypes.object.isRequired,
    variables: PropTypes.object.isRequired,
    children: PropTypes.node
  }

  getChildContext() {
    return {
      relay: {
        environment: this.props.environment,
        variables: this.props.variables
      }
    }
  }

  render() {
    return this.props.children
  }

}

export default (ComposedComponent, query, variables = {}) => class Page extends Component {

  static displayName = `RelayPage(${ComposedComponent.displayName})`

  static async getInitialProps(ctx) {
    let composedInitialProps = {}
    if (ComposedComponent.getInitialProps) {
      composedInitialProps = await ComposedComponent.getInitialProps(ctx)
    }

    let queryProps = {}
    let queryRecords = {}
    const environment = initEnvironment()

    if (query) {
      // Provide the `url` prop data in case a graphql query uses it
      // const url = { query: ctx.query, pathname: ctx.pathname }
      queryProps = await fetchQuery(environment, query, variables)
      queryRecords = environment.getStore().getSource().toJSON()
    }

    return {
      ...composedInitialProps,
      ...queryProps,
      queryRecords
    }
  }

  constructor(props) {
    super(props)
    this.environment = initEnvironment({
      records: props.queryRecords
    })
  }

  render() {
    return (
      <RelayProvider environment={this.environment} variables={variables}>
        <Provider store={store}>
          <ComposedComponent {...this.props} />
        </Provider>
      </RelayProvider>
    )
  }

}

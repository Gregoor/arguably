import ApolloClient, {createNetworkInterface} from 'apollo-client'
import 'isomorphic-fetch';


export default new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: process.env.GRAPHQL_ENDPOINT
  })
});
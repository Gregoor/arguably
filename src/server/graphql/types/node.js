import {fromGlobalId, nodeDefinitions} from 'graphql-relay'
import {Proposition} from '../../entities'
import {resolveWithUser} from '../resolvers'
import {viewableBy} from './helpers'
import PropositionGQL from './proposition'
import ViewerGQL from './viewer'

const {nodeField, nodeInterface} = nodeDefinitions(
  resolveWithUser((user, globalId) => {
    const {id, type} = fromGlobalId(globalId)

    if (type === 'Proposition') {
      return viewableBy(Proposition.find({id}), user)
    }

    return {}
  }),
  (obj) => {
    if (obj.id) return PropositionGQL
    else return ViewerGQL
  }
)

export default {
  field: nodeField,
  interface: nodeInterface
}

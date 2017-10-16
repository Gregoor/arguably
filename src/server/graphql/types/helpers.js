import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
import {connectionArgs, globalIdField} from 'graphql-relay'

export function fieldsFor(entity, fieldNames) {
  return Object.entries(entity.fields)
    .filter(([field]) => fieldNames.includes(field))
    .map(([field, def]) => {
      const meta = def.meta || def.type.meta
      const gqlType = {
        'String': GraphQLString,
        'Boolean': GraphQLBoolean,
        'Integer': GraphQLInt
      }[meta.kind === 'irreducible' ? meta.name : meta.type.meta.name] || GraphQLString
      return [field, {type: meta.kind === 'maybe' ? gqlType : new GraphQLNonNull(gqlType)}]
    })
    .concat([['id', globalIdField()]])
    .reduce((obj, [k, v]) => (obj[k] = v) && obj, {})
}

export const propositionsArgs = {
  languages: {type: new GraphQLList(GraphQLID)},
  order: {
    type: new GraphQLInputObjectType({
      name: 'PropositionOrder',
      fields: {
        by: {
          type: new GraphQLNonNull(new GraphQLEnumType({
            name: 'PropositionOrderBy',
            values: {
              CREATED_AT: {value: 'createdAt'},
              VOTES: {value: 'votes_count'}
            }
          }))
        },
        desc: {type: GraphQLBoolean}
      }
    })
  },
  query: {type: GraphQLString},
  ...connectionArgs
}

export async function viewableBy(propositions, user) {
  return propositions
  // function testProposition(proposition) {
  //   return proposition.published || (user && (user.canPublish || proposition.userId === user.id))
  // }
  //
  // propositions = await Promise.resolve(propositions)
  // return Array.isArray(propositions)
  //   ? propositions.filter(testProposition)
  //   : testProposition(propositions) ? propositions : null
}

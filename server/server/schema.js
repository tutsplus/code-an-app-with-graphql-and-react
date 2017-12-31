const graphql = require('graphql');
const {
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLUnionType,
  GraphQLList,
  GraphQLString,
  GraphQLID,
  buildSchema
} = graphql;
const { Kind } = require('graphql/language');

const Data = require('./data');

const DateType = new GraphQLScalarType({
  name: 'Date',
  description: 'Date in relation to Battle of Yavin.',
  serialize: serializeDate,
  parseValue: deserializeDate,
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) {
      return deserializeDate(ast.value);
    }
    return null;
  }
});

function deserializeDate(value) {
  let result = value.match(/^(\d+)\W?(BBY|ABY)$/);
  if (result) {
    return (result[2] === "BBY" ? -1 : 1) * parseInt(result[1]);
  }
  return null;
}

function serializeDate(value) {
  return `${Math.abs(value)} ${Math.sign(value) == 1 ? "ABY" : "BBY"}`;
}

const CharacterInterface = new GraphQLInterfaceType({
  name: 'Character',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString) },
    friends: {
      type: new GraphQLList(CharacterInterface),
      args: { appearsIn: { type: EpisodeEnum } }
    },
    appearsIn: {
      type: new GraphQLList(EpisodeEnum)
    }
  }),
  resolveType: (value) => {
    switch (value.type) {
      case 'Human': return HumanType;
      case 'Droid': return DroidType;
      default: return null;
    }
  }
});

const HumanType = new GraphQLObjectType({
  name: 'Human',
  description: 'A humanoid character in the Star Wars universe.',
  interfaces: [ CharacterInterface ],
  fields: () => ({
    id: { type: GraphQLID },
    name:  { type: new GraphQLNonNull(GraphQLString) },
    homePlanet: { type: GraphQLString },
    birthYear: { type: DateType },
    friends: {
      type: new GraphQLList(CharacterInterface),
      args: { appearsIn: { type: EpisodeEnum } },
      resolve: (human, { appearsIn }) => Data.getFriends(human, appearsIn)
    },
    appearsIn: { type: new GraphQLList(EpisodeEnum) }
  })
});

const DroidType = new GraphQLObjectType({
  name: 'Droid',
  description: 'A droid character in the Star Wars universe.',
  interfaces: [ CharacterInterface ],
  fields: () => ({
    id: { type: GraphQLID },
    name:  { type: new GraphQLNonNull(GraphQLString) },
    manufacturer: { type: GraphQLString },
    friends: {
      type: new GraphQLList(CharacterInterface),
      args: { appearsIn: { type: EpisodeEnum } },
      resolve: (droid, { appearsIn }) => Data.getFriends(droid, appearsIn)
    },
    appearsIn: { type: new GraphQLList(EpisodeEnum) }
  })
});

// const CharacterType = new GraphQLUnionType({
//   name: 'Character',
//   types: [ HumanType, DroidType ],
//   resolveType: (value) => {
//     switch (value.type) {
//       case 'Human': return HumanType;
//       case 'Droid': return DroidType;
//       default: return null;
//     }
//   }
// });

const EpisodeEnum = new GraphQLEnumType({
  name: 'Episode',
  description: 'One of the Star Wars films.',
  values: {
    TPM: {
      value: 1,
      description: 'First movie of the prequels. Released in 1999.',
    },
    AOTC: {
      value: 2,
      description: 'Second movie of the prequels. Released in 2002.',
    },
    ROTS: {
      value: 3,
      description: 'Third movie of the prequels. Released in 2005.',
    },
    ANH: {
      value: 4,
      description: 'First movie of the original trilogy. Released in 1977.',
    },
    ESB: {
      value: 5,
      description: 'Second movie of the original trilogy. Released in 1980.',
    },
    ROTJ: {
      value: 6,
      description: 'Third movie of the original trilogy. Released in 1983.',
    },
    TFA: {
      value: 7,
      description: 'First movie of the sequels. Released in 2015.',
    },
    TLJ: {
      value: 8,
      description: 'Second movie of the sequels. Released in 2017.',
    }
  }
});

const HumanInputType = new GraphQLInputObjectType({
  name: 'HumanInput',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    birthYear: { type: DateType }
  })
});

const query = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    characters: {
      type: new GraphQLList(CharacterInterface),
      resolve: () => Data.getCharacters()
    },
    character: {
      type: CharacterInterface,
      args: {
        id: {
          description: 'ID of the character',
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: (root, { id }) => {
        return Data.getCharacter(id);
      }
    }
  })
});

const mutation = new GraphQLObjectType({
  name: "Mutations",
  fields: () => ({
    createHuman: {
      description: "Create a new human character",
      type: HumanType,
      args: {
        human: { type: HumanInputType }
      },
      resolve: (root, { human }) => {
        return Data.createHuman(human);
      }
    }
  })
});

// module.exports = { schema: buildSchema(`
//   type Query {
//     human(id: ID): Human
//   }
//
//   type Human {
//     id: ID
//     name: String
//     homePlanet: String
//   }
// `),
//   root: {
//     human: ({ id }) => Data.getCharacter(id)
//   }
// };

module.exports = new GraphQLSchema({
  query,
  types: [ HumanType, DroidType ],
  mutation
});

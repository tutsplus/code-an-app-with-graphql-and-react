import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

class Mutations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      year: ''
    };
  }

  addCharacter() {
    this.props.mutate({
      variables: {
        id: this.props.data.characters.length + 1,
        name: this.state.name,
        year: this.state.year
      },
      refetchQueries: ['GetCharacters'],
      // update: (proxy, { data: { createHuman } }) => {
      //   let data = proxy.readQuery({ query });
      //   data.characters.push(createHuman);
      //   proxy.writeQuery({ query, data });
      // },
      // optimisticResponse: {
      //   __typename: "Mutation",
      //   createHuman: {
      //     __typename: "Human",
      //     id: -1,
      //     name: this.state.name,
      //     birthYear: this.state.year,
      //     homePlanet: "Unknown"
      //   }
      // }
    }).then(() => {
      this.setState({ name: '', year: '' });
      // this.props.data.refresh();
    });
  }

  render() {
    let characters = this.props.data.characters ? this.props.data.characters.map((c) => (
      <li key={c.id}>{c.name} {c.birthYear ? `born ${c.birthYear}` : ''} from {c.homePlanet || c.manufacturer}</li>
    )) : null;

    return (
      <div>
        <div className="row">
          <div className="form-group col">
            <input
              onChange={(e) => this.setState({ name: e.target.value })}
              value={this.state.name}
              placeholder="Name"
              className="form-control"
            />
          </div>
          <div className="form-group col">
            <input
              onChange={(e) => this.setState({ year: e.target.value })}
              value={this.state.year}
              placeholder="Birth Year"
              className="form-control"
            />
          </div>
          <div className="col-2">
            <button className="btn btn-primary btn-block" onClick={() => this.addCharacter()}>
              Add Character
            </button>
          </div>
        </div>
        <hr />
        <ul>{characters}</ul>
      </div>
    );
  }
}

const query = gql`
  query GetCharacters {
    characters {
      id
      name

      ...on Human {
        homePlanet
        birthYear
      }

      ...on Droid {
        manufacturer
      }
    }
  }
`;

const mutation = gql`
  mutation createHuman($id: ID, $name: String, $year: Date) {
    createHuman(human: { id: $id, name: $name, birthYear: $year }) {
      id
    }
  }
`;

export default graphql(mutation)(graphql(query)(Mutations));

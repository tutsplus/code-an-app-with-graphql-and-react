import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import Autocomplete from 'react-autocomplete';

class TripPlanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fromStation: undefined,
      toStation: undefined
    };
  }

  planRoute() {
    let from = this.props.stations.find((item) => item.name === this.state.fromStation);
    let to = this.props.stations.find((item) => item.name === this.state.toStation);

    this.props.data.refetch({
      from: { lat: from.lat, lon: from.lon },
      to: { lat: to.lat, lon: to.lon },
      skip: false
    })
  }

  render() {
    let renderItem = (item, isHighlighted) => (
      <div key={item.gtfsId} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>{item.name}</div>
    );
    let shouldRenderItem = (item, value) => item.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;

    return (
      <div>
        <div className="row">
          <div className="col form-input">
            <label className="form-label">Origin</label>
            <Autocomplete
              items={this.props.stations || []}
              getItemValue={(item) => item.name}
              inputProps={{ className: "form-control" }}
              wrapperStyle={{}}
              value={this.state.fromStation}
              renderItem={renderItem}
              shouldItemRender={shouldRenderItem}
              onChange={(e) => this.setState({ fromStation: e.target.value })}
              onSelect={(val) => this.setState({ fromStation: val })}
            />
          </div>
          <div className="col form-input">
            <label className="form-label">Destination</label>
            <Autocomplete
              items={this.props.stations || []}
              getItemValue={(item) => item.name}
              inputProps={{ className: "form-control" }}
              wrapperStyle={{}}
              value={this.state.toStation}
              renderItem={renderItem}
              shouldItemRender={shouldRenderItem}
              onChange={(e) => this.setState({ toStation: e.target.value })}
              onSelect={(val) => this.setState({ toStation: val })}
            />
          </div>
          <div className="col-2">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-primary btn-block" onClick={() => this.planRoute()}>
              Plan Route
            </button>
          </div>
        </div>
        <hr />
        <h3>Itineraries</h3>
        <div className="row itineraries">
          {this.renderItineraries()}
        </div>
      </div>
    );
  }

  renderLeg({ mode, distance, duration, departureDelay, endTime, to: { destination }, trip }, index) {
    let shortName = trip ? trip.route.shortName : null;
    let headsign = trip ? trip.headsign : null

    let legDistance = distance > 1000 ? `${(distance / 1000).toFixed(2)} km` : `${Math.round(distance)} m`;

    let time = new Date(endTime);
    let arrivalTime = `${time.getHours()}:${("0" + time.getMinutes()).slice(-2)}`;

    return (
      <div key={index} className={["leg", mode.toLowerCase()].join(" ")}>
        <div>
          <span className="mode">{mode.toLowerCase()}</span>
          <span>{shortName} {headsign}</span>
        </div>
        <div>
          <span className="distance">{legDistance}</span>
          <span>({Math.round(duration / 60)} min)</span>
        </div>
        <div className="end">
          <span className="end-time">{arrivalTime}</span>
          <span className="destination">{destination}</span>
        </div>
      </div>
    );
  }

  renderItineraries() {
    if (!this.props.data.plan) {
      return null;
    }

    return this.props.data.plan.itineraries.map((itinerary, index) => {
      let totalDistance = Math.round(itinerary.legs.map((l) => l.distance).reduce((p, c) => p + c,0));
      totalDistance = totalDistance > 1000 ? `${(totalDistance / 1000).toFixed(2)} km` : `${totalDistance} m`;

      let time = new Date(itinerary.startTime);
      let departureTime = `${time.getHours()}:${("0" + time.getMinutes()).slice(-2)}`;

      let legs = itinerary.legs.map(this.renderLeg);

      return (
        <div key={index} className="col-12 itinerary row">
          <div className="heading col" style={{ maxWidth: '100px' }}>
            <span className="distance">{totalDistance}</span>
            <span className="duration">{Math.round(itinerary.duration / 60)} min</span>
          </div>
          <div className="legs col">
            <div className="start">
              <span className="start-time">{departureTime}</span>
              <span className="origin">Origin</span>
            </div>
            {legs}
          </div>

          <hr className="col-12" />
        </div>
      );
    });
  }
}

const stationQuery = graphql(gql`
  query GetStations($skip: Boolean = true) {
    stations @include(if: $skip) {
      gtfsId
      name
      lat
      lon
    }
  }
`, {
  props: ({ data: { loading, stations, refetch } }) => ({
    data: {
      loading,
      refetch
    },
    stations: stations ? [...stations].sort((a, b) => a.name.localeCompare(b.name)) : null
  }),
  options: () => ({
    variables: {
      skip: true
    }
  })
});

const planQuery = graphql(gql`
  query GetPlan($from: InputCoordinates, $to: InputCoordinates, $date: String, $time: String, $skip: Boolean = false) {
    plan(from: $from, to: $to, date: $date, time: $time) @skip(if: $skip) {
      itineraries {
        startTime
        duration

        legs {
          endTime
          mode
          duration
          distance
          to {
            destination: name
          }

          trip {
            route { shortName }
            headsign: tripHeadsign
          }
        }
      }
    }
  }
`, {
  options: () => ({
    variables: {
      skip: true,
      date: (new Date().toISOString().split("T")[0]),
      time: (new Date().toISOString().split("T")[1].split(".")[0])
    }
  })
});

export default compose(
  stationQuery, planQuery
)(TripPlanner);

import React, { Component } from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { throttle } from 'throttle-debounce';

const center = [60.170672117, 24.941099882];

class TransportMap extends Component {
  constructor(props) {
    super(props);
    this.updateData = throttle(1000, this.updateData);
  }

  componentDidMount() {
    this.updateData(this.refs.map.leafletElement.getBounds());
  }

  updateData(bounds) {
    this.props.data.refetch({
      minLat: bounds._southWest.lat,
      minLon: bounds._southWest.lng,
      maxLat: bounds._northEast.lat,
      maxLon: bounds._northEast.lng,
      skip: false
    });
  }

  render() {
    let renderedStations = this.props.data.stops ? this.renderStations() : null;

    return (
      <Map
        center={center}
        zoom={17}
        onViewportChanged={() => this.updateData(this.refs.map.leafletElement.getBounds())}
        ref="map"
        className="transport-map"
      >
        <TileLayer
          url="https://cdn.digitransit.fi/map/v1/hsl-map/{z}/{x}/{y}.png"
          attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
        />
        {renderedStations}
      </Map>
    );
  }

  renderStations() {
    let stops = this.props.data.stops;

    return stops.map(({ id, name, lat, lon }) => {
      return (
        <Marker position={[lat, lon]} key={id}>
          <Popup>
            <div>
              <div><strong>{name}</strong></div>
            </div>
          </Popup>
        </Marker>
      );
    })
  }
}

const query = gql`
  query GetStopsInArea($minLat: Float, $maxLat: Float, $minLon: Float, $maxLon: Float, $skip: Boolean = false) {
    stops: stopsByBbox(minLat: $minLat, minLon: $minLon, maxLat: $maxLat, maxLon: $maxLon) @skip(if: $skip) {
      id
      name
      lat
      lon
    }
  }
`;

export default graphql(query, {
  options: () => ({
    variables: {
      skip: true
    }
  })
})(TransportMap);

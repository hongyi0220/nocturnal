import React from 'react';
import { Nav } from './Nav';
// import { PopUp } from './PopUp';
// import { FormSignup } from './FormSignup';
// import { FormLogin } from './FormLogin';
// import { Switch, Route } from 'react-router-dom';

export class Search extends React.Component {
    constructor() {
        super();
        this.createMap = this.createMap.bind(this);
    }

    createMap(coords) {
      var map;
      var infowindow;
      var mapDOMNode = this.refs.map;

      return function initMap() {
        var position = coords;

        map = new google.maps.Map(mapDOMNode, {
          center: coords,
          zoom: 15
        });

        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
          location: coords,
          radius: 500,
          type: ['bars']
        }, callback);
      }

      function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
          }
        }
      }

      function createMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.setContent(place.name);
          infowindow.open(map, this);
        });
      }

    }

    componentDidMount() {
        const coords = this.props.state.memory.coords;
        console.log('coords @ Search.js:', coords);
        if (coords) this.createMap()(coords);
    }

    render() {
        const state = this.props.state;
        const businesses = state.businesses;

        return (
            <div className='search-page-container'>
                <Nav/>
                <div className='backdrop-wrapper'>
                    backdrop goes here
                </div>
                <div className='map-results-container'>
                    <div ref='map' className='map-wrapper'>map goes here</div>
                    <div className='results-container'>results go here
                        {businesses ? businesses.map((bus, i) =>
                            <div key={i} className='bus-container'>
                                <div className='name-wrapper'>{bus.name}</div>
                                <div className='pic-wrapper'>{<img src={bus.image_url}/>}</div>
                            </div>
                        ) : ''}
                    </div>
                </div>
            </div>
        );
    }
}

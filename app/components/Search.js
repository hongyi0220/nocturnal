import React from 'react';
import { Nav } from './Nav';
// import { PopUp } from './PopUp';
// import { FormSignup } from './FormSignup';
// import { FormLogin } from './FormLogin';
// import { Switch, Route } from 'react-router-dom';

export class Search extends React.Component {
    constructor() {
        super();
        this.state = {
            coords: null
        }
        this.createMap = this.createMap.bind(this);
        this.getCoords = this.getCoords.bind(this);
    }

    getCoords() {
        const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
        const apiKey= '&key=AIzaSyDuljoAXSsX52jsv9nC37uU-EF4coi5O7E';
        const searchValue = this.props.state.memory.searchValue;
        const markers = this.props.state.memory.markers;
        console.log('MARKERS:',markers);
        // console.log('searchValue:', searchValue);
        const formatAddress = value => {
            return value.trim().replace(/\s/g,'+');
        }
        const address = formatAddress(searchValue);
        // console.log('formatted address: ', address);
        fetch(url + address + apiKey)
        .then(res => res.json())
        .then(resJson => {
            // console.log('resJson.results[0].geometry.location:',resJson.results[0].geometry.location);
            const coords = resJson.results[0].geometry.location;
            this.setState({
                    coords: coords
                }, () => this.createMap()(coords, markers));
        });
    }

    createMap() {
      var map;
      var infowindow;
      var bounds;
      var mapDOMNode = this.refs.map;
      // console.log('coords inside createMap:', coords);



      return function initMap(coords, markers) {
          console.log('markers inside initmap:', markers);
        // var position = coords;
// console.log('coords inside initMap:', coords);
bounds = new google.maps.LatLngBounds();
        map = new google.maps.Map(mapDOMNode, {
          center: coords,
          zoom: 15,
          styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ]
        });

        infowindow = new google.maps.InfoWindow();
        let marker;
        // var service = new google.maps.places.PlacesService(map);
        // service.nearbySearch({
        //   location: coords,
        //   radius: 500,
        //   type: ['store']
        // }, callback);
        for (let i = 0; i < markers.length; i++) {
            const position = new google.maps.LatLng(markers[i][1], markers[i][2]);
            bounds.extend(position);
            const marker = new google.maps.Marker({
                position: position,
                map: map,
                title: markers[i][0]
            });
            // google.maps.event.addListener(marker, 'click', function(marker, i) {
            //   infowindow.setContent(place.name);
            //   infowindow.open(map, this);
            // });
            map.fitBounds(bounds);
        }
      }

      // function callback(results, status) {
      //   if (status === google.maps.places.PlacesServiceStatus.OK) {
      //     for (var i = 0; i < results.length; i++) {
      //       createMarker(results[i]);
      //     }
      //   }
      // }
      console.log('markers inside initmap:', markers);



      // function createMarker(place) {
      //   var placeLoc = place.geometry.location;
      //   var marker = new google.maps.Marker({
      //     map: map,
      //     position: place.geometry.location
      //   });

        // google.maps.event.addListener(marker, 'click', function() {
        //   infowindow.setContent(place.name);
        //   infowindow.open(map, this);
        // });
      // }

    }

    componentDidMount() {
        // const coords = this.props.state.memory.coords;
        // console.log('coords @ Search.js:', coords);
        // if (coords) this.createMap()(coords);
        this.getCoords();
    }

    render() {
        const state = this.props.state;
        // const coords = state.memory.coords;
        const businesses = state.businesses;
        // console.log('coords:---', coords);

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

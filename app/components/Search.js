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
        // this.createMap = this.createMap.bind(this);
        this.initMap = this.initMap.bind(this);
        this.getCoords = this.getCoords.bind(this);
        // this.showBusDetail = this.showBusDetail.bind(this);
        //USE https://api.yelp.com/v3/businesses/{id} for business detail

    }

    getCoords() {
        const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
        const apiKey= '&key=AIzaSyDuljoAXSsX52jsv9nC37uU-EF4coi5O7E';
        const searchValue = this.props.state.memory.searchValue;
        // const markers = this.props.state.memory.markers;
        const businesses = this.props.state.businesses;
        console.log('businesses inside GETCOORDS:', businesses);
        // console.log('MARKERS:',markers);
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
                });
        });
        // , () => this.createMap()(coords, markers)
    }

    initMap(coords, markers, infowindowContent, business, isPopupOpen) {
        var map;
        var infowindow;
        var bounds;
        var mapDOMNode = this.refs.map;
        const ifwc = infowindowContent;

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
        const busContainers = document.getElementsByClassName('bus-container');
        // const popupLinks = document.getElementsByClassName('popup-link');

        for (let i = 0; i < markers.length; i++) {
            const position = new google.maps.LatLng(markers[i][1], markers[i][2]);
            bounds.extend(position);
            marker = new google.maps.Marker({
                position: position,
                map: map,
                title: markers[i][0]
            });

            google.maps.event.addListener(marker, 'click', function() {

                    infowindow.setContent(ifwc[i][0]);
                    infowindow.open(map, this);

            });

            // Open infowindow when clicking on a bar in results
            busContainers[i].addEventListener('click', ((marker, i) => {
                return () => {
                    infowindow.setContent(ifwc[i][0]);
                    infowindow.open(map, marker);
                }
            })(marker, i));
            map.fitBounds(bounds);
        }
        // This opens the marker & fill it with content when a popup link is clicked at homepage
        if (isPopupOpen) {
            const name = business.name;
            console.log('name:', name);
            let marker = markers.filter(marker => marker[0] === name)[0];
            console.error('marker:', marker);
            let infoContent;
            for (let i = 0; i < infowindowContent.length; i++) {
                if (infowindowContent[i][0].indexOf(name) > -1) {
                    infoContent = infowindowContent[i][0];
                    break;
                }
            }

            const position = new google.maps.LatLng(marker[1], marker[2]);
            console.log('position inside popup', position);
            // bounds.extend(position);
            const title = marker[0];
            marker = new google.maps.Marker({
                position: position,
                map: map,
                title: title
            });

            console.log(infoContent);
            // const infowindow = new google.maps.InfoWindow();
            infowindow.setContent(infoContent);
            infowindow.open(map, marker);
        }
    }

    componentDidMount() {
        this.getCoords();
    }

    // If/when component's prop updates, draw the map
    componentDidUpdate() {
        const coords = this.state.coords;
        const markers = this.props.state.memory.markers;
// console.log('markers:', markers);
        const infowindowContent = this.props.state.memory.infowindowContent;
        const isPopupOpen = this.props.state.ui.popupLink;
console.error('isPopupOpen:', isPopupOpen);
        const business = this.props.state.memory.business;
// console.log('infowindowContent:', infowindowContent);

        // if (isPopupLinkOpen) this.showBusDetail(coords, business, markers, infowindowContent);
        this.initMap(coords, markers, infowindowContent, business, isPopupOpen);
    }

    render() {
        const state = this.props.state;
        const businesses = state.businesses;

        return (
            <div onClick={e => e.stopPropagation()} className='search-page-container'>
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

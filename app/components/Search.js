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
        this.going = this.going.bind(this);
        // this.insertGoingData = this.insertGoingData.bind(this);
        // this.showBusDetail = this.showBusDetail.bind(this);
        //USE https://api.yelp.com/v3/businesses/{id} for business detail
    }

    going(e) {
        const id = e.target.id;
        console.log('place_id @ going(e):', id);
        const url = 'http://localhost:8080/going';
        const init = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({place_id: id})
        };
        fetch(url, init);
    }

    getCoords() {
        const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
        const apiKey= '&key=AIzaSyDuljoAXSsX52jsv9nC37uU-EF4coi5O7E';
        const searchValue = this.props.state.memory.searchValue;
        // const markers = this.props.state.memory.markers;
        const businesses = this.props.state.businesses;

        //
        //
        const formatAddress = value => {
            return value.trim().replace(/\s/g,'+');
        }
        const address = formatAddress(searchValue);
        //
        fetch(url + address + apiKey)
        .then(res => res.json())
        .then(resJson => {
            //
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


    // var position = coords;
//
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

            let marker = markers.filter(marker => marker[0] === name)[0];

            let infoContent;
            for (let i = 0; i < infowindowContent.length; i++) {
                if (infowindowContent[i][0].indexOf(name) > -1) {
                    infoContent = infowindowContent[i][0];
                    break;
                }
            }

            const position = new google.maps.LatLng(marker[1], marker[2]);

            // bounds.extend(position);
            const title = marker[0];
            marker = new google.maps.Marker({
                position: position,
                map: map,
                title: title
            });


            // const infowindow = new google.maps.InfoWindow();
            infowindow.setContent(infoContent);
            infowindow.open(map, marker);
        }
    }

    componentDidMount() {
        // const p_state = this.props.state;
        //
        // const businesses = p_state.businesses;
        // const going = p_state.memory.user.going;
        this.getCoords();
        // this.insertGoingData(businesses, going);
    }

    // If/when component's prop updates, draw the map
    componentDidUpdate() {
        const coords = this.state.coords;
        const p_state = this.props.state;
        const markers = p_state.memory.markers;
//
        const infowindowContent = p_state.memory.infowindowContent;
        const isPopupOpen = p_state.ui.popupLink;

        const business = p_state.memory.business;
        // const businesses = p_state.businesses;
        // const going = p_state.memory.user.going;
        // console.log('p_state.memory.user.going:', going);
//

        // if (isPopupLinkOpen) this.showBusDetail(coords, business, markers, infowindowContent);
        this.initMap(coords, markers, infowindowContent, business, isPopupOpen);
        // this.insertGoingData(businesses, going)
    }

    render() {
        // p_state: parent's state
        const p_state = this.props.state;
        const businesses = p_state.businesses;
        console.log('businesses @ Search render():', businesses);
        // const going = state.memory.user.going;
        const going = this.going;
        const toggleGoing = this.props.toggleGoing;

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
                                <div onClick={e => {e.stopPropagation(); going(e); toggleGoing(e)}} id={bus.id}
                                    className='going-button'>{bus.goingsData} people are going and
                                    I'm {bus.going ? '' : <div className='not-wrapper'>not</div>} going</div>
                            </div>
                        ) : ''}
                    </div>
                </div>
            </div>
        );
    }
}

import React from 'react';
import { Nav } from './Nav';
// import { PopUp } from './PopUp';
// import { FormSignup } from './FormSignup';
// import { FormLogin } from './FormLogin';
import { Link } from 'react-router-dom';

export class Search extends React.Component {
    constructor() {
        super();
        this.state = {
            coords: null,
            busContainers: null
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

        // NEED SEARCHVALUE WHEN REFRESHING /SEARCH PAGE
        const searchValue = this.props.state.memory.searchValue;

        const businesses = this.props.state.businesses;

        //
        //
        const formatAddress = value => {
            return value.trim().replace(/\s/g,'+');
        }
        const address = formatAddress(searchValue);

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

    initMap(coords, markers, infowindowContent, business, popup) {
        var map;
        var infowindow;
        var bounds;
        var mapDOMNode = this.refs.map;
        const ifwc = infowindowContent;

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
        console.log('popup?',popup);
        // This opens the marker & fill it with content when the link inside a popup is clicked
        if (popup) {
            const name = business.name;
            let marker = markers.filter(mkr => mkr[0] === name)[0];
            console.log('marker found @ initMap if(popup):', marker)
            const title = marker[0];
            console.log('title of marker:', title);
            let infoContent;
            for (let i = 0; i < infowindowContent.length; i++) {
                if (infowindowContent[i][0].indexOf(name) > -1) {
                    infoContent = infowindowContent[i][0];
                    break;
                }
            }

            console.log('infoContent @ initMap if(popup):', infoContent);
            const position = new google.maps.LatLng(marker[1], marker[2]);


            marker = new google.maps.Marker({
                position: position,
                map: map,
                title: title
            });
            console.log('marker after new google.maps.Marker:', marker);

            infowindow.setContent(infoContent);
            infowindow.open(map, marker);
            console.log('Everything in if(popup) is run!');
        }
    }

    componentDidMount() {
        const p_state = this.props.state;
        const currentPosition = p_state.memory.currentPosition;

        if (!currentPosition) this.getCoords();
    }


    componentDidUpdate() {
        const p_state = this.props.state;

        const coords = this.state.coords || p_state.memory.currentPosition;

        const markers = p_state.memory.markers;

        const infowindowContent = p_state.memory.infowindowContent;
        const popup = p_state.ui.popup;

        const business = p_state.memory.business;
            // If/when component's prop updates, draw the map
        if (this.refs.busC) this.initMap(coords, markers, infowindowContent, business, popup);

    }

    render() {
        // p_state -> parent's state
        const p_state = this.props.state;
        const businesses = p_state.businesses;
        const auth = p_state.authenticated;
        const getSearchValue = this.props.getSearchValue;
        const handleSearch = this.props.handleSearch;
        const value = p_state.memory.searchValue;

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
                    <div className='results-container'>
                        <div className='search-wrapper'>
                            <input id='x' onChange={getSearchValue} onKeyUp={handleSearch} type='text' value={value}
                                placeholder='City, state or zip'/>
                        </div>
                        {businesses ? businesses.map((bus, i) =>
                            <div key={i} className='bus-container' ref='busC'>
                                <div className='name-wrapper'>{bus.name}</div>
                                <div className='pic-wrapper'>{<img src={bus.image_url}/>}</div>
                                {/* It's not best practice but ok within the scope of this functionality to give the same id to multiple elements*/}
                                {/* onClick={e => {e.stopPropagation(); going(e); toggleGoing(e)}} */}
                                {auth ? <div id={bus.id} className='going-button'>{bus.goingsData} people are going and I'm&nbsp;
                                    {bus.going ? <div onClick={e => {e.stopPropagation(); going(e); toggleGoing(e)}}
                                        id={bus.id} className='not-wrapper'>going&nbsp;</div>
                                        : <div onClick={e => {e.stopPropagation(); going(e); toggleGoing(e)}}
                                        id={bus.id} className='not-wrapper'>not going&nbsp;</div>}
                                    {bus.going ? '' : <div className='yet-wrapper'>yet</div>}
                                </div>
                                    : <div><Link to='/'>Sign in</Link> to RSVP</div>}

                            </div>
                        ) : ''}
                    </div>
                </div>
            </div>
        );
    }
}

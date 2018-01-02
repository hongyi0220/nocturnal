import React from 'react';
import { Nav } from './Nav';
import { Link } from 'react-router-dom';

export class Search extends React.Component {
    constructor() {
        super();
        this.state = {
            coords: null,
            busContainers: null
        }
        this.initMap = this.initMap.bind(this);
        this.going = this.going.bind(this);
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
        const icon = 'https://raw.githubusercontent.com/hongyi0220/assets/master/yellow-marker.png'
        for (let i = 0; i < markers.length; i++) {
            const position = new google.maps.LatLng(markers[i][1], markers[i][2]);
            bounds.extend(position);
            marker = new google.maps.Marker({
                position: position,
                map: map,
                title: markers[i][0],
                icon: icon
            });

            google.maps.event.addListener(marker, 'click', function() {
                    infowindow.setContent(ifwc[i][0]);
                    infowindow.open(map, this);
            });

            // Open infowindow when hovering over a business
            busContainers[i].addEventListener('mouseover', ((marker, i) => {
                return () => {
                    infowindow.setContent(ifwc[i][0]);
                    infowindow.open(map, marker);
                }
            })(marker, i));
            map.fitBounds(bounds);
        }


        // This opens the marker & fill it with content when the link inside a popup is clicked
        if (popup) {
            const name = business.name;
            let marker = markers.filter(mkr => mkr[0] === name)[0];

            const title = marker[0];

            let infoContent;
            for (let i = 0; i < infowindowContent.length; i++) {
                if (infowindowContent[i][0].indexOf(name) > -1) {
                    infoContent = infowindowContent[i][0];
                    break;
                }
            }

            const position = new google.maps.LatLng(marker[1], marker[2]);

            marker = new google.maps.Marker({
                position: position,
                map: map,
                title: title
            });

            infowindow.setContent(infoContent);
            infowindow.open(map, marker);

        }
    }

    componentDidMount() {
        const p_state = this.props.state;
        const currentPosition = p_state.memory.currentPosition;

        this.props.toggleLoading();

        const clientHeight = this.props.getClientHeight();
        const navHeight = 50;
        const flexboxHeight = 35;
        console.log('clientHeight from this.props.getClientHeight():', clientHeight);
        const searchPageContainer = this.refs.searchPageContainer;
        const mapResultsContainer = this.refs.mapResultsContainer;

        searchPageContainer.style.height = clientHeight * .99 + 'px';
        mapResultsContainer.style.height = (clientHeight - navHeight - flexboxHeight) * .98 + 'px';

    }

    componentDidUpdate() {
        const p_state = this.props.state;
        const coords = this.state.coords || p_state.memory.currentPosition;
        const markers = p_state.memory.markers;
        const infowindowContent = p_state.memory.infowindowContent;
        const popup = p_state.ui.popup;
        const business = p_state.memory.business;

        // If/when component's prop updates, draw the map
        if (this.refs.busC) this.initMap(null, markers, infowindowContent, business, popup);
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
        const clearSearchText = this.clearSearchText;

        return (
            <div ref='searchPageContainer' onClick={e => e.stopPropagation()} className='search-page-container'>
                <Nav value={value} getSearchValue={getSearchValue} handleSearch={handleSearch}/>
                <div ref='mapResultsContainer' className='map-results-container'>
                    <div className='results-container'>
                        {businesses ? businesses.map((bus, i) =>
                            <div key={i} style={{background: 'url(' + bus.image_url + ') ' + 'no-repeat ' + 'center'}}className='bus-container' ref='busC'>
                                <div className='name-wrapper'>{bus.name}</div>
                                {/* <div className='pic-wrapper'>{<img src={bus.image_url}/>}</div> */}
                                {/* It's not best practice but ok within the scope of this functionality to give the same id to multiple elements*/}
                                {auth ? <div id={bus.id} className='going-button'>{bus.goingsData} people are going and I'm&nbsp;
                                    {bus.going ? <div onClick={e => {e.stopPropagation(); going(e); toggleGoing(e)}}
                                                    id={bus.id} className='not-wrapper'>going&nbsp;</div>
                                                : <div onClick={e => {e.stopPropagation(); going(e); toggleGoing(e)}}
                                                    id={bus.id} className='not-wrapper'>not going&nbsp;</div>}
                                    {bus.going ? '' : <div className='yet-wrapper'>yet</div>}
                                </div>
                                    : <div className='signin-link-wrapper'><Link to='/'>Sign in</Link> to RSVP</div>}

                            </div>
                        ) : ''}
                    </div>
                    <div ref='map' className='map-wrapper'><span>Getting map&nbsp;<i className="fa fa-spinner fa-pulse fa-lg fa-fw"></i></span></div>
                </div>
            </div>
        );
    }
}

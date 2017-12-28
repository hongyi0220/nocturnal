import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import { FormSignup } from './FormSignup';
import { Home } from './Home';
import { Search } from './Search';

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            businesses: null,
            authenticated: false,
            memory: {
                user: null,
                business: null,
                currentPosition: null,
                searchValue: '',
                markers: null,
                infowindowContent: null,
                goings: null
            },
            ui: {
                pic: false,
                popupLink: false
            }
        }
        this.fetchData = this.fetchData.bind(this);
        this.openHomeUi = this.openHomeUi.bind(this);
        this.closeAll = this.closeAll.bind(this);
        this.signOut = this.signOut.bind(this);
        this.getCurrentLocation = this.getCurrentLocation.bind(this);
        this.getUserData = this.getUserData.bind(this);
        this.getSearchValue = this.getSearchValue.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.makeMarkerData = this.makeMarkerData.bind(this);
        this.makeInfowindowContent = this.makeInfowindowContent.bind(this);
        this.toggleGoing = this.toggleGoing.bind(this);
        this.insertGoingData = this.insertGoingData.bind(this);
        // this.getCoords = this.getCoords.bind(this);
    }

    // Insert #of people going to a bar, and if the authenticated user is going to that bar
    //into the businesses data in state so they can be displayed in the bar search results
    insertGoingData(businesses, going, goingsData) {
        // Insert data on bars the user is going to
        const buses = businesses.map(bus => {
            // console.log('bus @ insertGoingData:', bus);
            const isGoing = () => {
                for (let i = 0; i < going.length; i++) {
                    if (bus.id === going[i]) {
                        // console.log('if triggered; bus.id === going[i]:', bus.id === going[i]);
                        bus.going = 1;
                        return true;
                    }
                }
                return false;
            }
            // console.log('isGoing():', isGoing());
            if (!isGoing()) bus.going = 0;
            return bus;
        });

        // Insert data on # of people going to each bar
        const busesTransformed = buses.map(bus => {
            // console.log('bus inside 2nd mapping of businesses:', bus);
            bus.goingsData = goingsData[bus.id] ? goingsData[bus.id] : 0;
            return bus;
        });

        this.setState(prevState => ({
            ...prevState,
            businesses: busesTransformed
        }));
        // , () => console.log('bus transformed:',this.state.businesses)
    }

    toggleGoing(e) {
        console.log('toggleGoing triggered');
        const place_id = e.target.id;
        const memory = {...this.state.memory};
        const user = memory.user;
        const state = {...this.state};
        const businesses = state.businesses;
        const going = user.going;
        const goings = memory.goings;
        console.log('going in toggleGoing:', going);
        // Push or pull going data in user data
        const isGoing = () => {
            for (let i = 0; i < going.length; i++) {
                if (going[i] === place_id) {
                    // console.log('going inside loop B4 splice:', going);
                    // console.log('goingS inside loop B4 subtraction:', goings);
                    going.splice(i, 1);
                    // if (goings[place_id])
                    goings[place_id] -= 1;
                    // else goings[place_id] = 1;
                    // console.log('going inside loop after splice:', going);
                    // console.log('goingS inside loop after subtraction:', goings);
                    return true;
                }
            }
            return false;
        }

        if (!isGoing()) {
            going.push(place_id);
            if (goings[place_id]) goings[place_id] += 1;
            else goings[place_id] = 1;
            // goings[place_id] += 1;
        }

        this.setState({ user }, () => {
            console.log('memory after toggleGoing:', this.state.memory);
            this.insertGoingData(businesses, going, goings);

        });
    }

    handleSearch(e) {
        const key = e.key;
        const location = this.state.memory.searchValue;
        // const businesses = this.state.businesses;
        // const going = this.state.memory.user.going;

        if (key === 'Enter') {
            this.fetchData(location);
            // this.insertGoingData(businesses, going);
            // this.makeMarkerData(businesses);
            this.props.history.push('/search');

        }
    }

    getSearchValue(e) {
        const value = e.target.value;
        this.setState({
            ...this.state,
            memory: {
                ...this.state.memory,
                searchValue: value
            }
        });
    }

    getUserData() {
        const url = 'http://localhost:8080/user'
        // const businesses = this.state.businesses;
        // console.log('businesses @ getUserData:', businesses);
        fetch(url)
        .then(res => res.json())
        .then(resJson => this.setState({
            ...this.state,
            authenticated: true,
            memory: {
                ...this.state.memory,
                user: resJson
            }
        }));
        // () => this.insertGoingData(businesses, resJson.going)
    }

    getCurrentLocation() {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(pos => {

                this.setState({
                    ...this.state,
                    memory: {
                        ...this.state.memory,
                        currentPosition: {
                            lat: pos.coords.latitude,
                            long: pos.coords.longitude
                        }
                    }
                }, () => {
                    this.fetchData(null);
                    this.props.history.push('/search');
                });
            });
    }

    signOut() {
        const auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut()
        .then(() => this.setState(prevState =>
            ({
                ...prevState,
                authenticated: false,
                memory: {
                    ...prevState.memory,
                    user: null
                }
            })
        ));
        // Destroy session
        const apiUrl = 'http://localhost:8080/signout';
        fetch(apiUrl);
    }

    closeAll(e) {

        this.setState({
            ...this.state,
            ui: {
                ...this.state.ui,
                pic: false,
                popupLinke: false
            }
        });
    }

    openHomeUi(e) {

        const id = e.target.id;
        const cityName = e.target.className;


        const business = id => {
            return this.state.businesses.filter(bus => bus.id === id)[0];
        }
        this.setState(prevState => ({
            ...prevState,
            memory: {
                ...prevState.memory,
                business: business(id),
                searchValue: cityName
            },
            ui: {
                ...prevState.ui,
                pic: true,
                popupLink: true
            }
        }));
        this.fetchData(cityName);
        e.stopPropagation();
    }

    makeInfowindowContent(businesses) {
        const infowindowContent = [];
        businesses.forEach(bus => {
            const yelpstars = ['zero.png', 'one.png', 'one_half.png', 'two.png', 'two_half.png', 'three.png',
                               'three_half.png', 'four.png', 'four_half.png', 'five.png'];
            const yelpstarsIndex = (bus.rating * 2) - 1;
            const info = '<div class="info-content">' +
                         '<h3>' + bus.name + '</h3>' +
                         '<img style="width:100px" src="' + bus.image_url + '"/>' +
                         '<div class="stars-wrapper">' + '<img src="/img/yelpstars/' + yelpstars[yelpstarsIndex] + '"/>' + '&nbsp;' +
                         bus.review_count + '&nbsp;' + 'reviews' + '</div>' +
                         '<div class="price-category-wrapper">' + bus.price + '&nbsp;' + bus.categories[0].title + '</div>' +
                         '</div>';
            infowindowContent.push([info]);
        });
        this.setState(prevState => ({
            ...prevState,
            memory: {
                ...prevState.memory,
                infowindowContent: infowindowContent
            }
        }));
    }

    makeMarkerData(businesses) {
        const markers = [];
        businesses.forEach(bus => {
            markers.push([bus.name, bus.coordinates.latitude, bus.coordinates.longitude]);
        });
        this.setState({
            ...this.state,
            memory: {
                ...this.state.memory,
                markers: markers
            }
        });
        // , () => console.log('after makeMarkerData:',this.state.memory)
    }

    fetchData(location) {
        const cors = 'https://cors.now.sh/';
        const url = 'https://api.yelp.com/v3/businesses/search';
        const key = 'JvHymxu3L88HLmjRak19pkInJW72X5XCmoTNWWm0VNMlgBbblR4CyREsz3TdLfCbbYLmjDbDT2UgfqpR4HGy_XhlLC9c2vPv-XcsLrrHnTFMg9fe94wpTbW11dE6WnYx';
        const currentPosition = this.state.memory.currentPosition;
        const user = this.state.memory.user;
        // const searchValue = this.state.memory.searchValue;

        const city = () => {
            let cities = ['chicago', 'la', 'nyc', 'atlanta', 'boston', 'san%20francisco', 'seattle', 'denver'];
            // cities = ['chicago'];
            const i = Math.floor(Math.random() * cities.length);
            return cities[i];
        }
        let query = currentPosition ? ('latitude=' + currentPosition.lat + '&longitude=' + currentPosition.long) : ('location=' + city());

        if (location) query = 'location=' + location;

        const headers = new Headers({
            'Authorization': 'Bearer ' + key,
        });
        const init = {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        }

        fetch(cors + url + '?term=bars&' + query, init)
        .then(res => res.json())
        .then(resJson => this.setState(prevState => ({
            ...prevState,
            businesses: resJson.businesses
        }), () => {
            console.log('location:', new Boolean(location));
            const buses = resJson.businesses;

            this.makeMarkerData(buses);
            this.makeInfowindowContent(buses);

            const apiUrl = 'http://localhost:8080/goingsdata';
            const init = {
                method: 'get',
                headers: {
                    'Accept': 'application/json'
                }
            }
            fetch(apiUrl, init)
            .then(res => res.json())
            .then(goingsData => this.setState(prevState => ({
                ...prevState,
                memory: {
                    ...prevState.memory,
                    goings: goingsData
                }
            }), () => {
                // When doing a search (of a location), insert data on who's going into businesses data
                if (location && user) {
                    const going = this.state.memory.user.going;
                    console.log('going insdie of fetchData:', going);
                    this.insertGoingData(buses, going, goingsData);
                }

            }));

        }));
        // Get data on # of people going to each business
        // const apiUrl = 'http://localhost:8080/goingsdata';
        // const init = {
        //     method: 'get',
        //     headers: {
        //         'Accept': 'application/json'
        //     }
        // }
        // fetch(apiUrl, init)
        // .then(res => res.json())
        // .then(resJson => this.setState(prevState => ({
        //     ...prevState,
        //     memory: {
        //         ...prevState.memory,
        //         goings: resJson
        //     }
        // }), () => {
        //
        // }));
        // , () => this.makeMarkerData(resJson.businesses)
    }

    componentWillMount() {
        this.fetchData(null)
    }

    componentDidMount() {
        const input = document.getElementById('auth');
        input.onchange = this.getUserData;
    }

    render() {
        const state = this.state;
        const auth = this.state.authenticated;
        const openHomeUi = this.openHomeUi;
        const closeAll = this.closeAll;
        const signOut = this.signOut;
        const getCurrentLocation = this.getCurrentLocation;
        const getUserData = this.getUserData;
        const getSearchValue = this.getSearchValue;
        const handleSearch = this.handleSearch;
        const history = this.props.history;
        const toggleGoing =  this.toggleGoing;

        return (
            <div onClick={closeAll} className='container'>
                <Switch>
                    <Route path='/search' render={() => <Search toggleGoing={toggleGoing} state={state}/>}/>
                    <Route path='/' render={() => <Home auth={auth} getCurrentLocation={getCurrentLocation}
                        getSearchValue={getSearchValue} closeAll={closeAll} signOut={signOut}
                        history={history} handleSearch={handleSearch} openHomeUi={openHomeUi} state={state}/>}/>
                </Switch>
                <input id='auth' type='hidden'/>
                {/* <div>Logo made with <a href="https://
www.designevo.com/" title="Free Online Logo Maker">DesignEvo</a></div> */}
            </div>
        );
    }
}

export default withRouter(App);

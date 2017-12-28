import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
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
        this.getCurrentPosition = this.getCurrentPosition.bind(this);
        this.getUserData = this.getUserData.bind(this);
        this.getSearchValue = this.getSearchValue.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.makeMarkerData = this.makeMarkerData.bind(this);
        this.makeInfowindowContent = this.makeInfowindowContent.bind(this);
        this.toggleGoing = this.toggleGoing.bind(this);
        this.insertGoingData = this.insertGoingData.bind(this);
        this.timeout = null;
        this.storeSearchValueInSession = this.storeSearchValueInSession.bind(this);
        this.getMapdata = this.getMapdata.bind(this);
    }

    storeSearchValueInSession(value) {
        const apiUrl = 'http://localhost:8080/searchvalue';
        const init = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({searchValue: value})
        }
        fetch(apiUrl, init);
    }

    // Insert #of people going to a bar, and if the authenticated user is going to that bar
    //into the businesses data in state so they can be displayed in the bar search results
    insertGoingData(businesses, going, goingsData) {
        // Insert data on bars the user is going to
        const buses = businesses.map(bus => {
            //
            const isGoing = () => {
                for (let i = 0; i < going.length; i++) {
                    if (bus.id === going[i]) {
                        //
                        bus.going = 1;
                        return true;
                    }
                }
                return false;
            }
            //
            if (!isGoing()) bus.going = 0;
            return bus;
        });

        // Insert data on # of people going to each bar
        const busesTransformed = buses.map(bus => {
            //
            bus.goingsData = goingsData[bus.id] ? goingsData[bus.id] : 0;
            return bus;
        });

        this.setState(prevState => ({
            ...prevState,
            businesses: busesTransformed
        }));
        // , () =>
    }

    toggleGoing(e) {

        const place_id = e.target.id;
        const memory = {...this.state.memory};
        const user = memory.user;
        const state = {...this.state};
        const businesses = state.businesses;
        const going = user.going;
        const goings = memory.goings;

        // Push or pull going data in user data
        const isGoing = () => {
            for (let i = 0; i < going.length; i++) {
                if (going[i] === place_id) {
                    //
                    //
                    going.splice(i, 1);
                    // if (goings[place_id])
                    goings[place_id] -= 1;
                    // else goings[place_id] = 1;
                    //
                    //
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

            this.insertGoingData(businesses, going, goings);

        });
    }

    handleSearch(e) {
        const id = e.target.id;
        clearTimeout(this.timeout);
        const location = this.state.memory.searchValue;

        this.timeout = setTimeout(() => {
            this.fetchData(location);
            if (id === 'home') this.props.history.push('/search');
            this.setState({
                ...this.state,
                memory: {
                    ...this.state.memory,
                    searchValue: ''
                }
            });

            this.storeSearchValueInSession(location);
            // const apiUrl = 'http://localhost:8080/searchvalue';
            // const init = {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({searchValue: location})
            // }
            // fetch(apiUrl, init);

        }, 500);

        const key = e.key;

        // const businesses = this.state.businesses;
        // const going = this.state.memory.user.going;

        if (key === 'Enter') {
            this.fetchData(location);
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
        //
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

    getCurrentPosition() {
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
        const error = err => {
            console.warn(`Error(${err.code}): ${err.message}`);
        }
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(pos => {

                this.setState({
                    ...this.state,
                    memory: {
                        ...this.state.memory,
                        currentPosition: {
                            lat: parseFloat(pos.coords.latitude),
                            lng: parseFloat(pos.coords.longitude)
                        }
                    }
                }, () => {
                    this.fetchData(null);
                    this.props.history.push('/search');
                });
            }, error, options);
    }

    signOut() {
        const auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut()
        .then(() => this.setState(
            {
                ...this.state,
                authenticated: false,
                memory: {
                    ...this.state.memory,
                    user: null
                }
            }
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
        this.storeSearchValueInSession(cityName);
        // const apiUrl = 'http://localhost:8080/searchvalue';
        // const init = {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({searchValue: cityName})
        // }
        // fetch(apiUrl, init);
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
        }, () => console.log('markers after makingMarkers:', markers));

        const apiUrl ='http://localhost:8080/markers';
        const init = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({markers: markers})
        }
        fetch(apiUrl, init);
    }

    getMapdata() {
        const apiUrl = 'http://localhost:8080/mapdata';
        const apiInit = {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }
       if (window.performance)
       if (performance.navigation.type === 1) {
           this.getUserData();
           console.log('page relaoded');
           fetch(apiUrl, apiInit)
           .then(res => res.json())
           .then(resJson => {
               const markers = resJson.markers;
               const _searchValue = resJson.searchValue;
               // console.log(_searchValue)
               this.setState(prevState => ({
                   ...prevState,
                   memory: {
                       ...prevState.memory,
                       markers: markers,
                       searchValue: prevState.memory.searchValue ? prevState.memory.searchValue : _searchValue
                   }
               }), () => {
                   this.fetchData(_searchValue);
               });
           });
       }
    }

    fetchData(location) {
        const cors = 'https://cors-anywhere.herokuapp.com/';
        // 'https://cors.now.sh/';
        const url = 'https://api.yelp.com/v3/businesses/search';

        const key = 'JvHymxu3L88HLmjRak19pkInJW72X5XCmoTNWWm0VNMlgBbblR4CyREsz3TdLfCbbYLmjDbDT2UgfqpR4HGy_XhlLC9c2vPv-XcsLrrHnTFMg9fe94wpTbW11dE6WnYx';
        const currentPosition = this.state.memory.currentPosition;
        const user = this.state.memory.user;
        let searchValue = this.state.memory.searchValue;
        // const apiUrl = 'http://localhost:8080/mapdata';
        // const apiInit = {
        //     method: 'GET',
        //     headers: {
        //         'Accept': 'application/json'
        //     }
        // }
    //      const getMapdata = () => {
    //         // if (window.performance)
    //         // if (performance.navigation.type === 1) {
    //             this.getUserData();
    //             console.log('page relaoded');
    //             fetch(apiUrl, apiInit)
    //             .then(res => res.json())
    //             .then(resJson => {
    //                 const markers = resJson.markers;
    //                 const _searchValue = resJson.searchValue;
    // console.log(_searchValue)
    //                 this.setState(prevState => ({
    //                     ...prevState,
    //                     memory: {
    //                         ...prevState.memory,
    //                         markers: markers,
    //                         searchValue: prevState.memory.searchValue ? prevState.memory.searchValue : _searchValue
    //                     }
    //                 }), () => {
    //                     this.fetchData(_searchValue);
    //
    //                 });
    //             });
    //         //     return true;
    //         // }
    //         // return false;
    //     }
    //     if(performance.navigation.type === 1) getMapdata();

        console.log('searchValue outside of reloadFetch:', searchValue);
        const city = () => {
            let cities = ['chicago', 'la', 'nyc', 'atlanta', 'boston', 'san%20francisco', 'seattle', 'denver'];
            // cities = ['chicago'];
            const i = Math.floor(Math.random() * cities.length);
            return cities[i];
        }
        let query = currentPosition ? ('latitude=' + currentPosition.lat + '&longitude=' + currentPosition.lng) : ('location=' + city());

        if (location) query = 'location=' + location;
        if (searchValue) query = 'location=' + searchValue;
        console.log('query @ fetchData:', query);
        const headers = new Headers({
            'Authorization': 'Bearer ' + key,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'HEAD, GET, POST, PUT, PATCH, DELETE',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
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

            const buses = resJson.businesses;

            this.makeMarkerData(buses);
            this.makeInfowindowContent(buses);

            // Get data on # of people going to each business
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

                    this.insertGoingData(buses, going, goingsData);
                }

            }));

        }));

    }

    componentWillMount() {
        this.getMapdata();
        if(performance.navigation.type !== 1) {
            console.log('not reload, fetching data(null)');
            this.fetchData(null);
        }

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
        const getCurrentPosition = this.getCurrentPosition;
        const getUserData = this.getUserData;
        const getSearchValue = this.getSearchValue;
        const handleSearch = this.handleSearch;
        const history = this.props.history;
        const toggleGoing =  this.toggleGoing;

        return (
            <div onClick={closeAll} className='container'>
                <Switch>
                    <Route path='/search' render={() => <Search getSearchValue={getSearchValue} handleSearch={handleSearch}
                        toggleGoing={toggleGoing} state={state}/>}/>
                    <Route path='/' render={() => <Home auth={auth} getCurrentPosition={getCurrentPosition}
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

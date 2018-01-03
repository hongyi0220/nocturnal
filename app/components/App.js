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
                popup: false,
                loading: false,
                height: null
            },
            dev: false
        }
        this.fetchData = this.fetchData.bind(this);
        this.openPopup = this.openPopup.bind(this);
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
        this.getGoingsData = this.getGoingsData.bind(this);
        this.toggleLoading = this.toggleLoading.bind(this);
        this.xhr = null;
        this.getClientHeight = this.getClientHeight.bind(this);
    }

    storeSearchValueInSession(value) {
        const dev = this.state.dev;
        const apiUrl = dev ? 'http://localhost:8080/searchvalue' : 'https://nocturnal-0220.herokuapp.com/searchvalue';

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

            const isGoing = () => {
                for (let i = 0; i < going.length; i++) {
                    if (bus.id === going[i]) {

                        bus.going = 1;
                        return true;
                    }
                }
                return false;
            }

            if (!isGoing()) bus.going = 0;
            return bus;
        });

        // Insert data on # of people going to each bar
        const busesTransformed = buses.map(bus => {

            bus.goingsData = goingsData[bus.id] ? goingsData[bus.id] : 0;
            return bus;
        });

        this.setState(prevState => ({
            ...prevState,
            businesses: busesTransformed
        }));
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

                    going.splice(i, 1);
                    goings[place_id] -= 1;

                    return true;
                }
            }
            return false;
        }

        if (!isGoing()) {
            going.push(place_id);
            if (goings[place_id]) goings[place_id] += 1;
            else goings[place_id] = 1;
        }

        this.setState({ user }, () => {

            this.insertGoingData(businesses, going, goings);

        });
    }

    handleSearch(e) {
        const id = e.target.id;
        clearTimeout(this.timeout);
        const location = this.state.memory.searchValue;
        const key = e.key;
        this.xhr.abort();

        const search = () => {
            this.fetchData(location, null);

            this.setState({
                ...this.state,
                memory: {
                    ...this.state.memory,
                    searchValue: ''
                },
                ui: {
                    ...this.state.ui,
                    loading: true
                }
            });

            this.storeSearchValueInSession(location);
        }

        // this.timeout = setTimeout(search, 500);

        if (key === 'Enter') {
            // clearTimeout(this.timeout);
            search();
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
        const dev = this.state.dev;
        const url = dev ? 'http://localhost:8080/user' : 'https://nocturnal-0220.herokuapp.com/user';

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

                const coords = {
                    lat: parseFloat(pos.coords.latitude),
                    lng: parseFloat(pos.coords.longitude)
                };

                this.setState({
                    ...this.state,
                    memory: {
                        ...this.state.memory,
                        currentPosition: coords
                    }
                }, () => {
                    this.fetchData(null, coords);
                });
            }, error, options);
    }

    signOut() {
        const auth2 = gapi.auth2.getAuthInstance();
        const dev = this.state.dev;
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
        const apiUrl = dev ? 'http://localhost:8080/signout' : 'https://nocturnal-0220.herokuapp.com/signout';
        fetch(apiUrl);
    }

    closeAll(e) {
        this.setState({
            ...this.state,
            ui: {
                ...this.state.ui,
                popup: false
            },
            memory: {
                ...this.state.memory,
                searchValue: ''
            }
        });
    }

    openPopup(e) {
        const id = e.target.id;

        const findBusiness = id => {
            return this.state.businesses.filter(bus => bus.id === id)[0];
        }
        const bus = findBusiness(id);
        const cityName = bus.location.city;

        this.setState(prevState => ({
            ...prevState,
            memory: {
                ...prevState.memory,
                business: bus,
                searchValue: cityName
            },
            ui: {
                ...prevState.ui,
                popup: true
            }
        }));
        this.storeSearchValueInSession(cityName);
        e.stopPropagation();
    }

    makeInfowindowContent(businesses) {
        const infowindowContent = [];
        businesses.forEach(bus => {
            const yelpstars = ['zero.png', 'one.png', 'one_half.png', 'two.png', 'two_half.png', 'three.png',
                               'three_half.png', 'four.png', 'four_half.png', 'five.png'];
            const yelpstarsIndex = (bus.rating * 2) - 1;
            const info = '<div style="text-align: center" class="info-content">' +
                         '<h3>' + bus.name + '</h3>' +
                         '<img style="width:150px" src="' + bus.image_url + '"/>' +
                         '<div class="stars-wrapper">' + '<img src="/img/yelpstars/' + yelpstars[yelpstarsIndex] + '"/>' + '&nbsp;' + ' ' +
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
        const dev = this.state.dev;
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

        // Send markers to be stored in session in case of a page refresh
        const apiUrl = dev ? 'http://localhost:8080/markers' : 'https://nocturnal-0220.herokuapp.com/markers';
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
        const dev = this.state.dev;
        const apiUrl = dev ? 'http://localhost:8080/mapdata' : 'https://nocturnal-0220.herokuapp.com/mapdata';
        const apiInit = {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }

       fetch(apiUrl, apiInit)
       .then(res => res.json())
       .then(resJson => {
           const markers = resJson.markers;
           const searchValue = resJson.searchValue;

           this.setState(prevState => ({
               ...prevState,
               memory: {
                   ...prevState.memory,
                   markers: markers,
                   searchValue: prevState.memory.searchValue ? prevState.memory.searchValue : searchValue
               }
           }), () => {
               this.fetchData(searchValue, null);
           });
       });
    }

    fetchData(location, position) {

        const cors = 'https://cors-anywhere.herokuapp.com/';
        const url = 'https://api.yelp.com/v3/businesses/search';
        const key = 'JvHymxu3L88HLmjRak19pkInJW72X5XCmoTNWWm0VNMlgBbblR4CyREsz3TdLfCbbYLmjDbDT2UgfqpR4HGy_XhlLC9c2vPv-XcsLrrHnTFMg9fe94wpTbW11dE6WnYx';

        const city = () => {
            let cities = ['chicago', 'la', 'nyc', 'atlanta', 'boston', 'san%20francisco', 'seattle', 'denver'];

            const i = Math.floor(Math.random() * cities.length);
            return cities[i];
        }
        let query;
        if (location) query = 'location=' + location;
        else if (position) query = 'latitude=' + position.lat + '&longitude=' + position.lng;
        else query = 'location=' + city();

        const xhr = new XMLHttpRequest();
        xhr.open('GET', cors + url + '?term=bars&' + query, true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + key);
        this.xhr = xhr;
        xhr.onload = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const resJson = JSON.parse(xhr.response);

                    this.setState(prevState => ({
                        ...prevState,
                        businesses: resJson.businesses
                    }), () => {

                        const buses = resJson.businesses;
                        if (location || position) {
                            this.toggleLoading();
                            this.makeMarkerData(buses);
                            this.makeInfowindowContent(buses);
                            this.getGoingsData(buses);
                            this.props.history.push('/search');
                        }

                    })
                } else if (xhr.status >= 400) {
                    console.error('XHR Error; Code: ', xhr.status);
                }
            }
        };
        xhr.send();
    }

    toggleLoading() {
        this.setState({
            ...this.state,
            ui: {
                ...this.state.ui,
                loading: this.state.ui.loading ? false : true
            }
        });
    }

    getGoingsData(buses) {
        const dev = this.state.dev;
        const user = this.state.memory.user;
        // Get data on # of people going to each business
        const apiUrl = dev ? 'http://localhost:8080/goingsdata': 'https://nocturnal-0220.herokuapp.com/goingsdata';
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
            // When user is signed-in, modify 'businesses' data in state to include
            //how many people are going and if the user is going to each business
            if (user) {
                const going = this.state.memory.user.going;

                this.insertGoingData(buses, going, goingsData);
            }

        }));
    }

    getClientHeight() {
        const height = document.documentElement.clientHeight || window.innerHeight;
        this.setState({...this.state, ui: {...this.state.ui, height: height}});
        return height;
    }

    componentWillMount() {
        const pathname = this.props.history.location.pathname;
        this.getUserData();
        if (window.performance)
        if (performance.navigation.type === 1 && pathname !== '/') {
            this.getMapdata();
        } else {
            this.fetchData(null, null);
        }

    }

    componentDidMount() {
        const clientHeight = this.getClientHeight();
        const height = clientHeight + 'px';
        const container = this.refs.container;

        container.style.height = height;

        const input = document.getElementById('auth');
        input.onchange = this.getUserData;
    }

    render() {
        const state = this.state;
        const auth = this.state.authenticated;
        const openPopup = this.openPopup;
        const closeAll = this.closeAll;
        const signOut = this.signOut;
        const getCurrentPosition = this.getCurrentPosition;
        const getUserData = this.getUserData;
        const getSearchValue = this.getSearchValue;
        const handleSearch = this.handleSearch;
        const history = this.props.history;
        const toggleGoing =  this.toggleGoing;
        const fetchData = this.fetchData;
        const toggleLoading = this.toggleLoading;
        const getClientHeight = this.getClientHeight;

        return (
            <div ref='container' onClick={closeAll} className='container'>
                <Switch>
                    <Route path='/search' render={() => <Search getSearchValue={getSearchValue} handleSearch={handleSearch}
                        getClientHeight={getClientHeight} toggleGoing={toggleGoing} state={state} toggleLoading={toggleLoading}/>}/>
                    <Route path='/' render={() => <Home fetchData={fetchData} auth={auth} getCurrentPosition={getCurrentPosition}
                        toggleLoading={toggleLoading} getSearchValue={getSearchValue} closeAll={closeAll} signOut={signOut}
                        getClientHeight={getClientHeight} history={history} handleSearch={handleSearch} openPopup={openPopup} state={state}/>}/>
                </Switch>
                <input id='auth' type='hidden'/>
                <footer>Design and code by <a href='http://yungilhong.com'>Yungil Hong</a></footer><div id='attribution'>Logo made with <a href="https://
www.designevo.com/" title="Free Online Logo Maker">DesignEvo</a></div>
            </div>
        );
    }
}

export default withRouter(App);

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
                infowindowContent: null
            },
            ui: {
                pic: false,
                signup: false,
                login: false
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
        // this.getCoords = this.getCoords.bind(this);
    }

    // getCoords() {
    //     const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
    //     const apiKey= '&key=AIzaSyDuljoAXSsX52jsv9nC37uU-EF4coi5O7E';
    //     const searchValue = this.state.memory.searchValue;
    //     const formatAddress = value => {
    //         return value.trim().replace(/\s/g,'+');
    //     }
    //     const address = formatAddress(searchValue);
    //     console.log('formatted address: ', address);
    //     fetch(url + address + apiKey)
    //     .then(res => res.json())
    //     .then(resJson => {
    //         // console.log('resJson:',resJson);
    //         const coords = resJson.results[0].geometry.location;
    //         this.setState({
    //             ...this.state,
    //             memory: {
    //                 ...this.state.memory,
    //                 coords: coords
    //             }
    //         }, () => console.log('coords:', coords));
    //     });
    // }

    handleSearch(e) {
        const key = e.key;
        // console.log(e.key);
        const location = this.state.memory.searchValue;
        // const businesses = this.state.businesses;
        console.log('location HANDLESEARCH:', location);
        // console.log('businesses HANDLESEARCH:', businesses);

        if (key === 'Enter') {
            this.fetchData(location);
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
        })
    }

    getUserData() {
// console.log('getUserData triggered');
// console.log('state:',this.state);
        const url = 'http://localhost:8080/user'
        fetch(url)
        .then(res => res.json())
        .then(resJson => this.setState({
            ...this.state,
            authenticated: true,
            memory: {
                ...this.state.memory,
                user: resJson
            }
        }, () => console.log('getUserData triggered; state:',this.state)));
    }

    getCurrentLocation() {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(pos => {
                console.log(pos);
                this.setState({
                    ...this.state,
                    memory: {
                        ...this.state.memory,
                        currentPosition: {
                            lat: pos.coords.latitude,
                            long: pos.coords.longitude
                        }
                    }
                }, () => this.fetchData())
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
    }

    closeAll(e) {
        console.log(e.target,'closeAll');
        this.setState({
            ...this.state,
            ui: {
                pic: false,
                signup: false
            }
        });
    }

    openHomeUi(e) {
console.log(`${e.target} triggered openHomeUi`);
        const id = e.target.id;
        const cityName = e.target.className;
        const isSignup = id === 'signup';
        const isLogin = id === 'login';
        const isPic = !isSignup && !isLogin;
        const business = id => {
            return this.state.businesses.filter(bus => bus.id === id)[0];
        }
        this.setState(prevState => ({
            ...prevState,
            memory: {
                ...prevState.memory,
                business: isPic ? business(id) : prevState.memory.business,
                searchValue: cityName
            },
            ui: {
                pic: isPic ? true : prevState.ui.pic,
                signup: isSignup ? true : prevState.ui.signup,
                login: isLogin ? true : prevState.ui.login
            }
        }));
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
        }), () => console.log('infowindowContent:', this.state.memory));
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
        }, () => console.log('after makeMarkerData:',this.state.memory))
    }

    fetchData(location) {
        const cors = 'https://cors.now.sh/';
        const url = 'https://api.yelp.com/v3/businesses/search';
        const key = 'JvHymxu3L88HLmjRak19pkInJW72X5XCmoTNWWm0VNMlgBbblR4CyREsz3TdLfCbbYLmjDbDT2UgfqpR4HGy_XhlLC9c2vPv-XcsLrrHnTFMg9fe94wpTbW11dE6WnYx';
        const currentPosition = this.state.memory.currentPosition;
        // const searchValue = this.state.memory.searchValue;

        const city = () => {
            let cities = ['chicago', 'la', 'nyc', 'atlanta', 'boston', 'san%20francisco', 'seattle', 'denver'];
            // cities = ['chicago'];
            const i = Math.floor(Math.random() * cities.length);
            return cities[i];
        }
        let query = currentPosition ? ('latitude=' + currentPosition.lat + '&longitude=' + currentPosition.long) : ('location=' + city());

        if (location) query = 'location=' + location;
        console.log('query:', query);
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
        .then(resJson => this.setState({
            businesses: resJson.businesses
        }, () => {
            this.makeMarkerData(resJson.businesses);
            this.makeInfowindowContent(resJson.businesses);
            console.log(this.state);
        }));
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

        return (
            <div onClick={closeAll} className='container'>
                <Switch>
                    <Route path='/search' render={() => <Search state={state}/>}/>
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

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
                coords: null
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
        this.getCoords = this.getCoords.bind(this);
    }

    getCoords() {
        const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
        const apiKey= '&key=AIzaSyDuljoAXSsX52jsv9nC37uU-EF4coi5O7E';
        const searchValue = this.state.memory.searchValue;
        const formatAddress = value => {
            return value.trim().replace(/\s/g,'+');
        }
        const address = formatAddress(searchValue);
        console.log('formatted address: ', address);
        fetch(url + address + apiKey)
        .then(res => res.json())
        .then(resJson => {
            // console.log('resJson:',resJson);
            const coords = resJson.results[0].geometry.location;
            this.setState({
                ...this.state,
                memory: {
                    ...this.state.memory,
                    coords: coords
                }
            }, () => console.log('coords:', coords));
        });
    }

    handleSearch(e) {
        const key = e.key;
        console.log(e.key);
        const location = this.state.memory.searchValue;
        console.log('location:', location);
        if (key === 'Enter') {
            this.fetchData();
            this.getCoords();
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

    closeAll() {
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
        const isSignup = id === 'signup';
        const isLogin = id === 'login';
        const isPic = !isSignup && !isLogin;
        const business = id => {
            return this.state.businesses.filter(bus => bus.id === id)[0];
        }
        this.setState(prevState => ({
            ...prevState,
            memory: {
                business: isPic ? business(id) : prevState.memory.business
            },
            ui: {
                pic: isPic ? true : prevState.ui.pic,
                signup: isSignup ? true : prevState.ui.signup,
                login: isLogin ? true : prevState.ui.login
            }
        }));
        e.stopPropagation();
    }

    fetchData() {
        const cors = "https://cors.now.sh/";
        const url = 'https://api.yelp.com/v3/businesses/search';
        const key = 'JvHymxu3L88HLmjRak19pkInJW72X5XCmoTNWWm0VNMlgBbblR4CyREsz3TdLfCbbYLmjDbDT2UgfqpR4HGy_XhlLC9c2vPv-XcsLrrHnTFMg9fe94wpTbW11dE6WnYx';
        const currentPosition = this.state.memory.currentPosition;
        const searchValue = this.state.memory.searchValue;

        const city = () => {
            const cities = ['chicago', 'la', 'nyc', 'atlanta', 'boston', 'san%20francisco', 'seattle']
            const i = Math.floor(Math.random() * cities.length);
            return cities[i];
        }
        let query = currentPosition ? ('latitude=' + currentPosition.lat + '&longitude=' + currentPosition.long) : ('location=' + city());
        if (searchValue) query = 'location=' + searchValue;
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
        }, () => console.log(resJson.businesses[0].id)));
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

import React from 'react';
import { withRouter, Route } from 'react-router-dom';
import { FormSignup } from './FormSignup';
import { Home } from './Home';

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            businesses: null,
            memory: {
                business: null,
                position: null
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
    }

    getCurrentLocation() {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(pos => {
                console.log(pos);
                this.setState({
                    ...this.state,
                    memory: {
                        ...this.state.memory,
                        position: {
                            lat: pos.coords.latitude,
                            long: pos.coords.longitude
                        }
                    }
                }, () => this.fetchData())
            });

    }

    signOut() {
        const auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(() => console.log('User signed out.'));
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
        const currentPosition = this.state.memory.position;
        const city = () => {
            const cities = ['chicago', 'la', 'nyc', 'atlanta', 'boston', 'san%20francisco', 'seattle']
            const i = Math.floor(Math.random() * cities.length);
            return cities[i];
        }
        const query = currentPosition ? ('latitude=' + currentPosition.lat + '&longitude=' + currentPosition.long) : ('location=' + city());
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
        this.fetchData()
    }

    render() {
        const state = this.state;
        const openHomeUi = this.openHomeUi;
        const closeAll = this.closeAll;
        const signOut = this.signOut;
        const getCurrentLocation = this.getCurrentLocation;
        return (
            <div onClick={closeAll} className='container'>

                <Route path='/' render={() => <Home getCurrentLocation={getCurrentLocation}
                    closeAll={closeAll} signOut={signOut} openHomeUi={openHomeUi} state={state}/>}/>

                <Route path='/' render={() => <div></div>}/>
                {/* <div>Logo made with <a href="https://
www.designevo.com/" title="Free Online Logo Maker">DesignEvo</a></div> */}
            </div>
        );
    }
}

export default withRouter(App);

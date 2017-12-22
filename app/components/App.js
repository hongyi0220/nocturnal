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
                business: null
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
        // this.onSignIn = this.onSignIn.bind(this);
        this.signOut = this.signOut.bind(this);
    }

    signOut() {
        const auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(() => console.log('User signed out.'));
    }

    // onSignIn(googleUser) {
    //     const profile = googleUser.getBasicProfile();
    //     console.log(profile);
    // }

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
// console.log(`${e.target} triggered openHomeUi`);
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
        const headers = new Headers({
            'Authorization': 'Bearer ' + key,
        });
        const init = {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        }
        const city = () => {
            const i = Math.floor(Math.random() * 3);
            return ['chicago', 'la', 'nyc'][i];
        }
        return fetch(cors + url + '?term=bars&location=' + city(), init);
    }

    componentWillMount() {
        this.fetchData()
        .then(res => res.json())
        .then(resJson => this.setState({
            businesses: resJson.businesses
        }, () => console.log(this.state)));
    }

    render() {
        const state = this.state;
        const openHomeUi = this.openHomeUi;
        const closeAll = this.closeAll;
        // const onSignIn = this.onSignIn;
        const signOut = this.signOut;
        // const auth = { onSignIn, signOut };
        return (
            <div onClick={closeAll} className='container'>

                <Route path='/' render={() => <Home closeAll={closeAll} signOut={signOut} openHomeUi={openHomeUi} state={state}/>}/>

                <Route path='/' render={() => <div></div>}/>
                {/* <div>Logo made with <a href="https://
www.designevo.com/" title="Free Online Logo Maker">DesignEvo</a></div> */}
            </div>
        );
    }
}

export default withRouter(App);

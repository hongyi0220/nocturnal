import React from 'react';
import { PopUp } from './PopUp';
import { Switch, Route } from 'react-router-dom';

export const Home = props => {
    const state = props.state;
    const memory = state.memory;
    const businesses = state.businesses;
    const user = memory.user;
    const value = memory.searchValue;
    const ui = state.ui;
    const popUp = ui.pic;
    const signup = ui.signup;
    const login = ui.login;
    const openHomeUi = props.openHomeUi;
    const signOut = props.signOut;
    const closeAll = props.closeAll;
    const uiFns = { openHomeUi, closeAll };
    const getCurrentPosition = props.getCurrentPosition;
    const auth = props.auth;
    const getSearchValue = props.getSearchValue;
    const handleSearch = props.handleSearch;
    const history = props.history;

    return (
        <div className='home-container'>
            <div className='logo-wrapper'><img src='/img/logo.png'/></div>
            <div className="g-signin2" data-onsuccess="onSignIn" data-width="200" data-longtitle="true"></div>
            {auth ?
                <div className='user-container'>
                    <div className='greeting-wrapper'>Hello, {user.given_name}!</div>
                    <div className='link-wrapper'><a onClick={signOut}>Sign out</a></div>
                </div>
            : ''}
            {popUp ? <PopUp state={state}/> : ''}
            <div className='search-container'>
                <div className='search-wrapper'>
                    <input id='home' onChange={getSearchValue} onKeyUp={handleSearch} type='text' value={value}
                        placeholder='City, state or zip'/>
                </div>
                <div className='button-wrapper'>
                    <div onClick={getCurrentPosition} className='button'><i className="fa fa-location-arrow" aria-hidden="true"></i></div>
                </div>
            </div>
            <div className='pics-container'>
                {businesses ? businesses.map((bus, i) =>
                    <div key={i} className='pic-wrapper'>
                        <img onClick={openHomeUi} id={bus.id} className={bus.location.city} src={bus.image_url}/>
                    </div>) : ''}
            </div>
        </div>
    );
}

import React from 'react';
import { PopUp } from './PopUp';
// import { Switch, Route } from 'react-router-dom';

export const Home = props => {
    const state = props.state;
    const memory = state.memory;
    const businesses = state.businesses;
    const user = memory.user;
    const value = memory.searchValue;
    const ui = state.ui;
    const popup = ui.popup;
    const loading = ui.loading;
    const openPopup = props.openPopup;
    const signOut = props.signOut;
    const closeAll = props.closeAll;
    const getCurrentPosition = props.getCurrentPosition;
    const auth = props.auth;
    const getSearchValue = props.getSearchValue;
    const handleSearch = props.handleSearch;
    const history = props.history;
    const fetchData = props.fetchData;
    const toggleLoading = props.toggleLoading;

    return (
        <div className='home-container'>
            <div className='logo-wrapper'><img src='/img/logo/logo-blue.png'/></div>

            <div className="g-signin2" data-theme="dark" data-onsuccess="onSignIn" data-width="200" data-height="40"></div>
            {auth ?
                <div className='user-container'>
                    <div className='greeting-wrapper'>Hello, {user.given_name}!</div>&nbsp;
                    <div className='link-wrapper'><a onClick={signOut}>Sign out</a></div>
                </div>
            : ''}
            {popup ? <PopUp toggleLoading={toggleLoading} fetchData={fetchData} state={state}/> : ''}
            <div className='search-container'>
                <div className='search-wrapper'>
                    <i className="fa fa-search" aria-hidden="true"></i>
                    <input id='home' onChange={getSearchValue} onKeyUp={handleSearch} type='text' value={value}
                        placeholder='Location'/>
                </div>
                <div className='button-wrapper'>
                    <div onClick={getCurrentPosition} className='button'>
                        {loading ?
                            <i className="fa fa-spinner fa-pulse fa-lg fa-fw"></i>
                            : <i className="fa fa-location-arrow" aria-hidden="true"></i>}
                    </div>
                    {/*<div className='loading-wrapper'>*/}
                </div>
            </div>
            <div className='pics-container'>
                {businesses ? businesses.map((bus, i) =>
                    <div key={i} className='pic-wrapper'>
                        <img onClick={openPopup} id={bus.id} className='img' src={bus.image_url}/>
                    </div>) : ''}
            </div>
        </div>
    );
}

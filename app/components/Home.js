import React from 'react';
import { PopUp } from './PopUp';
import { FormSignup } from './FormSignup';
import { FormLogin } from './FormLogin';
// import { Link } from 'react-router-dom';

export const Home = props => {
    const state = props.state;
    const businesses = state.businesses;
    const ui = state.ui;
    const popUp = ui.pic;
    const signup = ui.signup;
    const login = ui.login;
    const openHomeUi = props.openHomeUi;
    const signOut = props.signOut;
    const closeAll = props.closeAll;
    const uiFns = { openHomeUi, closeAll };
    const getCurrentLocation = props.getCurrentLocation;

    return (
        <div className='home-container'>
            <div className='logo-wrapper'><img src='./img/logo.png'/></div>
            <div className="g-signin2" data-onsuccess="onSignIn" data-width="200" data-longtitle="true"></div>
            <div className='link-wrapper'><a onClick={signOut}>Sign out</a></div>
            {signup || login ? '' : <div className='buttons-container'>
                <div onClick={e =>{closeAll(e); openHomeUi(e)}} id='signup' className='button'>Sign up</div>
                <div onClick={e =>{closeAll(e); openHomeUi(e)}} id='login' className='button'>Log in</div>
            </div>}
            {signup ? <FormSignup uiFns={uiFns}/> : ''}
            {login ? <FormLogin uiFns={uiFns}/> : ''}
            {popUp ? <PopUp state={state}/> : ''}
            <div className='button-wrapper'>
                <div onClick={getCurrentLocation} className='button'>Use my current location&nbsp;<i className="fa fa-location-arrow" aria-hidden="true"></i></div>
            </div>
            <div className='pics-container'>
                {businesses ? businesses.map((bus, i) =>
                    <div key={i} className='pic'>
                        <img onClick={openHomeUi} id={bus.id} src={bus.image_url}/>
                    </div>) : ''}
            </div>
        </div>
    );
}

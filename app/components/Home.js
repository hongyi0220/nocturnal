import React from 'react';
import { PopUp } from './PopUp';
import { FormSignup } from './FormSignup';
import { FormLogin } from './FormLogin';
import { Link } from 'react-router-dom';

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

    return (
        <div className='home-container'>
            <div className='logo-wrapper'><img src='./img/logo.png'/></div>
            <div className="g-signin2" data-onsuccess="onSignIn"></div>
            <div className='link-wrapper'><a href='#' onClick={signOut}>Sign out</a></div>
            {signup || login ? '' : <div className='buttons-container'>
                <div onClick={e =>{closeAll(); openHomeUi(e)}} type='button' id={'signup'} className='button'>Sign up</div>
                <div onClick={e =>{closeAll(); openHomeUi(e)}} type='button' id={'login'} className='button'>Log in</div>
            </div>}
            {signup ? <FormSignup uiFns={uiFns}/> : ''}
            {login ? <FormLogin uiFns={uiFns}/> : ''}
            {/* {popUp ? <PopUp state={state}/> : ''} */}
            <div className='pics-container'>
                {businesses ? businesses.map((bus, i) =>
                    <div className='pic-container'>
                        <div key={i} className='pic'><img onClick={openHomeUi} id={bus.id} src={bus.image_url}/></div>
                        {popUp ? <div className='popUp'>
                            <div className='name-wrapper'>{bus ? bus.name : ''}</div>
                            <div className='link-wrapper'><Link to='/'>Take me here</Link></div>
                        </div> : ''}
                    </div>) : ''}
            </div>
        </div>
    );
}

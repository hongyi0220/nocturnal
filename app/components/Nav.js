import React from 'react';
// import { PopUp } from './PopUp';
// import { FormSignup } from './FormSignup';
// import { FormLogin } from './FormLogin';
import { Link } from 'react-router-dom';

export const Nav = props => {

    return (
        <div className='nav-container'>
            <Link to='/'><img src='/img/logo/logo-transparent.png'/></Link>
            {/* <div class="g-signin2" data-onsuccess="onSignIn"></div> */}
        </div>
    );
}


import React from 'react';

export const FormLogin = props => {
    const uiFns = props.uiFns;
    const openHomeUi = uiFns.openHomeUi;
    const closeAll = uiFns.closeAll;
    return (
        <div className='login-container'>
            <h2>Sign into your account</h2>
            <div className='link-wrapper'>Don't have an account?&nbsp;
                <a href='#' onClick={e =>{closeAll(); openHomeUi(e)}} id='signup'>Sign up</a>
            </div>
            <form className='form-login' action='/login' method='post'>
            <div className='username-container'>
                <label htmlFor='username'>Enter your username</label>
                <input id='username' type='text' name='username'/>
            </div>
            <div className='password-container'>
                <label htmlFor='password'>Enter your password</label>
                <input id='password' type='password' name='password'/>
            </div>
            <div className='button-container'>
                <button type='submit'>Log in&nbsp;&nbsp;<i className="fa fa-caret-right" aria-hidden="true"></i></button>
            </div>
            </form>
        </div>
    );
}

import React from 'react';

export const FormSignup = props => {
    const uiFns = props.uiFns;
    const openHomeUi = uiFns.openHomeUi;
    const closeAll = uiFns.closeAll;
    return (
        <div className='form-container'>
            <h2>Sign up for your FREE account</h2>
            <div className='link-wrapper'>Already have an account?&nbsp;
                <a onClick={e =>{closeAll(e); openHomeUi(e)}} id='login'>Log in</a>
            </div>
            <form onClick={e => e.stopPropagation()} className='form-signup' action='/signup' method='post'>
            <div className='fullname-container'>
                <div className='firstname-container'>
                    <label htmlFor='firstname'>First name</label>
                    <input id='firstname' type='text' name='firstname'/>
                </div>
                <div className='lastname-container'>
                    <label htmlFor='lastname'>Last name</label>
                    <input id='lastname' type='text' name='lastname'/>
                </div>
            </div>
            <div className='username-container'>
                <label htmlFor='username'>Choose a username</label>
                <input id='username' type='text' name='username'/>
            </div>
            <div className='password-container'>
                <label htmlFor='password'>Choose a password</label>
                <input id='password' type='password' name='password'/>
            </div>
            <div className='email-container'>
                <label htmlFor='email'>Enter your email</label>
                <input id='email' type='email' name='email'/>
            </div>
            <div className='button-container'>
                <button type='submit'>Sign up&nbsp;&nbsp;<i className="fa fa-caret-right" aria-hidden="true"></i></button>
            </div>
            </form>
        </div>
    );
}

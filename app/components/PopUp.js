import React from 'react';
import { Link } from 'react-router-dom';

export const PopUp = props => {
    const state = props.state;
    let bus
    if (state) bus = state.memory.business;
    return (
        <div className='popUp'>
            <div className='img-wrapper'><img src={bus ? bus.image_url : ''}/></div>
            <div className='name-wrapper'>{bus ? bus.name : ''}</div>
            <div className='link-wrapper'><Link to='/'>Take me here</Link></div>
        </div>
    );
}

import React from 'react';
// import { Link } from 'react-router-dom';

export const PopUp = props => {
    const state = props.state;
    const location = state.memory.searchValue;
    const fetchData = props.fetchData;
    let bus;
    if (state) bus = state.memory.business;
    const yelpstars = ['zero.png', 'one.png', 'one_half.png', 'two.png', 'two_half.png', 'three.png',
                       'three_half.png', 'four.png', 'four_half.png', 'five.png'];
    const yelpstarsIndex = (bus.rating * 2) - 1;
    return (
        <div className='popUp'>

            <div className="info-content">
                <h3>{bus.name}</h3>
                <img style={{width:100 + 'px'}} src={bus.image_url}/>
                <div className="stars-wrapper"><img src={'/img/yelpstars/' + yelpstars[yelpstarsIndex] }/>&nbsp;
                {bus.review_count}&nbsp;reviews</div>
                <div className="price-category-wrapper">{bus.price}&nbsp;{bus.categories[0].title}</div>
            </div>

            <div className='link-wrapper'><a onClick={e => {e.preventDefault(); fetchData(location)}} className='popup-link'>Take me here</a></div>
        </div>
    );
}

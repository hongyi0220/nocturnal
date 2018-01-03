import React from 'react';

export const PopUp = props => {
    const state = props.state;
    const location = state.memory.searchValue;
    const fetchData = props.fetchData;
    let bus;
    if (state) bus = state.memory.business;
    const yelpstars = ['zero.png', 'one.png', 'one_half.png', 'two.png', 'two_half.png', 'three.png',
                       'three_half.png', 'four.png', 'four_half.png', 'five.png'];
    const yelpstarsIndex = (bus.rating * 2) - 1;
    const toggleLoading = props.toggleLoading;
    return (
        <div className='popUp'>

            <div onClick={e => e.stopPropagation()} className="info-container">
                <h3>{bus.name}</h3>
                <div className='img-wrapper'><img src={bus.image_url}/></div>
                <div className="stars-wrapper"><img src={'/img/yelpstars/' + yelpstars[yelpstarsIndex] }/> &nbsp;
                {bus.review_count}&nbsp;reviews</div>
                <div className="price-category-wrapper">
                    {bus.price}&nbsp;
                    {bus.categories[0].title}
                    &nbsp;<div className='seperator'></div>&nbsp;
                    {bus.categories[1] ? bus.categories[1].title : ''}
                </div>
                <div className='link-wrapper'>
                    <a onClick={e => {e.stopPropagation(); fetchData(location, null)}} className='popup-link'>Take me here</a>
                </div>
            </div>

        </div>
    );
}

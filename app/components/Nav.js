import React from 'react';
import { Link } from 'react-router-dom';

export const Nav = props => {
    const getSearchValue = props.getSearchValue;
    const handleSearch = props.handleSearch;
    const value = props.value;
    const closeAll = props.closeAll;
    const reload = props.reload;
    return (
        <div className='nav-container'>
            <div className='logo-container'>
                <Link onClick={reload} className='logo-yellow' to='/'><img src='/img/logo/logo-t-y-nn.png'/></Link>
                <img src='/img/logo/logo-t-b-nn.png'/>
            </div>
            <div className='search-wrapper'>
                <i className="fa fa-search" aria-hidden="true"></i>
                <input id='x' onChange={getSearchValue} onKeyUp={handleSearch} type='text' value={value}
                    placeholder='Location' onClick={closeAll}/>
            </div>
        </div>
    );
}

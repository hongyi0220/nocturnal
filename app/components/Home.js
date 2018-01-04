import React from 'react';
import { PopUp } from './PopUp';

export class Home extends React.Component {

    componentDidMount() {
        const clientHeight = this.props.getClientHeight();
        const homeContainer = this.refs.homeContainer;
        homeContainer.style.height = clientHeight + 'px';
    }

    render() {
        const state =this.props.state;
        const memory = state.memory;
        const businesses = state.businesses;
        const user = memory.user;
        const value = memory.searchValue;
        const ui = state.ui;
        const popup = ui.popup;
        const loading = ui.loading;
        const openPopup =this.props.openPopup;
        const signOut =this.props.signOut;
        const closeAll =this.props.closeAll;
        const getCurrentPosition =this.props.getCurrentPosition;
        const auth =this.props.auth;
        const getSearchValue =this.props.getSearchValue;
        const handleSearch =this.props.handleSearch;
        const history =this.props.history;
        const fetchData =this.props.fetchData;
        const toggleLoading =this.props.toggleLoading;
        return (
            <div ref='homeContainer' className='home-container'>
                <div className='logo-container'>
                    <div className='logo-wrapper' id='logo-yellow'><img src='/img/logo/logo-o-y-yn.png'/></div>
                    <div className='logo-wrapper' id='logo-black'><img src='/img/logo/logo-o-b-yn.png'/></div>
                </div>


                <div className="g-signin2" data-onsuccess="onSignIn" data-width="200" data-height="40"></div>
                {auth ?
                    <div className='user-container'>
                        <div className='greeting-wrapper'>Hello, {user.given_name}! </div>&nbsp;{" "}
                        <div className='link-wrapper'><a onClick={signOut}> Sign out</a></div>
                    </div>
                : ''}
                {popup ? <PopUp toggleLoading={toggleLoading} fetchData={fetchData} state={state}/> : ''}
                <div className='search-container'>
                    {/* <div className='search-wrapper'> */}
                        <div className='input-wrapper'>
                            <i className="fa fa-search" aria-hidden="true"></i>
                            <input ref='search' id='home' onChange={getSearchValue} onKeyUp={handleSearch}
                                type='text' value={value} placeholder='Location'/>
                        </div>
                    {/* </div> */}
                    <div className='button-wrapper'>
                        <div onClick={getCurrentPosition} className='button'>
                            {loading ?
                                <i className="fa fa-spinner fa-pulse fa-lg fa-fw"></i>
                                : <i className="fa fa-location-arrow" aria-hidden="true"></i>}
                        </div>

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

}

import React from 'react';
import { withRouter, Route } from 'react-router-dom';

class App extends React.Component {
    render() {
        return (
            <div className='container'>
                heya
                <Route path='/hi' render={() => <div>hi</div>}/>
                <Route path='/hi/hello' render={() => <div>hello</div>}/>
            </div>
        );
    }
}

export default withRouter(App);

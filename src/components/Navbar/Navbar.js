import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './Navbar.css'

class Navbar extends Component {
    render() {
        return (<header className="navbar">
            <div className="navbar__logo"><FontAwesomeIcon icon='user-astronaut' /> Cosmolist</div>
        </header>
        )
    };
};

export default Navbar;
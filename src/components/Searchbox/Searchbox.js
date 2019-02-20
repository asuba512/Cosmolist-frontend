import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './Searchbox.css';

const searchbox = props => (
    <div className={`searchbox__container ${props.className}`}>
        <span className='searchbox__icon'><FontAwesomeIcon icon='search' /></span>
        <input placeholder={props.placeholder} className='searchbox__input' value={props.value} onChange={props.onSearchHandler} />
    </div>
)

export default searchbox;
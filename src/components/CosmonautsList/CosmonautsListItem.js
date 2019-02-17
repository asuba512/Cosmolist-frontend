import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './CosmonautsListItem.css';

const cosmonautsList = props => (
    <li className='cosmonauts__list-item'>
        <div>
            <img src='http://bestnycacupuncturist.com/wp-content/uploads/2016/11/anonymous-avatar-sm.jpg' alt='Avatar' />
        </div>
        <div>
            <h1>
                {props.cosmonaut.firstname} {props.cosmonaut.lastname}
            </h1>
        </div>
        <div>
            <h2>
                {new Date(props.cosmonaut.birthday).toLocaleDateString()}
            </h2>
        </div>
        <div>
            <h2>
                {props.cosmonaut.superpower.value ? props.cosmonaut.superpower.label : "no superpower"}
            </h2>
        </div>
        <div>
            <button className='btn' onClick={props.onEditCosmonaut.bind(this, props.cosmonaut._id)}><FontAwesomeIcon icon='user-edit' />Edit</button>
            <button className='btn' onClick={props.onRemoveCosmonaut.bind(this, props.cosmonaut._id)}><FontAwesomeIcon icon='user-slash' />Remove</button>
        </div>
    </li >
)

export default cosmonautsList;
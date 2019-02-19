import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import Mousetrap from 'mousetrap';

import './Modal.css';

class Modal extends Component {

    modal = null;

    componentDidMount() {
        Mousetrap.bind('esc', this.props.onCancel);
        this.modal = document.querySelector('#modal-body')
        disableBodyScroll(this.modal);
    }
    componentWillUnmount() {
        Mousetrap.unbind('esc');
        enableBodyScroll(this.modal);
    }
    render() {
        return (
            <div className={this.props.isError && 'error'}>
                <div className='backdrop' onClick={this.props.onCancel}></div>
                <div className={'modal ' + this.props.modalSize}>
                    <div className='modal__header'>
                        {this.props.headerText}
                        <button className='modal__header-close-btn' onClick={this.props.onCancel} ><FontAwesomeIcon icon='times' /></button>
                    </div>
                    <div className='modal__body' id='modal-body'>
                        {this.props.children}
                    </div>
                    <div className='modal__buttons'>
                        {this.props.hasAdditionalAction && (
                            <div className='modal__buttons-left'>
                                <button className='btn' onClick={this.props.onAdditionalAction}>{this.props.additionalAction}</button>
                            </div>
                        )}
                        <div className='modal__buttons-right'>
                            <button className='btn' onClick={this.props.onCancel} autoFocus>{this.props.cancelText || 'Cancel'}</button>
                            {this.props.confirmText && <button className='btn' onClick={this.props.onConfirm}>{this.props.hasSaveIcon && <FontAwesomeIcon icon='save' />}{this.props.confirmText}</button>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};


export default Modal;
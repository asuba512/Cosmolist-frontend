import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import Mousetrap from 'mousetrap';

import './Modal.css';

class Modal extends Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }
    componentDidMount() {
        Mousetrap.bind('esc', this.props.onCancel);
        disableBodyScroll(this.modal);
    }
    componentWillUnmount() {
        Mousetrap.unbind('esc');
        enableBodyScroll(this.modal);
    }
    render() {
        return (
            <React.Fragment>
                <div className='backdrop' onClick={this.props.onCancel}></div>
                <div className={'modal ' + this.props.modalSize} ref={this.modal}>
                    <div className='modal__header'>
                        {this.props.headerText}
                    </div>
                    <div className='modal__body'>
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
            </React.Fragment>
        );
    }
};


export default Modal;
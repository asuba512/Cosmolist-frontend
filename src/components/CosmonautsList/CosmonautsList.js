import React, { Component } from 'react';
import Select from 'react-select'

import Context from '../../Context';
import CosmonautsListItem from './CosmonautsListItem';
import Modal from '../Modal/Modal';

import APIRequest from './../../helpers/APIRequest';

import './CosmonautsList.css';

class CosmonautsList extends Component {
    state = {
        selectedCosmonaut: null,
        selectedSuperpower: null,
        removeCosmonaut: { status: false, id: null },
        isFirstnameValid: true,
        isLastnameValid: true,
        isBirthdayValid: true
    }

    constructor(props) {
        super(props);
        this.firstname = React.createRef();
        this.lastname = React.createRef();
        this.birthday = React.createRef();
    }

    static contextType = Context;

    resetValidation = () => {
        this.setState({ isFirstnameValid: true, isLastnameValid: true, isBirthdayValid: true });
    }

    validateFields = () => {
        let valid = true;
        this.resetValidation();
        if (this.firstname.current.value.trim().length === 0) {
            valid = false;
            this.setState({ isFirstnameValid: false });
        }
        if (this.lastname.current.value.trim().length === 0) {
            valid = false;
            this.setState({ isLastnameValid: false });
        }
        if (this.birthday.current.value.trim().length === 0) {
            valid = false;
            this.setState({ isBirthdayValid: false });
        }
        return valid;
    }

    cancelHandler = () => {
        this.setState({ selectedCosmonaut: null, removeCosmonaut: false });
    }

    editCosmonautHandler = cosmonautId => {
        this.setState(prevState => {
            const selectedCosmonaut = this.props.cosmonauts.find(cosmonaut => cosmonaut._id === cosmonautId);
            return { selectedCosmonaut: selectedCosmonaut, selectedSuperpower: selectedCosmonaut.superpower };
        });
        this.props.fetchSuperpowers();
        this.resetValidation();
    }

    saveEditCosmonautHandler = () => {
        if (!this.validateFields())
            return;
        const superpower = this.state.selectedSuperpower.value ? ('"' + this.state.selectedSuperpower.value + '"') : null;
        APIRequest(this.context, {
            query: `
                mutation {
                    modifyCosmonaut(cosmonautId: "${this.state.selectedCosmonaut._id}", inputCosmonaut: {
                        firstname: "${this.firstname.current.value}",
                        lastname: "${this.lastname.current.value}",
                        birthday: "${new Date(this.birthday.current.value).toISOString()}"
                        superpower: ${superpower}
                    }){
                        _id
                        firstname
                        lastname
                        birthday
                        superpower {
                            _id
                            name
                        }
                    }
                }
            `
        }, (data) => {
            let modifiedCosmonaut = data.data.modifyCosmonaut;
            modifiedCosmonaut.superpower = this.props.getSuperpower(modifiedCosmonaut.superpower);
            this.props.updateCosmonauts(this.props.cosmonauts.map(cosmonaut => (
                cosmonaut._id === this.state.selectedCosmonaut._id ? JSON.parse(JSON.stringify(modifiedCosmonaut)) : cosmonaut
            )));
            this.setState({
                selectedCosmonaut: null,
                selectedSuperpower: null
            });
        });
    }

    removeCosmonautHandler = cosmonautId => {
        this.setState({ removeCosmonaut: { status: true, id: cosmonautId } });
    }

    confirmRemoveCosmonautHandler = () => {
        const cosmonautId = this.state.removeCosmonaut.id;
        APIRequest(this.context, {
            query: `
                mutation {
                    removeCosmonaut(cosmonautId: "${cosmonautId}"){
                        _id
                    }
                }
            `
        }, (data) => {
            const removedCosmonautId = data.data.removeCosmonaut._id;
            const updatedCosmonauts = this.props.cosmonauts.filter(cosmonaut => {
                return cosmonaut._id !== removedCosmonautId;
            });
            this.props.updateCosmonauts(updatedCosmonauts);
            this.setState({ removeCosmonaut: { status: false, id: null } });
        });
    }

    render() {
        return (
            <React.Fragment>
                {this.state.selectedCosmonaut && (
                    <Modal
                        headerText='Edit Cosmonaut'
                        confirmText='Save' onConfirm={this.saveEditCosmonautHandler} hasSaveIcon
                        onCancel={this.cancelHandler}
                        hasAdditionalAction additionalAction="Reset" onAdditionalAction={() => { this.editCosmonautForm.reset(); this.resetValidation(); this.setState({ selectedSuperpower: this.state.selectedCosmonaut.superpower }) }}
                        modalSize='big'>
                        <form className='form' ref={(el) => this.editCosmonautForm = el} onSubmit={null}>
                            <div className='form-control'>
                                <label htmlFor='firstname'>Firstname*</label>
                                <input type='text' id='firstname' ref={this.firstname} className={!this.state.isFirstnameValid ? 'invalid-input' : ''}
                                    defaultValue={this.state.selectedCosmonaut.firstname} />
                            </div>
                            <div className='form-control'>
                                <label htmlFor='lastname'>Lastname*</label>
                                <input type='text' id='lastname' ref={this.lastname} className={!this.state.isLastnameValid ? 'invalid-input' : ''}
                                    defaultValue={this.state.selectedCosmonaut.lastname} />
                            </div>
                            <div className='form-control'>
                                <label htmlFor='birthday'>Date of Birth*</label>
                                <input type='date' id='birthday' ref={this.birthday} className={!this.state.isBirthdayValid ? 'invalid-input' : ''}
                                    defaultValue={new Date(this.state.selectedCosmonaut.birthday).toISOString().split('T')[0]} />
                            </div>
                            <div className='form-control'>
                                <label htmlFor='superpower'>Superpower</label>
                                <Select
                                    value={this.state.selectedSuperpower}
                                    onChange={superpower => { this.setState({ selectedSuperpower: superpower }) }}
                                    isDisabled={this.context.loading}
                                    options={this.props.superpowers}
                                    className='form-control-select'
                                    classNamePrefix='form-control-select'
                                />
                            </div>
                        </form>
                    </Modal>
                )}
                {this.state.removeCosmonaut.status && (
                    <Modal headerText='Are you sure?' confirmText='Yes' onConfirm={this.confirmRemoveCosmonautHandler} onCancel={this.cancelHandler} modalSize='small'>
                        You cannot undo this action.
                    </Modal>
                )}
                <ul className='cosmonauts__list' >
                    {
                        this.props.shownCosmonauts.map(cosmonaut => (
                            <CosmonautsListItem
                                onEditCosmonaut={this.editCosmonautHandler} onRemoveCosmonaut={this.removeCosmonautHandler}
                                key={cosmonaut._id} cosmonaut={cosmonaut} />
                        ))
                    }
                </ul >
            </React.Fragment>
        );
    }
}

export default CosmonautsList;
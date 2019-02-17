import React, { Component } from 'react';
import CreatableSelect from 'react-select/lib/Creatable';

import Context from '../Context';
import APIRequest from '../helpers/APIRequest';

import Modal from '../components/Modal/Modal';
import CosmonautsList from '../components/CosmonautsList/CosmonautsList';
import Searchbox from '../components/Searchbox/Searchbox';
import SuperpowerManager from '../components/SuperpowerManager/SuperpowerManager';

import './Cosmonauts.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class CosmonautsPage extends Component {
    state = {
        cosmonauts: [],
        shownCosmonauts: [],
        superpowers: [],
        selectedSuperpower: this.getSuperpower(null),
        creatingCosmonaut: false,
        managingSuperpowers: false,
        searchValue: '',
        isFirstnameValid: true,
        isLastnameValid: true,
        isBirthdayValid: true
    }

    static contextType = Context;

    constructor(props) {
        super(props);
        this.firstname = React.createRef();
        this.lastname = React.createRef();
        this.birthday = React.createRef();
        this.superpower = null;
    }

    componentDidMount = () => {
        this.fetchCosmonauts();
    }

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

    getSuperpower(superpower) {
        if (superpower)
            return { value: superpower._id, label: superpower.name };
        else
            return { value: null, label: "None" };
    }

    cancelHandler = () => {
        this.setState({ selectedCosmonaut: null, creatingCosmonaut: false, removeCosmonaut: false });
    }

    newCosmonautHandler = () => {
        this.setState({ creatingCosmonaut: true });
        this.setState({ selectedSuperpower: this.getSuperpower(null) });
        this.fetchSuperpowers();
        this.resetValidation();
    }

    saveNewCosmonautHandler = () => {
        if (!this.validateFields()) {
            return;
        }
        const superpower = this.state.selectedSuperpower.value ? ('"' + this.state.selectedSuperpower.value + '"') : null;
        APIRequest(this.context, {
            query: `
                mutation {
                    createCosmonaut(inputCosmonaut: {
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
            this.setState(prevState => {
                const cosmonauts = [...prevState.cosmonauts];
                cosmonauts.push({
                    _id: data.data.createCosmonaut._id,
                    firstname: data.data.createCosmonaut.firstname,
                    lastname: data.data.createCosmonaut.lastname,
                    birthday: data.data.createCosmonaut.birthday,
                    superpower: this.getSuperpower(data.data.createCosmonaut.superpower)
                })
                return { cosmonauts: cosmonauts, creatingCosmonaut: false };
            })
            this.filterCosmonauts();
        })
    }

    manageSuperpowersHandler = () => {
        this.setState({ managingSuperpowers: true });
    }

    closeManageSuperpowersHandler = () => {
        this.fetchCosmonauts();
        this.setState({ managingSuperpowers: false });
    }

    filterCosmonauts = (event) => {
        let searchValue;
        if (event) {
            this.setState({ searchValue: event.currentTarget.value });
            searchValue = event.currentTarget.value.toLowerCase().trim();
        }
        else {
            searchValue = this.state.searchValue.toLowerCase().trim();
        }
        if (searchValue !== '') {
            this.setState({
                shownCosmonauts: this.state.cosmonauts.filter(cosmonaut => {
                    return (
                        cosmonaut.firstname.toLowerCase().indexOf(searchValue) !== -1 ||
                        cosmonaut.lastname.toLowerCase().indexOf(searchValue) !== -1 ||
                        cosmonaut.firstname.toLowerCase().concat(' ' + cosmonaut.lastname.toLowerCase()).indexOf(searchValue) !== -1
                    )
                })
            });
        }
        else
            this.setState({ shownCosmonauts: this.state.cosmonauts });
    }

    fetchCosmonauts = () => {
        APIRequest(this.context, {
            query: `
                query {
                    cosmonauts {
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
            let cosmonauts = data.data.cosmonauts.map(cosmonaut => {
                cosmonaut.superpower = this.getSuperpower(cosmonaut.superpower);
                return cosmonaut;
            });
            this.setState({ cosmonauts: cosmonauts, shownCosmonauts: cosmonauts, searchValue: '' });
        });
    }

    updateCosmonauts = (updatedCosmonauts) => {
        this.setState({ cosmonauts: updatedCosmonauts });
        this.filterCosmonauts();
    }

    addNewSuperpower = (name) => {
        APIRequest(this.context, {
            query: `
                mutation {
                    createSuperpower(inputSuperpower: {
                        name: "${name}"
                    }) {
                        _id
                        name
                    }
                }
            `
        }, (data) => {
            let superpower = this.getSuperpower(data.data.createSuperpower);
            this.setState(prevState => {
                return { superpowers: [...prevState.superpowers, superpower], selectedSuperpower: superpower }
            })
        });
    }

    fetchSuperpowers = () => {
        APIRequest(this.context, {
            query: `
                query {
                    superpowers {
                        _id
                        name
                    }
                }
            `
        }, (data) => {
            let superpowers = data.data.superpowers.map(superpower => {
                return this.getSuperpower(superpower);
            });
            superpowers.unshift(this.getSuperpower(null));
            this.setState({ superpowers: superpowers });
        });
    }

    render() {
        return (
            <section className='cosmonauts'>
                {this.state.creatingCosmonaut && (
                    <Modal headerText='New Cosmonaut' confirmText='Save' onConfirm={this.saveNewCosmonautHandler} onCancel={this.cancelHandler} hasSaveIcon modalSize='big'>
                        <form className='form' onSubmit={null}>
                            <div className='form-control'>
                                <label htmlFor='firstname'>Firstname*</label>
                                <input type='text' id='firstname' ref={this.firstname} className={!this.state.isFirstnameValid ? 'invalid-input' : ''} />
                            </div>
                            <div className='form-control'>
                                <label htmlFor='lastname'>Lastname*</label>
                                <input type='text' id='lastname' ref={this.lastname} className={!this.state.isLastnameValid ? 'invalid-input' : ''} />
                            </div>
                            <div className='form-control'>
                                <label htmlFor='birthday'>Date of Birth*</label>
                                <input type='date' id='birthday' ref={this.birthday} className={!this.state.isBirthdayValid ? 'invalid-input' : ''} />
                            </div>
                            <div className='form-control'>
                                <label htmlFor='superpower'>Superpower</label>
                                <CreatableSelect
                                    value={this.state.selectedSuperpower}
                                    onChange={superpower => { this.setState({ selectedSuperpower: superpower }) }}
                                    onCreateOption={this.addNewSuperpower}
                                    isDisabled={this.context.loading}
                                    options={this.state.superpowers}
                                    isSearchable
                                    className='form-control-select'
                                    classNamePrefix='form-control-select'
                                />
                            </div>
                        </form>
                    </Modal>
                )}
                {this.state.managingSuperpowers && <SuperpowerManager closeHandler={this.closeManageSuperpowersHandler} />}

                <div className='cosmonauts__control'>
                    <button className='btn' onClick={this.manageSuperpowersHandler}><FontAwesomeIcon icon='cog' />Manage Superpowers</button>
                    <button className='btn' onClick={this.newCosmonautHandler}><FontAwesomeIcon icon='plus' />New Cosmonaut</button>
                    <div className='flex-divider' />
                    <Searchbox placeholder='Search cosmonauts' onSearchHandler={this.filterCosmonauts} value={this.state.searchValue} />
                    <button className='btn' onClick={this.fetchCosmonauts}><FontAwesomeIcon icon='sync' />Reload</button>
                </div>

                <CosmonautsList
                    cosmonauts={this.state.shownCosmonauts}
                    superpowers={this.state.superpowers}
                    onEditCosmonaut={this.editCosmonautHandler}
                    onRemoveCosmonaut={this.removeCosmonautConfirmationHandler}
                    updateCosmonauts={this.updateCosmonauts}
                    fetchSuperpowers={this.fetchSuperpowers}
                    getSuperpower={this.getSuperpower}
                />
            </section >
        );
    }
}

export default CosmonautsPage;
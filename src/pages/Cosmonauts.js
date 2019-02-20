import React, { Component } from 'react';
import CreatableSelect from 'react-select/lib/Creatable';
import Select from 'react-select'

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
        filterBySuperpower: null,
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
        this.loadData();
    }

    loadData = () => {
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
            return { value: superpower._id, label: superpower.name, users: superpower.users };
        else
            return { value: null, label: 'No superpower', users: [] };
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
        this.loadData();
        this.setState({ managingSuperpowers: false });
    }

    filterBySuperpowerHandler = (superpower, action) => {
        this.setState({ filterBySuperpower: action === 'clear' ? null : superpower }, this.filterCosmonauts);
    }

    filterCosmonauts = async (event) => {
        let searchValue;
        if (event) {
            this.setState({ searchValue: event.currentTarget.value });
            searchValue = event.currentTarget.value.toLowerCase().trim();
        }
        else {
            searchValue = this.state.searchValue.toLowerCase().trim();
        }
        this.setState(prevState => ({ cosmonauts: prevState.cosmonauts.sort((cosmonaut1, cosmonaut2) => cosmonaut1.lastname.localeCompare(cosmonaut2.lastname)) }), () => {
            let filteredCosmonauts = this.state.cosmonauts;
            if (this.state.filterBySuperpower) {
                filteredCosmonauts = filteredCosmonauts.filter(cosmonaut => {
                    if (!this.state.filterBySuperpower.value) {
                        return cosmonaut.superpower.value === null;
                    }
                    return this.state.filterBySuperpower.users.find(user => user._id === cosmonaut._id) ? true : false;
                })
            }
            if (searchValue !== '') {
                this.setState({
                    shownCosmonauts: filteredCosmonauts.filter(cosmonaut => {
                        return (
                            cosmonaut.firstname.toLowerCase().indexOf(searchValue) !== -1 ||
                            cosmonaut.lastname.toLowerCase().indexOf(searchValue) !== -1 ||
                            cosmonaut.firstname.toLowerCase().concat(' ' + cosmonaut.lastname.toLowerCase()).indexOf(searchValue) !== -1
                        )
                    })
                });
            }
            else
                this.setState({ shownCosmonauts: filteredCosmonauts });
        });

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
            cosmonauts = cosmonauts.sort((cosmonaut1, cosmonaut2) => cosmonaut1.lastname.localeCompare(cosmonaut2.lastname));
            this.setState({ cosmonauts: cosmonauts, shownCosmonauts: cosmonauts, searchValue: '' }, this.fetchSuperpowers);
        });
    }

    updateCosmonauts = (updatedCosmonauts) => {
        this.setState({ cosmonauts: updatedCosmonauts }, this.fetchSuperpowers);
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
                        users {
                            _id
                        }
                    }
                }
            `
        }, (data) => {
            let superpowers = data.data.superpowers.map(superpower => {
                return this.getSuperpower(superpower);
            });
            superpowers = superpowers.sort((superpower1, superpower2) => superpower1.label.localeCompare(superpower2.label))
            superpowers.unshift(this.getSuperpower(null));
            let filteredSuperpower = null;
            if (this.state.filterBySuperpower)
                filteredSuperpower = superpowers.find(superpower => superpower.value === this.state.filterBySuperpower.value);
            this.setState({ superpowers: superpowers, filterBySuperpower: filteredSuperpower }, this.filterCosmonauts);
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
                    <button className='btn' onClick={this.loadData}><FontAwesomeIcon icon='sync' />Reload</button>
                    <button className='btn' onClick={this.manageSuperpowersHandler}><FontAwesomeIcon icon='cog' />Manage Superpowers</button>
                    <button className='btn' onClick={this.newCosmonautHandler}><FontAwesomeIcon icon='plus' />New Cosmonaut</button>
                    <div className='flex-divider' />
                    <div className='cosmonauts__control-superpower'>
                        <Select
                            value={this.state.filterBySuperpower}
                            onChange={this.filterBySuperpowerHandler}
                            isClearable
                            clear
                            isDisabled={this.context.loading}
                            options={this.state.superpowers}
                            placeholder='Filter by superpowers'
                            isSearchable
                            className='form-control-select'
                            classNamePrefix='form-control-select'
                        />
                    </div>
                    <Searchbox placeholder='Search cosmonauts' onSearchHandler={this.filterCosmonauts} value={this.state.searchValue} className='cosmonauts__control-searchbox' />
                </div>

                <CosmonautsList
                    cosmonauts={this.state.cosmonauts}
                    shownCosmonauts={this.state.shownCosmonauts}
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
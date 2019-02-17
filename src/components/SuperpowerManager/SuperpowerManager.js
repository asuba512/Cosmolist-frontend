import React, { Component } from 'react';

import Modal from '../Modal/Modal';
import Searchbox from '../Searchbox/Searchbox';
import APIRequest from '../../helpers/APIRequest';
import Context from '../../Context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './SuperpowerManager.css';

class SuperpowerManager extends Component {
    state = {
        superpowers: [],
        shownSuperpowers: [],
        searchValue: '',
        isNewSuperpowerNameValid: true,
        isSuperpowerNameValid: true,
        selectedSuperpower: null,
        removeSuperpower: null
    }
    static contextType = Context;

    constructor(props) {
        super(props);
        this.newSuperpowerInput = React.createRef();
        this.newNameInput = React.createRef();
    }

    componentDidMount = () => {
        this.fetchSuperpowers();
    }

    transformSuperpowers = (superpowers) => {
        return superpowers.map(superpower => {
            return (
                <li key={superpower._id}>
                    <span>{superpower.name}</span>
                    <button className='btn' onClick={this.renameSuperpower.bind(this, superpower._id)}>
                        <FontAwesomeIcon icon='edit' />Rename superpower
                    </button>
                    <button className='btn' onClick={this.removeSuperpower.bind(this, superpower._id)}>
                        <FontAwesomeIcon icon='times' />Remove superpower
                    </button>
                </li>);
        });
    }

    cancelHandler = () => {
        this.setState({ removeSuperpower: null, selectedSuperpower: null });
    }

    newSuperpowerHandler = () => {
        const name = this.newSuperpowerInput.current.value
        if (name.trim() === '') {
            this.setState({ isNewSuperpowerNameValid: false });
            return;
        }
        else
            this.setState({ isNewSuperpowerNameValid: true });
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
            let superpower = data.data.createSuperpower;
            this.setState(prevState => {
                return { superpowers: [...prevState.superpowers, superpower] }
            });
            this.filterSuperpowers();
            this.newSuperpowerInput.current.value = '';
        });
    }

    renameSuperpower = (id) => {
        const selectedSuperpower = this.state.superpowers.find(superpower => superpower._id === id);
        this.setState({ selectedSuperpower: selectedSuperpower });
    }

    confirmRenameSuperpower = () => {
        const id = this.state.selectedSuperpower._id;
        const name = this.newNameInput.current.value;
        if (name.trim() === '') {
            this.setState({ isSuperpowerNameValid: false });
            return;
        }
        else
            this.setState({ isSuperpowerNameValid: true });
        APIRequest(this.context, {
            query: `
                    mutation {
                        modifySuperpower(superpowerId: "${id}",
                        inputSuperpower: {
                                name: "${name}"
                            }) {
                                _id
                                name
                            }
                    }
                `
        }, (data) => {
            let modifiedSuperpower = data.data.modifySuperpower;
            this.setState(prevState => {
                return {
                    superpowers: prevState.superpowers.map(superpower => (
                        superpower._id === id ? JSON.parse(JSON.stringify(modifiedSuperpower)) : superpower
                    )),
                    selectedSuperpower: null
                };
            });
            this.filterSuperpowers();
        });
    }

    removeSuperpower = (id) => {
        this.setState({ removeSuperpower: id });
    }

    confirmRemoveSuperpower = () => {
        const id = this.state.removeSuperpower;
        APIRequest(this.context, {
            query: `
                mutation {
                    removeSuperpower(superpowerId: "${id}") {
                        _id
                    }
                }
            `
        }, (data) => {
            let superpowerId = data.data.removeSuperpower._id;
            this.setState(prevState => {
                const updatedSuperpowers = prevState.superpowers.filter(superpower => {
                    return superpower._id !== superpowerId;
                });
                return { superpowers: updatedSuperpowers, removeSuperpower: null };
            });
            this.filterSuperpowers();
        });
    }

    filterSuperpowers = (event) => {
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
                shownSuperpowers: this.state.superpowers.filter(superpower => {
                    return (
                        superpower.name.toLowerCase().indexOf(searchValue) !== -1
                    )
                })
            });
        }
        else
            this.setState({ shownSuperpowers: this.state.superpowers });
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
            const superpowers = data.data.superpowers;
            this.setState({ superpowers: superpowers, shownSuperpowers: superpowers, searchValue: '' });
        });
    }

    render() {
        return (
            <React.Fragment>
                <Modal
                    headerText='Superpowers'
                    cancelText='Close' onCancel={this.props.closeHandler}
                    modalSize='huge' >
                    <div className='superpower-manager__control'>
                        <Searchbox placeholder='Search superpowers' onSearchHandler={this.filterSuperpowers} value={this.state.searchValue} />
                        <div className='flex-divider' />
                        <input type='text' className={!this.state.isNewSuperpowerNameValid ? 'invalid-input' : ''} placeholder='New superpower name' ref={this.newSuperpowerInput}></input>
                        <button className='btn' onClick={this.newSuperpowerHandler}><FontAwesomeIcon icon='plus' /> Add superpower</button>
                    </div>
                    <ul className='superpower-manager__list'>
                        {this.transformSuperpowers(this.state.shownSuperpowers)}
                    </ul>
                </Modal >
                {this.state.removeSuperpower && (
                    <Modal
                        headerText='Are you sure?'
                        confirmText='Yes' onConfirm={this.confirmRemoveSuperpower}
                        onCancel={this.cancelHandler}
                        modalSize='small'>
                        You cannot undo this action.
                    </Modal>
                )}
                {this.state.selectedSuperpower && (<Modal
                    headerText='New name'
                    modalSize='big'
                    onCancel={this.cancelHandler}
                    confirmText='Save' onConfirm={this.confirmRenameSuperpower}>
                    <input type='text' defaultValue={this.state.selectedSuperpower.name} className={!this.state.isSuperpowerNameValid ? 'invalid-input' : ''} ref={this.newNameInput} />
                </Modal>
                )}
            </React.Fragment>
        )
    }
}

export default SuperpowerManager;
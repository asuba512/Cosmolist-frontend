import React from 'react';

export default React.createContext({
    loading: null,
    beginLoading: () => { },
    endLoading: () => { },
    cosmonauts: []
})
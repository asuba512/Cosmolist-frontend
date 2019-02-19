const APIRequest = (context, query, successHandler) => {
    console.log(process.env.REACT_APP_BACKEND_SERVER);
    context.beginLoading();
    fetch(process.env.REACT_APP_BACKEND_SERVER, {
        method: 'POST',
        body: JSON.stringify(query),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(result => {
            if (result.status !== 200 && result.status !== 201) {
                throw new Error('Request failed!');
            }
            return result.json();
        })
        .then(data => {
            successHandler(data);
            context.endLoading();
        })
        .catch(err => {
            context.errorHandler(err);
            context.endLoading();
        });
};

export default APIRequest;
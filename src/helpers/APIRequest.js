const APIRequest = (context, query, successHandler) => {
    context.beginLoading();
    fetch('http://localhost:8000/graphql', {
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
            console.log(err);
            context.endLoading();
        });
};

export default APIRequest;
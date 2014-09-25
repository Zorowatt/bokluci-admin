app.factory('homeServices', function($resource) {
    return $resource('/api/:id', {}, {
        query: {method: 'GET', params: {s: '', l: '' ,new: ''}, isArray: true},
        post: {method: 'POST'},
        update: {method: 'PUT', params: {entryId: '@entryId'}},
        remove: {method: 'DELETE'}
    });
});



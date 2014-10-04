var mongoose = require('mongoose');

var searchBufferSchema = mongoose.Schema ({

    name: String,
    buffer: [String]

});

var SearchBuffer = mongoose.model('SearchBuffer',searchBufferSchema);

module.exports.seedInitialBuffer = function() {
    SearchBuffer.find({}).exec(function(err, collection) {
        if (err) {
            console.log('Cannot find SearchBuffer: ' + err);
            return;
        }

        // if you want to clear the DB and push same data to it just remove the "//", each
        //Product.remove(function(){

        if (collection.length === 0) {
            SearchBuffer.create(
                {
                    name: 'n/a',
                    buffer: ['aaa','bbbaa','ccc','ddd','eee','fff','aas','asa','aa222','aa333','aa4444','aadsfsdf','aasdfsdfsfsd'
                        ,'aaassssss','aahhhhhh']
                });


            console.log('New buffer added to DB ... ');
        }
    });
};
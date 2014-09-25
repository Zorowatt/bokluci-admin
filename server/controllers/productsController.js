var Products = require('mongoose').model('Product');
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var db = mongoose.connection;
var gfs = Grid(db.db, mongoose.mongo);


module.exports = {
    getImage: function(req, res, next) {
        var readstream = gfs.createReadStream({
            filename: 'barista1.jpg'
        });
        readstream.on('error', function (err) {
            console.log('An error occurred!', err);
            throw err;
        });
        readstream.pipe(res);


    },
    getAllProductsByNewProduct: function(req, res, next) {

        //return all products
        var options = {};
        //return new added products only
        if (req.query.new == '1') {options = {flagIsNew : true} }
        //return products with new comments only
        if (req.query.new == '2') {options = {flagNewCommentAdded:true} }



//        //return all products if insists
//        if  (req.query.new == 'false'){
//           options ={flagNewCommentAdded:true};
//        }

        var limit = req.query.l;
        var skip = req.query.s;

        //Validate skip and limit
        if (skip < 0) {skip = 0}
        if (limit <= 0) {limit = 1}
        if (limit > 20) {limit = 20}

        Products.find(options).sort({ id: 1 }).limit(limit).skip(skip).exec(function(err, collection) {
            if (err) {
                console.log('Products can not be loaded: ' + err);
            }
            res.send(collection);
        })
    },
    getAllProductsByNewComment: function(req, res, next){
        var options = {flagNewCommentAdded : true};
//        if  (req.query.new == 'false'){
//            options ={};
//        }

        var limit = req.query.l;
        var skip = req.query.s;
        //Validate skip and limit
        if (skip < 0) {skip = 0}
        if (limit <= 0) {limit = 1}
        if (limit > 20) {limit = 20}

        Products.find(options).sort({ id: 1 }).limit(limit).skip(skip).exec(function(err, collection) {
            if (err) {
                console.log('Products can not be loaded: ' + err);
            }
            res.send(collection);
        })


    },




    getProductById: function(req, res, next){
        Products.findOne({ _id : req.params.id }).exec(function(err, document) {
            if (err) {
                console.log('Product can not be loaded: ' + err);
            }
            res.send(document);
        })

    },

    createProduct: function(req, res, next) {


// `gfs` is a gridfs-stream instance
        //TODO direct pipe the request to the gridFS
        //TODO what type of the request should be and how to parse it???
//        app.post('/picture', function(req, res) {
//            req.pipe(gfs.createWriteStream({
//                filename: 'test'
//            }));
//            res.send("Success!");
//        });

        //TODO pipe the file from the file siystem to the gridFS
        // TODO how to use additional params???
//        var writestream = gfs.createWriteStream({
//            filename: 'barista1.jpg'
////            mode: 'w', // default value: w+, possible options: w, w+ or r, see [GridStore](http://mongodb.github.com/node-mongodb-native/api-generated/gridstore.html)
////
////            //any other options from the GridStore may be passed too, e.g.:
////
////            chunkSize: 1024,
////            content_type: 'plain/text', // For content_type to work properly, set "mode"-option to "w" too!
////            root: 'my_collection',
////            metadata: {
////                ...
////        }
//        });
//        fs.createReadStream('/barista1.jpg').pipe(writestream);

        //console.log(req.body);
        Products.create(req.body, function(err, product) {
            if (err) {
                console.log('Failed to add new product: ' + err);
                return;
            }
            res.end();
           // res.send(product);

        });
    },
    updateProduct : function(req, res, next) {
        var t = req.body;
        //console.log(t);
        Products.findByIdAndUpdate({_id : req.params.id},{

                name: t.name,
                origin: t.origin,
                maker: t.maker,
                productModel: t.productModel,
                reseller: t.reseller,
                pros: t.pros,
                cons: t.cons,
                flagIsNew: t.flagIsNew,
                flagNewCommentAdded: t.flagNewCommentAdded,
                keyWords: t.keyWords,
                category: t.category,
                picture: t.picture
            },
            function(err, edited) {
                if (err){
                    console.log('Error: '+ err);
                    return;
                }
                console.log('Product with _id: '+ req.params.id + '   UPDATED');
                res.end();
            });
    },
    removeProduct : function(req, res, next) {
        Products.remove({_id: req.params.id}, function(err, edited) {
            if (err){
                console.log('Error: '+ err);
                return;
            }
            console.log('Product with _id: '+ req.params.id + '   REMOVED');
            res.end();
            });




    }
    };

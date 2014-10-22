var Products = require('mongoose').model('Product');
var Search = require('mongoose').model('SearchBuffer');
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var db = mongoose.connection;
var gfs = Grid(db.db, mongoose.mongo);


module.exports = {
    getImage: function(req, res, next) {
        //console.log(req.params.id);
        var readstream = gfs.createReadStream({
            filename: req.params.id,
            content_type: 'image/*'
        });
        readstream.on('error', function (err) {
            console.log('An error occurred!', err);
            throw err;
        });
        readstream.pipe(res);
    },
    getAllProducts: function(req, res, next) {

        //return new products only
        var options = {flagIsNew : true};
        //return products w/ new comments only
        if (req.query.new == '1') {options = {flagNewCommentAdded:true} }
        //return all products
        if (req.query.new == '2') {options = {}}

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

    updateProduct : function(req, res, next) {
        var t = req.body;
        //console.log(t);
        //Adding to search buffer
        //TODO remove unused values
        Search.update({name: 'n/a'},{ $addToSet: { buffer: { $each: t.keyWords } } },
            function(err, edited) {
                if (err) {
                    console.log('Error: ' + err);
                    return;
                }
            });
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
                //console.log('Product with _id: '+ req.params.id + '   UPDATED');
                res.end();
            });
    },

    removeProduct : function(req, res, next) {
        //Get filename of the picture before product being removed
        Products.findOne({_id: req.params.id}).exec(function(err, collection) {
            if (err) {
                console.log('Products can not be loaded: ' + err);
            }
            //Remove the product picture from the GridFS
            if (collection.picture[0]) {
                gfs.remove({"filename": collection.picture[0].filename}, function (err, edited) {
                    if (err) {
                        console.log('Error: ' + err);
                        return;
                    }
                    console.log('Picture with filename: ' + collection.picture[0].filename + '   REMOVED');
                    ;
                });
            }else{
                console.log('picture is missing');
            }
            if (collection.thumbnail) {
                gfs.remove({"filename": collection.thumbnail}, function (err, edited) {
                    if (err) {
                        console.log('Error: ' + err);
                        return;
                    }
                    console.log('Thumbnail with filename: ' + collection.thumbnail + '   REMOVED');
                    ;
                });
            }else{
                console.log('picture is missing');
            }




        });
        //Remove the product from the mongoDB
        Products.remove({_id: req.params.id}, function(err, edited) {
            if (err){
                console.log('Error: '+ err);
                return;
            }
            console.log('Product with _id: '+ req.params.id + '   REMOVED');

            });
        res.end();
    }
    };

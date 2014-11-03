var  Products = require('mongoose').model('Product')
    ,Images = require('mongoose').model('Images')
//var Search = require('mongoose').model('SearchBuffer')
    ,mongoose = require('mongoose')
//var Grid = require('gridfs-stream')
    ,db = mongoose.connection
//var gfs = Grid(db.db, mongoose.mongo)
    ,fs = require('fs')
    ,stream = require('streamifier')
;

module.exports = {
    DbClear: function (req, res, next) {
        Images.remove({ready: false},function (err) {
            if (err){
                return res.end();
            }
            console.log('All orphaned Images been removed from DB!');
        });

    res.end();
    },

    updateProduct : function(req, res, next) {
        var t = req.body;
        var prosN = 0;
        for (i = 0; i < t.pros.length; i++) {
           if (!t.pros[i].flagIsNew){
               prosN=prosN+1;
           }
        }
        var consN = 0;
        for (i = 0; i < t.cons.length; i++) {
            if (!t.cons[i].flagIsNew){
                consN=consN+1;
            }
        }


        Products.findByIdAndUpdate({_id : req.params.id},{
                name: t.name,
                pros: t.pros,
                cons: t.cons,
                flagIsNew: t.flagIsNew,
                flagNewCommentAdded: t.flagNewCommentAdded,
                picture: t.picture,
                consCount: consN,
                prosCount: prosN
            },
            function(err, edited) {
                if (err){
                    console.log('Error: '+ err);
                    return;
                }
                res.end();
            });
    },






    // TODO ready so far

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
    removeProduct : function(req, res, next) {
        Products.findOneAndRemove({_id: req.params.id}).exec(function (err, product) {
            if (err) {
                console.log('Products can not be loaded: ' + err);
            }
            if (product) {
                //Remove the product picture from the GridFS

                if (product.thumbnail !== undefined && product.thumbnail!='na') {
                    Images.findOneAndRemove({name:product.thumbnail}).exec(function (err, product) {
                        if (err) {
                            console.log('Products can not be loaded: ' + err);
                        }
                    });

                } else {
                    console.log('picture is missing');
                }
            }
            res.end();
        });
    },
    getImage: function(req, res, next) {
        if (req.params.id=='na' || req.params.id===undefined){
            fs.createReadStream('./server/nopictureThumb.jpg').pipe(res);
            return;
        }
        Images.findOne({name: req.params.id})
            .exec(function(err, document) {
                var t = stream.createReadStream(document.dataFile);
                res.setHeader('Expires', new Date(Date.now() + 604800000));
                res.setHeader('Content-Type', document.contentType);
                t.pipe(res);
            });
    },
    getThumb: function(req, res, next) {
        if (req.params.id=='na' || req.params.id===undefined){
            fs.createReadStream('./server/nopictureThumb.jpg').pipe(res);
            return;
        }
        Images.findOne({name: req.params.id})
            .exec(function(err, document) {
                var t = stream.createReadStream(document.dataThumb);
                res.setHeader('Expires', new Date(Date.now() + 604800000));
                res.setHeader('Content-Type', document.contentType);
                t.pipe(res);
            });

    }
};

var  Products = require('mongoose').model('Product')
    ,Images = require('mongoose').model('Images')
//var Search = require('mongoose').model('SearchBuffer')
    ,mongoose = require('mongoose')
//var Grid = require('gridfs-stream')
    ,db = mongoose.connection
//var gfs = Grid(db.db, mongoose.mongo)
    ,fs = require('fs')
    ,stream = require('streamifier')
    ,gm = require('gm').subClass({ imageMagick: true })
;

var cirToLat = {"Ё":"YO","Й":"I","Ц":"TS","У":"U","К":"K","Е":"E","Н":"N","Г":"G","Ш":"SH","Щ":"SCH","З":"Z","Х":"H","Ъ":"'","ё":"yo","й":"i","ц":"ts","у":"u","к":"k","е":"e","н":"n","г":"g","ш":"sh","щ":"sch","з":"z","х":"h","ъ":"'","Ф":"F","Ы":"I","В":"V","А":"a","П":"P","Р":"R","О":"O","Л":"L","Д":"D","Ж":"ZH","Э":"E","ф":"f","ы":"i","в":"v","а":"a","п":"p","р":"r","о":"o","л":"l","д":"d","ж":"zh","э":"e","Я":"Ya","Ч":"CH","С":"S","М":"M","И":"I","Т":"T","Ь":"'","Б":"B","Ю":"YU","я":"ya","ч":"ch","с":"s","м":"m","и":"i","т":"t","ь":"'","б":"b","ю":"yu"};
var latToCyr = {'y':'ъ','Y':'Ъ','c':'ц','C':'Ц','q':'я','Q':'Я','a':'а','b':'б','v':'в','w':'в','g':'г','d':'д','e':'е','j':'ж','z':'з','i':'и','k':'к','l':'л','m':'м','n':'н','o':'о','p':'п','r':'р','s':'с','t':'т','u':'у','f':'ф','h':'х','A':'А','B':'Б','V':'В','W':'В','G':'Г','D':'Д','E':'Е','J':'Ж','Z':'З','I':'И','K':'К','L':'Л','M':'М','N':'Н','O':'О','P':'П','R':'Р','S':'С','T':'Т','U':'У','F':'Ф','H':'Х'};
function transliterate(word) {
    var arr = word.split('');
    var newWord=[];
    var origin=[];
    var oringPlusU=[];
    var variants=[];
    for(i= 0;i<arr.length;i++){
        if (arr[i].charCodeAt(0)>64 && arr[i].charCodeAt(0)<91 || arr[i].charCodeAt(0)>96 && arr[i].charCodeAt(0)<123) {

            //slavei,haimana,slavej
            if (arr[i]=='e') {
                if (arr[i + 1] == 'j') {
                    origin.push('еж');
                    newWord.push('ей');
                    i++;
                    continue;
                }
            }
            if (arr[i]=='e') {
                if (arr[i + 1] == 'i') {
                    origin.push('еи');
                    newWord.push('ей');
                    i++;
                    continue;
                }
            }
            //naj-,nai-
            if (arr[i]=='a') {
                if (arr[i + 1] == 'j') {
                    origin.push('аж');
                    newWord.push('ай');
                    i++;
                    continue;
                }
            }
            if (arr[i]=='a') {
                if (arr[i + 1] == 'i') {
                    origin.push('аи');
                    newWord.push('ай');
                    i++;
                    continue;
                }
            }
            //iuli,juli
            if (arr[i]=='i') {
                if (arr[i + 1] == 'u') {
                    origin.push('иу');
                    newWord.push('ю');
                    i++;
                    continue;
                }
            }
            if (arr[i]=='j') {
                if (arr[i + 1] == 'u') {
                    origin.push('жу');
                    newWord.push('ю');
                    i++;
                    continue;
                }
            }



            //jordan,iordan,djordani
            if (arr[i]=='i') {
                if (arr[i + 1] == 'o') {
                    origin.push('ио');
                    newWord.push('йо');
                    i++;
                    continue;
                }
            }
            if (arr[i]=='j') {
                if (arr[i + 1] == 'o') {
                    origin.push('жо');
                    newWord.push('йо');
                    i++;
                    continue;
                }
            }


            //moi,twoi
            if (arr[i]=='o') {
                if (arr[i + 1] == 'i') {
                    origin.push('ои');
                    newWord.push('ой');
                    i++;
                    continue;
                }
            }
            //cska,carevec,tsarevets,tcarevetc
            if (arr[i]=='t') {
                if (arr[i + 1] == 's') {
                    origin.push('тс');
                    newWord.push('ц');
                    i++;
                    continue;
                }
                if (arr[i + 1] == 'c') {
                    origin.push('тц');
                    newWord.push('ц');
                    i++;
                    continue;
                }
            }
            //TODO chehia
            //chapla
            if (arr[i]=='c') {
                if (arr[i + 1] == 'h') {
                    origin.push('цх');
                    newWord.push('ч');
                    i++;
                    continue;
                }
            }
            //niama,njama
            if (arr[i]=='i') {
                if (arr[i + 1] == 'a') {
                    origin.push('иа');
                    newWord.push('я');
                    i++;
                    continue;
                }
            }
            if (arr[i]=='j') {
                if (arr[i + 1] == 'a') {
                    origin.push('жа');
                    newWord.push('я');
                    i++;
                    continue;
                }
            }

            //shtipka,stipka,sharka
            if (arr[i]=='s') {
                if (arr[i + 1] == 'h') {
                    if(arr[i+2] == 't'){
                        origin.push('схт');
                        newWord.push('щ');
                        i++;
                        i++;
                        continue;
                    }else{
                        origin.push('сх');
                        newWord.push('ш');
                        i++;
                        continue;
                    }
                }
                if (arr[i + 1] == 't'){
                    origin.push('ст');
                    newWord.push('щ');
                    i++;
                    continue;
                }
            }

            origin.push(transFromLatToCyr(arr[i]));
            newWord.push(transFromLatToCyr(arr[i]));

        }
    }

    //TODO ninja
    //TODO chehia

    variants.push(newWord.join(''));
    variants.push(origin.join(''));
    variants.push(newWord.join('').replace(/у/g, 'ъ'));
    variants.push(origin.join('').replace(/у/g, 'ъ'));
    return variants;//newWord.join('');
}
function transFromCyrToLat(letter) {
    return letter.split('').map(function (char) {
        return cirToLat[char] || char;
    });
}
function transFromLatToCyr(letter) {

    return letter.split('').map(function (char) {
        return latToCyr[char] || char;
    });
}

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "щщ");
}
module.exports = {

    rotateLeft: function (req, res) {
        Images.findOne({name: req.params.id})
            .exec(function(err, document) {
                var fileExt = document.contentType.split('/').pop();
                gm(document.dataThumb)
                .rotate('white', 90)
                .toBuffer(fileExt,function (err, buffer) {
                    if (err)  return res.end(err);
                    Images.update({name: req.params.id},{dataThumb:buffer},function (err, numberAffected, raw) {
                        if (err) return res.end(err);
                        res.end();
                    });
                });
                gm(document.dataFile)
                .rotate('white', 90)
                .toBuffer(fileExt,function (err, buffer) {
                    if (err)  return res.end(err);
                    Images.update({name: req.params.id},{dataFile:buffer},function (err, numberAffected, raw) {
                        if (err) return res.end(err);
                        res.end();
                    });
                });
            });
    },
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

        //remove not allowed symbols
        req.query.search = escapeRegExp(req.query.search);

        //replace latin letter with cyrillic
        var p = transliterate(req.query.search);
        p[0] = p[0]!='' ? p[0] : 'щщщщщщ';
        p[1] = p[1]!='' ? p[1] : 'щщщщщщ';
        p[2] = p[2]!='' ? p[2] : 'щщщщщщ';
        p[3] = p[3]!='' ? p[3] : 'щщщщщщ';
        //console.log(p);
        var limit = req.query.l;
        var skip = req.query.s;

        //Validate skip and limit
        if (skip < 0) {skip = 0}
        if (limit <1) {limit = 1}
        if (limit > 20) {limit = 20}

//        Products.find(options).sort({ id: 1 }).limit(limit).skip(skip).exec(function(err, collection) {
//            if (err) {
//                console.log('Products can not be loaded: ' + err);
//            }
//            res.send(collection);
//        })

        if (req.query.l && req.query.s) {
            //return new products only
            var findOptions = {
                flagIsNew : true,
                $or : [{name: { $regex: req.query.search, $options: "i" }},{name: { $regex: p[0], $options: "i" }},{name: { $regex: p[1], $options: "i" }},{name: { $regex: p[2], $options: "i" }},{name: { $regex: p[3], $options: "i" }} ]
            };
            //return old products only
            if (req.query.new == '1') {
                findOptions = {
                    flagIsNew:false,
                    $or : [{name: { $regex: req.query.search, $options: "i" }},{name: { $regex: p[0], $options: "i" }},{name: { $regex: p[1], $options: "i" }},{name: { $regex: p[2], $options: "i" }},{name: { $regex: p[3], $options: "i" }} ]
                }
            }
            //return products w/ new comments only
            if (req.query.new == '2') {
                findOptions = {
                    flagNewCommentAdded:true,
                    $or : [{name: { $regex: req.query.search, $options: "i" }},{name: { $regex: p[0], $options: "i" }},{name: { $regex: p[1], $options: "i" }},{name: { $regex: p[2], $options: "i" }},{name: { $regex: p[3], $options: "i" }} ]
                }
            }
            //return all products
            if (req.query.new == '3') {
                findOptions = {
                    $or : [{name: { $regex: req.query.search, $options: "i" }},{name: { $regex: p[0], $options: "i" }},{name: { $regex: p[1], $options: "i" }},{name: { $regex: p[2], $options: "i" }},{name: { $regex: p[3], $options: "i" }} ]
                }
            }


//            var findOptions = {
//                flagIsNew: false,
//                //name: { $regex: req.query.search, $options: "i" }
//                $or : [{name: { $regex: req.query.search, $options: "i" }},{name: { $regex: p[0], $options: "i" }},{name: { $regex: p[1], $options: "i" }},{name: { $regex: p[2], $options: "i" }},{name: { $regex: p[3], $options: "i" }} ]
//            };
            Products.find(findOptions).sort({ prosCount: -1 }).limit(limit).skip(skip)
                .exec(function (err, collection) {
                    if (err) {
                        console.log('Products can not be loaded: ' + err);
                    }
                    if(collection!==undefined && collection.length>0) {
                        res.send(collection);
                    }
                    else{
                        res.end();
                    }
                });
        }
        else{
            res.redirect('/');
        }



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

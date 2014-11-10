var controllers = require('../controllers');

module.exports = function(app){


    //Image rotate
    app.get('/left/:id',controllers.products.rotateLeft);

    app.post('/api/search', controllers.search.searchSuggestions);

    //get all products from Home partial
    app.get('/api', controllers.products.getAllProducts);
    //get the image from gridFS by name
    app.get('/image/:id', controllers.products.getImage);
    app.get('/thumb/:id', controllers.products.getThumb);
    //get product by its id from productEdit partial
    app.get('/api/product/:id', controllers.products.getProductById);
    //update product
    app.put('/api/:id', controllers.products.updateProduct);
    //delete product and its image as well
    app.get('/api/delete/:id', controllers.products.removeProduct);
    //DB clear
    app.get('/api/clear',controllers.products.DbClear);



    //Servicing Angular Routes
    //for Home page
    app.get('/home',function(req,res){
        res.render('../../public/app/home');
    });
    //for other pages
    app.get('/p/:partialArea/:partialName', function(req,res) {
        res.render('../../public/app/' + req.params.partialArea + '/' + req.params.partialName)

    });

    app.get('*',function(req,res){
        res.render('index');

    });
};
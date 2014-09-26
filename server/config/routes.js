var controllers = require('../controllers');

module.exports = function(app){

    //get all products from Home partial
    app.get('/api', controllers.products.getAllProducts);
    //get the image from gridFS by name
    app.get('/get_image/:id', controllers.products.getImage);
    //get product by its id from productEdit partial
    app.get('/api/product/:id', controllers.products.getProductById);
    //update product
    app.put('/api/:id', controllers.products.updateProduct);
    //delete product and its image as well
    app.get('/api/delete/:id', controllers.products.removeProduct);


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
var controllers = require('../controllers');

module.exports = function(app){
//    app.get('/api/teachers', controllers.teachers.getAllTeachers);
//
//    app.post('/todo/create', function (req, res) {
//       // TODO: move and rename the file using req.files.path & .name)
//        res.send(console.dir(req.files));  // DEBUG: display available fields
//    });


    //Servicing Angular Controllers
    //app.get('/ggg/:id', controllers.products.getImage);
    app.get('/api', controllers.products.getAllProductsByNewProduct);
    app.get('/api/comment', controllers.products.getAllProductsByNewComment);
    //app.post('/api/', controllers.products.createProduct);
    app.put('/api/:id', controllers.products.updateProduct);
    app.delete('/api/:id', controllers.products.removeProduct);

    app.get('/api/product/:id', controllers.products.getProductById);

    //Servicing Angular Routes
    app.get('/home',function(req,res){
        res.render('../../public/app/home');
    });

    app.get('/p/:partialArea/:partialName', function(req,res) {
        res.render('../../public/app/' + req.params.partialArea + '/' + req.params.partialName)

    });

    app.get('*',function(req,res){
        res.render('index');

    });
};
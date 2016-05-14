/**
 * Created by Jim Ankrom on 2/20/2016.
 */

module.exports = function (sway) {

    // Set all Access-Control headers for CORS OPTIONS preflight
    sway.express = {
        accessControlOptions: function (req, res, next) {
            //console.log('CORS headers added - ' + req.headers.origin);
            res.header('Access-Control-Allow-Origin', req.headers.origin || "*");
            res.header('Access-Control-Allow-Credentials', true);
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

            // respond immediately to OPTIONS preflight request
            if ('OPTIONS' == req.method) {
                //console.log('closing CORS');
                res.status(200).end();
            } else {
                next();
            }
        },
        monitor: {

        }
    };

    // TODO : logging middleware
    //function logHeaders (req, res, next) {
    //    console.log(req.headers);
    //    next();
    //}
    //if (debug) app.use(logHeaders);
};
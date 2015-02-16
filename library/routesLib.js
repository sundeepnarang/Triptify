/**
 * Created by Sundeep on 2/15/2015.
 */
var passport = require('passport');

require('../config/passport')(passport);

exports.passport = passport;
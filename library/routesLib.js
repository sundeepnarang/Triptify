/**
 * Created by Sundeep on 2/15/2015.
 */
var passport = require('passport');
var util = require('util');
var bcrypt   = require('bcrypt-nodejs');
var options = {
    cid     : "55505",//"Ueam4gQA",
    apiKey  : "tr8kuvkg9ah9tbqgn45b32db",
    locale  : "en_US",  // optional defaults to en_US
    currencyCode :"USD"  // optional defaults to USD
};
var expedia = require('expedia')(options);

require('../config/passport')(passport);

var search = function(id,body,ip,ua,done){

    var options = {
        "customerSessionId" :id,
        "customerIpAddress" : ip,
        "customerUserAgent" : ua,"HotelListRequest": {
            "city": body.city,
            "stateProvinceCode":body.state,
            "countryCode": "US",
            "arrivalDate": body.arrival,
            "departureDate": body.departure,
            "RoomGroup": {
                "Room": { "numberOfAdults": "2" }
            },
            "numberOfResults": "25"
        }
    }

    expedia.hotels.list(options, function(err, res){
        if(err)throw new Error(err);
        console.log(res);
        done(res.HotelListResponse.HotelList.HotelSummary.map(function (d,i) {
            return util.inspect(d);
        }));
    });

};

exports.search    = search;
exports.passport = passport;
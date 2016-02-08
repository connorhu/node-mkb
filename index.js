var soap = require('soap');
var libxmljs = require('libxmljs');
var url = 'http://www.mnb.hu/arfolyamok.asmx?wsdl';
var api = {
    getRates: function(callback) {
        soap.createClient(url, function(err, client) {
            client.GetCurrentExchangeRates({}, function(err, result) {
                if (err) {
                    callback(err);
                    return;
                }
                if (!result['GetCurrentExchangeRatesResult']) {
                    callback(new Error('soap result is missing'));
                    return;
                }
        
                var xml = result['GetCurrentExchangeRatesResult'];
                var xmlDoc = libxmljs.parseXml(xml);
        
                var day = xmlDoc.get('//Day');
        
                var data = {
                    date: day.attr('date').value(),
                    rates: {}
                };
        
                var rates  = day.childNodes();
        
                for (var i = 0; i < rates.length; i++) {
                    var currency = rates[i].attr('curr').value();
                    data.rates[currency] = {
                        unit: rates[i].attr('unit').value() * 1,
                        rate: parseFloat(rates[i].text().replace(',', '.'))
                    };
                }
        
                callback(null, data);
            });
        });
    },
    getRate: function (currency, callback) {
        api.getRates(function (err, data) {
            if (err) {
                callback(err);
                return;
            }
            
            if (!data.rates[currency]) {
                callback(new Error('currency is missing'));
                return;
            }
            
            callback(null, {
                date: data.date,
                rate: data.rate,
                unit: data.unit,
                currency: currency
            });
        });
    }
}

module.exports = api;
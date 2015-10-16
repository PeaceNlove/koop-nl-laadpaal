var request = require('request');

var Laadpaal = function( koop ){

  var laadpaal = {};
  laadpaal.__proto__ = koop.BaseModel( koop );
  
  // adds a service to the Cache.db
  // needs a host, generates an id 
  laadpaal.register = function (id, host, callback) {
    var type = 'laadpaal';
    koop.Cache.db.serviceCount( type, function (error, count) {
      id = id || count++;
      koop.Cache.db.serviceRegister( type, {'id': id, 'host': host},  function (err, success) {
        callback( err, id );
      });
    });
  };
  // get service by id, no id == return all
  laadpaal.find = function( id, options,callback ){
	  var options = options;
    
	var type = 'Laadpaal';
	// check the cache for data with this type & id 
	if(options && !options.hasOwnProperty("limit")){
			options["limit"] =1000;
	}
	if (options && options.hasOwnProperty("resultOffset")&& !options.hasOwnProperty("offset")){
		options.offset = options.resultOffset;
	}
	console.log(JSON.stringify(options));
	if ( options && options.returnCountOnly){
		var table = type + ':' + id+':0';
		koop.Cache.getCount( table, options, function(err, entry ){
			var c = entry;
			var data = [{type: 'FeatureCollection',count: c}];
			callback( null, data );
		});
	}
	else{
		koop.Cache.get( type, id, options, function(err, entry ){
			
		  if ( err&& err!=='Not Found'){
			// if we get an err then get the data and insert it 
			koop.Cache.db.serviceGet( 'laadpaal', parseInt(id) || id, function(err, service){
			
				if (err){
					callback('No service table found for that id. Try POSTing {"id":"arcgis", "host":"http://www.arcgis.com"} to /jsonurl', null);
				} 
				else {
					var url = service.host;
					console.log(url);
					request.get(url, function(e, res){
					  var json = JSON.parse(res.body);
					  var geojson = {"type": "FeatureCollection","features": []	};
					  for (var i = 0; i< json.length;i++){	
						  //{"id":"59813","lng":"4.526335","lat":"52.139907","name":"Alfen LPD_0112","address":"Energieweg 21","postalcode":"2382NB","city":"Zoeterwoude","country":"NL","phone":"036 - 549 34 00","url":"http:\/\/www.icu-charging-stations.com\/","owner":"alfen","email":"","opentimes":"","chargetype":"AC krachtstroom","connectortype":"mennekes","nroutlets":"1","cards":[],"pricemethod":"jaarabonnement","price":"0.00","power":"11kW","vehicle":"auto","facilities":["parkeer","winkelcentrum","openbaar vervoer"],"realtimestatus":true}
						  var feature = {
							"type": "Feature",
							"geometry": {
								"type": "Point",
								"coordinates": [
									parseFloat(json[i].lng),parseFloat(json[i].lat)
								]
							},
							"properties": json[i]
						  }
						  delete feature.properties.lng;
						  delete feature.properties.lat;
						  feature.properties["gid"] = feature.properties.id;
						  delete feature.properties.id;
						  feature.properties.cards = feature.properties.cards.join(", ");
						  feature.properties.facilities = feature.properties.facilities.join(", ");
						  feature.properties.nroutlets = parseInt(feature.properties.nroutlets);
						  feature.properties.price = parseInt(feature.properties.price);
						  geojson.features.push(feature);
					  }
					  // insert data into the cache; assume layer is 0 unless there are many layers (most cases 0 is fine)  
					  koop.Cache.insert( type, id, geojson, 0, function( err, success){
						if ( success ) {
						 var entry = [];
						  entry.push(geojson);
						  callback( null, entry );
						}
					  });
					});
					
				  } 
				});
		  
			}
			else {
				if (!entry && err==='Not Found'){entry = [{type: 'FeatureCollection',features: []}];}
				callback( null, entry );
			}
		});
	}
      
  }

  
  
  return laadpaal;

};

module.exports = Laadpaal;

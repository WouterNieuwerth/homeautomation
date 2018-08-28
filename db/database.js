const mongoose          = require('mongoose');
const options           = {promiseLibrary: require('bluebird')};
const ThermostatDevice  = require('./schemas.js').ThermostatDevice;
var object = {};

var deviceSchema = new mongoose.Schema(ThermostatDevice);

function connect (callback) {

  mongoose.connect('mongodb://wouternieuwerth:kDz51QuaIGj3J%265k@wouternieuwerthcluster0-shard-00-00-xq9uq.mongodb.net:27017,wouternieuwerthcluster0-shard-00-01-xq9uq.mongodb.net:27017,wouternieuwerthcluster0-shard-00-02-xq9uq.mongodb.net:27017/test?ssl=true&replicaSet=WouterNieuwerthCluster0-shard-0&authSource=admin', options);

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));

  db.once('open', function(){
    console.log('We\'re connected to the database!');

    var Device = db.model('Device', deviceSchema);

    function find(query,model,callback) {

      if (!query) {
        model.find(function(err, results) {
          if (err) throw err;
          callback(err,results);
        });
      } else {
        model.find(query, function(err, results) {
          if (err) throw err;
          callback(err,results);
        });
      }
    };

    function add(content,model,callback) {
      var newDevice = new model(content);
      newDevice.save(function(err,results){
        if (err) throw err;
        console.log('Device added...');
        callback(err,results);
      });
    };

    function remove(query,model) {
      model.remove(query,function(err,removed){
        if (err) throw err;
        //console.log(removed);
        console.log("Remove executed...")
      });
    };

    object = {
      Device: Device,
      find: find,
      add: add,
      remove: remove
    };

    callback(object);

  });

}

module.exports = {
  connect: connect
}

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  facebookId:{ type: String,unique: true },
  currentNode:Number,
  first_name: String,
  last_name:String,
  roll_number:String,
  otp_number:String,
  gender:String,
  admin:Number,
  last_search:String
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);
//connect with database
mongoose.connect('mongodb://localhost:27017/LibraryBot');
// make this available to our users in our Node applications
module.exports = User;
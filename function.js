var User = require('./User');
var nodemailer = require('nodemailer');
module.exports = {
  // function to resgister user in the database first time
  registerUser: function (sender) {
    User.find({ facebookId: sender }, function(err, user) {
     if (err) throw err;
     if(user.length==0){
        var temp=sender.slice(0,4);
        var newUser = User({
        facebookId: sender,
        currentNode: 1,
        otp_number:temp,
        admin:1
         });
          //save the user
      newUser.save(function(err) {
        if (err) throw err;
           console.log('First time User resigered!');
      });
      }
      //if user already found in the data base
else if(user.length>0){
user[0].currentNode=1;
user[0].save(function(err) {
      if (err) throw err;
  });
}
  });
  },
  //function to update the current position in data flow diagram
  updateNode: function (sender,node) {
	 User.find({ facebookId: sender }, function(err, user) {
     if (err) throw err;
      user[0].currentNode=node;

  // save the user
     user[0].save(function(err) {
      if (err) throw err;
     console.log('User successfully updated Node!');
  });
  // object of the user
   console.log(user);
       });
  },
  //function to update the roll number
  updateRollNumber: function (sender,rollNumber) {
	 User.find({ facebookId: sender }, function(err, user) {
     if (err) throw err;
      user[0].roll_number = rollNumber;
      user[0].currentNode=3;

  // save the user
     user[0].save(function(err) {
      if (err) throw err;
     console.log('User successfully updated his Roll Number!');
  });
  // object of the user
   console.log(user);
       });
  },
   //function to update the roll number
  updateLastSearch: function (sender,ls) {
   User.find({ facebookId: sender }, function(err, user) {
     if (err) throw err;
      user[0].last_search = ls;
  // save the user
     user[0].save(function(err) {
      if (err) throw err;
     console.log('User successfully updated last search!');
  });
  // object of the user
   console.log(user);
       });
  },
  //function to update the profile data info which provided by the facebook
  updateData: function (sender,data) {
   User.find({ facebookId: sender }, function(err, user) {
     if (err) throw err;
     //console.log("first name:"+data.first_name);
     //console.log("Last Name"+data.last_name);

      user[0].first_name = data.first_name;
      user[0].last_name=data.last_name;
      user[0].gender=data.gender;
      //user[0].currentNode=4;
  // save the user
     user[0].save(function(err) {
      if (err) throw err;
     console.log('User successfully updated his Data!');
  });
  // object of the user
   //console.log(user);
       });
  },
  //function to send otp to the a webmail address
sendMailToUser:function(sender,name,userEmail){
// Create a SMTP transport object
var transport = nodemailer.createTransport("SMTP", {
        service: 'Gmail',
        auth: {
            user: "abhiyadav9221@gmail.com",
            pass: "rahulyadav9221"
        }
    });

console.log('SMTP Configured');
var temp=sender.slice(0,4);
var tempName=name;
// Message object
var message = {

    // sender info
    from: '"Handy Library"<abhiyadav9221@gmail.com>',

    // Comma separated list of recipients
    to: userEmail,

    // Subject of the message
    subject: "One Time Password from HandyLibrary.", 

    // plaintext body

    text: "Hello "+tempName+"\nYour One Time Password Is:"+temp+" You can use it for Verification on Handy Library Bot.\n  Thank You For Your Time.",

    // HTML body
    html:'<p><b>Hello</b> to myself <img src="cid:note@node"/></p>'+
         '<p>Here\'s a nyan cat for you as an embedded attachment:<br/></p>'
};

console.log('Sending Mail');
transport.sendMail(message, function(error){
  if(error){
      console.log('Error occured');
      console.log(error.message);
      return;
  }
  console.log('Message sent successfully!');

  //if you don't want to use this transport object anymore, uncomment following line
  transport.close(); // close the connection pool
});
}
};
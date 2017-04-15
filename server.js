var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
var FuncB = require('./function');
var User = require('./User');
var mongodb = require('mongodb');
var Promise = require('promise');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/libraryData';
app.set('port', (process.env.PORT || 8080))
//facebook page token
var token = "EAAD37nUm9K0BAMbbIQwhl4uVZAnzEMIsgOdoRZCkZBYjy74NNUBmdPoXn7Cz4TQdkoRPrZC50ZCBFEcm1c6dGEko9XxZAHAMUrazgkNlWmBlCiz2EZBhgZAn1a7tiRqALvV3ZCtaWaBilIull29KZC9q6T23bm9sZAEfh3iD3h47rR9gwZDZD"
// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'VERIFY_TOKEN') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
});

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))

});


app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
    console.log(res);
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id;
        console.log("userID id is : " +sender);
        pageId = event.recipient.id;
        
        //console.log(event.message.attachments);
        //if user send some attachments
       if(event.message && event.message.attachments)
        {
            if(event.message.attachments[0].type ==='image')
            {
                 var imageUrl = event.message.attachments[0].payload.url;
                 User.find({facebookId: sender }, function(err, users) {
                     if (err) throw err;
                     if(users.length>0)
                        {
                         var ifadmin=users[0].admin;
                         if(ifadmin==1)
	                           {
	                            User.find({}, function(err, users) {
                                if (err) throw err;
                                if(users.length>0)
                                {
                                	   for(var i=0;i<users.length;i++)
                                	  {
                                	     id=users[i].facebookId;
                                	     sendImageMessage(id,imageUrl);
                                	   }
                                    }
                                   });
	                           }
                          }
                       });
            }
        }
        //if user send some text message
        if (event.message && event.message.text) {
            text = event.message.text
            //console.log("user enterd:"+text);
            User.find({facebookId: sender }, function(err, users) {
              if (err) throw err;
              if(users.length>0){
              var position=users[0].currentNode;//current position of the user in data flow diafram
              var name=users[0].first_name;//user's name which stotred in database
              var db_otp=users[0].otp_number;
                  //object of all the users
              console.log(position);
               switch(position){
                   case 1:
                   var greetingText=text;
                   console.log("Currently User enterd first message:"+greetingText);
                   userProfileInformation(sender);
                   FuncB.updateNode(sender,2);
                   sendTextMessage(sender,"Hey "+name+".Please enter your roll no for authentication.\neg.- ipg_2013XXX");
                   break;
                   case 2:
                   var rollNumber=text;
                   if(text.length>=11)
                   {
                   var email=rollNumber+"@iiitm.ac.in";
                   console.log("Currently User enterd his rollNumber:"+rollNumber);
                   FuncB.updateRollNumber(sender,rollNumber);
                   FuncB.sendMailToUser(sender,name,email);
                   sendTextMessage(sender,"Please enter the OTP which i have sent on your Webmail id."); 
                   }
                   else
                   {
                    sendTextMessage(sender,"Please enter a valid Roll Number.");
                    FuncB.updateNode(sender,2);
                   }
                   break; 
                   case 3:
                   console.log("Currently User enterd his OTP:"+otp);
                   var otp=text;
                   if(db_otp==otp)
                   {
                    FuncB.updateNode(sender,4);
                    sendTextMessage(sender,"Thank You! You have been verified.");
                    sendGenericMessage(sender);
                   }
                   else
                    {
                     sendTextMessage(sender,"You Enterd Wrong OTP.\nplease Try Again.");    
                    }
                   break;
                   case 4:
                   userProfileInformation(sender);
                   var searchQuery=text;
                   sendTextMessage(sender,"Sorry! I couldn't understand your query.");
                   break;
                   case 7:
                   var book_name=text;
                   var coll='books';
                   FuncB.updateLastSearch(sender,book_name);
                   searchbookResult(sender,coll,book_name);
                   break;
                   case 8:
                   var author_name=text;
                   var coll='authors';
                   FuncB.updateLastSearch(sender,author_name);
                   searchbookResult(sender,coll,author_name);
                   break;
                   case 9:
                   var user_query=text;
                   var coll='both';
                   FuncB.updateLastSearch(sender,user_query);
                   searchbookResult(sender,coll,user_query);
                 }
                 
               }
              // continue
             });
        }
        //to handle psotback event
        if (event.postback) {
            var postbackData = event.postback.payload;   // need to be changed when original format comes...
            console.log(postbackData);
                switch(postbackData){
                  case 'get_start':
                    console.log("id of fb user :"+sender);
                        FuncB.registerUser(sender);
                        sendTextMessage(sender,"Say 'Hi' to get started.");
                        userProfileInformation(sender);
                        break; 
                  case'search_book':
                     User.find({facebookId: sender }, function(err, users) {
                     if (err) throw err;
                     if(users.length>0)
                        {
                     var position=users[0].currentNode;
                     if(position<4)
                           {
                            sendTextMessage(sender,"Please follow accordingly.")
                           }
                           else
                           	sendButtonMassage(sender);
                          }
                       });
                     break;
                  case'help':
                  var about_us="Hi there! I am handy library, a friend of yours. I am here to ease out the library info for you and make it readily available to you.You can know about issued books to you, fine you got to pay and any book you want to search from me.Hope you will come over to see me again.";
                      sendTextMessage(sender,about_us);
                      break;
                  case'view_profile':
                     User.find({facebookId: sender }, function(err, users) {
                     if (err) throw err;
                     if(users.length>0)
                        {
                     var position=users[0].currentNode;
                     var user_roll=users[0].roll_number;
                     if(position<4)
                           {
                            sendTextMessage(sender,"Please Fill details according to previous message.")
                           }
                           else
                           searchUserProfile(sender,user_roll);	
                          }
                       });
                    break;
                    case'by_book':
                    sendTextMessage(sender,"Type book name.");
                    FuncB.updateNode(sender,7);
                    break;
                    case'by_author':
                    sendTextMessage(sender,"Type author name.");
                    FuncB.updateNode(sender,8);
                    break;
                    case'by_both':
                    sendTextMessage(sender,"Type book and author name.");
                    FuncB.updateNode(sender,9);
                    break;
                    case'more_result':
                    User.find({facebookId: sender }, function(err, users) {
                     if (err) throw err;
                     if(users.length>0)
                        {
                     var position=users[0].currentNode;
                     var lastSearch=users[0].last_search;
                          if(position==7)
                           {
                            var coll='books';
                            sendMoreResult(sender,coll,lastSearch);
                           }
                           else if(position==8)
                           {
                            var coll='authors';
                            sendMoreResult(sender,coll,lastSearch);
                           }
                           else if(position==9)
                           {
                             var coll='both';
                            sendMoreResult(sender,coll,lastSearch);
                           }
                           else
                           sendTextMessage(sender,"No More Results Found!"); 
                          }
                       });
                    break;
                    }
            continue
        }
    }
    res.end("200");
})
// A function required to send a text message to user
function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
// A function required to send a Image message to user
function sendImageMessage(sender, url) {
    messageData = {
            "attachment":{
                  "type":"image",
                      "payload":{
                        "url": url    
                        }
                    }
                }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
// A function required to get chatbot user's profile info from facebook server
function userProfileInformation(sender) {
request({
        url: 'https://graph.facebook.com/v2.6/'+ sender +'?fields=first_name,last_name,profile_pic,locale,timezone,gender',
        qs: {access_token:token},
        method: 'GET',
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
        else
        {
            var parsedBody = JSON.parse(response.body);
            console.log("type  information :"+typeof(parsedBody));
            FuncB.updateData(sender,parsedBody);
        }
    })
};
// A function required to send Button message to user
function sendButtonMassage(sender)
{
  messageData = {
        "attachment":{
              "type":"template",
              "payload":{
                "template_type":"button",
                "text":"How do you want to search:",
                "buttons":[
                  {
                    "type":"postback",
                    "title":"By Book Name",
                    "payload":"by_book"
                  },
                  {
                    "type":"postback",
                    "title":"By Author Name",
                    "payload":"by_author"
                  },
                 {
                    "type":"postback",
                    "title":"By Book & Author Name",
                    "payload":"by_both"
                  }
                ]
              }
            }
         }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
// A function to find the books in the database according to user query
function searchbookResult(Sender,col,text){
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url);
    var collection = db.collection(col);
{
    var search_for_answer =  text;
    collection.find({$text: {$search: search_for_answer }}, {score: {$meta: "textScore"}}).sort({score:{$meta:"textScore"}}).toArray(function (err, result) {
      if (err) {
        console.log(err);
      } else if (result.length>0) {
        var res1=result[0];
        var res2=result[1];
        sendTopResult(sender,res1,res2);
      } 
      else 
      {
        //if no books found in the database
        sendTextMessage(sender,"No match found.\nTry again.");
      }
      //Close connection
      db.close();
    });
}
  }
});
}
// A function to fetch library user's profile info
function searchUserProfile(Sender,user_rollNumber){
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url);
    var collection = db.collection('users');
{
    var search_for_user =  user_rollNumber;
    collection.find({$text: {$search: search_for_user }}, {score: {$meta: "textScore"}}).sort({score:{$meta:"textScore"}}).toArray(function (err, result) {
      if (err) {
        console.log(err);
      } else if (result.length>0) {
        var fine=result[0].total_fine;
        var count=result[0].bookCount;
        var message_user="Right now you have"+count+" Books issued on your accout.And you have "+fine+" fine.";
      	sendTextMessage(sender,message_user);
      	for(var i=0;i<count;i++)
        {
        var data ="Book Name:"+result[0].bookDetails[i].bookname+"\nAuthor Name:"+result[0].bookDetails[i].author+"\nBarcode:"+result[0].bookDetails[i].barcode+"\nExpiry Date:"+result[0].bookDetails[i].expiry_date+"";
        sendTextMessage(sender,data);
        }
      } else {
        //NO user found
        sendTextMessage(sender,"Sorry! I could't find Your Profile.  \n Try Again..");
      }
      //Close connection
      db.close();
    });
}
  }
});
}
// A function to know the next step of the user
function sendGenericMessage(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "What do you want to do next?",
                    "subtitle": "I am here to help.",
                    "image_url": "http://www.thequotepedia.com/images/16/a-reader-lives-a-thousand-lives-before-he-dies-books-quotes.jpg",
                    "buttons": [
                    {
                     "type":"postback",
                    "title":"Search New Book",
                    "payload":"search_book"
                    }, 
                    {
                    "type":"postback",
                    "title":"View Your Profile",
                    "payload":"view_profile"
                    }
                  ],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
} 
//function to send top two results in slider format
function sendTopResult(sender,obj1,obj2) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": obj1.bookname+" By "+obj1.author+"",
                    "subtitle": "Available: "+obj1.available+" Copies \n Library Index: "+obj1.library_index+"",
                    "image_url": obj1.image_url,
                    "buttons": [
                    {
                     "type":"postback",
                     "title":"View More Results",
                     "payload":"more_result",
                    }],
                },
                {
                    "title":obj2.bookname+" By "+obj2.author+"",
                    "subtitle": "Available: "+obj2.available+" Copies \n Library Index: "+obj2.library_index+"",
                    "image_url": obj2.image_url,
                    "buttons": [{
		                      "type":"postback",
		                     "title":"View More Results",
		                     "payload":"more_result",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
//fuction to send three more results to the user
function sendMoreResult(Sender,col,text){
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url);
    var collection = db.collection(col);
{
    var search_for_answer =  text;
    collection.find({$text: {$search: search_for_answer }}, {score: {$meta: "textScore"}}).sort({score:{$meta:"textScore"}}).toArray(function (err, result) {
      if (err) {
        console.log(err);
      } 
      else if (result.length>0) 
      {
        var data0 ="Book Name: "+result[2].bookname+"\nAuthor Name: "+result[2].author+"\nAvilable:"+result[2].available+" Copies\nIndex: "+result[2].library_index+"";
        sendTextMessage(sender,data0);
        var data1 ="Book Name: "+result[3].bookname+"\nAuthor Name: "+result[3].author+"\nAvilable:"+result[3].available+" Copies\nIndex: "+result[3].library_index+"";
        sendTextMessage(sender,data1);
        var data2 ="Book Name: "+result[4].bookname+"\nAuthor Name: "+result[4].author+"\nAvilable: "+result[4].available+" Copies\nIndex: "+result[4].library_index+"";
        sendTextMessage(sender,data2);
      } 
      else 
      {
        // NO more results found
        sendTextMessage(sender,"Sorry! I could't Get your Query.  \n Try Again..");
      }
      //Close connection
      db.close();
    });
}
  }
});
};

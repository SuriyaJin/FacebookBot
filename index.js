'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
var ConversationV1 = require('watson-developer-cloud/conversation/v1');
const app = express()
app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot');
})
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token')
})



const token = "EAAKvwWuKUtwBAEgdhZBdgZC155uaUknJ1My7yOo2CtaQcAG9MZAqRq1ErLZARM7KZBylAv5TZADkBQ2XsEPtXDUyXTn9GNAc92jZAtaxfb3EytJ43aEQunCQZB7IWlVjtGRXyQBFH2Bp8pURSu8XOzLRWQZBu4kcUZBySAcZCQQEH5JFwZDZD"
function GetResponse(sender, text){
  let messageData={};
  var conversation = new ConversationV1({
    username: '9183e35a-31b4-46d0-b18d-fb0d69285026',
    password: 'xZvXbh5oh5qN',
    version_date: ConversationV1.VERSION_DATE_2016_09_20
  });
  console.log(text);
  conversation.message({
    input: { text: text },
    workspace_id:'b6a4828f-9ed6-4199-b453-45cf642593e1'
   }, function(err, response) {
       if (err) {
         messageData={text:err}
       } else {
         console.log(response["output"]["text"][0]);
         messageData={text:response["output"]["text"][0].toString()}
       }
  });
  if(messageData!=undefined){
    sendTextMessage(sender,messageData);
  }
}
function sendTextMessage(sender, text) {

    //let messageData = { text:text }
    let messageData = {text:text};
    console.log("messageData: "+ messageData);
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
    });
}



function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "First card",
                    "subtitle": "Element #1 of an hscroll",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "web url"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }, {
                    "title": "Second card",
                    "subtitle": "Element #2 of an hscroll",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
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



app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i]
      let sender = event.sender.id
      if (event.message && event.message.text) {
        let text = event.message.text
        if (text === 'Generic') {
            sendGenericMessage(sender)
            continue
        }
        GetResponse(sender,text.substring(0, 200))
      }
      if (event.postback) {
        let text = JSON.stringify(event.postback)
        sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
        continue
      }
    }
    res.sendStatus(200)
  })


app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'));
})

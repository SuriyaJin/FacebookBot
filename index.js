'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
var ConversationV1 = require('watson-developer-cloud/conversation/v1')
const app = express()
app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot');
})



app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'Quittrix(Innovate the future)') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token')
})



const token = "EAAFCyO2pJmkBAHr0uCZCEB1s41cdTx9AAPkplZBphZBuontD2wkwTMtlVmshTmahfjpBZCV93fsJYfdgCZArjqQZAmy2z5xPtlOEwwchn8ooeEFcoFUskinT82yj2iAZCsckPG9Y7aL1rCa17Dr1ZB6L9bNG9NBrCCH1Ux3mscX1BwZDZD"
function GetResponse(sender, text){
  //var messageData="";
  var conversation = new ConversationV1({
    username: 'c3096497-5f08-4c2a-97c9-163ba205ca32',
    password: '8Di4neBhHYYV',
    version_date: ConversationV1.VERSION_DATE_2016_09_20
  });
  conversation.message({
    input: { text: text },
    workspace_id:'8541940c-3910-4d45-869d-5ab3fc27792b'
   }, function(err, response) {
       if (err) {
         messageData=err;
       } else {
         sendTextMessage(sender,response["output"]["text"][0]);
       }
  });
  }



function sendTextMessage(sender, text) {

    let messageData = { text:text }
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

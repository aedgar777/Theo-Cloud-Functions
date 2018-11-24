const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendNotification = functions.firestore.document('/dm_threads/{thread_id}/messages/{message_id}')
    .onCreate((snapshot, context) => {


        const newMessage = snapshot.data();

        const senderName = newMessage.authorName;
        const senderID = newMessage.authorUID;
        const messageText = newMessage.message;
        const recipientName = newMessage.recipientName;
        const recipientID = newMessage.recipientUID;
        var timestamp = new Date();
        timestamp = newMessage.timestamp;

        console.log(senderName + " " + senderID + " " + messageText + " " + recipientName + " " + recipientID + " " + timestamp.toString())


    });



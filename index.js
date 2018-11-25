const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendDMNotification = functions.firestore.document('/dm_threads/{thread_id}/messages/{message_id}')
    .onCreate((snapshot, context) => {


        const newMessage = snapshot.data();

        const senderName = newMessage.authorName;
        const senderID = newMessage.authorUID;
        const messageText = newMessage.message;
        const recipientName = newMessage.recipientName;
        const recipientID = newMessage.recipientUID;
        const timestamp = newMessage.timestamp.toString();

        console.log(senderName + " " + senderID + " " + messageText + " " + recipientName + " " + recipientID + " " + timestamp.toString())

        const deviceToken = admin.firestore.document(`/Users/${recipientID}/deviceToken`).once('value');

        return deviceToken.then(result => {

            const token_id = result.val();


            const payload = {
                notification: {
                    title: senderName,
                    body: messageText,
                    icon: "default"
                }
            };

            return admin.messaging().sendToDevice(token_id, payload).then(response => {

                console.log('Notification Feature')

            });


        });


    });



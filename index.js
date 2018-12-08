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

        let deviceTokenQuery = admin.firestore().collection(`/Users/${recipientID}/device_tokens`);

       return deviceTokenQuery.get().then(querySnapshot => {

            let tokens = querySnapshot.docs;


            tokens.map((token)=>{

                let token_id = token;


                const payload = {
                    notification: {
                        title: senderName,
                        body: messageText,
                        icon: "default"
                    }
                };


                admin.messaging().sendToDevice(token_id, payload).then(response => {

                    console.log('Notification sent to device with ID: ' + token_id)

                });

            })
           Promise.all(tokens);

        });

    });




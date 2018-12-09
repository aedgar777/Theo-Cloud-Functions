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
        const timestamp = newMessage.timestamp;

        console.log(senderName + " " + senderID + " " + messageText + " " + recipientName + " " + recipientID + " " + timestamp.toString());

        let deviceTokenQuery = admin.firestore().collection(`/Users/${recipientID}/device_tokens/`);

        return deviceTokenQuery.get().then(querySnapshot => {
            console.log('deviceTokenQuery returned');

            let tokens = querySnapshot.docs;

            console.log('1');


            const notificationPromises = tokens.map(token => {
                console.log('2');

                let token_id = token.tokenID.toString();

                console.log(token_id);
                console.log('3');

                const payload = {
                    notification: {
                        title: senderName,
                        body: messageText,
                        icon: "default"
                    }
                };


                return admin.messaging().sendToDevice(token_id, payload)

            });
            console.log('4')
            return Promise.all(notificationPromises);

        });

    });




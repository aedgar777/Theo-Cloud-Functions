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

        let deviceTokenQuery = admin.firestore().collection(`/users/${recipientID}/device_tokens/`);

        return deviceTokenQuery.get().then(querySnapshot => {

            let tokenShapshot = querySnapshot.docs;

            const notificationPromises = tokenShapshot.map(doc => {


                let token_id = doc.data().tokenID;

                console.log("token_id: " + token_id);


                const payload = {
                    notification: {
                        title: senderName,
                        body: messageText,
                        icon: "default"
                    }
                };


                return admin.messaging().sendToDevice(token_id, payload).then(response => {

                    console.log("Notification sent: ", response);
                    console.log(response.results[0].error);
                })
                    .catch(error => {

                        console.log("Error sending message: ", error);

                    });


            });

            return Promise.all(notificationPromises);

        });

    });




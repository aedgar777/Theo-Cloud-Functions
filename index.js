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
        var notificationsOn = null;

        console.log(senderName + " " + senderID + " " + messageText + " " + recipientName + " " + recipientID + " " + timestamp.toString());

        let deviceTokenQuery = admin.firestore().collection(`/users/${recipientID}/device_tokens/`);

        var idsToBeSorted = [senderID, recipientID];
        idsToBeSorted.sort();
        var threadID = idsToBeSorted[0]+idsToBeSorted[1];
        console.log(threadID);
        let recipientThread = functions.firestore.document(`users/${recipientID}/threads/${threadID}`);

        recipientThread
            .onUpdate((snapshot, context) => {
            const threadDetails = snapshot.data();

            notificationsOn = threadDetails.notificationsOn;

        });

        if (notificationsOn !== false) {

            return deviceTokenQuery.get().then(querySnapshot => {

                let tokenShapshot = querySnapshot.docs;

                const notificationPromises = tokenShapshot.map(doc => {


                    let token_id = doc.data().tokenID;

                    console.log("token_id: " + token_id);


                    const payload = {
                        notification: {
                            title: senderName,
                            body: messageText,
                        },
                        data: {

                            senderID: senderID,
                            senderName: senderName

                        }

                    };


                    return admin.messaging().sendToDevice(token_id, payload).then(response => {

                        console.log("Notification sent: ", response);
                    })
                        .catch(error => {

                            console.log("Error sending message: ", error);

                        });


                });

                return Promise.all(notificationPromises);

            });

        }

    });




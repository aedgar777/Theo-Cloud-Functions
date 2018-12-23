const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendDMNotification = functions.firestore.document('/dm_threads/{thread_id}/messages/{message_id}')
    .onCreate((snapshot, context) => {


        const newMessage = snapshot.data();

        const senderName = newMessage.authorName;
        const senderID = newMessage.authorUID;
        const messageText = newMessage.message;
        const recipientID = newMessage.recipientUID;
        var notificationsOn = null;

        var idsToBeSorted = [senderID, recipientID];
        idsToBeSorted.sort();
        var threadID = idsToBeSorted[0] + idsToBeSorted[1];


        console.log(recipientID);
        console.log(threadID);


        return admin.firestore().collection(`users/${recipientID}/threads/${threadID}/settings`).doc(`notificationsOn`).get().then(queryResult => {


            let notificationsOn = queryResult.data().storedBoolean;
            console.log("notificationsOn: " +notificationsOn);


            if (notificationsOn !== false) {

                return admin.firestore().collection(`/users/${recipientID}/device_tokens/`).get().then(querySnapshot => {

                    let tokenShapshot = querySnapshot.docs;

                    const notificationPromises = tokenShapshot.map(doc => {


                        let token_id = doc.data().tokenID;

                        console.log("token ID: " + token_id);


                        const payload = {

                            data: {

                                title: senderName,
                                body: messageText,
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

            return;


        });

    });











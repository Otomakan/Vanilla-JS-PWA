const bodyParser = require('body-parser');
const express = require('express');
const cron = require('node-cron');
const app = express();
const port = 3000;
const webPush = require('web-push');
require('dotenv').config();

console.log(webPush.generateVAPIDKeys());

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
// const
webPush.setVapidDetails(
  'https://serviceworke.rs/',
  vapidPublicKey,
  vapidPrivateKey
);
const hardCodedSubscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/dS02aQyd8kM:APA91bHUzp--sdVCWPGMQYXHaJLRxbXJfo-lW_3qAmEIW-_r44ADPvrNjuaqVFVhwR-x8WjXaESJ31eLdNmWHApN055qGqS9t3nlo1HXnRcpTIehYDEG9LZoAhoLvHArcetOy5Ysk-mf',
  expirationTime: null
};
// We want to use JSON to communicate with our app parse application/json
const registerTasks = () => {
  cron.schedule('30 8 * * *', () => {
    console.log('Time for you morning pill!');
  });
  cron.schedule('30 15 * * *', () => {
    console.log('Time for you arvo pill!');
  });
  cron.schedule('3 10 * * *', () => {
    console.log('Time for you evening pill!');
  });
  cron.schedule('* * * * * *', () => {
    const payload = null;
    const options = {
      'TTL': 0
    };
    webPush.sendNotification(hardCodedSubscription, payload, options)
      .then(function(res) {
        res.sendStatus(201);
      }).catch(e=>{
        console.log(e)
      })
  });
};

app.use(express.static('public'));
// Tasks
registerTasks();
app.use(bodyParser.json());

app.get('/vapid-public-key', (req, res) => res.send({ vapidPublicKey }));

app.get('/public');

app.listen(port, () => console.log(`Listening on port ${port}!`));

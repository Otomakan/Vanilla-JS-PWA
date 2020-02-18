const bodyParser = require('body-parser');
const express = require('express');
const cron = require('node-cron');
const app = express();
const port = 3000;
const webPush = require('web-push');
// const storage = require('node-persist');

require('dotenv').config();

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
// const
webPush.setVapidDetails(
  'https://jmisteli.com',
  vapidPublicKey,
  vapidPrivateKey
);

const allSubscriptions = {};

// We want to use JSON to communicate with our app parse application/json
const registerTasks = (subscription) => {
  const endpoint = subscription.endpoint;

  // My remote machine is on UTC time and I live in Japan so I made the appropriate calculation
  const morningTask = cron.schedule('30 23 * * *', () => {
    sendNotification(subscription, JSON.stringify({ timeOfDay: 'morning' }));
  });
  const afternoonTask = cron.schedule('30 6 * * *', () => {
    sendNotification(subscription, JSON.stringify({ timeOfDay: 'afternoon' }));
  });
  const nightTask = cron.schedule('15 14 * * *', () => {
    sendNotification(subscription, JSON.stringify({ timeOfDay: 'evening' }));
  });

  allSubscriptions[endpoint] = [morningTask, afternoonTask, nightTask];
};

app.use(express.static('public'));
// Tasks
app.use(bodyParser.json());

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  registerTasks(subscription);
  console.log(allSubscriptions);
  res.send('subscribed!');
});

app.get('/vapid-public-key', (req, res) => res.send({ vapidPublicKey }));

app.get('/public');

app.listen(port, () => console.log(`Listening on port ${port}!`));

const sendNotification = (subscription, payload) => {
  console.log('send Notification');
  console.log(subscription);
  const options = {
    TTL: 0
  };
  if (!subscription.keys) {
    payload = payload || null;
  }

  console.log(payload, 'payload');

  webPush.sendNotification(subscription, payload, options)
    .then(res => {
      console.log('sent');
    }).catch(e => {
      console.log(e);
    });
};

app.post('/unsubscribe', (req, res) => {
  console.log(req.body);
  const endpoint = req.body.endpoint;
  allSubscriptions[endpoint].forEach(task => {
    // destroy allows us to delete a task
    task.destroy();
  });
  delete allSubscriptions[endpoint]
});

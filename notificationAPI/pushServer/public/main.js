(async () => {
  const registration = await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();

  // If we don't have a subscription we have to create it!
  if (!subscription) {
    subscription = await subscribe(registration);
  }

  // The subscription object in chrome:
  //  endpoint: "https://fcm.googleapis.com/fcm/send/cyMiHqakiZE:APA91bFUIYbrvtnSGw0dwargHllB2BGJiwNu-Svf7KkpRM9YQ8PrCzpr8gOQxHCPXD-4Y-lGcQmZDpyZ8I8Gugv2RmOWRAU0sO7DfvB5XoyeO7hHU4KMtiDulQ8mY-fj5xhyOxPejIvF"
  // expirationTime: null
  // keys:
  // p256dh: "BJG5rNdalnpu6yuRSuly3H221ljDVYRvDmEx_F6qNllUONAR8vJ_R03c8qgR06O2sfa1hvFzpR5b7iVRitRS-Qk"
  // auth: "zG9-yhkAzIdknhMW0d89Aw"

  document.getElementById('unsubscribe').onclick = () => unsubscribe();
})().catch(e => {
  alert(`There has been an error 
        ${e.toString()}`);
  throw e;
});

// As soon as you run this code once it shouldn't run again if the initiatial subscription went well
// Except if you clear your storage
const subscribe = async (registration) => {
  // First get a public key from our server
  const response = await fetch('/vapid-public-key');
  const body = await response.json();
  const vapidPublicKey = body.vapidPublicKey;

  // this is an annoying part of the process we have to turn our public key
  const Uint8ArrayPublicKey = urlBase64ToUint8Array(vapidPublicKey);

  // registering a new subscription
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: Uint8ArrayPublicKey
  });

  await fetch('/subscribe',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription.toJSON())
    });
  return subscription;
};

const unsubscribe = async () => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  await subscription.unsubscribe();
  await fetch('/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON())
  });
  writeSubscriptionStatus('Unsubscribed');
};

const writeSubscriptionStatus = (subscriptionStatus) => {
  document.getElementById('status').innerHTML = subscriptionStatus;
};

// I have found this code (or variations of) from; multiple sources
// but I could not find the original author
const urlBase64ToUint8Array = (base64String) => {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

(async () => {
  console.log('in await');
  const registration = await navigator.serviceWorker.ready;
  console.log(registration);

  let subscription = await registration.pushManager.getSubscription();

  // If we don't have a subscription we have to create it!
  if (!subscription) {
    subscription = await subscribe(registration);
  }

  // The subscription object in chrome:
  // {
  //   endpoint: "https://fcm.googleapis.com/fcm/send/dS02aQyd8kM:APA91bHUzp--sdVCWPGMQYXHaJLRxbXJfo-lW_3qAmEIW-_r44ADPvrNjuaqVFVhwR-x8WjXaESJ31eLdNmWHApN055qGqS9t3nlo1HXnRcpTIehYDEG9LZoAhoLvHArcetOy5Ysk-mf",
  //   expirationTime: null
  // }

  console.log(subscription);
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

  return subscription;
};

// I have found this code (or variations of) from multiple sources
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

const logoUrl = '/images/icons/icon-512x512.png';
// Util function to have formatted minutes and seconds
const addZeroToTime = (time) => {
	if (time < 10)
		time = '0' + time;
	return time;
};

const oneSecPlease = async (time) => {
	await new Promise(resolve => setTimeout(() => { resolve(); }, 1000));
	return time - 1;
};

const defaultNotification = {
	requireInteraction: true,
	vibrate: [200, 100, 200],
	icon: logoUrl,
	// image will try to fetch the image from the url online, if it can't reach it there will be a delay
	image: 'https://picsum.photos/300/200'
};

const work = async (state) => {
	const stopWorking = () => {
		state.status = 'Time to rest!';

		const notificationOptions = {
			...defaultNotification,
			body : 'Stop Working',
			// actions: [{
			// 	title: 'rest',
			// 	action: () => { state.status = 'resting';}
			// },{
			// 	title: 'Call it a day',
			// 	action: () => { console.log('Bye bye');}
			// }]
		};
		var notification = new Notification('Stop Working', notificationOptions);
		// notification.onclick =  () => { state.status = 'resting' };

		// notification.onclose =  () => {  state.status = 'resting' };
		console.log(notification);
	};
	
	state.time = state.workTime;

	while (state.time !== 0) {
		state.time = await oneSecPlease(state.time);
	}

	stopWorking();
};

const rest = async (state) => {
	const stopResting = () => {
		state.status = 'Ok you can work now :)';
		const notificationOptions = {
			...defaultNotification,
			body : 'Stop resting',
		};
		var notification = new Notification('Stop resting', notificationOptions);
		notification.onclick =  ()=> { state.status = 'working'; };
		notification.onclose =  () => {state.status = 'working'; };
		console.log(notification);
	};

	state.time = state.restTime;
	
	while (state.time !== 0) {
		state.time = await oneSecPlease(state.time);
	}

	stopResting();
};

(async () => {

	const appState = new Proxy({
		status: '',
		time : 0,
		restTime: 1000,
		workTime: 5
	}, {
		set : (target, prop, val) => {
			if (prop === 'status') {
				if (val === 'working')
					work(appState);
				else if (val === 'resting')
					rest(appState);
				document.getElementById('status').innerHTML = val;
			}
			else if (prop === 'time') {
				const minutesLeft =  addZeroToTime(Math.floor(val / 60));
				const secondsLeft = addZeroToTime(val % 60);
				document.getElementById('timer').innerHTML = minutesLeft + ' : ' + secondsLeft;
			}
			target[prop] = val;
		}
	});


	appState.status =  'working';

	// Checking if we already have permission to send notifications
	const notificationsAllowed = await navigator.permissions.query({name: 'notifications'});

	if (notificationsAllowed.state !== 'granted'){
		window.alert('we need your permission');
		// Requesting permission
		const permission = await Notification.requestPermission();

		// If the permission is not granted the application won't work
		if (permission !== 'granted') {
			// I am a very sour developer
			document.body.innerHTML = '<h1> This app can\'t work without notification bye </h1>';
			return;
		}
	}

	

	// appState.status === 'rest' ? rest(appState) : work(appState);
})();


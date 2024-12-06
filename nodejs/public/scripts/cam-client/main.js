const sendButton = document.getElementById('send');
const rfidInput = document.getElementById('rfid');

sendButton.addEventListener('click', () => {
	const rfid = rfidInput.value;
	fetch('http://192.168.1.210:3000/api/security-gate/auth-door', {
		method: 'POST',
		body: rfid,
	})
		.then((response) => response.json())
		.then((data) => {
			console.log('Success:', data);
		})
		.catch((error) => {
			console.error('Error:', error);
		});
});

const ADDRESS =
	'wss://192.168.1.210:3000?source=esp32cam_security_gate_send_img';
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const context = canvas.getContext('2d');
const websocket = new WebSocket(ADDRESS);

// Get access to the camera
navigator.mediaDevices
	.getUserMedia({
		video: {
			facingMode: 'default',
			width: 480,
			height: 640,
			frameRate: 25,
		},
	})
	.then((stream) => {
		video.srcObject = stream;
	})
	.catch((err) => {
		console.error('Error accessing the camera: ', err);
		alert(
			'Camera access is required to use this feature. Please enable camera access in your browser settings.'
		);
	});

websocket.onopen = async () => {
	console.log('WebSocket connection opened');
	setInterval(() => {
		context.drawImage(video, 0, 0, 640, 480); // Swapped width and height
		const imageData = canvas.toDataURL('image/jpeg');
		const binary = atob(imageData.split(',')[1]);
		const array = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			array[i] = binary.charCodeAt(i);
		}

		websocket.send(array.buffer);
	}, 1000 / 25); // Capture and send image every second
};

websocket.onclose = () => {
	console.log('WebSocket connection closed');
};

websocket.onerror = (error) => {
	console.error('WebSocket error: ', error);
};

captureButton.addEventListener('click', () => {
	context.drawImage(video, 0, 0, canvas.width, canvas.height); // Swapped width and height
	const imageData = canvas.toDataURL('image/jpeg');
	const binary = atob(imageData.split(',')[1]);
	const array = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		array[i] = binary.charCodeAt(i);
	}
	websocket.send(array.buffer);
});

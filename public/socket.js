const socket = io();

socket.on('yourInfo', ({ username, coin }) => {
  console.log(username, coin);
})

socket.on('result', ({status, coin}) => {
	console.log(status, coin);
})

socket.on('roll', dice => {
  console.log(dice);
})
import socketio from 'socket.io-client';

const socket = socketio('http://192.168.1.5:3333', {
  autoConnect: false,
});

function subscribeToNewDevs(subscribeFuncion) {
  socket.on('new-dev', subscribeFuncion);
}

function connect(latitude, longitude, techs) {
  socket.io.opts.query = {
    latitude, longitude, techs
  };

  socket.connect();
}

function disconnect() {
  if (socket.connect) {
    socket.disconnect();
  }
}

export {
  connect,
  disconnect,
  subscribeToNewDevs,
};

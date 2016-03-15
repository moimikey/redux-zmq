import MsgPack from 'msgpack';

export default zmq => {
  return ({dispatch}) => {
    return next => action => {
      if (!action.sock) {
        return next(action);
      }
      console.log('zmqMiddleWare :: ', action);

      const {type, sock, ...rest} = action;
      console.log('zmqMiddleWare :: ', sock, type, rest);

      if (type) {
        next({type, ...rest});
      }

      switch (type) {
        case 'CONNECT':
          zmq.connect(`tcp://${sock.ip}:5556`);
          break;
        case 'COMMAND':
          zmq.send(sock.cmd);
          break;
        default:
          break;
      }

      zmq.on('connect', () => {
        console.log('zmqMiddleWare :: on connect');
        dispatch({
          type: 'CONNECTED'
        });
      });

      zmq.on('disconnect', () => {
        dispatch({
          type: 'DISCONNECTED'
        });
      });

      zmq.on('message', reply => {
        const data = MsgPack.unpack(reply);
        dispatch({
          type: 'DATA',
          cmd: sock.cmd,
          data
        });
      });
    };
  };
};

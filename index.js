export default zeromq => {
  return ({dispatch}) => {
    let connectTimer;

    zeromq.on('connect', () => {
      clearTimeout(connectTimer);
      dispatch({
        type: 'CONNECTED'
      });
    });

    zeromq.on('disconnect', () => {
      dispatch({
        type: 'DISCONNECTED'
      });
    });

    zeromq.on('message', data => {
      dispatch({
        type: 'MESSAGE',
        data
      });
    });

    return next => action => {
      if (!action.zmq) {
        return next(action);
      }

      const {type, zmq, ...rest} = action;

      if (type) {
        next({type, ...rest});
      }

      switch (type) {
        case 'CONNECT':
          console.log('CONNECT :: ', zmq);
          zeromq.connect(`tcp://${zmq.ip}:${zmq.port}`);

          dispatch({
            type: 'CONNECTING'
          });

          connectTimer = setTimeout(() => {
            dispatch({
              type: 'ERROR',
              message: 'Not able to connect to server'
            });
          }, 5000);
          break;
        case 'COMMAND':
          zeromq.send(zmq.cmd);
          break;
        default:
          break;
      }
    };
  };
};

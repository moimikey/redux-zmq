'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (zeromq) {
  return function (_ref) {
    var dispatch = _ref.dispatch;

    var connectTimer = void 0;

    zeromq.on('connect', function () {
      clearTimeout(connectTimer);
      dispatch({
        type: 'CONNECTED'
      });
    });

    zeromq.on('disconnect', function () {
      dispatch({
        type: 'DISCONNECTED'
      });
    });

    zeromq.on('message', function (data) {
      dispatch({
        type: 'MESSAGE',
        data: data
      });
    });

    return function (next) {
      return function (action) {
        if (!action.zmq) {
          return next(action);
        }

        var type = action.type;
        var zmq = action.zmq;
        var rest = (0, _objectWithoutProperties3.default)(action, ['type', 'zmq']);


        if (type) {
          next((0, _extends3.default)({ type: type }, rest));
        }

        switch (type) {
          case 'CONNECT':
            console.log('CONNECT :: ', zmq);
            zeromq.connect('tcp://' + zmq.ip + ':' + zmq.port);

            dispatch({
              type: 'CONNECTING'
            });

            connectTimer = setTimeout(function () {
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
};

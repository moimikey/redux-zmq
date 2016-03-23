import test from 'ava';
import 'babel-core/register';
import sinon from 'sinon';

import createZmqMiddleware from './index';

// let store;
// let next;
// let action;

const zmqMock = {
  on: sinon.spy(),
  connect: sinon.spy(),
  send: sinon.spy()
};

const zmqMiddleware = createZmqMiddleware(zmqMock);

const doDispatch = sinon.spy();
const doGetState = sinon.spy();

const nextHandler = zmqMiddleware({
  dispatch: doDispatch,
  getState: doGetState
});

test('handle next', t => {
  const actionHandler = nextHandler();

  t.is(typeof actionHandler, 'function');
});

test('zmq bindings', t => {
  createZmqMiddleware(zmqMock);

  t.true(zmqMock.on.calledThrice);
});

test('zmq connect', t => {
  const action = {
    type: 'CONNECT',
    zmq: {
      ip: 'localhost',
      port: 5555
    }
  };

  nextHandler(sinon.spy())(action);
  t.true(doDispatch.calledOnce);
  t.true(doDispatch.calledWith({
    type: 'CONNECTING'
  }));
  t.true(zmqMock.connect.calledOnce);
  t.true(zmqMock.connect.calledWith('tcp://localhost:5555'));
});

test('pass action to next', t => {
  const action = {};

  const actionHandler = nextHandler(act => {
    t.same(action, act);
  });

  actionHandler(action);
});

// test('bar', async t => {
//   const bar = Promise.resolve('bar');

//   t.is(await bar, 'bar');
// });

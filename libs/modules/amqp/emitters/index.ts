import { EventEmitter } from 'events';

export const requestEmitter = new EventEmitter();
export const responseEmitter = new EventEmitter();
export const replyEmitter = new EventEmitter();

requestEmitter.setMaxListeners(0);
responseEmitter.setMaxListeners(0);
replyEmitter.setMaxListeners(0);

/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

let microTaskQueue: Shumway.Shell.MicroTasksQueue = null;

this.self = this;
this.window = this;

declare function print(message: string): void;

this.console = {
	_print: print,
	log: print,
	info: function () {
		if (!Shumway.Shell.verbose) {
			return;
		}
		print(Shumway.IndentingWriter.YELLOW + Shumway.argumentsToString(arguments) +
			Shumway.IndentingWriter.ENDC);
	},
	warn: function () {
		print(Shumway.IndentingWriter.RED + Shumway.argumentsToString(arguments) +
			Shumway.IndentingWriter.ENDC);
	},
	error: function () {
		print(Shumway.IndentingWriter.BOLD_RED + Shumway.argumentsToString(arguments) +
			Shumway.IndentingWriter.ENDC + '\nstack:\n' + (new Error().stack));
	},
	time: function () {
	},
	timeEnd: function () {
	}
};

this.dump = function (message: any) {
	putstr(Shumway.argumentsToString(arguments));
};

this.addEventListener = function (type: any) {
	// console.log('Add listener: ' + type);
};

let defaultTimerArgs: Array<any> = [];
this.setTimeout = function (fn: any, interval: number) {
	let args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : defaultTimerArgs;
	let task = microTaskQueue.scheduleInterval(fn, args, interval, false);
	return task.id;
};
this.setInterval = function (fn: any, interval: number) {
	let args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : defaultTimerArgs;
	let task = microTaskQueue.scheduleInterval(fn, args, interval, true);
	return task.id;
};
this.clearTimeout = function (id: any) {
	microTaskQueue.remove(id);
};
this.clearInterval = clearTimeout;

this.navigator = {
	userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:4.0) Gecko/20100101 Firefox/4.0'
};

// TODO remove document stub
this.document = {
	createElementNS: function (ns: any, qname: any) {
		if (qname !== 'svg') {
			throw new Error('only supports svg and create SVGMatrix');
		}
		return {
			createSVGMatrix: function () {
				return {a: 0, b: 0, c: 0, d: 0, e: 0, f: 0};
			}
		};
	},
	createElement: function (name: any) {
		if (name !== 'canvas') {
			throw new Error('only supports canvas');
		}
		return {
			getContext: function (type: any) {
				if (type !== '2d') {
					throw new Error('only supports canvas 2d');
				}
				return {};
			}
		}
	},
	location: {
		href: {
			resource: ""//shumway/build/ts/shell.js"
		}
	}
};

this.Image = function () {
};
this.Image.prototype = {};

this.URL = function (url: any, baseURL = '') {
	url = url + '';
	baseURL = baseURL + '';
	if (url.indexOf('://') >= 0 || baseURL === url) {
		this._setURL(url);
		return;
	}

	let base = baseURL || '';
	base = base.lastIndexOf('/') >= 0 ? base.substring(0, base.lastIndexOf('/') + 1) : '';
	if (url.indexOf('/') === 0) {
		let m = /^[^:]+:\/\/[^\/]+/.exec(base);
		if (m) base = m[0];
	}
	this._setURL(base + url);
};
this.URL.prototype = {
	_setURL: function (url: any) {
		this.href = url + '';
		// Simple parsing to extract protocol, hostname and port.
		let m = /^(\w+:)\/\/([^:/]+)(:([0-9]+))?/.exec(url.toLowerCase());
		if (m) {
			this.protocol = m[1];
			this.hostname = m[2];
			this.port = m[4] || '';
		} else {
			this.protocol = 'file:';
			this.hostname = '';
			this.port = '';
		}
	},
	toString: function () {
		return this.href;
	}
};
this.URL.createObjectURL = function createObjectURL() {
	return "";
};

this.Blob = function () {
};
this.Blob.prototype = {};

this.XMLHttpRequest = function () {
};
this.XMLHttpRequest.prototype = {
	open: function (method: any, url: any, async: any) {
		this.url = url;
		if (async === false) {
			throw new Error('Unsupported sync');
		}
	},
	send: function (data: any) {
		setTimeout(function () {
			try {
				console.log('XHR: ' + this.url);
				let response = this.responseType === 'arraybuffer' ?
					read(this.url, 'binary').buffer : read(this.url);
				if (this.responseType === 'json') {
					response = JSON.parse(response);
				}
				this.response = response;
				this.readyState = 4;
				this.status = 200;
				this.onreadystatechange && this.onreadystatechange();
				this.onload && this.onload();
			} catch (e) {
				this.error = e;
				this.readyState = 4;
				this.status = 404;
				this.onreadystatechange && this.onreadystatechange();
				this.onerror && this.onerror();
			}
		}.bind(this));
	}
}

this.window.screen = {
	width: 1024,
	height: 1024
};

/**
 * sessionStorage polyfill.
 */
let sessionStorageObject: { [key: string]: string } = {};
this.window.sessionStorage = {
	getItem: function (key: string): string {
		return sessionStorageObject[key];
	},
	setItem(key: string, value: string): void {
		sessionStorageObject[key] = value;
	},
	removeItem(key: string): void {
		delete sessionStorageObject[key];
	}
};

/**
 * Promise polyfill.
 */
this.window.Promise = (function () {
	function getDeferred(C: any) {
		if (typeof C !== 'function') {
			throw new TypeError('Invalid deferred constructor');
		}
		let resolver = createDeferredConstructionFunctions();
		let promise = new C(resolver);
		let resolve = resolver.resolve;
		if (typeof resolve !== 'function') {
			throw new TypeError('Invalid resolve construction function');
		}
		let reject = resolver.reject;
		if (typeof reject !== 'function') {
			throw new TypeError('Invalid reject construction function');
		}
		return {promise: promise, resolve: resolve, reject: reject};
	}

	function updateDeferredFromPotentialThenable(x: any, deferred: any) {
		if (typeof x !== 'object' || x === null) {
			return false;
		}
		try {
			let then = x.then;
			if (typeof then !== 'function') {
				return false;
			}
			let thenCallResult = then.call(x, deferred.resolve, deferred.reject);
		} catch (e) {
			let reject = deferred.reject;
			reject(e);
		}
		return true;
	}

	function isPromise(x: any) {
		return typeof x === 'object' && x !== null &&
			typeof x.promiseStatus !== 'undefined';
	}

	function rejectPromise(promise: any, reason: any) {
		if (promise.promiseStatus !== 'unresolved') {
			return;
		}
		let reactions = promise.rejectReactions;
		promise.result = reason;
		promise.resolveReactions = undefined;
		promise.rejectReactions = undefined;
		promise.promiseStatus = 'has-rejection';
		triggerPromiseReactions(reactions, reason);
	}

	function resolvePromise(promise: any, resolution: any) {
		if (promise.promiseStatus !== 'unresolved') {
			return;
		}
		let reactions = promise.resolveReactions;
		promise.result = resolution;
		promise.resolveReactions = undefined;
		promise.rejectReactions = undefined;
		promise.promiseStatus = 'has-resolution';
		triggerPromiseReactions(reactions, resolution);
	}

	function triggerPromiseReactions(reactions: any, argument: any) {
		for (let i = 0; i < reactions.length; i++) {
			queueMicrotask({reaction: reactions[i], argument: argument});
		}
	}

	function queueMicrotask(task: any) {
		if (microtasksQueue.length === 0) {
			setTimeout(handleMicrotasksQueue, 0);
		}
		microtasksQueue.push(task);
	}

	function executePromiseReaction(reaction: any, argument: any) {
		let deferred = reaction.deferred;
		let handler = reaction.handler;
		let handlerResult, updateResult;
		try {
			handlerResult = handler(argument);
		} catch (e) {
			let reject = deferred.reject;
			return reject(e);
		}

		if (handlerResult === deferred.promise) {
			let reject = deferred.reject;
			return reject(new TypeError('Self resolution'));
		}

		try {
			updateResult = updateDeferredFromPotentialThenable(handlerResult,
				deferred);
			if (!updateResult) {
				let resolve = deferred.resolve;
				return resolve(handlerResult);
			}
		} catch (e) {
			let reject = deferred.reject;
			return reject(e);
		}
	}

	let microtasksQueue: Array<any> = [];

	function handleMicrotasksQueue() {
		while (microtasksQueue.length > 0) {
			let task = microtasksQueue[0];
			try {
				executePromiseReaction(task.reaction, task.argument);
			} catch (e) {
				// unhandler onFulfillment/onRejection exception
				if (typeof (<any>Promise).onerror === 'function') {
					(<any>Promise).onerror(e);
				}
			}
			microtasksQueue.shift();
		}
	}

	function throwerFunction(e: any) {
		throw e;
	}

	function identityFunction(x: any) {
		return x;
	}

	function createRejectPromiseFunction(promise: any) {
		return function (reason: any) {
			rejectPromise(promise, reason);
		};
	}

	function createResolvePromiseFunction(promise: any) {
		return function (resolution: any) {
			resolvePromise(promise, resolution);
		};
	}

	function createDeferredConstructionFunctions(): any {
		let fn: any = function (resolve: any, reject: any) {
			fn.resolve = resolve;
			fn.reject = reject;
		};
		return fn;
	}

	function createPromiseResolutionHandlerFunctions(promise: any,
	                                                 fulfillmentHandler: any, rejectionHandler: any) {
		return function (x: any) {
			if (x === promise) {
				return rejectionHandler(new TypeError('Self resolution'));
			}
			let cstr = promise.promiseConstructor;
			if (isPromise(x)) {
				let xConstructor = x.promiseConstructor;
				if (xConstructor === cstr) {
					return x.then(fulfillmentHandler, rejectionHandler);
				}
			}
			let deferred = getDeferred(cstr);
			let updateResult = updateDeferredFromPotentialThenable(x, deferred);
			if (updateResult) {
				let deferredPromise = deferred.promise;
				return deferredPromise.then(fulfillmentHandler, rejectionHandler);
			}
			return fulfillmentHandler(x);
		};
	}

	function createPromiseAllCountdownFunction(index: number, values: Array<any>, deferred: any,
	                                           countdownHolder: any) {
		return function (x: any) {
			values[index] = x;
			countdownHolder.countdown--;
			if (countdownHolder.countdown === 0) {
				deferred.resolve(values);
			}
		};
	}

	function Promise(resolver: any) {
		if (typeof resolver !== 'function') {
			throw new TypeError('resolver is not a function');
		}
		let promise = this;
		if (typeof promise !== 'object') {
			throw new TypeError('Promise to initialize is not an object');
		}
		promise.promiseStatus = 'unresolved';
		promise.resolveReactions = [];
		promise.rejectReactions = [];
		promise.result = undefined;

		let resolve = createResolvePromiseFunction(promise);
		let reject = createRejectPromiseFunction(promise);

		try {
			let result = resolver(resolve, reject);
		} catch (e) {
			rejectPromise(promise, e);
		}

		promise.promiseConstructor = Promise;
		return promise;
	}

	(<any>Promise).all = function (iterable: any) {
		let deferred = getDeferred(this);
		let values: Array<any> = [];
		let countdownHolder = {countdown: 0};
		let index = 0;
		iterable.forEach(function (nextValue: any) {
			let nextPromise = this.cast(nextValue);
			let fn = createPromiseAllCountdownFunction(index, values,
				deferred, countdownHolder);
			nextPromise.then(fn, deferred.reject);
			index++;
			countdownHolder.countdown++;
		}, this);
		if (index === 0) {
			deferred.resolve(values);
		}
		return deferred.promise;
	};
	(<any>Promise).cast = function (x: any) {
		if (isPromise(x)) {
			return x;
		}
		let deferred = getDeferred(this);
		deferred.resolve(x);
		return deferred.promise;
	};
	(<any>Promise).reject = function (r: any) {
		let deferred = getDeferred(this);
		let rejectResult = deferred.reject(r);
		return deferred.promise;
	};
	(<any>Promise).resolve = function (x: any) {
		let deferred = getDeferred(this);
		let rejectResult = deferred.resolve(x);
		return deferred.promise;
	};
	Promise.prototype = {
		'catch': function (onRejected: any) {
			this.then(undefined, onRejected);
		},
		then: function (onFulfilled: any, onRejected: any) {
			let promise = this;
			if (!isPromise(promise)) {
				throw new TypeError('this is not a Promises');
			}
			let cstr = promise.promiseConstructor;
			let deferred = getDeferred(cstr);

			let rejectionHandler = typeof onRejected === 'function' ? onRejected :
				throwerFunction;
			let fulfillmentHandler = typeof onFulfilled === 'function' ? onFulfilled :
				identityFunction;
			let resolutionHandler = createPromiseResolutionHandlerFunctions(promise,
				fulfillmentHandler, rejectionHandler);

			let resolveReaction = {deferred: deferred, handler: resolutionHandler};
			let rejectReaction = {deferred: deferred, handler: rejectionHandler};

			switch (promise.promiseStatus) {
				case 'unresolved':
					promise.resolveReactions.push(resolveReaction);
					promise.rejectReactions.push(rejectReaction);
					break;
				case 'has-resolution':
					let resolution = promise.result;
					queueMicrotask({reaction: resolveReaction, argument: resolution});
					break;
				case 'has-rejection':
					let rejection = promise.result;
					queueMicrotask({reaction: rejectReaction, argument: rejection});
					break;
			}
			return deferred.promise;
		}
	};

	return Promise;
})();

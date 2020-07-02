/*
 * Copyright 2015 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Implementation of the built-in ActionScript classes. Here we will implement
// functions and object prototypes that will be exposed to the AVM1 code.

module Shumway.AVM1.Natives {
	// Object natives

	class AVM1ObjectPrototype extends AVM1Object {
		public constructor(context: IAVM1Context) {
			super(context);
			// Initialization must be perfromed later after the Function creation.
			// See the _initializePrototype and createBuiltins below.
		}

		_initializePrototype() {
			let context = this.context;
			alDefineObjectProperties(this, {
				constructor: {
					value: context.builtins.Object,
					writable: true
				},
				valueOf: {
					value: this._valueOf,
					writable: true
				},
				toString: {
					value: this._toString,
					writable: true
				},
				addProperty: {
					value: this.addProperty
				},
				hasOwnProperty: {
					value: this.hasOwnProperty
				},
				isPropertyEnumerable: {
					value: this.isPropertyEnumerable
				},
				isPrototypeOf: {
					value: this.isPrototypeOf
				},
				unwatch: {
					value: this.unwatch
				},
				watch: {
					value: this.watch
				}
			});
		}

		public _valueOf() {
			return this;
		}

		public _toString() {
			if (alIsFunction(this)) {
				// Really weird case of functions.
				return '[type ' + alGetObjectClass(this) + ']';
			}
			return '[object ' + alGetObjectClass(this) + ']';
		}

		public addProperty(name: any, getter: any, setter: any) {
			if (typeof name !== 'string' || name === '') {
				return false;
			}
			if (!alIsFunction(getter)) {
				return false;
			}
			if (!alIsFunction(setter) && setter !== null) {
				return false;
			}
			let desc = this.alGetOwnProperty(name);
			if (desc && !!(desc.flags & AVM1PropertyFlags.DONT_DELETE)) {
				return false; // protected property
			}
			this.alSetOwnProperty(name, new AVM1PropertyDescriptor(AVM1PropertyFlags.ACCESSOR, null,
				getter, setter || undefined));
			return true;
		}

		public hasOwnProperty(name: any): boolean {
			return this.alHasOwnProperty(name);
		}

		public isPropertyEnumerable(name: any): boolean {
			let desc = this.alGetProperty(name);
			return !(desc.flags & AVM1PropertyFlags.DONT_ENUM);
		}

		public isPrototypeOf(theClass: AVM1Function): boolean {
			return alInstanceOf(this.context, this, theClass);
		}

		public unwatch(name: string): boolean {
			name = alCoerceString(this.context, name);
			return this.alRemotePropertyWatcher(name);
		}

		public watch(name: string, callback: AVM1Function, userData?: any): boolean {
			name = alCoerceString(this.context, name);
			if (!alIsFunction(callback)) {
				return false;
			}
			return this.alAddPropertyWatcher(name, callback, userData);
		}
	}

	export class AVM1ObjectFunction extends AVM1Function {
		public constructor(context: IAVM1Context) {
			super(context);
			this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
			let proto = context.builtins.Object.alGetPrototypeProperty();
			alDefineObjectProperties(this, {
				prototype: {
					value: proto
				},
				registerClass: {
					value: this.registerClass
				}
			});
		}

		public registerClass(name: any, theClass: any) {
			this.context.registerClass(name, theClass);
		}

		public alConstruct(args?: any[]): AVM1Object {
			if (args) {
				let value = args[0];
				if (value instanceof AVM1Object) {
					return value;
				}
				switch (typeof value) {
					case 'string':
					case 'boolean':
					case 'number':
						return alToObject(this.context, value);
				}
			}
			// null or undefined
			return alNewObject(this.context);
		}

		public alCall(thisArg: any, args?: any[]): any {
			if (!args || args[0] === null || args[0] === undefined) {
				return alNewObject(this.context);
			}
			return alToObject(this.context, args[0]);
		}
	}

	// Function natives

	class AVM1FunctionPrototype extends AVM1Object {
		public constructor(context: IAVM1Context) {
			super(context);
		}

		_initializePrototype() {
			let context = this.context;
			this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
			alDefineObjectProperties(this, {
				constructor: {
					value: context.builtins.Function,
					writable: true
				},
				call: this.call,
				apply: this.apply
			});
		}

		public call(thisArg: any, ...args: any[]): any {
			let fn = alEnsureType<AVM1Function>(this, AVM1Function);
			return fn.alCall(thisArg, args);
		}

		public apply(thisArg: any, args?: AVM1ArrayNative): any {
			let fn = alEnsureType<AVM1Function>(this, AVM1Function);
			let nativeArgs = !args ? undefined :
				alEnsureType<AVM1ArrayNative>(args, AVM1ArrayNative).value;
			return fn.alCall(thisArg, nativeArgs);
		}
	}

	export class AVM1FunctionFunction extends AVM1Function {
		public constructor(context: IAVM1Context) {
			super(context);

			this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
			let proto = context.builtins.Function.alGetPrototypeProperty();
			alDefineObjectProperties(this, {
				prototype: {
					value: proto
				}
			});
		}

		public alConstruct(args?: any[]): AVM1Object {
			// ActionScript just returns the first argument.
			return args ? args[0] : undefined;
		}

		public alCall(thisArg: any, args?: any[]): any {
			// ActionScript just returns the first argument.
			return args ? args[0] : undefined;
		}
	}

	// Boolean natives

	export class AVM1BooleanNative extends AVM1Object {
		public value: boolean;

		public constructor(context: IAVM1Context, value: boolean) {
			super(context);
			this.alPrototype = context.builtins.Boolean.alGetPrototypeProperty();
			this.alSetOwnConstructorProperty(context.builtins.Boolean);
			this.value = value;
		}

		public valueOf(): any {
			return this.value;
		}
	}

	export class AVM1BooleanPrototype extends AVM1Object {
		public constructor(context: IAVM1Context) {
			super(context);
			this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
			alDefineObjectProperties(this, {
				constructor: {
					value: context.builtins.Boolean,
					writable: true
				},
				valueOf: {
					value: this._valueOf,
					writable: true
				},
				toString: {
					value: this._toString,
					writable: true
				}
			});
		}

		public _valueOf() {
			let native = alEnsureType<AVM1BooleanNative>(this, AVM1BooleanNative);
			return native.value;
		}

		public _toString() {
			let native = alEnsureType<AVM1BooleanNative>(this, AVM1BooleanNative);
			return native.value ? 'true' : 'false';
		}
	}

	export class AVM1BooleanFunction extends AVM1Function {
		public constructor(context: IAVM1Context) {
			super(context);
			this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
			let proto = new AVM1BooleanPrototype(context);
			alDefineObjectProperties(this, {
				prototype: {
					value: proto
				}
			});
		}

		public alConstruct(args?: any[]): AVM1Object {
			let value = args ? alToBoolean(this.context, args[0]) : false;
			return new AVM1BooleanNative(this.context, value);
		}

		public alCall(thisArg: any, args?: any[]): any {
			// TODO returns boolean value?
			let value = args ? alToBoolean(this.context, args[0]) : false;
			return value;
		}
	}

	// Number natives

	export class AVM1NumberNative extends AVM1Object {
		public value: number;

		public constructor(context: IAVM1Context, value: number) {
			super(context);
			this.alPrototype = context.builtins.Number.alGetPrototypeProperty();
			this.alSetOwnConstructorProperty(context.builtins.Number);
			this.value = value;
		}

		public valueOf(): any {
			return this.value;
		}
	}

	export class AVM1NumberPrototype extends AVM1Object {
		public constructor(context: IAVM1Context) {
			super(context);
			this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
			alDefineObjectProperties(this, {
				constructor: {
					value: context.builtins.Number,
					writable: true
				},
				valueOf: {
					value: this._valueOf,
					writable: true
				},
				toString: {
					value: this._toString,
					writable: true
				}
			});
		}

		public _valueOf() {
			let native = alEnsureType<AVM1NumberNative>(this, AVM1NumberNative);
			return native.value;
		}

		public _toString(radix: number) {
			let native = alEnsureType<AVM1NumberNative>(this, AVM1NumberNative);
			return native.value.toString(radix || 10);
		}
	}

	export class AVM1NumberFunction extends AVM1Function {
		public constructor(context: IAVM1Context) {
			super(context);
			this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
			let proto = new AVM1NumberPrototype(context);
			alDefineObjectProperties(this, {
				prototype: {
					value: proto
				},
				MAX_VALUE: Number.MAX_VALUE,
				MIN_VALUE: Number.MIN_VALUE,
				NaN: Number.NaN,
				NEGATIVE_INFINITY: Number.NEGATIVE_INFINITY,
				POSITIVE_INFINITY: Number.POSITIVE_INFINITY
			});

		}

		public alConstruct(args?: any[]): AVM1Object {
			let value = args ? alToNumber(this.context, args[0]) : 0;
			return new AVM1NumberNative(this.context, value);
		}

		public alCall(thisArg: any, args?: any[]): any {
			// TODO returns number value?
			let value = args ? alToNumber(this.context, args[0]) : 0;
			return value;
		}
	}

	// String natives

	export class AVM1StringNative extends AVM1Object {
		public value: string;

		public constructor(context: IAVM1Context, value: string) {
			super(context);
			this.alPrototype = context.builtins.String.alGetPrototypeProperty();
			this.alSetOwnConstructorProperty(context.builtins.String);
			this.value = value;
		}

		public toString(): string {
			return this.value;
		}
	}

	// Most of the methods of String prototype are generic and accept any object.
	export class AVM1StringPrototype extends AVM1Object {
		public constructor(context: IAVM1Context) {
			super(context);
			this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
			alDefineObjectProperties(this, {
				constructor: {
					value: context.builtins.String,
					writable: true
				},
				valueOf: {
					value: this._valueOf,
					writable: true
				},
				toString: {
					value: this._toString,
					writable: true
				},
				length: {
					get: this.getLength
				},
				charAt: {
					value: this.charAt,
					writable: true
				},
				charCodeAt: {
					value: this.charCodeAt,
					writable: true
				},
				concat: {
					value: this.concat,
					writable: true
				},
				indexOf: {
					value: this.indexOf,
					writable: true
				},
				lastIndexOf: {
					value: this.lastIndexOf,
					writable: true
				},
				slice: {
					value: this.slice,
					writable: true
				},
				split: {
					value: this.split,
					writable: true
				},
				substr: {
					value: this.substr,
					writable: true
				},
				substring: {
					value: this.substring,
					writable: true
				},
				toLowerCase: {
					value: this.toLowerCase,
					writable: true
				},
				toUpperCase: {
					value: this.toUpperCase,
					writable: true
				}
			});
		}

		public _valueOf() {
			let native = alEnsureType<AVM1StringNative>(this, AVM1StringNative);
			return native.value;
		}

		public _toString() {
			let native = alEnsureType<AVM1StringNative>(this, AVM1StringNative);
			return native.value;
		}

		public getLength(): number {
			let native = alEnsureType<AVM1StringNative>(this, AVM1StringNative);
			return native.value.length;
		}

		public charAt(index: number): string {
			let value = alToString(this.context, this);
			return value.charAt(alToInteger(this.context, index));
		}

		public charCodeAt(index: number): number {
			let value = alToString(this.context, this);
			return value.charCodeAt(alToInteger(this.context, index));
		}

		public concat(...items: AVM1Object[]): string {
			let stringItems: string[] = [alToString(this.context, this)];
			for (let i = 0; i < items.length; ++i) {
				stringItems.push(alToString(this.context, items[i]));
			}
			return stringItems.join('');
		}

		public indexOf(searchString: string, position?: number): number {
			let value = alToString(this.context, this);
			searchString = alToString(this.context, searchString);
			position = alToInteger(this.context, position);
			return value.indexOf(searchString, position);
		}

		public lastIndexOf(searchString: string, position?: number): number {
			let value = alToString(this.context, this);
			searchString = alToString(this.context, searchString);
			position = arguments.length < 2 ? NaN : alToNumber(this.context, position); // SWF6 alToNumber(undefined) === 0
			if (position < 0) {
				// Different from JS
				return -1;
			}
			return value.lastIndexOf(searchString, isNaN(position) ? undefined : position);
		}

		public slice(start: number, end?: number): string {
			if (arguments.length === 0) {
				// Different from JS
				return undefined;
			}
			let value = alToString(this.context, this);
			start = alToInteger(this.context, start);
			end = end === undefined ? undefined : alToInteger(this.context, end);
			return value.slice(start, end);
		}

		public split(separator: any, limit?: number): AVM1ArrayNative {
			let value = alToString(this.context, this);
			// TODO separator as regular expression?
			separator = alToString(this.context, separator);
			limit = (limit === undefined ? ~0 : alToInt32(this.context, limit)) >>> 0;
			return new AVM1ArrayNative(this.context, value.split(separator, limit));
		}

		public substr(start: number, length?: number): string {
			// Different from JS
			let value = alToString(this.context, this);
			let valueLength = value.length;
			start = alToInteger(this.context, start);
			length = length === undefined ? valueLength : alToInteger(this.context, length);
			if (start < 0) {
				start = Math.max(0, valueLength + start);
			}
			if (length < 0) {
				if (-length <= start) { // this one is weird -- don't ask
					return '';
				}
				length = Math.max(0, valueLength + length);
			}
			return value.substr(start, length);
		}

		public substring(start: number, end?: number): string {
			let value = alToString(this.context, this);
			start = alToInteger(this.context, start);
			if (start >= value.length) {
				// Different from JS
				return '';
			}
			end = end === undefined ? undefined : alToInteger(this.context, end);
			return value.substring(start, end);
		}

		public toLowerCase(): string {
			let value = alToString(this.context, this);
			return value.toLowerCase();
		}

		public toUpperCase(): string {
			let value = alToString(this.context, this);
			return value.toUpperCase();
		}
	}

	export class AVM1StringFunction extends AVM1Function {
		public constructor(context: IAVM1Context) {
			super(context);
			this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
			let proto = new AVM1StringPrototype(context);
			alDefineObjectProperties(this, {
				prototype: {
					value: proto
				},
				fromCharCode: {
					value: this.fromCharCode
				}
			});
		}

		public alConstruct(args?: any[]): AVM1Object {
			let value = args ? alToString(this.context, args[0]) : '';
			return new AVM1StringNative(this.context, value);
		}

		public alCall(thisArg: any, args?: any[]): any {
			let value = args ? alToString(this.context, args[0]) : '';
			return value;
		}

		public fromCharCode(...codes: number[]): string {
			codes = codes.map((code) => alToInt32(this.context, code) & 0xFFFF);
			return String.fromCharCode.apply(String, codes);
		}
	}

	// Array natives

	let cachedArrayPropertyDescriptor = new AVM1PropertyDescriptor(AVM1PropertyFlags.DATA,
		undefined);

	export class AVM1ArrayNative extends AVM1Object {
		public value: any[];

		public constructor(context: IAVM1Context, value: any[]) {
			super(context);
			this.alPrototype = context.builtins.Array.alGetPrototypeProperty();
			this.alSetOwnConstructorProperty(context.builtins.Array);
			this.value = value;
		}

		public alGetOwnProperty(p: any): AVM1PropertyDescriptor {
			if (alIsIndex(this.context, p)) {
				let index = alToInt32(this.context, p);
				if (Object.getOwnPropertyDescriptor(this.value, <any>index)) {
					cachedArrayPropertyDescriptor.value = this.value[index];
					return cachedArrayPropertyDescriptor;
				}
			}
			return super.alGetOwnProperty(p);
		}

		public alSetOwnProperty(p: any, v: AVM1PropertyDescriptor) {
			if (alIsIndex(this.context, p)) {
				let index = alToInt32(this.context, p);
				if (!(v.flags & AVM1PropertyFlags.DATA) ||
					!!(v.flags & AVM1PropertyFlags.DONT_ENUM) ||
					!!(v.flags & AVM1PropertyFlags.DONT_DELETE)) {
					throw new Error('Special property is non-supported for array');
				}
				this.value[index] = v.value;
				return;
			}
			super.alSetOwnProperty(p, v);
		}

		public alDeleteOwnProperty(p: any) {
			if (alIsIndex(this.context, p)) {
				let index = alToInt32(this.context, p);
				delete this.value[index];
				return;
			}
			super.alDeleteOwnProperty(p);
		}

		public alGetOwnPropertiesKeys(): string[] {
			let keys = super.alGetOwnPropertiesKeys();
			let itemIndices = [];
			for (let i in this.value) {
				itemIndices.push(i);
			}
			return itemIndices.concat(keys);
		}

		/**
		 * Creates a JavaScript array from the AVM1 list object.
		 * @param arr     An array-like AVM1 object.
		 * @param fn      A function that converts AVM1 list object item to JavaScript object.
		 * @param thisArg Optional. Value to use as this when executing fn.
		 * @returns {any[]} A JavaScript array.
		 */
		public static mapToJSArray(arr: AVM1Object, fn: (item: any, index?: number) => any, thisArg?: any): any[] {
			if (arr instanceof AVM1ArrayNative) {
				return (<AVM1ArrayNative>arr).value.map(fn, thisArg);
			}
			// This method is generic, so array-like objects can use it.
			if (!alIsArrayLike(arr.context, arr)) {
				// TODO generate proper AVM1 exception.
				throw new Error('Invalid type'); // Interpreter will catch this.
			}
			let result: Array<any> = [];
			alIterateArray(arr.context, arr, (item: any, index: number) => {
				result.push(fn.call(thisArg, item, index));
			});
			return result;
		}
	}

	enum AVM1ArraySortOnOptions {
		CASEINSENSITIVE = 1,
		DESCENDING = 2,
		UNIQUESORT = 4,
		RETURNINDEXEDARRAY = 8,
		NUMERIC = 16
	}

	// TODO implement all the Array class and its prototype natives

	export class AVM1ArrayPrototype extends AVM1Object {
		public constructor(context: IAVM1Context) {
			super(context);
			this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
			alDefineObjectProperties(this, {
				constructor: {
					value: context.builtins.Array,
					writable: true
				},
				join: {
					value: this.join,
					writable: true
				},
				length: {
					get: this.getLength,
					set: this.setLength
				},
				concat: {
					value: this.concat,
					writable: true
				},
				pop: {
					value: this.pop,
					writable: true
				},
				push: {
					value: this.push,
					writable: true
				},
				shift: {
					value: this.shift,
					writable: true
				},
				slice: {
					value: this.slice,
					writable: true
				},
				splice: {
					value: this.splice,
					writable: true
				},
				sort: {
					value: this.sort,
					writable: true
				},
				sortOn: {
					value: this.sortOn,
					writable: true
				},
				toString: {
					value: this._toString,
					writable: true
				},
				unshift: {
					value: this.unshift,
					writable: true
				},
			});
		}

		public _toString() {
			let join = this.context.builtins.Array.alGetPrototypeProperty().alGet('join');
			return join.alCall(this);
		}

		public getLength(): number {
			let arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
			return arr.length;
		}

		public setLength(length: number) {
			if (!isIndex(length)) {
				return; // no action on invalid length
			}
			length = alToInt32(this.context, length) >>> 0;

			let arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
			arr.length = length;
		}

		public concat(...items: any[]): AVM1Object {
			if (this instanceof AVM1ArrayNative) {
				// Faster case for native array implementation
				let arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
				for (let i = 0; i < arr.length; i++) {
					if (items[i] instanceof AVM1ArrayNative) {
						items[i] = alEnsureType<AVM1ArrayNative>(items[i], AVM1ArrayNative).value;
					}
				}
				return new AVM1ArrayNative(this.context,
					Array.prototype.concat.apply(arr, items));
			}
			// Generic behavior
			let a: Array<any> = [];
			let e: any = this;
			let isArrayObject = alIsArrayLike(this.context, this);
			let i = 0;
			while (true) {
				if (isArrayObject) {
					alIterateArray(this.context, e, (value) => a.push(value));
				} else {
					a.push(alToString(this.context, e));
				}
				if (i >= items.length) {
					break;
				}
				e = items[i++];
				isArrayObject = alIsArray(this.context, e); // not-logical behavior
			}
			return new AVM1ArrayNative(this.context, a);
		}

		public join(separator?: string): string {
			separator = separator === undefined ? ',' : alCoerceString(this.context, separator);
			if (this instanceof AVM1ArrayNative) {
				// Faster case for native array implementation
				let arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
				if (arr.length === 0) {
					return '';
				}
				if (arr.every(function (i) {
						return !(i instanceof AVM1Object);
					})) {
					return arr.join(separator);
				}
			}
			let context = this.context;
			let length = alToInt32(context, this.alGet('length')) >>> 0;
			if (length === 0) {
				return '';
			}
			let result = [];
			for (let i = 0; i < length; i++) {
				let item = this.alGet(i);
				result[i] = item === null || item === undefined ? '' : alCoerceString(context, item);
			}
			return result.join(separator);
		}

		public pop(): any {
			if (this instanceof AVM1ArrayNative) {
				// Faster case for native array implementation
				let arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
				return arr.pop();
			}
			let length = alToInt32(this.context, this.alGet('length')) >>> 0;
			if (length === 0) {
				return undefined;
			}
			let i = length - 1;
			let result = this.alGet(i);
			this.alDeleteProperty(i);
			this.alPut('length', i);
			return result;
		}

		public push(...items: any[]): number {
			if (this instanceof AVM1ArrayNative) {
				// Faster case for native array implementation
				let arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
				return Array.prototype.push.apply(arr, items);
			}
			let length = alToInt32(this.context, this.alGet('length')) >>> 0;
			for (let i = 0; i < items.length; i++) {
				this.alPut(length, items[i]);
				length++; // TODO check overflow
			}
			this.alPut('length', length);
			return length;
		}

		public shift(): any {
			if (this instanceof AVM1ArrayNative) {
				// Faster case for native array implementation
				let arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
				return arr.shift();
			}
			let length = alToInt32(this.context, this.alGet('length')) >>> 0;
			if (length === 0) {
				return undefined;
			}
			let result = this.alGet(0);
			for (let i = 1; i < length; i++) {
				if (this.alHasProperty(i)) {
					this.alPut(i - 1, this.alGet(i));
				} else {
					this.alDeleteProperty(i - 1);
				}
			}
			this.alDeleteProperty(length - 1);
			this.alPut('length', length - 1);
			return result;
		}

		public slice(start: number, end?: number): AVM1Object {
			start = alToInteger(this.context, start);
			end = end !== undefined ? alToInteger(this.context, end) : undefined;
			if (this instanceof AVM1ArrayNative) {
				// Faster case for native array implementation
				let arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
				return new AVM1ArrayNative(this.context, arr.slice(start, end));
			}
			let a = [];
			let length = alToInt32(this.context, this.alGet('length')) >>> 0;
			start = start < 0 ? Math.max(length + start, 0) : Math.min(length, start);
			end = end === undefined ? length :
				(end < 0 ? Math.max(length + end, 0) : Math.min(length, end));
			for (let i = start, j = 0; i < end; i++, j++) {
				if (this.alHasProperty(i)) {
					a[j] = this.alGet(i);
				}
			}
			return new AVM1ArrayNative(this.context, a);
		}

		public splice(start: number, deleteCount: number, ...items: any[]): AVM1Object {
			start = alToInteger(this.context, start);
			deleteCount = alToInteger(this.context, deleteCount);
			if (this instanceof AVM1ArrayNative) {
				// Faster case for native array implementation
				let arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
				return new AVM1ArrayNative(this.context,
					Array.prototype.splice.apply(arr, [start, deleteCount].concat(items)));
			}
			let a = [];
			let length = alToInt32(this.context, this.alGet('length')) >>> 0;
			start = start < 0 ? Math.max(length + start, 0) : Math.min(length, start);
			deleteCount = Math.min(Math.max(deleteCount, 0), length - start);
			for (let i = 0; i < deleteCount; i++) {
				if (this.alHasProperty(start + i)) {
					a[i] = this.alGet(start + i);
				}
			}
			let delta = items.length - deleteCount;
			if (delta < 0) {
				for (let i = start - delta; i < length; i++) {
					if (this.alHasProperty(i)) {
						this.alPut(i + delta, this.alGet(i));
					} else {
						this.alDeleteProperty(i + delta);
					}
				}
				for (let i = delta; i < 0; i++) {
					this.alDeleteProperty(length + i);
				}
			} else if (delta > 0) {
				// TODO check overflow
				for (let i = length - 1; i >= start + delta; i--) {
					if (this.alHasProperty(i)) {
						this.alPut(i + delta, this.alGet(i));
					} else {
						this.alDeleteProperty(i + delta);
					}
				}
			}
			for (let i = 0; i < items.length; i++) {
				this.alPut(start + i, items[i]);
			}
			this.alPut('length', length + delta);
			return new AVM1ArrayNative(this.context, a);
		}

		public sort(comparefn?: AVM1Function): AVM1Object {
			let arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
			if (!alIsFunction(comparefn)) {
				arr.sort();
			} else {
				let args: Array<any> = [undefined, undefined];
				arr.sort(function (a, b) {
					args[0] = a;
					args[1] = b;
					return comparefn.alCall(null, args);
				});
			}
			return this;
		}

		public sortOn(fieldNames: AVM1Object, options: any): AVM1Object {
			let context = this.context;
			// The field names and options we'll end up using.
			let fieldNamesList: string[] = [];
			let optionsList: number[] = [];
			if (alIsString(context, fieldNames)) {
				fieldNamesList = [alToString(context, fieldNames)];
				optionsList = [alToInt32(context, options)];
			} else if (alIsArray(context, fieldNames)) {
				fieldNamesList = [];
				optionsList = [];
				let optionsArray: AVM1Object = alIsArray(context, options) ? options : null;
				let length = alToInteger(context, fieldNames.alGet('length'));
				if (optionsArray) {
					// checking in length of fieldNames == options
					let optionsLength = alToInteger(context, optionsArray.alGet('length'));
					if (length !== optionsLength) {
						optionsArray = null;
					}
				}
				for (let i = 0; i < length; i++) {
					fieldNamesList.push(alToString(context, fieldNames.alGet(i)));
					optionsList.push(optionsArray ? alToInt32(context, optionsArray.alGet(i)) : 0);
				}
			} else {
				// Field parameters are incorrect.
				return undefined;
			}

			// TODO revisit this code
			let optionsVal: number = optionsList[0];
			release || Shumway.Debug.assertNotImplemented(!(optionsVal & AVM1ArraySortOnOptions.UNIQUESORT), "UNIQUESORT");
			release || Shumway.Debug.assertNotImplemented(!(optionsVal & AVM1ArraySortOnOptions.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");

			let comparer = (a: any, b: any) => {
				let aObj = alToObject(context, a);
				let bObj = alToObject(context, b);
				if (!a || !b) {
					return !a ? !b ? 0 : -1 : +1;
				}
				for (let i = 0; i < fieldNamesList.length; i++) {
					let aField = aObj.alGet(fieldNamesList[i]);
					let bField = bObj.alGet(fieldNamesList[i]);
					let result;
					if (optionsList[i] & AVM1ArraySortOnOptions.NUMERIC) {
						let aNum = alToNumber(context, aField);
						let bNum = alToNumber(context, bField);
						result = aNum < bNum ? -1 : aNum > bNum ? +1 : 0;
					} else {
						let aStr = alToString(context, aField);
						let bStr = alToString(context, bField);
						if (optionsList[i] & AVM1ArraySortOnOptions.CASEINSENSITIVE) {
							aStr = aStr.toLowerCase();
							bStr = bStr.toLowerCase();
						}
						result = aStr < bStr ? -1 : aStr > bStr ? +1 : 0;
					}
					if (result !== 0) {
						return !(optionsList[i] & AVM1ArraySortOnOptions.DESCENDING) ? result : -result;
					}
				}
				return 0;
			};

			let arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
			arr.sort(comparer);

			// Strange, the documentation said to do not return anything.
			return this;
		}

		public unshift(...items: any[]): number {
			if (this instanceof AVM1ArrayNative) {
				// Faster case for native array implementation
				let arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
				return Array.prototype.unshift.apply(arr, items);
			}
			let length = alToInt32(this.context, this.alGet('length')) >>> 0;
			let insertCount = items.length;
			// TODO check overflow
			for (let i = length - 1; i >= 0; i--) {
				if (this.alHasProperty(i)) {
					this.alPut(i + insertCount, this.alGet(i));
				} else {
					this.alDeleteProperty(i + insertCount);
				}
			}

			for (let i = 0; i < items.length; i++) {
				this.alPut(i, items[i]);
			}
			length += insertCount;
			this.alPut('length', length); // ActionScript does not do that?
			return length;
		}
	}

	export class AVM1ArrayFunction extends AVM1Function {
		public constructor(context: IAVM1Context) {
			super(context);
			this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
			let proto = new AVM1ArrayPrototype(context);
			alDefineObjectProperties(this, {
				prototype: {
					value: proto
				}
			});
		}

		public alConstruct(args?: any[]): AVM1Object {
			if (!args) {
				return new AVM1ArrayNative(this.context, []);
			}
			if (args.length === 1 && typeof args[0] === 'number') {
				let len = args[0];
				if (len >>> 0 !== len) {
					throw new Error('Range error'); // TODO avm1 native
				}
				return new AVM1ArrayNative(this.context, new Array(len));
			}
			return new AVM1ArrayNative(this.context, args);
		}

		public alCall(thisArg: any, args?: any[]): any {
			return this.alConstruct.apply(this, args);
		}
	}

	// Math natives

	class AVM1MathObject extends AVM1Object {
		public constructor(context: IAVM1Context) {
			super(context);
			this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
			alDefineObjectProperties(this, {
				E: Math.E,
				LN10: Math.LN10,
				LN2: Math.LN2,
				LOG10E: Math.LOG10E,
				LOG2E: Math.LOG2E,
				PI: Math.PI,
				SQRT1_2: Math.SQRT1_2,
				SQRT2: Math.SQRT2,
				abs: this.abs,
				acos: this.acos,
				asin: this.asin,
				atan: this.atan,
				atan2: this.atan2,
				ceil: this.ceil,
				cos: this.cos,
				exp: this.exp,
				floor: this.floor,
				log: this.log,
				max: this.max,
				min: this.min,
				pow: this.pow,
				random: this.random,
				round: this.round,
				sin: this.sin,
				sqrt: this.sqrt,
				tan: this.tan
			});
		}

		public abs(x: number): number {
			return Math.abs(alToNumber(this.context, x));
		}

		public acos(x: number): number {
			return Math.acos(alToNumber(this.context, x));
		}

		public asin(x: number): number {
			return Math.asin(alToNumber(this.context, x));
		}

		public atan(x: number): number {
			return Math.atan(alToNumber(this.context, x));
		}

		public atan2(y: number, x: number): number {
			return Math.atan2(alToNumber(this.context, y), alToNumber(this.context, x));
		}

		public ceil(x: number): number {
			return Math.ceil(alToNumber(this.context, x));
		}

		public cos(x: number): number {
			return Math.cos(alToNumber(this.context, x));
		}

		public exp(x: number): number {
			return Math.exp(alToNumber(this.context, x));
		}

		public floor(x: number): number {
			return Math.floor(alToNumber(this.context, x));
		}

		public log(x: number): number {
			return Math.log(alToNumber(this.context, x));
		}

		public max(...values: number[]): number {
			values = values.map((x) => alToNumber(this.context, x));
			return Math.max.apply(null, values);
		}

		public min(...values: number[]): number {
			values = values.map((x) => alToNumber(this.context, x));
			return Math.min.apply(null, values);
		}

		public pow(x: number, y: number): number {
			return Math.pow(alToNumber(this.context, x), alToNumber(this.context, y));
		}

		public random(): number {
			return Math.random();
		}

		public round(x: number): number {
			return Math.round(alToNumber(this.context, x));
		}

		public sin(x: number): number {
			return Math.sin(alToNumber(this.context, x));
		}

		public sqrt(x: number): number {
			return Math.sqrt(alToNumber(this.context, x));
		}

		public tan(x: number): number {
			return Math.tan(alToNumber(this.context, x));
		}
	}

	// Date natives

	class AVM1DateNative extends AVM1Object {
		public value: Date;

		public constructor(context: IAVM1Context, value: Date) {
			super(context);
			this.alPrototype = context.builtins.Date.alGetPrototypeProperty();
			this.alSetOwnConstructorProperty(context.builtins.Date);
			this.value = value;
		}

		public alDefaultValue(hint?: AVM1DefaultValueHint): any {
			if (hint !== undefined) {
				return super.alDefaultValue(hint);
			}

			if (this.context.swfVersion >= 6) {
				return super.alDefaultValue(AVM1DefaultValueHint.STRING);
			} else {
				return super.alDefaultValue(AVM1DefaultValueHint.NUMBER);
			}
		}
	}

	// TODO implement all the Date class and its prototype natives

	class AVM1DatePrototype extends AVM1Object {
		public constructor(context: IAVM1Context) {
			super(context);
			this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
			alDefineObjectProperties(this, {
				constructor: {
					value: context.builtins.Date,
					writable: true
				},
				valueOf: {
					value: this._valueOf,
					writable: true
				},
				toString: {
					value: this._toString,
					writable: true
				},
				toLocaleString: {
					value: this._toLocaleString,
					writable: true
				},
				toDateString: {
					value: this.toDateString,
					writable: true
				},
				toTimeString: {
					value: this.toTimeString,
					writable: true
				},
				toLocaleDateString: {
					value: this.toLocaleDateString,
					writable: true
				},
				toLocaleTimeString: {
					value: this.toLocaleTimeString,
					writable: true
				},
				getTime: {
					value: this.getTime,
					writable: true
				},
				getFullYear: {
					value: this.getFullYear,
					writable: true
				},
				getUTCFullYear: {
					value: this.getUTCFullYear,
					writable: true
				},
				getMonth: {
					value: this.getMonth,
					writable: true
				},
				getUTCMonth: {
					value: this.getUTCMonth,
					writable: true
				},
				getDate: {
					value: this.getDate,
					writable: true
				},
				getUTCDate: {
					value: this.getUTCDate,
					writable: true
				},
				getDay: {
					value: this.getDay,
					writable: true
				},
				getUTCDay: {
					value: this.getUTCDay,
					writable: true
				},
				getHours: {
					value: this.getHours,
					writable: true
				},
				getUTCHours: {
					value: this.getUTCHours,
					writable: true
				},
				getMinutes: {
					value: this.getMinutes,
					writable: true
				},
				getUTCMinutes: {
					value: this.getUTCMinutes,
					writable: true
				},
				getSeconds: {
					value: this.getSeconds,
					writable: true
				},
				getUTCSeconds: {
					value: this.getUTCSeconds,
					writable: true
				},
				getMilliseconds: {
					value: this.getMilliseconds,
					writable: true
				},
				getUTCMilliseconds: {
					value: this.getUTCMilliseconds,
					writable: true
				},
				getTimezoneOffset: {
					value: this.getTimezoneOffset,
					writable: true
				},
				setTime: {
					value: this.setTime,
					writable: true
				},
				setMilliseconds: {
					value: this.setMilliseconds,
					writable: true
				},
				setUTCMilliseconds: {
					value: this.setUTCMilliseconds,
					writable: true
				},
				setSeconds: {
					value: this.setSeconds,
					writable: true
				},
				setUTCSeconds: {
					value: this.setUTCSeconds,
					writable: true
				},
				setMinutes: {
					value: this.setMinutes,
					writable: true
				},
				setUTCMinutes: {
					value: this.setUTCMinutes,
					writable: true
				},
				setHours: {
					value: this.setHours,
					writable: true
				},
				setUTCHours: {
					value: this.setUTCHours,
					writable: true
				},
				setDate: {
					value: this.setDate,
					writable: true
				},
				setUTCDate: {
					value: this.setUTCDate,
					writable: true
				},
				setMonth: {
					value: this.setMonth,
					writable: true
				},
				setUTCMonth: {
					value: this.setUTCMonth,
					writable: true
				},
				setFullYear: {
					value: this.setFullYear,
					writable: true
				},
				setUTCFullYear: {
					value: this.setUTCFullYear,
					writable: true
				},
				toUTCString: {
					value: this.toUTCString,
					writable: true
				}
			});
		}

		public _valueOf() {
			let native = alEnsureType<AVM1DateNative>(this, AVM1DateNative);
			return native.value.valueOf();
		}

		public _toString() {
			let native = alEnsureType<AVM1DateNative>(this, AVM1DateNative);
			return native.value.toString();
		}

		public _toLocaleString(): string {
			let native = alEnsureType<AVM1DateNative>(this, AVM1DateNative);
			return native.value.toLocaleString();
		}

		public toDateString(): string {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.toDateString();
		}

		public toTimeString(): string {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.toTimeString();
		}

		public toLocaleDateString(): string {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.toLocaleDateString();
		}

		public toLocaleTimeString(): string {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.toLocaleTimeString();
		}

		public getTime(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getTime();
		}

		public getFullYear(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getFullYear();
		}

		public getUTCFullYear(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getUTCFullYear();
		}

		public getMonth(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getMonth();
		}

		public getUTCMonth(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getUTCMonth();
		}

		public getDate(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getDate();
		}

		public getUTCDate(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getUTCDate();
		}

		public getDay(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getDay();
		}

		public getUTCDay(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getUTCDay();
		}

		public getHours(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getHours();
		}

		public getUTCHours(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getUTCHours();
		}

		public getMinutes(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getMinutes();
		}

		public getUTCMinutes(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getUTCMinutes();
		}

		public getSeconds(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getSeconds();
		}

		public getUTCSeconds(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getUTCSeconds();
		}

		public getMilliseconds(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getMilliseconds();
		}

		public getUTCMilliseconds(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getUTCMilliseconds();
		}

		public getTimezoneOffset(): number {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.getTimezoneOffset();
		}

		public setTime(time: number): number {
			time = alToNumber(this.context, time);
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setTime(time);
		}

		public setMilliseconds(ms: number): number {
			ms = alToNumber(this.context, ms);
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setMilliseconds(ms);
		}

		public setUTCMilliseconds(ms: number): number {
			ms = alToNumber(this.context, ms);
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setUTCMilliseconds(ms);
		}

		public setSeconds(sec: number, ms?: number): number {
			sec = alToNumber(this.context, sec);
			if (arguments.length <= 1) {
				return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setSeconds(sec);
			} else {
				ms = alToNumber(this.context, ms);
				return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setSeconds(sec, ms);
			}
		}

		public setUTCSeconds(sec: number, ms?: number): number {
			sec = alToNumber(this.context, sec);
			if (arguments.length <= 1) {
				return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setUTCSeconds(sec);
			} else {
				ms = alToNumber(this.context, ms);
				return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setUTCSeconds(sec, ms);
			}
		}

		public setMinutes(min: number, sec?: number, ms?: number): number {
			min = alToNumber(this.context, min);
			if (arguments.length <= 1) {
				return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setMinutes(min);
			} else {
				sec = alToNumber(this.context, sec);
				if (arguments.length <= 2) {
					return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setMinutes(min, sec);
				} else {
					ms = alToNumber(this.context, ms);
					return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setMinutes(min, sec, ms);
				}
			}
		}

		public setUTCMinutes(min: number, sec?: number, ms?: number): number {
			min = alToNumber(this.context, min);
			if (arguments.length <= 1) {
				return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setUTCMinutes(min);
			} else {
				sec = alToNumber(this.context, sec);
				if (arguments.length <= 2) {
					return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setUTCMinutes(min, sec);
				} else {
					ms = alToNumber(this.context, ms);
					return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setUTCMinutes(min, sec, ms);
				}
			}
		}

		public setHours(hour: number, min?: number, sec?: number, ms?: number): number {
			hour = alToNumber(this.context, hour);
			if (arguments.length <= 1) {
				return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setHours(hour);
			} else {
				min = alToNumber(this.context, min);
				if (arguments.length <= 2) {
					return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setHours(hour, min);
				} else {
					sec = alToNumber(this.context, sec);
					if (arguments.length <= 3) {
						return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setHours(hour, min, sec);
					} else {
						ms = alToNumber(this.context, ms);
						return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setHours(hour, min, sec, ms);
					}
				}
			}
		}

		public setUTCHours(hour: number, min?: number, sec?: number, ms?: number): number {
			hour = alToNumber(this.context, hour);
			if (arguments.length <= 1) {
				return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setUTCHours(hour);
			} else {
				min = alToNumber(this.context, min);
				if (arguments.length <= 2) {
					return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setUTCHours(hour, min);
				} else {
					sec = alToNumber(this.context, sec);
					if (arguments.length <= 3) {
						return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setUTCHours(hour, min, sec);
					} else {
						ms = alToNumber(this.context, ms);
						return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setUTCHours(hour, min, sec, ms);
					}
				}
			}
		}

		public setDate(date: number): number {
			date = alToNumber(this.context, date);
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setDate(date);
		}

		public setUTCDate(date: number): number {
			date = alToNumber(this.context, date);
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setUTCDate(date);
		}

		public setMonth(month: number, date?: number): number {
			month = alToNumber(this.context, month);
			if (arguments.length <= 1) {
				return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setMonth(month);
			} else {
				date = alToNumber(this.context, date);
				return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setMonth(month, date);
			}
		}

		public setUTCMonth(month: number, date?: number): number {
			month = alToNumber(this.context, month);
			if (arguments.length <= 1) {
				return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setUTCMonth(month);
			} else {
				date = alToNumber(this.context, date);
				return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setUTCMonth(month, date);
			}
		}

		public setFullYear(year: number, month?: number, date?: number): number {
			year = alToNumber(this.context, year);
			if (arguments.length <= 1) {
				return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setFullYear(year);
			} else {
				month = alToNumber(this.context, month);
				if (arguments.length <= 2) {
					return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setFullYear(year, month);
				} else {
					date = alToNumber(this.context, date);
					return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setFullYear(year, month, date);
				}
			}
		}

		public setUTCFullYear(year: number, month?: number, date?: number): number {
			year = alToNumber(this.context, year);
			if (arguments.length <= 1) {
				return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setUTCFullYear(year);
			} else {
				month = alToNumber(this.context, month);
				if (arguments.length <= 2) {
					return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setUTCFullYear(year, month);
				} else {
					date = alToNumber(this.context, date);
					return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.setUTCFullYear(year, month, date);
				}
			}
		}

		public toUTCString(): string {
			return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.toUTCString();
		}
	}

	class AVM1DateFunction extends AVM1Function {
		public constructor(context: IAVM1Context) {
			super(context);
			this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
			let proto = new AVM1DatePrototype(context);
			alDefineObjectProperties(this, {
				prototype: {
					value: proto
				},
				UTC: {
					value: this._UTC,
					writable: true
				}
			});
		}

		public alConstruct(args?: any[]): AVM1Object {
			let context = this.context;
			let value: Date;
			switch (args.length) {
				case 0:
					value = new Date();
					break;
				case 1:
					value = new Date(alToPrimitive(context, args[0]));
					break;
				default: // case 2-7
					let numbers = [];
					for (let i = 0; i < args.length; i++) {
						numbers.push(alToNumber(context, args[i]));
					}
					value = new Date(
						alToNumber(context, args[0]),
						alToNumber(context, args[1]),
						args.length > 2 ? alToNumber(context, args[2]) : 1,
						args.length > 3 ? alToNumber(context, args[3]) : 0,
						args.length > 4 ? alToNumber(context, args[4]) : 0,
						args.length > 5 ? alToNumber(context, args[5]) : 0,
						args.length > 6 ? alToNumber(context, args[6]) : 0);
					break;
			}
			return new AVM1DateNative(context, value);
		}

		public alCall(thisArg: any, args?: any[]): any {
			return alCallProperty(this.alConstruct.apply(this, args), 'toString');
		}

		public _UTC(year: number, month: number, date?: number, hours?: number, seconds?: number, ms?: number): number {
			let context = this.context;
			return Date.UTC(
				alToNumber(context, arguments[0]),
				alToNumber(context, arguments[1]),
				arguments.length > 2 ? alToNumber(context, arguments[2]) : 1,
				arguments.length > 3 ? alToNumber(context, arguments[3]) : 0,
				arguments.length > 4 ? alToNumber(context, arguments[4]) : 0,
				arguments.length > 5 ? alToNumber(context, arguments[5]) : 0,
				arguments.length > 6 ? alToNumber(context, arguments[6]) : 0);
		}
	}

	// Error natives

	export class AVM1ErrorNative extends AVM1Object {
		public constructor(context: IAVM1Context, message: string) {
			super(context);
			this.alPrototype = context.builtins.Error.alGetPrototypeProperty();
			this.alSetOwnConstructorProperty(context.builtins.Error);
			if (message !== undefined) {
				this.alPut('message', message);
			}
		}
	}

	export class AVM1ErrorPrototype extends AVM1Object {
		public constructor(context: IAVM1Context) {
			super(context);
			this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
			alDefineObjectProperties(this, {
				constructor: {
					value: context.builtins.Error,
					writable: true
				},
				name: {
					value: 'Error',
					writable: true
				},
				message: {
					value: 'Error',
					writable: true,
				},
				toString: {
					value: this._toString,
					writable: true
				}
			});
		}

		public _toString() {
			return this.alGet('message');
		}
	}

	export class AVM1ErrorFunction extends AVM1Function {
		public constructor(context: IAVM1Context) {
			super(context);
			this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
			let proto = new AVM1ErrorPrototype(context);
			alDefineObjectProperties(this, {
				prototype: {
					value: proto
				}
			});
		}

		public alConstruct(args?: any[]): AVM1Object {
			let value: string = args && args[0] !== undefined ? alCoerceString(this.context, args[0]) : undefined;
			return new AVM1ErrorNative(this.context, value);
		}

		public alCall(thisArg: any, args?: any[]): any {
			let value: string = args && args[0] !== undefined ? alCoerceString(this.context, args[0]) : undefined;
			return new AVM1ErrorNative(this.context, value);
		}
	}

	function alEnsureType<T extends AVM1Object>(obj: AVM1Object, cls: any /* typeof AVM1Object */): T {
		if (obj instanceof cls) {
			return <any>obj;
		}
		throw new Error('Invalid type');
	}

	/**
	 * Installs built-ins on the AVM1Context. It shall be a first call before
	 * any AVM1Object is instantiated.
	 * @param {IAVM1Context} context
	 */
	export function installBuiltins(context: IAVM1Context): void {
		let builtins = context.builtins;

		// Resolving cyclic dependency between Object/Function functions and their prototypes.
		let objectProto = new AVM1ObjectPrototype(context);
		let dummyObject = new AVM1Object(context);
		dummyObject.alSetOwnPrototypeProperty(objectProto);
		builtins.Object = dummyObject;
		let functionProto = new AVM1FunctionPrototype(context);
		let dummyFunction = new AVM1Object(context);
		dummyFunction.alSetOwnPrototypeProperty(functionProto);
		builtins.Function = dummyFunction;
		objectProto._initializePrototype();
		functionProto._initializePrototype();

		builtins.Object = new AVM1ObjectFunction(context);
		builtins.Function = new AVM1FunctionFunction(context);
		builtins.Boolean = new AVM1BooleanFunction(context);
		builtins.Number = new AVM1NumberFunction(context);
		builtins.String = new AVM1StringFunction(context);
		builtins.Array = new AVM1ArrayFunction(context);
		builtins.Date = new AVM1DateFunction(context);
		builtins.Math = new AVM1MathObject(context);
		builtins.Error = new AVM1ErrorFunction(context);
	}
}

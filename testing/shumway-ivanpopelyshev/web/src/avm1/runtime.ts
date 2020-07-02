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

module Shumway.AVM1 {

	/**
	 * Base class for object instances we prefer to not inherit Object.prototype properties.
	 */
	export class NullPrototypeObject {
	}

	// Just assigning class prototype to null will not work, using next best thing.
	NullPrototypeObject.prototype = Object.create(null);

	// Implementing object structure and metaobject protocol very similar to
	// the one documented in the ECMAScript language 3.0 specification.

	// ActionScript properties flags.
	// DONT_ENUM, DONT_DELETE, and READ_ONLY are mapped to the the ASSetPropFlags.
	export const enum AVM1PropertyFlags {
		DONT_ENUM = 1,
		DONT_DELETE = 2,
		READ_ONLY = 4,
		DATA = 64,
		ACCESSOR = 128,
		ASSETPROP_MASK = DONT_DELETE | DONT_ENUM | READ_ONLY
	}

	export const enum AVM1DefaultValueHint {
		NUMBER,
		STRING
	}

	export interface IAVM1Callable {
		alCall(thisArg: any, args?: any[]): any;
	}

	export interface IAVM1PropertyWatcher {
		name: any;
		callback: IAVM1Callable;
		userData: any;
	}

	export class AVM1PropertyDescriptor {
		[key: string]: any;
		public originalName: string;

		constructor(public flags: AVM1PropertyFlags,
		            public value?: any,
		            public get?: IAVM1Callable,
		            public set?: IAVM1Callable,
		            public watcher?: IAVM1PropertyWatcher) {
			// Empty block
		}
	}

	let DEBUG_PROPERTY_PREFIX = '$Bg';

	export interface IAVM1Builtins {
		Object: AVM1Object;
		Function: AVM1Object;
		Boolean: AVM1Object;
		Number: AVM1Object;
		String: AVM1Object;
		Array: AVM1Object;
		Date: AVM1Object;
		Math: AVM1Object;
		Error: AVM1Object;
	}

	export interface IAVM1Context {
		builtins: IAVM1Builtins;
		swfVersion: number;
		isPropertyCaseSensitive: boolean;

		registerClass(name: string, cls: AVM1Object): void;
	}

	/**
	 * Base class for the ActionScript AVM1 object.
	 */
	export class AVM1Object extends NullPrototypeObject {
		[key: string]: any;
		// Using our own bag of properties
		private _ownProperties: any;
		private _prototype: AVM1Object;

		private _avm1Context: IAVM1Context;

		public get context(): AVM1Context { // too painful to have it as IAVM1Context
			return <AVM1Context>this._avm1Context;
		}

		public constructor(avm1Context: IAVM1Context) {
			super();
			this._avm1Context = avm1Context;
			this._ownProperties = Object.create(null);
			this._prototype = null;

			let self = this;
			// Using IAVM1Callable here to avoid circular calls between AVM1Object and
			// AVM1Function during constructions.
			// TODO do we need to support __proto__ for all SWF versions?
			let getter = {
				alCall: function (thisArg: any, args?: any[]): any {
					return self.alPrototype;
				}
			};
			let setter = {
				alCall: function (thisArg: any, args?: any[]): any {
					self.alPrototype = args[0];
				}
			};
			let desc = new AVM1PropertyDescriptor(AVM1PropertyFlags.ACCESSOR |
				AVM1PropertyFlags.DONT_DELETE |
				AVM1PropertyFlags.DONT_ENUM,
				null,
				getter,
				setter);
			this.alSetOwnProperty('__proto__', desc);
		}

		get alPrototype(): AVM1Object {
			return this._prototype;
		}

		set alPrototype(v: AVM1Object) {
			// checking for circular references
			let p = v;
			while (p) {
				if (p === this) {
					return; // possible loop in __proto__ chain is found
				}
				p = p.alPrototype;
			}
			// TODO recursive chain check
			this._prototype = v;
		}

		public alGetPrototypeProperty(): AVM1Object {
			return this.alGet('prototype');
		}

		// TODO shall we add mode for readonly/native flags of the prototype property?
		public alSetOwnPrototypeProperty(v: any): void {
			this.alSetOwnProperty('prototype', new AVM1PropertyDescriptor(AVM1PropertyFlags.DATA |
				AVM1PropertyFlags.DONT_ENUM,
				v));
		}

		public alGetConstructorProperty(): AVM1Object {
			return this.alGet('__constructor__');
		}

		public alSetOwnConstructorProperty(v: any): void {
			this.alSetOwnProperty('__constructor__', new AVM1PropertyDescriptor(AVM1PropertyFlags.DATA |
				AVM1PropertyFlags.DONT_ENUM,
				v));
		}

		_debugEscapeProperty(p: any): string {
			let context = this.context;
			let name = alToString(context, p);
			if (!context.isPropertyCaseSensitive) {
				name = name.toLowerCase();
			}
			return DEBUG_PROPERTY_PREFIX + name;
		}

		public alGetOwnProperty(name: any): AVM1PropertyDescriptor {
			if (typeof name === 'string' && !this.context.isPropertyCaseSensitive) {
				name = name.toLowerCase();
			}
			release || Debug.assert(alIsName(this.context, name));
			// TODO __resolve
			return this._ownProperties[name];
		}

		public alSetOwnProperty(p: any, desc: AVM1PropertyDescriptor): void {
			let name = this.context.normalizeName(p);
			if (!desc.originalName && !this.context.isPropertyCaseSensitive) {
				desc.originalName = p;
			}
			if (!release) {
				Debug.assert(desc instanceof AVM1PropertyDescriptor);
				// Ensure that a descriptor isn't used multiple times. If it were, we couldn't update
				// values in-place.
				Debug.assert(!desc['owningObject'] || desc['owningObject'] === this);
				desc['owningObject'] = this;
				// adding data property on the main object for convenience of debugging.
				if ((desc.flags & AVM1PropertyFlags.DATA) &&
					!(desc.flags & AVM1PropertyFlags.DONT_ENUM)) {
					Object.defineProperty(this, this._debugEscapeProperty(name),
						{value: desc.value, enumerable: true, configurable: true});
				}
			}
			this._ownProperties[name] = desc;
		}

		public alHasOwnProperty(p: any): boolean {
			let name = this.context.normalizeName(p);
			return !!this._ownProperties[name];
		}

		public alDeleteOwnProperty(p: any) {
			let name = this.context.normalizeName(p);
			delete this._ownProperties[name];
			if (!release) {
				delete this[this._debugEscapeProperty(p)];
			}
		}

		public alGetOwnPropertiesKeys(): string[] {
			let keys: string[] = [];
			if (!this.context.isPropertyCaseSensitive) {
				for (let name in this._ownProperties) {
					let desc = this._ownProperties[name];
					release || Debug.assert("originalName" in desc);
					if (!(desc.flags & AVM1PropertyFlags.DONT_ENUM)) {
						keys.push(desc.originalName);
					}
				}
			} else {
				for (let name in this._ownProperties) {
					let desc = this._ownProperties[name];
					if (!(desc.flags & AVM1PropertyFlags.DONT_ENUM)) {
						keys.push(name);
					}
				}
			}
			return keys;
		}

		public alGetProperty(p: any): AVM1PropertyDescriptor {
			let desc = this.alGetOwnProperty(p);
			if (desc) {
				return desc;
			}
			if (!this._prototype) {
				return undefined;
			}
			return this._prototype.alGetProperty(p);
		}

		public alGet(p: any): any {
			let name = this.context.normalizeName(p);
			let desc = this.alGetProperty(name);
			if (!desc) {
				return undefined;
			}
			if ((desc.flags & AVM1PropertyFlags.DATA)) {
				return desc.value;
			}
			release || Debug.assert((desc.flags & AVM1PropertyFlags.ACCESSOR));
			let getter = desc.get;
			if (!getter) {
				return undefined;
			}
			return getter.alCall(this);
		}

		public alCanPut(p: any): boolean {
			let desc = this.alGetOwnProperty(p);
			if (desc) {
				if ((desc.flags & AVM1PropertyFlags.ACCESSOR)) {
					return !!desc.set;
				} else {
					return !(desc.flags & AVM1PropertyFlags.READ_ONLY);
				}
			}
			let proto = this._prototype;
			if (!proto) {
				return true;
			}
			return proto.alCanPut(p);
		}

		public alPut(p: any, v: any) {
			// Perform all lookups with the canonicalized name, but keep the original name around to
			// pass it to `alSetOwnProperty`, which stores it on the descriptor.
			let originalName = p;
			p = this.context.normalizeName(p);
			if (!this.alCanPut(p)) {
				return;
			}
			let ownDesc = this.alGetOwnProperty(p);
			if (ownDesc && (ownDesc.flags & AVM1PropertyFlags.DATA)) {
				if (ownDesc.watcher) {
					v = ownDesc.watcher.callback.alCall(this,
						[ownDesc.watcher.name, ownDesc.value, v, ownDesc.watcher.userData]);
				}
				// Real properties (i.e., not things like "_root" on MovieClips) can be updated in-place.
				if (p in this._ownProperties) {
					ownDesc.value = v;
				} else {
					this.alSetOwnProperty(originalName, new AVM1PropertyDescriptor(ownDesc.flags, v));
				}
				return;
			}
			let desc = this.alGetProperty(p);
			if (desc && (desc.flags & AVM1PropertyFlags.ACCESSOR)) {
				if (desc.watcher) {
					let oldValue = desc.get ? desc.get.alCall(this) : undefined;
					v = desc.watcher.callback.alCall(this,
						[desc.watcher.name, oldValue, v, desc.watcher.userData]);
				}
				let setter = desc.set;
				release || Debug.assert(setter);
				setter.alCall(this, [v]);
			} else {
				if (desc && desc.watcher) {
					release || Debug.assert(desc.flags & AVM1PropertyFlags.DATA);
					v = desc.watcher.callback.alCall(this,
						[desc.watcher.name, desc.value, v, desc.watcher.userData]);
				}
				let newDesc = new AVM1PropertyDescriptor(desc ? desc.flags : AVM1PropertyFlags.DATA, v);
				this.alSetOwnProperty(originalName, newDesc);
			}
		}

		public alHasProperty(p: any): boolean {
			let desc = this.alGetProperty(p);
			return !!desc;
		}

		public alDeleteProperty(p: any): boolean {
			let desc = this.alGetOwnProperty(p);
			if (!desc) {
				return true;
			}
			if ((desc.flags & AVM1PropertyFlags.DONT_DELETE)) {
				return false;
			}
			this.alDeleteOwnProperty(p);
			return true;
		}

		public alAddPropertyWatcher(p: any, callback: IAVM1Callable, userData: any): boolean {
			// TODO verify/test this functionality to match ActionScript
			let desc = this.alGetProperty(p);
			if (!desc) {
				return false;
			}
			desc.watcher = {
				name: p,
				callback: callback,
				userData: userData
			};
			return true;
		}

		public alRemotePropertyWatcher(p: any): boolean {
			let desc = this.alGetProperty(p);
			if (!desc || !desc.watcher) {
				return false;
			}
			desc.watcher = undefined;
			return true;

		}

		public alDefaultValue(hint: AVM1DefaultValueHint = AVM1DefaultValueHint.NUMBER): any {
			if (hint === AVM1DefaultValueHint.STRING) {
				let toString = this.alGet(this.context.normalizeName('toString'));
				if (alIsFunction(toString)) {
					let str = toString.alCall(this);
					return str;
				}
				let valueOf = this.alGet(this.context.normalizeName('valueOf'));
				if (alIsFunction(valueOf)) {
					let val = valueOf.alCall(this);
					return val;
				}
			} else {
				release || Debug.assert(hint === AVM1DefaultValueHint.NUMBER);
				let valueOf = this.alGet(this.context.normalizeName('valueOf'));
				if (alIsFunction(valueOf)) {
					let val = valueOf.alCall(this);
					return val;
				}
				let toString = this.alGet(this.context.normalizeName('toString'));
				if (alIsFunction(toString)) {
					let str = toString.alCall(this);
					return str;
				}
			}
			// TODO is this a default?
			return this;
		}

		public alGetKeys(): string[] {
			let ownKeys = this.alGetOwnPropertiesKeys();
			let proto = this._prototype;
			if (!proto) {
				return ownKeys;
			}

			let otherKeys = proto.alGetKeys();
			if (ownKeys.length === 0) {
				return otherKeys;
			}

			// Merging two keys sets
			// TODO check if we shall worry about __proto__ usage here
			let context = this.context;
			// If the context is case-insensitive, names only differing in their casing overwrite each
			// other. Iterating over the keys returns the first original, case-preserved key that was
			// ever used for the property, though.
			if (!context.isPropertyCaseSensitive) {
				let keyLists = [ownKeys, otherKeys];
				let canonicalKeysMap = Object.create(null);
				let keys = [];
				for (let k = 0; k < keyLists.length; k++) {
					let keyList = keyLists[k];
					for (let i = keyList.length; i--;) {
						let key = keyList[i];
						let canonicalKey = context.normalizeName(key);
						if (canonicalKeysMap[canonicalKey]) {
							continue;
						}
						canonicalKeysMap[canonicalKey] = true;
						keys.push(key);
					}
				}
				return keys;
			} else {
				let processed = Object.create(null);
				for (let i = 0; i < ownKeys.length; i++) {
					processed[ownKeys[i]] = true;
				}
				for (let i = 0; i < otherKeys.length; i++) {
					processed[otherKeys[i]] = true;
				}
				return Object.getOwnPropertyNames(processed);
			}
		}
	}

	/**
	 * Base class for ActionsScript functions.
	 */
	export class AVM1Function extends AVM1Object implements IAVM1Callable {
		public constructor(context: IAVM1Context) {
			super(context);
			this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
		}

		public alConstruct(args?: any[]): AVM1Object {
			throw new Error('not implemented AVM1Function.alConstruct');
		}

		public alCall(thisArg: any, args?: any[]): any {
			throw new Error('not implemented AVM1Function.alCall');
		}

		/**
		 * Wraps the function to the callable JavaScript function.
		 * @returns {Function} a JavaScript function.
		 */
		public toJSFunction(thisArg: AVM1Object = null): Function {
			let fn = this;
			let context = this.context;
			return function () {
				let args = Array.prototype.slice.call(arguments, 0);
				return context.executeFunction(fn, thisArg, args);
			};
		}
	}

	/**
	 * Base class for ActionScript functions with native JavaScript implementation.
	 */
	export class AVM1NativeFunction extends AVM1Function {
		private _fn: Function;
		private _ctor: Function;

		/**
		 * @param {IAVM1Context} context
		 * @param {Function} fn The native function for regular calling.
		 * @param {Function} ctor The native function for construction.
		 */
		public constructor(context: IAVM1Context, fn: Function, ctor?: Function) {
			super(context);
			this._fn = fn;
			if (ctor) {
				this._ctor = ctor;
			}
		}

		public alConstruct(args?: any[]): AVM1Object {
			if (!this._ctor) {
				throw new Error('not a constructor');
			}
			return this._ctor.apply(this, args);
		}

		public alCall(thisArg: any, args?: any[]): any {
			if (!this._fn) {
				throw new Error('not callable');
			}
			return this._fn.apply(thisArg, args);
		}
	}

	/**
	 * Base class the is used for the interpreter.
	 * See {AVM1InterpretedFunction} implementation
	 */
	export class AVM1EvalFunction extends AVM1Function {
		public constructor(context: IAVM1Context) {
			super(context);
			let proto = new AVM1Object(context);
			proto.alPrototype = context.builtins.Object.alGetPrototypeProperty();
			proto.alSetOwnProperty('constructor', new AVM1PropertyDescriptor(AVM1PropertyFlags.DATA |
				AVM1PropertyFlags.DONT_ENUM |
				AVM1PropertyFlags.DONT_DELETE));
			this.alSetOwnPrototypeProperty(proto);
		}

		public alConstruct(args?: any[]): AVM1Object {
			let obj = new AVM1Object(this.context);
			let objPrototype = this.alGetPrototypeProperty();
			if (!(objPrototype instanceof AVM1Object)) {
				objPrototype = this.context.builtins.Object.alGetPrototypeProperty();
			}
			obj.alPrototype = objPrototype;
			obj.alSetOwnConstructorProperty(this);
			let result = this.alCall(obj, args);
			return result instanceof AVM1Object ? result : obj;
		}
	}

	// TODO create classes for the ActionScript errors.

	class AVM1TypeError extends Error {
		constructor(msg?: any) {
			super(msg);
		}
	}

	export function alToPrimitive(context: IAVM1Context, v: any, preferredType?: AVM1DefaultValueHint) {
		if (!(v instanceof AVM1Object)) {
			return v;
		}
		let obj: AVM1Object = v;
		return preferredType !== undefined ? obj.alDefaultValue(preferredType) : obj.alDefaultValue();
	}

	export function alToBoolean(context: IAVM1Context, v: any): boolean {
		switch (typeof v) {
			case 'undefined':
				return false;
			case 'object':
				return v !== null;
			case 'boolean':
				return v;
			case 'string':
			case 'number':
				return !!v;
			default:
				release || Debug.assert(false);
		}
		return false;
	}

	export function alToNumber(context: IAVM1Context, v: any): number {
		if (typeof v === 'object' && v !== null) {
			v = alToPrimitive(context, v, AVM1DefaultValueHint.NUMBER);
		}
		switch (typeof v) {
			case 'undefined':
				return context.swfVersion >= 7 ? NaN : 0;
			case 'object':
				if (v === null) {
					return context.swfVersion >= 7 ? NaN : 0;
				}
				return context.swfVersion >= 5 ? NaN : 0;
			case 'boolean':
				return v ? 1 : 0;
			case 'number':
				return v;
			case 'string':
				if (v === '' && context.swfVersion < 5) {
					return 0;
				}
				return +v;
			default:
				release || Debug.assert(false);
		}
		return 0;
	}

	export function alToInteger(context: IAVM1Context, v: any): number {
		let n = alToNumber(context, v);
		if (isNaN(n)) {
			return 0;
		}
		if (n === 0 || n === Number.POSITIVE_INFINITY || n === Number.NEGATIVE_INFINITY) {
			return n;
		}
		return n < 0 ? Math.ceil(n) : Math.floor(n);
	}

	export function alToInt32(context: IAVM1Context, v: any): number {
		let n = alToNumber(context, v);
		return n | 0;
	}

	export function alToString(context: IAVM1Context, v: any): string {
		if (typeof v === 'object' && v !== null) {
			v = alToPrimitive(context, v, AVM1DefaultValueHint.STRING);
		}
		switch (typeof v) {
			case 'undefined':
				return context.swfVersion >= 7 ? 'undefined' : '';
			case 'object':
				if (v === null) {
					return 'null';
				}
				return '[type ' + alGetObjectClass(v) + ']';
			case 'boolean':
				return v ? 'true' : 'false';
			case 'number':
				return v + '';
			case 'string':
				return v;
			default:
				release || Debug.assert(false);
		}
		return '';
	}

	export function alIsName(context: IAVM1Context, v: any): boolean {
		return typeof v === 'number' ||
			typeof v === 'string' &&
			(context.isPropertyCaseSensitive || v === v.toLowerCase());
	}

	export function alToObject(context: IAVM1Context, v: any): AVM1Object {
		switch (typeof v) {
			case 'undefined':
				throw new AVM1TypeError();
			case 'object':
				if (v === null) {
					throw new AVM1TypeError();
				}
				// TODO verify if all objects here are inherited from AVM1Object
				if (Array.isArray(v)) {
					return new Natives.AVM1ArrayNative(context, v);
				}
				return v;
			case 'boolean':
				return new Natives.AVM1BooleanNative(context, v);
			case 'number':
				return new Natives.AVM1NumberNative(context, v);
			case 'string':
				return new Natives.AVM1StringNative(context, v);
			default:
				release || Debug.assert(false);
		}
		return null;
	}

	export function alNewObject(context: IAVM1Context): AVM1Object {
		let obj = new AVM1Object(context);
		obj.alPrototype = context.builtins.Object.alGetPrototypeProperty();
		obj.alSetOwnConstructorProperty(context.builtins.Object);
		return obj;
	}

	export function alGetObjectClass(obj: AVM1Object): string {
		if (obj instanceof AVM1Function) {
			return 'Function';
		}
		// TODO more cases
		return 'Object';
	}

	/**
	 * Non-standard string coercion function roughly matching the behavior of AVM2's axCoerceString.
	 *
	 * This is useful when dealing with AVM2 objects in the implementation of AVM1 builtins: they
	 * frequently expect either a string or `null`, but not `undefined`.
	 */
	export function alCoerceString(context: IAVM1Context, x: any): string {
		if (x instanceof AVM1Object) {
			return alToString(context, x);
		}
		return Shumway.AVMX.axCoerceString(x);
	}

	export function alCoerceNumber(context: IAVM1Context, x: any): number {
		if (isNullOrUndefined(x)) {
			return undefined;
		}
		return alToNumber(context, x);
	}

	export function alIsIndex(context: IAVM1Context, p: any) {
		if (p instanceof AVM1Object) {
			return isIndex(alToString(context, p));
		}
		return isIndex(p);
	}

	export function alForEachProperty(obj: AVM1Object, fn: (name: string) => void, thisArg?: any) {
		obj.alGetKeys().forEach(fn, thisArg);
	}

	export function alIsFunction(obj: any): boolean {
		return obj instanceof AVM1Function;
	}

	export function alCallProperty(obj: AVM1Object, p: any, args?: any[]): any {
		let callable: IAVM1Callable = obj.alGet(p);
		callable.alCall(obj, args);
	}

	export function alInstanceOf(context: IAVM1Context, obj: any, cls: any): boolean {
		if (!(obj instanceof AVM1Object)) {
			return false;
		}
		if (!(cls instanceof AVM1Object)) {
			return false;
		}
		let proto = cls.alGetPrototypeProperty();
		for (let i = obj; i; i = i.alPrototype) {
			if (i === proto) {
				return true;
			}
		}
		return false;
	}

	export function alIsArray(context: IAVM1Context, v: any): boolean {
		return alInstanceOf(context, v, context.builtins.Array);
	}

	export function alIsArrayLike(context: IAVM1Context, v: any): boolean {
		if (!(v instanceof AVM1Object)) {
			return false;
		}
		let length = alToInteger(context, v.alGet('length'));
		if (isNaN(length) || length < 0 || length >= 4294967296) {
			return false;
		}
		return true;
	}

	export function alIterateArray(context: IAVM1Context, arr: AVM1Object,
	                               fn: (obj: any, index?: number) => void, thisArg: any = null): void {
		let length = alToInteger(context, arr.alGet('length'));
		if (isNaN(length) || length >= 4294967296) {
			return;
		}
		for (let i = 0; i < length; i++) {
			fn.call(thisArg, arr.alGet(i), i);
		}
	}

	export function alIsString(context: IAVM1Context, v: any): boolean {
		return typeof v === 'string';
	}

	export function alDefineObjectProperties(obj: AVM1Object, descriptors: any): void {
		let context = obj.context;
		Object.getOwnPropertyNames(descriptors).forEach(function (name) {
			let desc = descriptors[name];
			let value, getter, setter;
			let flags: AVM1PropertyFlags = 0;
			if (typeof desc === 'object') {
				if (desc.get || desc.set) {
					getter = desc.get ? new AVM1NativeFunction(context, desc.get) : undefined;
					setter = desc.set ? new AVM1NativeFunction(context, desc.set) : undefined;
					flags |= AVM1PropertyFlags.ACCESSOR;
				} else {
					value = desc.value;
					if (typeof value === 'function') {
						value = new AVM1NativeFunction(context, value);
					}
					flags |= AVM1PropertyFlags.DATA;
					if (!desc.writable) {
						flags |= AVM1PropertyFlags.READ_ONLY;
					}
				}
				if (!desc.enumerable) {
					flags |= AVM1PropertyFlags.DONT_ENUM;
				}
				if (!desc.configurable) {
					flags |= AVM1PropertyFlags.DONT_DELETE;
				}
			} else {
				value = desc;
				if (typeof value === 'function') {
					value = new AVM1NativeFunction(context, value);
				}
				flags |= AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_DELETE |
					AVM1PropertyFlags.DONT_ENUM | AVM1PropertyFlags.READ_ONLY;
			}
			obj.alSetOwnProperty(name, new AVM1PropertyDescriptor(flags, value, getter, setter));
		});
	}
}

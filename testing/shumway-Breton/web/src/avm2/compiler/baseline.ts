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

module Shumway.AVMX.Compiler {
	import assert = Debug.assert;

	let writer = Compiler.baselineDebugLevel.value > 0 ? new IndentingWriter() : null;

	declare let Relooper;

	let compileCount = 0, passCompileCount = 0, failCompileCount = 0, compileTime = 0;

	function escapeAllowedCharacter(ch, next) {
		switch (ch) {
			case '\b':
				return '\\b';
			case '\f':
				return '\\f';
			case '\t':
				return '\\t';
			default:
				let code = ch.charCodeAt(0), hex = code.toString(16), result;
				if (code > 0xff) {
					result = '\\u' + '0000'.slice(hex.length) + hex;
				} else if (ch === '\u0000' && '0123456789'.indexOf(next) < 0) {
					result = '\\0';
				} else if (ch === '\x0B') { // '\v'
					result = '\\x0B';
				} else {
					result = '\\x' + '00'.slice(hex.length) + hex;
				}
				return result;
		}
	}

	function escapeDisallowedCharacter(ch) {
		switch (ch) {
			case '\\':
				return '\\\\';
			case '\n':
				return '\\n';
			case '\r':
				return '\\r';
			case '\u2028':
				return '\\u2028';
			case '\u2029':
				return '\\u2029';
			default:
				throw new Error('Incorrectly classified character');
		}
	}

	let escapeStringCacheCount = 0;
	let escapeStringCache = Object.create(null);

	export function escapeString(str: string) {
		let result = escapeStringCache[str];
		if (result) {
			return result;
		}
		if (escapeStringCacheCount === 1024) {
			escapeStringCache = Object.create(null);
			escapeStringCacheCount = 0;
		}
		result = '"';

		for (let i = 0, len = str.length; i < len; ++i) {
			let ch = str[i];
			if (ch === '"') {
				result += '\\';
			} else if ('\\\n\r\u2028\u2029'.indexOf(ch) >= 0) {
				result += escapeDisallowedCharacter(ch);
				continue;
			} else if (!(ch >= ' ' && ch <= '~')) {
				result += escapeAllowedCharacter(ch, str[i + 1]);
				continue;
			}
			result += ch;
		}

		result += '"';
		escapeStringCache[str] = result;
		escapeStringCacheCount++;
		return result;
	}

	function makeLiteral(value: any) {
		if (typeof value === "string") {
			return escapeString(value);
		}
		return String(value);
	}

	class Emitter {
		private _buffer: string [];
		private _indent = 0;
		private _emitIndent;

		constructor(emitIndent: boolean) {
			this._buffer = [];
			this._emitIndent = true; // emitIndent;
		}

		reset() {
			this._buffer.length = 0;
			this._indent = 0;
		}

		enter(s: string) {
			this.writeLn(s);
			this._indent++;
		}

		leave(s: string) {
			this._indent--;
			this.writeLn(s);
		}

		leaveAndEnter(s: string) {
			this._indent--;
			this.writeLn(s);
			this._indent++;
		}

		writeLn(s: string) {
			if (!release && this._emitIndent) {
				let prefix = "";
				for (let i = 0; i < this._indent; i++) {
					prefix += "  ";
				}
				s = prefix + s;
			}
			this._buffer.push(s);
		}

		writeLns(s: string) {
			if (release) {
				this._buffer.push(s);
				return;
			}
			let lines = s.split("\n");
			for (let i = 0; i < lines.length; i++) {
				let line = lines[i];
				if (line.length > 0) {
					this.writeLn(lines[i]);
				}
			}
		}

		indent() {
			this._indent++;
		}

		outdent() {
			this._indent--;
		}

		toString(): string {
			return this._buffer.join("\n");
		}
	}

	interface BlockState {
		stack: number;
		scopeIndex: number;
	}

	class BaselineCompiler {
		blocks: Bytecode [];
		bytecodes: Bytecode [];
		blockStates: BlockState [];
		bodyEmitter: Emitter;
		blockEmitter: Emitter;
		relooperEntryBlock: number;
		parameters: string [];
		local: string [];
		abc: ABCFile;

		private pushedStrings: number[] = [];
		private stack: number = 0;
		private scopeIndex: number = 0;
		private hasNext2Infos: number = 0;

		private blockBodies: string[] = [];

		static localNames = ["this", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

		/**
		 * Make sure that none of these shadow global names.
		 */
		static stackNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

		constructor(public methodInfo: MethodInfo, private scope: Scope, private hasDynamicScope: boolean,
		            private globalMiName: string) {
			this.abc = this.methodInfo.abc;
		}

		compile() {
			compileCount++;

			release || assert(!Relooper.r);
			Relooper.init();

			this.bodyEmitter = new Emitter(!release);
			this.blockEmitter = new Emitter(!release);

			let body = this.methodInfo.getBody();

			let hasCatchBlocks = body.catchBlocks.length > 0;

			if (hasCatchBlocks) {
				this.bodyEmitter.writeLn("let pc = 0;");
			}

			let start = performance.now();
			release || writer && writer.writeLn("Compiling: " + compileCount + " " + this.methodInfo);

			let analysis = this.methodInfo.analysis || new Analysis(this.methodInfo);
			if (!analysis.analyzedControlFlow) {
				analysis.analyzeControlFlow();
			}
			this.methodInfo.classScope = this.scope;

			let blocks = this.blocks = analysis.blocks;
			this.bytecodes = analysis.bytecodes;
			this.blockStates = [];

			release || writer && writer.writeLn("Code: " + this.bytecodes.length + ", Blocks: " + blocks.length);

			this.local = ['this'];
			// TODO: Emit locals, parameters, and stack slots after body, and collect required info there.
			// This would allow us to get rid of that part of the analysis phase above, and in many cases,
			// because the information in the header is often incorrect, emit less code.
			this.parameters = [];
			if (this.hasDynamicScope) {
				this.parameters.push('$0');
			}
			// If the hasDynamicScope is passed in, then we need to offset the argument position.
			let parameterIndexOffset = this.hasDynamicScope ? 1 : 0;
			let parameterCount = this.methodInfo.parameters.length;
			for (let i = 0; i < parameterCount; i++) {
				let parameter = this.methodInfo.parameters[i];
				let parameterName = this.getLocalName(i + 1);
				this.local.push(parameterName);
				this.parameters.push(parameterName);
				if (parameter.optional && parameter.isUsed) {
					let value = makeLiteral(parameter.value);
					this.bodyEmitter.writeLn('arguments.length < ' + (parameterIndexOffset + i + 1) + ' && (' + parameterName + ' = ' +
						value + ');');
				}
				let coercedParamameter = wrapInCoercer(parameterName, parameter.type);
				if (coercedParamameter !== parameterName) {
					this.bodyEmitter.writeLn(parameterName + ' = ' + coercedParamameter + ';');
				}
			}

			let localsCount = body.localCount;
			if (localsCount > parameterCount + 1) {
				let localsDefinition = 'let ';
				for (let i = parameterCount + 1; i < localsCount; i++) {
					this.local.push(this.getLocalName(i));
					localsDefinition += this.local[i] + (i < (localsCount - 1) ? ', ' : ';');
				}
				this.bodyEmitter.writeLn(localsDefinition);
			}

			if (body.maxStack > 0) {
				let stackSlotsDefinition = 'let ';
				for (let i = 0; i < body.maxStack; i++) {
					stackSlotsDefinition +=
						this.getStack(i) + (i < (body.maxStack - 1) ? ', ' : ';');
				}
				this.bodyEmitter.writeLn(stackSlotsDefinition);
			}

			let scopesCount = body.maxScopeDepth - body.initScopeDepth + 1;
			let scopesOffset = this.hasDynamicScope ? 1 : 0;
			if (scopesCount - scopesOffset) {
				let scopesDefinition = 'let ';
				for (let i = scopesOffset; i < scopesCount; i++) {
					scopesDefinition += this.getScope(i) + (i < (scopesCount - 1) ? ', ' : ';');
				}
				this.bodyEmitter.writeLn(scopesDefinition);
			}

			this.bodyEmitter.writeLn('let mi = ' + this.globalMiName + ';');
			if (!this.hasDynamicScope) {
				this.bodyEmitter.writeLn('$0 = mi.classScope;');
			}
			this.bodyEmitter.writeLn('let label;');

			if (this.methodInfo.needsRest() || this.methodInfo.needsArguments()) {
				let offset = parameterIndexOffset + (this.methodInfo.needsRest() ? parameterCount : 0);
				this.bodyEmitter.writeLn(this.local[parameterCount + 1] +
					' = sliceArguments(arguments, ' + offset + ');');
			}

			let relooperEntryBlock = this.relooperEntryBlock = Relooper.addBlock("// Entry Block");

			// Create a relooper block for each basic block.
			for (let i = 0; i < blocks.length; i++) {
				let block = blocks[i];
				block.relooperBlock = Relooper.addBlock("// Block: " + block.bid);
			}

			// If we have exception handlers, dispatch to appropriate block using the current PC, which
			// was set in the catch block.
			let exceptionEntryBlocks = [];
			if (hasCatchBlocks) {
				let catchBlocks = body.catchBlocks;
				for (let i = 0; i < catchBlocks.length; i++) {
					let target = catchBlocks[i].target;
					this.propagateBlockState(null, target, 1, 0);
					exceptionEntryBlocks[target.bid] = target;
					Relooper.addBranch(relooperEntryBlock, target.relooperBlock, "pc === " + target.pc);
				}
			}

			// By default we dispatch to the first block.
			Relooper.addBranch(relooperEntryBlock, blocks[0].relooperBlock);

			this.propagateBlockState(null, blocks[0], 0, 0);
			this.emitBlocks();

			if (this.hasNext2Infos > 0) {
				let hasNext2Definition = 'let ';
				for (let i = 0; i < this.hasNext2Infos; i++) {
					hasNext2Definition += 'hasNext' + i + ' = new HasNext2Info()';
					hasNext2Definition += (i < (this.hasNext2Infos - 1) ? ', ' : ';');
				}
				this.bodyEmitter.writeLn(hasNext2Definition);
			}

			if (hasCatchBlocks) {
				this.bodyEmitter.enter("while(1) {");
				this.bodyEmitter.enter("try {");
			}

			let allBlocks: string = Relooper.render(this.relooperEntryBlock);
			for (let i = 0; i < blocks.length; i++) {
				let bid = blocks[i].bid;
				let blockCode = this.blockBodies[bid];
				release || assert(blockCode);
				allBlocks = allBlocks.split('"\'"\'' + bid + '"\'"\'').join(blockCode);
			}
			this.bodyEmitter.writeLns(allBlocks);

			if (hasCatchBlocks) {
				this.bodyEmitter.leaveAndEnter("} catch (ex) {");
				let catchBlocks = body.catchBlocks;
				for (let i = 0; i < catchBlocks.length; i++) {
					let handler = catchBlocks[i];
					let check = "";
					let type = handler.getType();
					if (type) {
						this.bodyEmitter.writeLn('let mn = mi.abc.constantPool.multinames[' +
							handler.typeNameIndex + '];');
						this.bodyEmitter.writeLn('let type = mi.abc.applicationDomain.getType(mn);');
						check = " && type.isType(ex)";
					}
					this.bodyEmitter.writeLn("if (pc >= " + handler.start_pc + " && pc <= " + handler.end_pc + check + ") { pc = " + handler.target_pc + "; continue; }");
				}
				this.bodyEmitter.leave("}");
				this.bodyEmitter.leave("}");
			}

			let body = this.bodyEmitter.toString();

			let duration = performance.now() - start;
			compileTime += duration;
			passCompileCount++;
			writer && writer.writeLn("Compiled: PASS: " + passCompileCount +
				", FAIL: " + failCompileCount +
				", TIME: " + (duration).toFixed(2) +
				", RATIO: " + (passCompileCount / compileCount).toFixed(4) +
				" (" + compileTime.toFixed(2) + " total)");

			BytecodePool.releaseList(analysis.bytecodes);
			Relooper.cleanup();
			return {body: body, parameters: this.parameters};
		}

		emitBlocks() {
			let blocks = this.blocks;
			for (let i = 0; i < blocks.length; i++) {
				let block = blocks[i];
				this.emitBlock(block);
				if (!release) {
					assert(this.stack >= 0);
					assert(this.scopeIndex >= 0);
				}
			}
		}

		setCurrentBlockState(block: Bytecode) {
			let state = this.blockStates[block.bid];
			assert(state, "No state exists for " + block.bid);
			this.stack = state.stack;
			this.scopeIndex = state.scopeIndex;
		}

		propagateBlockState(predecessorBlock: Bytecode, block: Bytecode, stack: number, scopeIndex: number) {
			// writer && writer.writeLn("Propagating from: " + (predecessorBlock ? predecessorBlock.bid :
			// -1) + ", to: " + block.bid + " " + stack + " " + scopeIndex);
			let state = this.blockStates[block.bid];
			if (state) {
				assert(state.stack === stack, "Stack heights don't match, stack: " + stack + ", was: " + state.stack);
				assert(state.scopeIndex === scopeIndex, "Scope index doesn't match, scopeIndex: " + scopeIndex + ", was: " + state.scopeIndex);
				return;
			}
			this.blockStates[block.bid] = {stack: stack, scopeIndex: scopeIndex};
		}

		/**
		 * Get's the first exception handler to cover the pc.
		 */
		getHandler(bc: Bytecode) {
			// Bytecode can't throw.
			if (!opcodeTable[bc.op].canThrow) {
				return null;
			}
			let pc = bc.pc;
			let catchBlocks = this.methodInfo.getBody().catchBlocks;
			for (let i = 0; i < catchBlocks.length; i++) {
				let exception = catchBlocks[i];
				if (exception.start_pc >= pc && pc <= exception.end_pc) {
					return exception;
				}
			}
			return null;
		}

		getStack(i: number): string {
			if (i >= BaselineCompiler.stackNames.length) {
				return "s" + (i - BaselineCompiler.stackNames.length);
			}
			return BaselineCompiler.stackNames[i];
		}

		getLocalName(i: number): string {
			if (i >= BaselineCompiler.localNames.length) {
				return "l" + (i - BaselineCompiler.localNames.length);
			}
			return BaselineCompiler.localNames[i];
		}

		getScope(i: number): string {
			return "$" + i;
		}

		getLocal(i: number): string {
			if (i < 0 || i >= this.local.length) {
				throw new Error("Out of bounds local read: " + i + ' > ' + (this.local.length - 1));
			}
			return this.local[i];
		}

		peek(): string {
			return this.getStack(this.stack - 1);
		}

		emitPopTemporaries(n: number) {
			for (let i = 0; i < n; i++) {
				this.blockEmitter.writeLn("let t" + i + " = " + this.pop() + ";");
			}
		}

		emitPushTemporary(...indices: number []) {
			for (let i = 0; i < indices.length; i++) {
				this.emitPush("t" + indices[i]);
			}
		}

		pop(): string {
			this.stack--;
			return this.getStack(this.stack);
		}

		emitBlock(block: Bytecode) {
			this.setCurrentBlockState(block);
			// writer && writer.writeLn("emitBlock: " + block.bid + " " + this.stack + " " +
			// this.scopeIndex);

			this.blockEmitter.reset();
			if (!release && Compiler.baselineDebugLevel.value > 1) {
				this.emitLine("// Block: " + block.bid);
			}
			let bytecodes = this.bytecodes;
			let bc;
			for (let bci = block.position, end = block.end.position; bci <= end; bci++) {
				bc = bytecodes[bci];
				this.emitBytecode(block, bc);
			}
			this.blockBodies[block.bid] = this.blockEmitter.toString();
			Relooper.setBlockCode(block.relooperBlock, '"\'"\'' + block.bid + '"\'"\'');

			let nextBlock = (end + 1 < bytecodes.length) ? bytecodes[end + 1] : null;
			if (nextBlock && !bc.isBlockEnd()) {
				Relooper.addBranch(block.relooperBlock, nextBlock.relooperBlock);
				this.propagateBlockState(block, nextBlock, this.stack, this.scopeIndex);
			}
		}

		peekScope() {
			return this.getScope(this.scopeIndex);
		}

		emitBytecode(code: Uint8Array, pc: number, bc: Bytecode) {
			release || assert(this.stack >= 0);
			release || assert(this.scopeIndex >= 0);

			// If a exception handler exists for the current PC, save the PC in case we throw. This is
			// how the catch block can figure out where we came from.
			if (this.getHandler(bc)) {
				this.blockEmitter.writeLn("pc = " + pc + ";");
			}

			if (!release) {
				let opName = Bytecode[bc];
				//Compiler.baselineDebugLevel.value > 1 && this.emitLine("// BC: " + String(bc));
			}
			switch (bc) {
				case Bytecode.GETLOCAL:
					this.emitLoadLocal(bc.index);
					break;
				case Bytecode.GETLOCAL0:
				case Bytecode.GETLOCAL1:
				case Bytecode.GETLOCAL2:
				case Bytecode.GETLOCAL3:
					this.emitLoadLocal(op - Bytecode.getlocal0);
					break;
				case Bytecode.SETLOCAL:
					this.emitStoreLocal(bc.index);
					break;
				case Bytecode.SETLOCAL0:
				case Bytecode.SETLOCAL1:
				case Bytecode.SETLOCAL2:
				case Bytecode.SETLOCAL3:
					this.emitStoreLocal(op - Bytecode.setlocal0);
					break;
				case Bytecode.INITPROPERTY:
				case Bytecode.SETPROPERTY:
					this.emitSetProperty(bc.index);
					break;
				case Bytecode.SETSUPER:
					this.emitSetSuper(bc.index);
					break;
				case Bytecode.GETPROPERTY:
					this.emitGetProperty(bc.index);
					break;
				case Bytecode.GETSUPER:
					this.emitGetSuper(bc.index);
					break;
				case Bytecode.DELETEPROPERTY:
					this.emitDeleteProperty(bc.index);
					break;
				case Bytecode.FINDPROPERTY:
					this.emitFindProperty(bc.index, false);
					break;
				case Bytecode.FINDPROPSTRICT:
					this.emitFindProperty(bc.index, true);
					break;
				case Bytecode.CALLPROPERTY:
				case Bytecode.CALLPROPVOID:
				case Bytecode.CALLPROPLEX:
					this.emitCallProperty(bc);
					break;
				case Bytecode.CALLSUPER:
				case Bytecode.CALLSUPERVOID:
					this.emitCallSuper(bc);
					break;
				case Bytecode.CALL:
					this.emitCall(bc);
					break;
				case Bytecode.GETLEX:
					this.emitGetLex(bc.index);
					break;
				case Bytecode.GETDESCENDANTS:
					this.emitGetDescendants(bc.index);
					break;
				case Bytecode.CHECKFILTER:
					this.emitCheckFilter();
					break;
				case Bytecode.PUSHWITH:
					this.emitPushScope(true);
					break;
				case Bytecode.PUSHSCOPE:
					this.emitPushScope(false);
					break;
				case Bytecode.POPSCOPE:
					this.popScope();
					break;
				case Bytecode.GETGLOBALSCOPE:
					this.emitGetGlobalScope();
					break;
				case Bytecode.GETSCOPEOBJECT:
					this.emitGetScopeObject();
					break;
				case Bytecode.GETSLOT:
					this.emitGetSlot(bc.index);
					break;
				case Bytecode.SETSLOT:
					this.emitSetSlot(bc.index);
					break;
				case Bytecode.NEWACTIVATION:
					this.emitPush('Object.create(mi.activationPrototype)');
					break;
				case Bytecode.NEWOBJECT:
					this.emitNewObject(bc);
					break;
				case Bytecode.NEWARRAY:
					this.emitNewArray(bc);
					break;
				case Bytecode.NEWCLASS:
					this.emitNewClass(bc);
					break;
				case Bytecode.NEWFUNCTION:
					this.emitNewFunction(bc);
					break;
				case Bytecode.NEWCATCH:
					this.emitNewCatch(bc);
					break;
				case Bytecode.CONSTRUCT:
					this.emitConstruct(bc);
					break;
				case Bytecode.CONSTRUCTPROP:
					this.emitConstructProperty(bc);
					break;
				case Bytecode.THROW:
					this.emitThrow();
					break;
				case Bytecode.HASNEXT2:
					this.emitHasNext2(bc);
					break;
				case Bytecode.NEXTNAME:
					this.emitNextName();
					break;
				case Bytecode.NEXTVALUE:
					this.emitNextValue();
					break;
				case Bytecode.JUMP:
					this.emitJump(block, bc);
					break;
				case Bytecode.IFNLT:
					this.emitBinaryIf(block, bc, "<", true);
					break;
				case Bytecode.IFNGE:
					this.emitBinaryIf(block, bc, ">=", true);
					break;
				case Bytecode.IFNGT:
					this.emitBinaryIf(block, bc, ">", true);
					break;
				case Bytecode.IFNLE:
					this.emitBinaryIf(block, bc, "<=", true);
					break;
				case Bytecode.IFGE:
					this.emitBinaryIf(block, bc, ">=", false);
					break;
				case Bytecode.IFGT:
					this.emitBinaryIf(block, bc, ">", false);
					break;
				case Bytecode.IFLE:
					this.emitBinaryIf(block, bc, "<=", false);
					break;
				case Bytecode.IFLT:
					this.emitBinaryIf(block, bc, "<", false);
					break;
				case Bytecode.IFEQ:
					this.emitIfEq(block, bc, false);
					break;
				case Bytecode.IFNE:
					this.emitIfEq(block, bc, true);
					break;
				case Bytecode.IFSTRICTEQ:
					this.emitBinaryIf(block, bc, "===", false);
					break;
				case Bytecode.IFSTRICTNE:
					this.emitBinaryIf(block, bc, "!==", false);
					break;
				case Bytecode.IFTRUE:
					this.emitUnaryIf(block, bc, "!!");
					break;
				case Bytecode.IFFALSE:
					this.emitUnaryIf(block, bc, "!");
					break;
				case Bytecode.LOOKUPSWITCH:
					this.emitLookupSwitch(block, bc);
					break;
				case Bytecode.PUSHSTRING:
					this.emitPushString(bc);
					break;
				case Bytecode.PUSHDOUBLE:
					this.emitPushDouble(bc);
					break;
				case Bytecode.PUSHINT:
					this.emitPush(this.constantPool.ints[bc.index]);
					break;
				case Bytecode.PUSHUINT:
					this.emitPush(this.constantPool.uints[bc.index]);
					break;
				case Bytecode.PUSHBYTE:
				case Bytecode.PUSHSHORT:
					this.emitPush(bc.value);
					break;
				case Bytecode.PUSHNULL:
					this.emitPush(null);
					break;
				case Bytecode.PUSHUNDEFINED:
					this.emitPush(undefined);
					break;
				case Bytecode.PUSHTRUE:
					this.emitPush(true);
					break;
				case Bytecode.PUSHFALSE:
					this.emitPush(false);
					break;
				case Bytecode.PUSHNAN:
					this.emitPush('NaN');
					break;
				case Bytecode.POP:
					// TODO whether this can validly happen. It does happen in mx.core::BitmapAsset's ctor,
					// where a block starts with a pop, but perhaps something has gone wrong earlier for that?
					if (this.stack > 0) {
						this.stack--;
					}
					break;
				case Bytecode.KILL:
					if (bc.index > 0) {
						this.emitReplaceLocal(bc.index, 'undefined');
					}
					break;
				case Bytecode.CONSTRUCTSUPER:
					this.emitConstructSuper(bc);
					break;
				case Bytecode.INCREMENT:
					this.emitLine(this.peek() + '++;');
					break;
				case Bytecode.INCREMENT_I:
					this.emitReplace('(' + this.peek() + '|0) + ' + 1);
					break;
				case Bytecode.DECREMENT:
					this.emitLine(this.peek() + '--;');
					break;
				case Bytecode.DECREMENT_I:
					this.emitReplace('(' + this.peek() + '|0) - ' + 1);
					break;
				case Bytecode.INCLOCAL:
					this.emitLine(this.getLocal(bc.index) + '++;');
					break;
				case Bytecode.INCLOCAL_I:
					this.emitReplaceLocal(bc.index, '(' + this.getLocal(bc.index) + '|0) + ' + 1);
					break;
				case Bytecode.DECLOCAL:
					this.emitLine(this.getLocal(bc.index) + '--;');
					break;
				case Bytecode.DECLOCAL_I:
					this.emitReplaceLocal(bc.index, '(' + this.getLocal(bc.index) + '|0) - ' + 1);
					break;
				case Bytecode.NOT:
					this.emitUnaryOp('!');
					break;
				case Bytecode.BITNOT:
					this.emitUnaryOp('~');
					break;
				case Bytecode.NEGATE:
					this.emitUnaryOp('-');
					break;
				case Bytecode.NEGATE_I:
					this.emitUnaryOp_i('-');
					break;
				case Bytecode.UNPLUS:
					this.emitUnaryOp('+');
					break;
				case Bytecode.EQUALS:
					this.emitEquals();
					break;
				case Bytecode.ADD:
					this.emitAddExpression();
					break;
				case Bytecode.ADD_I:
					this.emitBinaryExpression_i(' + ');
					break;
				case Bytecode.SUBTRACT:
					this.emitBinaryExpression(' - ');
					break;
				case Bytecode.SUBTRACT_I:
					this.emitBinaryExpression_i(' - ');
					break;
				case Bytecode.MULTIPLY:
					this.emitBinaryExpression(' * ');
					break;
				case Bytecode.MULTIPLY_I:
					this.emitBinaryExpression_i(' * ');
					break;
				case Bytecode.DIVIDE:
					this.emitBinaryExpression(' / ');
					break;
				case Bytecode.MODULO:
					this.emitBinaryExpression(' % ');
					break;
				case Bytecode.LSHIFT:
					this.emitBinaryExpression(' << ');
					break;
				case Bytecode.RSHIFT:
					this.emitBinaryExpression(' >> ');
					break;
				case Bytecode.URSHIFT:
					this.emitBinaryExpression(' >>> ');
					break;
				case Bytecode.BITAND:
					this.emitBinaryExpression(' & ');
					break;
				case Bytecode.BITOR:
					this.emitBinaryExpression(' | ');
					break;
				case Bytecode.BITXOR:
					this.emitBinaryExpression(' ^ ');
					break;
				case Bytecode.STRICTEQUALS:
					this.emitBinaryExpression(' === ');
					break;
				case Bytecode.LESSEQUALS:
					this.emitBinaryExpression(' <= ');
					break;
				case Bytecode.LESSTHAN:
					this.emitBinaryExpression(' < ');
					break;
				case Bytecode.GREATEREQUALS:
					this.emitBinaryExpression(' >= ');
					break;
				case Bytecode.GREATERTHAN:
					this.emitBinaryExpression(' > ');
					break;
				case Bytecode.COERCE:
					this.emitCoerce(bc);
					break;
				case Bytecode.COERCE_A:
					// NOP.
					break;
				case Bytecode.COERCE_I:
				case Bytecode.CONVERT_I:
					this.emitCoerceInt();
					break;
				case Bytecode.COERCE_U:
				case Bytecode.CONVERT_U:
					this.emitCoerceUint();
					break;
				case Bytecode.COERCE_D:
				case Bytecode.CONVERT_D:
					this.emitCoerceNumber();
					break;
				case Bytecode.COERCE_B:
				case Bytecode.CONVERT_B:
					this.emitCoerceBoolean();
					break;
				case Bytecode.COERCE_O:
				case Bytecode.CONVERT_O:
					this.emitCoerceObject(bc);
					break;
				case Bytecode.COERCE_S:
				case Bytecode.CONVERT_S:
					this.emitCoerceString(bc);
					break;
				case Bytecode.INSTANCEOF:
					this.emitInstanceof();
					break;
				case Bytecode.ISTYPE:
					this.emitIsType(bc.index);
					break;
				case Bytecode.ISTYPELATE:
					this.emitIsTypeLate();
					break;
				case Bytecode.ASTYPELATE:
					this.emitAsTypeLate();
					break;
				case Bytecode.APPLYTYPE:
					this.emitApplyType(bc);
					break;
				case Bytecode.IN:
					this.emitIn();
					break;
				case Bytecode.TYPEOF:
					this.emitReplace('axTypeOf(' + this.peek() + ', sec)');
					break;
				case Bytecode.DUP:
					this.emitDup();
					break;
				case Bytecode.SWAP:
					this.emitSwap();
					break;
				case Bytecode.RETURNVOID:
					this.emitReturnVoid();
					break;
				case Bytecode.RETURNVALUE:
					this.emitReturnValue();
					break;
				case Bytecode.DEBUG:
				case Bytecode.DEBUGFILE:
				case Bytecode.DEBUGLINE:
					// Ignored.
					break;
				default:
					throw "Not Implemented: " + Bytecode[op];
			}
		}

		emitLoadLocal(i: number) {
			this.emitPush(this.getLocal(i));
		}

		emitStoreLocal(i: number) {
			this.blockEmitter.writeLn(this.getLocal(i) + " = " + this.pop() + ";");
		}

		emitReplaceLocal(i: number, v: string) {
			this.blockEmitter.writeLn(this.getLocal(i) + " = " + v + ";");
		}

		emitSetProperty(nameIndex: number) {
			let value = this.pop();
			let multiname = this.constantPool.multinames[nameIndex];
			// TODO: re-enable after XML and XMLList are able to handle this.
			if (false && multiname.isSimpleStatic()) {
				let qualifiedName = Multiname.qualifyName(multiname.namespaces[0], multiname.name);
				this.blockEmitter.writeLn(this.pop() + '.' + qualifiedName + ' = ' + value + ';');
			} else {
				let nameElements = this.emitMultiname(nameIndex);
				this.blockEmitter.writeLn(this.pop() + ".axSetProperty(" + nameElements + ", " +
					value + ");");
			}
		}

		emitSetSuper(nameIndex: number) {
			let value = this.pop();
			let multiname = this.constantPool.multinames[nameIndex];
			if (multiname.isSimpleStatic()) {
				let qualifiedName = Multiname.qualifyName(multiname.namespaces[0], multiname.name);
				if ('s' + qualifiedName in this.methodInfo.classScope.object.baseClass.traitsPrototype) {
					this.emitLine('mi.classScope.object.baseClass.traitsPrototype.s' + qualifiedName +
						'.call(' + this.pop() + ', ' + value + ');');
				} else {
					// If the base class doesn't have this as a setter, we can just emit a plain property
					// set: if this class overrode the value, then it'd be overridden, period.
					this.emitLine(this.pop() + '.' + qualifiedName + ' = ' + value + ';');
				}
			} else {
				let nameElements = this.emitMultiname(nameIndex);
				this.emitLine(this.pop() + ".axSetSuper(mi.classScope, " + nameElements + ", " +
					value + ");");
			}
		}

		emitGetProperty(nameIndex: number) {
			let multiname = this.constantPool.multinames[nameIndex];
			// TODO: re-enable after XML and XMLList are able to handle this.
			if (false && multiname.isSimpleStatic()) {
				let qualifiedName = Multiname.qualifyName(multiname.namespaces[0], multiname.name);
				this.emitReplace(this.peek() + '.' + qualifiedName);
			} else {
				let nameElements = this.emitMultiname(nameIndex);
				this.emitReplace(this.peek() + ".axGetProperty(" + nameElements + ", false)");
			}
		}

		emitGetSuper(nameIndex: number) {
			let multiname = this.constantPool.multinames[nameIndex];
			if (multiname.isSimpleStatic()) {
				let qualifiedName = Multiname.qualifyName(multiname.namespaces[0], multiname.name);
				if ('g' + qualifiedName in this.methodInfo.classScope.object.baseClass.traitsPrototype) {
					this.emitReplace('mi.classScope.object.baseClass.traitsPrototype.g' + qualifiedName +
						'.call(this)');
				} else {
					// If the base class doesn't have this as a getter, we can just emit a plain property
					// get: if this class overrode the value, then it'd be overridden, period.
					this.emitReplace(this.peek() + '.' + qualifiedName);
				}
			} else {
				let nameElements = this.emitMultiname(nameIndex);
				let receiver = this.peek();
				this.emitReplace(receiver + ".axGetSuper(mi.classScope, " + nameElements + ")");
			}
		}

		emitDeleteProperty(nameIndex: number) {
			let multiname = this.constantPool.multinames[nameIndex];
			// TODO: re-enable after XML and XMLList are able to handle this.
			if (false && multiname.isSimpleStatic()) {
				let qualifiedName = Multiname.qualifyName(multiname.namespaces[0], multiname.name);
				this.emitReplace('delete ' + this.peek() + '.' + qualifiedName);
			} else {
				let nameElements = this.emitMultiname(nameIndex);
				this.emitReplace(this.peek() + ".axDeleteProperty(" + nameElements + ", false)");
			}
		}

		emitFindProperty(nameIndex: number, strict: boolean) {
			let scope = this.getScope(this.scopeIndex);
			let nameElements = this.emitMultiname(nameIndex);
			this.emitPush(scope + ".findScopeProperty(" + nameElements + ", mi, " + strict + ")");
			return nameElements;
		}

		emitCallProperty(bc: Bytecode) {
			let args = this.popArgs(bc.argCount);
			let isLex = bc.op === OP.callproplex;
			let call: string;
			let multiname = this.constantPool.multinames[bc.index];
			// TODO: re-enable after scope lookups for primitive natives are fixed.
			if (false && multiname.isSimpleStatic()) {
				let qualifiedName = Multiname.qualifyName(multiname.namespaces[0], multiname.name);
				call = '.' + qualifiedName + '(' + args + ')';
			} else {
				let nameElements = this.emitMultiname(bc.index);
				call = ".axCallProperty(" + nameElements + ", " + isLex + ", [" + args + "])";
			}
			if (bc.op !== OP.callpropvoid) {
				this.emitReplace(this.peek() + call);
			} else {
				this.blockEmitter.writeLn(this.pop() + call + ';');
			}
		}

		emitCallSuper(bc: Bytecode) {
			let args = this.popArgs(bc.argCount);
			let multiname = this.constantPool.multinames[bc.index];
			// Super calls with statically resolvable names are optimized to direct calls.
			// This must be valid as `axCallSuper` asserts that the method can be found. (Which in
			// itself is invalid, as an incorrect, but valid script can create this situation.)
			if (multiname.isSimpleStatic()) {
				let qualifiedName = 'm' + Multiname.qualifyName(multiname.namespaces[0], multiname.name);
				call = 'mi.classScope.object.baseClass.traitsPrototype.' + qualifiedName +
					'.call(' + this.peek() + (args.length ? ', ' + args : '') + ')';
			}
			if (!call) {
				let nameElements = this.emitMultiname(bc.index);
				let call = this.peek() + '.axCallSuper(mi.classScope, ' + nameElements + ', [' + args +
					'])';
			}
			if (bc.op !== OP.callsupervoid) {
				this.emitReplace(call);
			} else {
				this.stack--;
				this.blockEmitter.writeLn(call + ';');
			}
		}

		emitCall(bc: Bytecode) {
			let args = this.popArgs(bc.argCount);
			let argsString = args.length ? ', ' + args.join(', ') : '';
			let receiver = this.pop();
			let callee = this.peek();
			this.emitReplace(callee + '.axCall(' + receiver + argsString + ')');
		}

		emitConstruct(bc: Bytecode) {
			let args = this.popArgs(bc.argCount);
			let ctor = this.peek();
			this.emitReplace('new ' + ctor + '.instanceConstructor(' + args + ')');
		}

		emitConstructProperty(bc: Bytecode) {
			let args = this.popArgs(bc.argCount);
			this.emitGetProperty(bc.index);
			let val = this.peek();
			this.blockEmitter.writeLn(val + ' = new ' + val + '.instanceConstructor(' + args + ');');
		}

		emitGetLex(nameIndex: number) {
			let nameElements = this.emitFindProperty(nameIndex, true);
			let multiname = this.constantPool.multinames[nameIndex];
			if (multiname.isSimpleStatic()) {
				let qualifiedName = Multiname.qualifyName(multiname.namespaces[0], multiname.name);
				this.emitReplace(this.peek() + '.' + qualifiedName);
			} else {
				this.emitReplace(this.peek() + ".axGetProperty(" + nameElements + ", false)");
			}
		}

		emitGetDescendants(nameIndex: number) {
			let name;
			let multiname = this.constantPool.multinames[nameIndex];
			if (multiname.isRuntime()) {
				name = this.pop();
			} else {
				name = multiname.name;
			}
			this.emitReplace(this.peek() + ".descendants('" + name + "')");
		}

		emitCheckFilter() {
			this.emitReplace('checkFilter(' + this.peek() + ')');
		}

		emitMultiname(index: number): string {
			let multiname = this.constantPool.multinames[index];
			this.blockEmitter.writeLn('let mn = mi.abc.constantPool.multinames[' + index + ']; // ' +
				(release ? '' : multiname));
			let name = multiname.isRuntimeName() ? this.pop() : '"' + (multiname.name || '*') + '"';
			let namespaces = multiname.isRuntimeNamespace() ? '[' + this.pop() + ']' : 'mn.namespaces';
			return namespaces + ', ' + name + ', ' + multiname.flags;
		}

		emitBinaryIf(block: Bytecode, bc: Bytecode, operator: string, negate: boolean) {
			let y = this.pop();
			let x = this.pop();
			let condition = x + " " + operator + " " + y;
			if (negate) {
				condition = "!(" + condition + ")";
			}
			this.emitIf(block, bc, condition);
		}

		emitIfEq(block: Bytecode, bc: Bytecode, negate: boolean) {
			let y = this.pop();
			let x = this.pop();
			let condition = "axEquals(" + x + ", " + y + ")";
			if (negate) {
				condition = "!" + condition;
			}
			this.emitIf(block, bc, condition);
		}

		emitUnaryIf(block: Bytecode, bc: Bytecode, operator: string) {
			let x = this.pop();
			this.emitIf(block, bc, operator + x);
		}

		emitIf(block: Bytecode, bc: Bytecode, predicate: string) {
			let next = this.bytecodes[bc.position + 1];
			let target = bc.target;
			Relooper.addBranch(block.relooperBlock, next.relooperBlock);
			this.propagateBlockState(block, next, this.stack, this.scopeIndex);

			if (next !== target) {
				Relooper.addBranch(block.relooperBlock, target.relooperBlock, predicate);
				this.propagateBlockState(block, target, this.stack, this.scopeIndex);
			}
		}

		emitJump(block: Bytecode, bc: Bytecode) {
			Relooper.addBranch(block.relooperBlock, bc.target.relooperBlock);
			this.propagateBlockState(block, bc.target, this.stack, this.scopeIndex);
		}

		emitHasNext2(bc: Bytecode) {
			let info = 'hasNext' + (this.hasNext2Infos++);
			let object = this.local[bc.object];
			let index = this.local[bc.index];
			this.emitLine(info + '.object = ' + object + ';');
			this.emitLine(info + '.index = ' + index + ';');
			this.emitLine('Object(' + object + ').axHasNext2(' + info + ');');
			this.emitLine(object + ' = ' + info + '.object;');
			this.emitPush(index + ' = ' + info + '.index');
		}

		emitNextName() {
			let index = this.pop();
			this.emitReplace(this.peek() + '.axNextName(' + index + ')');
		}

		emitNextValue() {
			let index = this.pop();
			this.emitReplace(this.peek() + '.axNextValue(' + index + ')');
		}

		emitThrow() {
			this.emitLine('throw ' + this.pop() + ';');
		}

		emitLookupSwitch(block: Bytecode, bc: Bytecode) {
			let x = this.pop();
			// We need some text in the body of the lookup switch block, otherwise the
			// branch condition variable is ignored.
			let branchBlock = Relooper.addBlock("// Lookup Switch", String(x));
			Relooper.addBranch(block.relooperBlock, branchBlock);

			let defaultTargetBlock = bc.targets[bc.targets.length - 1];
			let defaultTarget = defaultTargetBlock.relooperBlock;

			this.propagateBlockState(block, defaultTargetBlock, this.stack, this.scopeIndex);
			for (let i = 0; i < bc.targets.length - 1; i++) {
				let targetBlock = bc.targets[i];
				let target = targetBlock.relooperBlock;
				let caseTarget = Relooper.addBlock();
				Relooper.addBranch(branchBlock, caseTarget, "case " + i + ":");
				Relooper.addBranch(caseTarget, target);
				this.propagateBlockState(block, targetBlock, this.stack, this.scopeIndex);
			}
			Relooper.addBranch(branchBlock, defaultTarget);
		}

		emitPush(v) {
			let line = this.getStack(this.stack) + " = " + v + ";";
			release || (line += " // push at " + this.stack);
			this.blockEmitter.writeLn(line);
			this.stack++;
		}

		emitReplace(v) {
			let line = this.getStack(this.stack - 1) + " = " + v + ";";
			release || (line += " // replace at " + (this.stack - 1));
			this.blockEmitter.writeLn(line);
		}

		emitLine(v) {
			this.blockEmitter.writeLn(v);
		}

		emitPushDouble(bc) {
			let val = this.constantPool.doubles[bc.index];
			// `String(-0)` gives "0", so to preserve the `-0`, we have to bend over backwards.
			this.emitPush((val === 0 && 1 / val < 0) ? '-0' : val);
		}

		emitPushString(bc) {
			// The property keys for OP.newobject are pushed on the stack. They can't be used in that
			// format, however, for emitting an object literal definition. So we also store the indices
			// of all pushed strings here and redo the lookup in `emitNewObject`.
			this.pushedStrings[this.stack] = bc.index;
			let str = this.constantPool.strings[bc.index];
			// For long strings or ones containing newlines or ", emit a reference instead of the literal.
			if (str.length > 40 || str.indexOf('\n') > -1 || str.indexOf('\r') > -1 ||
				str.indexOf('"') > -1) {
				this.emitPush('mi.abc.constantPool.strings[' + bc.index + ']');
			} else {
				// String needs escaping, we should move the escaping code outside of the
				// AST module.
				this.emitPush(escapeString(str));
			}
		}

		emitPushScope(isWith: boolean) {
			let parent = this.getScope(this.scopeIndex);
			let scope = "new Scope(" + parent + ", " + this.pop() + ", " + isWith + ")";
			this.scopeIndex++;
			this.blockEmitter.writeLn(this.getScope(this.scopeIndex) + " = " + scope + ";");
		}

		popScope() {
			this.scopeIndex--;
		}

		emitGetGlobalScope() {
			this.emitPush(this.peekScope() + '.global.object');
		}

		emitGetScopeObject() {
			this.emitPush(this.peekScope() + '.object');
		}

		emitGetSlot(index: number) {
			this.emitReplace(this.peek() + '.axGetSlot(' + index + ')');
		}

		emitSetSlot(index: number) {
			let value = this.pop();
			let object = this.pop();
			this.emitLine(object + '.axSetSlot(' + index + ', ' + value + ')');
		}

		emitNewClass(bc: Bytecode) {
			this.emitPush('createClass(mi.abc.classes[' + bc.index + '], ' + this.pop() + ', ' + this.peekScope() + ')');
		}

		emitNewObject(bc: Bytecode) {
			let properties = [];
			for (let i = 0; i < bc.argCount; i++) {
				let value = this.pop();
				this.pop();
				let key = this.constantPool.strings[this.pushedStrings[this.stack]];
				properties.push((isNumeric(key) ? key : escapeString('$Bg' + key)) + ': ' + value);
			}
			this.emitPush('{ ' + properties.join(', ') + ' }');
		}

		emitNewArray(bc: Bytecode) {
			let values = [];
			for (let i = 0; i < bc.argCount; i++) {
				values.push(this.pop());
			}
			this.emitPush('[' + values.reverse() + ']');
		}

		emitNewFunction(bc: Bytecode) {
			this.emitPush('createFunction(mi.abc.methods[' + bc.index + '], ' + this.peekScope() +
				', true)');
		}

		emitNewCatch(bc: Bytecode) {
			this.emitPush('mi.exceptions[' + bc.index + '].scopeObject');
		}

		emitConstructSuper(bc: Bytecode) {
			let superInvoke = 'mi.classScope.object.baseClass.instanceConstructorNoInitialize.call(';
			let args = this.popArgs(bc.argCount);
			superInvoke += this.pop();
			if (args.length) {
				superInvoke += ', ' + args.join(', ');
			}
			superInvoke += ');';
			this.blockEmitter.writeLn(superInvoke);
		}

		emitCoerce(bc: Bytecode) {
			let multiname = this.constantPool.multinames[bc.index];
			switch (multiname) {
				case Multiname.Int:
					return this.emitCoerceInt();
				case Multiname.Uint:
					return this.emitCoerceUint();
				case Multiname.Number:
					return this.emitCoerceNumber();
				case Multiname.Boolean:
					return this.emitCoerceBoolean();
				case Multiname.Object:
					return this.emitCoerceObject(bc);
				case Multiname.String:
					return this.emitCoerceString(bc);
			}
			if (bc.ti && bc.ti.noCoercionNeeded) {
				return;
			}
			let coercion = 'mi.abc.app.getType(mi.abc.constantPool.multinames[' +
				bc.index + '].axCoerce(' + this.pop() + ')';
			this.emitPush(coercion);
		}

		emitCoerceInt() {
			let val = this.peek();
			this.blockEmitter.writeLn(val + ' |= 0;');
		}

		emitCoerceUint() {
			let val = this.peek();
			this.blockEmitter.writeLn(val + ' >>>= 0;');
		}

		emitCoerceNumber() {
			let val = this.peek();
			this.blockEmitter.writeLn(val + '= +' + val);
		}

		emitCoerceBoolean() {
			let val = this.peek();
			this.blockEmitter.writeLn(val + ' = !!' + val + ';');
		}

		emitCoerceObject(bc: Bytecode) {
			if (bc.ti && bc.ti.noCoercionNeeded) {
				return;
			}
			let val = this.peek();
			this.blockEmitter.writeLn(val + ' = axCoerceObject(' + val + ');');
		}

		emitCoerceString(bc: Bytecode) {
			if (bc.ti && bc.ti.noCoercionNeeded) {
				return;
			}
			let val = this.peek();
			this.blockEmitter.writeLn(val + ' = axCoerceString(' + val + ');');
		}

		emitInstanceof() {
			let type = this.pop();
			this.emitReplace(type + '.axIsInstanceOf(' + this.peek() + ')');
		}

		emitIsType(index: number) {
			this.emitLine('let mn = mi.abc.constantPool.multinames[' + index + '];' +
				(release ? '' : ' // ' + this.constantPool.multinames[index]));
			this.emitReplace('mi.abc.applicationDomain.getType(mn).isType(' + this.peek() + ')');
		}

		emitIsTypeLate() {
			let type = this.pop();
			this.emitReplace(type + '.axIsType(' + this.peek() + ')');
		}

		emitAsTypeLate() {
			let type = this.pop();
			this.emitReplace(type + '.axAsType(' + this.peek() + ')');
		}

		emitApplyType(bc: Bytecode) {
			let args = this.popArgs(bc.argCount);
			let type = this.peek();
			this.emitReplace('sec.applyType(' + type + ', [' + args + '])');
		}

		emitIn() {
			let object = this.pop();
			this.emitReplace(object + '.axHasProperty(' + this.peek() + ')');
		}

		emitDup() {
			this.emitPush(this.peek());
		}

		emitSwap() {
			let top = this.getStack(this.stack - 1);
			let next = this.getStack(this.stack - 2);
			this.blockEmitter.writeLn("let $t = " + top + ";");
			this.blockEmitter.writeLn(top + " = " + next + ";");
			this.blockEmitter.writeLn(next + " = $t;");
		}

		emitEquals() {
			let right = this.pop();
			this.emitReplace('axEquals(' + this.peek() + ', ' + right + ')');
		}

		emitUnaryOp(operator: string) {
			this.emitReplace(operator + this.peek());
		}

		emitUnaryOp_i(operator: string) {
			this.emitReplace(operator + this.peek() + '|0');
		}

		emitAddExpression() {
			let right = this.pop();
			let left = this.peek();
			this.blockEmitter.writeLn(left + ' = axAdd(' + left + ', ' + right + ', sec);');
		}

		emitBinaryExpression(expression: string) {
			let right = this.pop();
			let left = this.peek();
			this.blockEmitter.writeLn(left + ' = ' + left + expression + right + ';');
		}

		emitBinaryExpression_i(expression: string) {
			let right = this.pop();
			let left = this.peek();
			this.blockEmitter.writeLn(left + ' = ' + left + '|0' + expression + right + '|0;');
		}

		emitReturnVoid() {
			this.blockEmitter.writeLn('return;');
		}

		emitReturnValue() {
			let value = this.pop();
			this.blockEmitter.writeLn('return ' + wrapInCoercer(value, this.methodInfo.returnType) + ';');
		}

		popArgs(count: number): string[] {
			let args = [];
			let end = this.stack;
			let start = end - count;
			for (let i = start; i < end; i++) {
				args.push(this.getStack(i));
			}
			this.stack = start;
			return args;
		}
	}

	function wrapInCoercer(value, type: Multiname) {
		if (!type) {
			return value;
		}
		switch (Multiname.getQualifiedName(type)) {
			case Multiname.Int:
				return value + '|0';
			case Multiname.Uint:
				return value + ' >>> 0';
			case Multiname.String:
				return 'axCoerceString(' + value + ')';
			case Multiname.Number:
				return '+' + value;
			case Multiname.Boolean:
				return '!!' + value;
			case Multiname.Object:
				return 'axCoerceObject(' + value + ')';
			default:
				return value;
		}
	}

	export function baselineCompileMethod(methodInfo: MethodInfo, scope: Scope,
	                                      hasDynamicScope: boolean, globalMiName: string) {
		let relooperState = Relooper.r;
		Relooper.r = 0;
		let compiler = new BaselineCompiler(methodInfo, scope, hasDynamicScope, globalMiName);
		try {
			let result = compiler.compile();
		} catch (e) {
			Relooper.cleanup();
			failCompileCount++;
			writer && writer.errorLn("Error: " + e);
		}
		Relooper.r = relooperState;
		return result;
	}

	function mangleABC(abc: AbcFile) {
		return StringUtilities.variableLengthEncodeInt32(abc.hash);
	}

	function mangleScript(scriptInfo: ScriptInfo) {
		return mangleABC(scriptInfo.abc) + "_" + scriptInfo.index;
	}

	function mangleClass(classInfo: ClassInfo) {
		return mangleABC(classInfo.abc) + "_" + Multiname.getQualifiedName(classInfo.instanceInfo.name);
	}

	function emitScript(emitter: Emitter, scriptInfo: ScriptInfo) {
		emitter.writeLn("// Script: " + scriptInfo.name);

		emitMethodTraits(emitter, mangleScript(scriptInfo), scriptInfo.traits);

		emitter.enter("function " + mangleScript(scriptInfo) + "() {");
		emitTraits(emitter, scriptInfo.traits);
		emitter.leave("}");
	}

	function emitTraits(emitter: Emitter, traits: Trait []) {
		for (let i = 0; i < traits.length; i++) {
			let trait = traits[i];
			if (trait.isConst() || trait.isSlot()) {
				let defaultValue = trait.hasDefaultValue ? makeLiteral(trait.value) : ClassInfo.getDefaultValue(trait.typeName);
				emitter.writeLn("this." + Multiname.getQualifiedName(trait.name) + " = " + defaultValue + ";");
			}
		}
	}

	function emitMethodTraits(emitter: Emitter, prefix: string, traits: Trait []) {
		for (let i = 0; i < traits.length; i++) {
			let trait = traits[i];
			if (trait.isMethodOrAccessor()) {
				let methodInfo = trait.methodInfo;
				if (!methodInfo.code) {
					return;
				}
				let result = baselineCompileMethod(methodInfo, new Scope(null, {baseClass: {traitsPrototype: {}}}), false, '');
				if (result) {
					emitter.enter("function " + prefix + Multiname.getQualifiedName(trait.name) + "(" + result.parameters.join(", ") + ") {");
					emitter.writeLns(result.body);
					emitter.leave("}");
				}
			}
		}
	}

	function emitClass(emitter: Emitter, classInfo: ClassInfo) {
		emitter.writeLn("// Class: " + classInfo.instanceInfo.name + " extends " + classInfo.instanceInfo.superName);

		let instanceMangledName = mangleClass(classInfo);

		let staticMangledName = instanceMangledName + "_Static";
		emitMethodTraits(emitter, staticMangledName + "_", classInfo.traits);

		emitter.enter("function " + staticMangledName + " () {");
		emitTraits(emitter, classInfo.traits);
		emitter.leave("}");

		function emitInstanceTraits(ci: ClassInfo) {
			if (ci.instanceInfo.superName) {
				emitInstanceTraits(findClassInfo(ci.instanceInfo.superName));
			}
			emitter.writeLn("// Traits: " + ci.instanceInfo.name);
			emitTraits(emitter, ci.instanceInfo.traits);
		}

		emitMethodTraits(emitter, instanceMangledName + "_", classInfo.instanceInfo.traits);
		emitter.enter("function " + instanceMangledName + "() {");
		emitInstanceTraits(classInfo);
		emitter.leave("}");
	}

	let libraries: AbcFile [] = [];

	function findClassInfo(mn: Multiname): ClassInfo {
		for (let i = 0; i < libraries.length; i++) {
			let abc = libraries[i];
			let scripts = abc.scripts;
			for (let j = 0; j < scripts.length; j++) {
				let script = scripts[j];
				let traits = script.traits;
				for (let k = 0; k < traits.length; k++) {
					let trait = traits[k];
					if (trait.isClass()) {
						let traitName = Multiname.getQualifiedName(trait.name);
						// So here mn is either a Multiname or a QName.
						for (let m = 0, n = mn.namespaces.length; m < n; m++) {
							let qn = mn.getQName(m);
							if (traitName === Multiname.getQualifiedName(qn)) {
								return trait.classInfo;
							}
						}
					}
				}
			}
		}
	}

	export function baselineCompileABCs(libs: AbcFile [], abcs: AbcFile []) {

		writer && writer.writeLn("Compiling LIBs: " + libs);
		writer && writer.writeLn("Compiling ABCs: " + abcs);

		libraries.push.apply(libraries, libs);
		libraries.push.apply(libraries, abcs);

		for (let j = 0; j < abcs.length; j++) {
			let abc = abcs[j];

			writer && writer.writeLn("Compiling ABC: " + abc);

			let emitter = new Emitter(true);

			for (let i = 0; i < abc.scripts.length; i++) {
				emitScript(emitter, abc.scripts[i]);
			}

			for (let i = 0; i < abc.classes.length; i++) {
				emitClass(emitter, abc.classes[i]);
			}

			// let w = new IndentingWriter();
			// w.writeLns(emitter.toString());
		}
	}
}

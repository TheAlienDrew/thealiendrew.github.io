module Shumway.AVM2 {
	import Option = Shumway.Options.Option;
	import OptionSet = Shumway.Options.OptionSet;

	import shumwayOptions = Shumway.Settings.shumwayOptions;

	let avm2Options = shumwayOptions.register(new OptionSet("AVM2"));

	export module Runtime {
		let options = avm2Options.register(new OptionSet("Runtime"));
		export let traceRuntime = options.register(new Option("tr", "traceRuntime", "boolean", false, "trace runtime"));
		export let traceExecution = options.register(new Option("tx", "traceExecution", "boolean", false, "trace execution"));
		export let traceInterpreter = options.register(new Option("ti", "traceInterpreter", "boolean", false, "trace interpreter"));

		export let debuggerMode = options.register(new Option("db", "debuggerMode", "boolean", true, "enable debugger mode"));
		// REDUX: Re-enable the options that still matter and remove the rest.
		//export let traceFunctions = options.register(new Option("t", "traceFunctions", "number", 0, "trace functions", { choices: { "off":0, "compiled":1, "compiled & abc":2 } }));
		//export let traceClasses = options.register(new Option("tc", "traceClasses", "boolean", false, "trace class creation"));
		//export let traceDomain = options.register(new Option("td", "traceDomain", "boolean", false, "trace domain property access"));
		//export let globalMultinameAnalysis = options.register(new Option("ga", "globalMultinameAnalysis", "boolean", false, "Global multiname analysis."));
		//export let codeCaching = options.register(new Option("cc", "codeCaching", "boolean", false, "Enable code caching."));
		//
		//export let compilerEnableExceptions = options.register(new Option("cex", "exceptions", "boolean", false, "Compile functions with catch blocks."));
		//export let compilerMaximumMethodSize = options.register(new Option("cmms", "maximumMethodSize", "number", 4 * 1024, "Compiler maximum method size."));

		export const enum ExecutionMode {
			INTERPRET = 0x1,
			COMPILE = 0x2
		}
	}

	export module Compiler {
		//export let options = avm2Options.register(new OptionSet("Compiler"));
		//export let traceLevel = options.register(new Option("tc4", "tc4", "number", 0, "Compiler Trace Level"));
		//export let breakFilter = options.register(new Option("", "break", "string", "", "Set a break point at methods whose qualified name matches this string pattern."));
		//export let compileFilter = options.register(new Option("", "compile", "string", "", "Only compile methods whose qualified name matches this string pattern."));
		//export let enableDirtyLocals = options.register(new Option("dl", "dirtyLocals", "boolean", true, "Perform dirty local analysis to minimise PHI nodes."));
		//export let useBaseline = options.register(new Option("bl", "useBaseline", "boolean", false, "Use baseline instead of optimizing compiler."));
		//export let baselineDebugLevel = options.register(new Option("bl-dbg", "baselineDebugLevel", "number", 0, "Level of trace and code debug output in baseline compiler.", { choices: { "off":0, "normal":1, "verbose":2 } }));
	}

	export module Verifier {
		//export let options = avm2Options.register(new OptionSet("Verifier"));
		//export let enabled = options.register(new Option("verifier", "verifier", "boolean", true, "Enable verifier."));
		//export let traceLevel = options.register(new Option("tv", "tv", "number", 0, "Verifier Trace Level"));
	}
}

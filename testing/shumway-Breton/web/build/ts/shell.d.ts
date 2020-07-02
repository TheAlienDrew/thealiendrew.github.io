declare module Shumway {
}
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
declare let microTaskQueue: Shumway.Shell.MicroTasksQueue;
declare function print(message: string): void;
declare let defaultTimerArgs: Array<any>;
/**
 * sessionStorage polyfill.
 */
declare let sessionStorageObject: {
    [key: string]: string;
};
declare function addLogPrefix(prefix: any, args: Array<any>): any;
declare module Shumway.Shell {
}
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
declare module Shumway.Unit {
    let everFailed: boolean;
    let testNumber: number;
    let writer: IndentingWriter;
    function fail(message: any): void;
    function eqFloat(a: number, b: number, test: string, tolerance: number): void;
    function neq(a: number, b: number, test: string): void;
    function eq(a: any, b: any, test: string): void;
    function eqArray(a: Array<any>, b: Array<any>, test: string): void;
    function structEq(a: any, b: any, test: any): void;
    function matrixEq(a: any, b: any, test: string): void;
    function check(condition: boolean, test: string): void;
    function assertThrowsInstanceOf(f: any, ctor: any, test: string): void;
    function description(test: string): string;
    function failedLocation(): string;
    function info(s: string): void;
    function warn(s: string): void;
    function error(s: string): void;
    /**
     * Measures several runs of a test case and tries to ensure that the test case is reasonably fast, yet still accurate.
     */
    function checkTime(fn: any, test: string, threshold: number, iterations?: number, help?: boolean): void;
}
/**
 * Exported on the global object since unit tests don't import them explicitly.
 */
import check = Shumway.Unit.check;
import checkTime = Shumway.Unit.checkTime;
import fail = Shumway.Unit.fail;
import eqFloat = Shumway.Unit.eqFloat;
import neq = Shumway.Unit.neq;
import eq = Shumway.Unit.eq;
import eqArray = Shumway.Unit.eqArray;
import structEq = Shumway.Unit.structEq;
import matrixEq = Shumway.Unit.matrixEq;
import assertThrowsInstanceOf = Shumway.Unit.assertThrowsInstanceOf;
import info = Shumway.Unit.info;
import error = Shumway.Unit.error;
declare module Shumway.Shell.Fuzz {
    class Mill {
        private _writer;
        private _kind;
        constructor(writer: IndentingWriter, kind: string);
        fuzz(): void;
    }
}
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
declare module Shumway.Shell {
    class MicroTask {
        id: number;
        fn: () => any;
        args: any[];
        interval: number;
        repeat: boolean;
        runAt: number;
        constructor(id: number, fn: () => any, args: any[], interval: number, repeat: boolean);
    }
    class MicroTasksQueue {
        private tasks;
        private nextId;
        private time;
        private stopped;
        constructor();
        readonly isEmpty: boolean;
        scheduleInterval(fn: () => any, args: any[], interval: number, repeat: boolean): MicroTask;
        enqueue(task: MicroTask): void;
        dequeue(): MicroTask;
        remove(id: number): void;
        clear(): void;
        /**
         * Runs micro tasks for a certain |duration| and |count| whichever comes first. Optionally,
         * if the |clear| option is specified, the micro task queue is cleared even if not all the
         * tasks have been executed.
         *
         * If a |preCallback| function is specified, only continue execution if |preCallback()| returns true.
         */
        run(duration?: number, count?: number, clear?: boolean, preCallback?: Function): void;
        stop(): void;
    }
}
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
declare module Shumway.Shell {
    function setFileServicesBaseUrl(baseUrl: string): void;
    function initializePlayerServices(): void;
}
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
/**
 * Lets you run Shumway from the command line.
 */
declare let scriptArgs: any;
declare let arguments: any;
declare let load: any;
declare let quit: any;
declare let read: any;
declare let help: any;
declare let printErr: any;
declare let errors: number;
declare let homePath: string;
declare let builtinABCPath: string;
declare let shellABCPath: string;
declare let playerglobalInfo: {
    abcs: string;
    catalog: string;
};
declare let readFile: any, readBinaryFile: any, readbuffer: any;
declare let isV8: boolean;
declare let isJSC: boolean;
/**
 * Global unitTests array, unit tests add themselves to this. The list may have numbers, these indicate the
 * number of times to run the test following it. This makes it easy to disable test by pushing a zero in
 * front.
 */
declare let unitTests: Array<any>;
declare let commandLineArguments: string[];
declare let disableBundleSelection: any;
declare module Shumway.Shell {
    let verbose: boolean;
    function main(commandLineArguments: string[]): void;
}

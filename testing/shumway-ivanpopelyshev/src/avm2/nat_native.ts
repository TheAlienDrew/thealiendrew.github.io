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
module Shumway.AVMX.AS {
	registerNativeClass("__AS3__.vec.Vector$object", GenericVector, 'ObjectVector', NamespaceType.PackageInternal);
	registerNativeClass("__AS3__.vec.Vector$int", Int32Vector, 'Int32Vector', NamespaceType.PackageInternal);
	registerNativeClass("__AS3__.vec.Vector$uint", Uint32Vector, 'Uint32Vector', NamespaceType.PackageInternal);
	registerNativeClass("__AS3__.vec.Vector$double", Float64Vector, 'Float64Vector', NamespaceType.PackageInternal);
}

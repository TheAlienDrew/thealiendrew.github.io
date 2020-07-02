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

module Shumway.Shell {
  class ShellBinaryFileReader {
    public url:string;
    public method:string;
    public mimeType:string;
    public data:string;

    constructor(url: string, method: string, mimeType: string, data: string) {
      this.url = url;
      this.method = method;
      this.mimeType = mimeType;
      this.data = data;
    }

    readAll(progress: any, complete: any) {
      setTimeout(function () {
        try {
          let url = this.url + '';
          let strippedUrl = url.indexOf('file://') === 0 ? url.substr(7) : url;
          complete(read(strippedUrl, 'binary'));
        } catch (e) {
          complete(null, 'Can\'t read ' + this.url);
        }
      }.bind(this));
    }

    readAsync(ondata: any, onerror: any, onopen: any, oncomplete: any, onhttpstatus: any) {
      onopen && setTimeout(onopen);
      this.readAll(null, function (data: any, err: any) {
        if (data) {
          ondata(data, { loaded: data.byteLength, total: data.byteLength});
          oncomplete();
        } else {
          onerror(err);
        }
      });
    }
  }

  let shellTelemetry = {
    reportTelemetry: function (data: any) {
    }
  };

  let shellFileLoadingService = {
    baseUrl: null as string,
    createSession: function () {
      return {
        open: function (request: any) {
          let self = this;
          let path = Shumway.FileLoadingService.instance.resolveUrl(request.url);
          new BinaryFileReader(path, request.method, request.mimeType, request.data).readAsync(
            function (data, progress) {
              self.onprogress(data, {bytesLoaded: progress.loaded, bytesTotal: progress.total});
            },
            function (e) {
              self.onerror(e);
            },
            self.onopen,
            self.onclose,
            self.onhttpstatus);
        },
        close: function () {
          // doing nothing in the shell
        }
      };
    },
    setBaseUrl: function (url: any) {
      shellFileLoadingService.baseUrl = url;
      return url;
    },
    resolveUrl: function (url: any) {
      return new (<any>URL)(url, shellFileLoadingService.baseUrl).href;
    },
    navigateTo: function (url: any, target: any) {
    }
  };

  export function setFileServicesBaseUrl(baseUrl: string) {
    shellFileLoadingService.baseUrl = baseUrl;
  }

  export function initializePlayerServices() {
    Shumway.BinaryFileReader = <typeof BinaryFileReader><any>ShellBinaryFileReader;
    Shumway.Telemetry.instance = shellTelemetry;
    Shumway.FileLoadingService.instance = shellFileLoadingService;
    Shumway.LocalConnectionService.instance = new Player.PlayerInternalLocalConnectionService();
  }
}

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var RtmpJs;
(function (RtmpJs) {
    var Browser;
    (function (Browser) {
        var ShumwayComRtmpSocket = /** @class */ (function () {
            function ShumwayComRtmpSocket(host, port, params) {
                this._socket = ShumwayCom.createRtmpSocket({ host: host, port: port, ssl: params.useSecureTransport });
            }
            Object.defineProperty(ShumwayComRtmpSocket, "isAvailable", {
                get: function () {
                    return !!(typeof ShumwayCom !== 'undefined' && ShumwayCom.createRtmpSocket);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ShumwayComRtmpSocket.prototype, "onopen", {
                get: function () {
                    return this._onopen;
                },
                set: function (callback) {
                    this._socket.setOpenCallback(this._onopen = callback);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ShumwayComRtmpSocket.prototype, "ondata", {
                get: function () {
                    return this._ondata;
                },
                set: function (callback) {
                    this._socket.setDataCallback(this._ondata = callback);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ShumwayComRtmpSocket.prototype, "ondrain", {
                get: function () {
                    return this._ondrain;
                },
                set: function (callback) {
                    this._socket.setDrainCallback(this._ondrain = callback);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ShumwayComRtmpSocket.prototype, "onerror", {
                get: function () {
                    return this._onerror;
                },
                set: function (callback) {
                    this._socket.setErrorCallback(this._onerror = callback);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ShumwayComRtmpSocket.prototype, "onclose", {
                get: function () {
                    return this._onclose;
                },
                set: function (callback) {
                    this._socket.setCloseCallback(this._onclose = callback);
                },
                enumerable: true,
                configurable: true
            });
            ShumwayComRtmpSocket.prototype.send = function (buffer, offset, count) {
                return this._socket.send(buffer, offset, count);
            };
            ShumwayComRtmpSocket.prototype.close = function () {
                this._socket.close();
            };
            return ShumwayComRtmpSocket;
        }());
        Browser.ShumwayComRtmpSocket = ShumwayComRtmpSocket;
        var ShumwayComRtmpXHR = /** @class */ (function () {
            function ShumwayComRtmpXHR() {
                this._xhr = ShumwayCom.createRtmpXHR();
            }
            Object.defineProperty(ShumwayComRtmpXHR, "isAvailable", {
                get: function () {
                    return !!(typeof ShumwayCom !== 'undefined' && ShumwayCom.createRtmpXHR);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ShumwayComRtmpXHR.prototype, "status", {
                get: function () {
                    return this._xhr.status;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ShumwayComRtmpXHR.prototype, "response", {
                get: function () {
                    return this._xhr.response;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ShumwayComRtmpXHR.prototype, "responseType", {
                get: function () {
                    return this._xhr.responseType;
                },
                set: function (type) {
                    this._xhr.responseType = type;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ShumwayComRtmpXHR.prototype, "onload", {
                get: function () {
                    return this._onload;
                },
                set: function (callback) {
                    this._xhr.setLoadCallback(this._onload = callback);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ShumwayComRtmpXHR.prototype, "onerror", {
                get: function () {
                    return this._onload;
                },
                set: function (callback) {
                    this._xhr.setErrorCallback(this._onerror = callback);
                },
                enumerable: true,
                configurable: true
            });
            ShumwayComRtmpXHR.prototype.open = function (method, path, async) {
                if (async === void 0) { async = true; }
                this._xhr.open(method, path, async);
            };
            ShumwayComRtmpXHR.prototype.setRequestHeader = function (header, value) {
                this._xhr.setRequestHeader(header, value);
            };
            ShumwayComRtmpXHR.prototype.send = function (data) {
                this._xhr.send(data);
            };
            return ShumwayComRtmpXHR;
        }());
        Browser.ShumwayComRtmpXHR = ShumwayComRtmpXHR;
    })(Browser = RtmpJs.Browser || (RtmpJs.Browser = {}));
})(RtmpJs || (RtmpJs = {}));
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
var RtmpJs;
(function (RtmpJs) {
    var MAX_CHUNKED_CHANNEL_BUFFER = 0x80000;
    var RANDOM_DATA_SIZE = 1536;
    var PROTOCOL_VERSION = 3;
    var SET_CHUNK_SIZE_CONTROL_MESSAGE_ID = 1;
    var ABORT_MESSAGE_CONTROL_MESSAGE_ID = 2;
    var ACK_MESSAGE_ID = 3;
    var USER_CONTROL_MESSAGE_ID = 4;
    var ACK_WINDOW_SIZE_MESSAGE_ID = 5;
    var SET_PEER_BANDWIDTH_MESSAGE_ID = 6;
    var CONTROL_CHUNK_STREAM_ID = 2;
    var MIN_CHUNK_STREAM_ID = 3;
    var MAX_CHUNK_STREAM_ID = 65599;
    var MAX_CHUNK_HEADER_SIZE = 18;
    var ChunkedStream = /** @class */ (function () {
        function ChunkedStream(id) {
            this.onmessage = null;
            this.id = id;
            this.buffer = null;
            this.bufferLength = 0;
            this.lastStreamId = -1;
            this.lastTimestamp = 0;
            this.lastLength = 0;
            this.lastTypeId = 0;
            this.lastMessageComplete = false;
            this.waitingForBytes = 0;
            this.sentStreamId = -1;
            this.sentTimestamp = 0;
            this.sentLength = 0;
            this.sentTypeId = 0;
        }
        ChunkedStream.prototype.setBuffer = function (enabled) {
            if (enabled && !this.buffer) {
                this.buffer = new Uint8Array(128);
                this.bufferLength = 0;
            }
            if (!enabled && this.buffer) {
                this.buffer = null;
                this.bufferLength = 0;
            }
        };
        ChunkedStream.prototype.abort = function () {
            if (this.buffer) {
                this.bufferLength = 0;
            }
            else if (!this.lastMessageComplete) {
                this.lastMessageComplete = true;
                this.onmessage({
                    timestamp: this.lastTimestamp,
                    streamId: this.lastStreamId,
                    chunkedStreamId: this.id,
                    typeId: this.lastTypeId,
                    data: null,
                    firstChunk: false,
                    lastChunk: true
                });
            }
        };
        ChunkedStream.prototype._push = function (data, firstChunk, lastChunk) {
            if (!this.onmessage) {
                return;
            }
            if ((firstChunk && lastChunk) || !this.buffer) {
                this.onmessage({
                    timestamp: this.lastTimestamp,
                    streamId: this.lastStreamId,
                    chunkedStreamId: this.id,
                    typeId: this.lastTypeId,
                    data: data,
                    firstChunk: firstChunk,
                    lastChunk: lastChunk
                });
                return;
            }
            if (firstChunk) {
                this.bufferLength = 0;
                if (this.lastLength > this.buffer.length) {
                    this.buffer = new Uint8Array(this.lastLength);
                }
            }
            this.buffer.set(data, this.bufferLength);
            this.bufferLength += data.length;
            if (lastChunk) {
                this.onmessage({
                    timestamp: this.lastTimestamp,
                    streamId: this.lastStreamId,
                    chunkedStreamId: this.id,
                    typeId: this.lastTypeId,
                    data: this.buffer.subarray(0, this.bufferLength),
                    firstChunk: true,
                    lastChunk: true
                });
            }
        };
        return ChunkedStream;
    }());
    RtmpJs.ChunkedStream = ChunkedStream;
    var ChunkedChannel = /** @class */ (function () {
        function ChunkedChannel() {
            this.onusercontrolmessage = null;
            this.onack = null;
            this.ondata = function (data) {
            };
            this.onclose = function () {
            };
            this.oncreated = null;
            this.state = 'uninitialized';
            this.buffer = new Uint8Array(4092);
            this.bufferLength = 0;
            this.chunkSize = 128;
            this.chunkStreams = [];
            this.peerChunkSize = 128;
            this.peerAckWindowSize = 0;
            this.bandwidthLimitType = 0;
            this.windowAckSize = 0;
            this.bytesReceived = 0;
            this.lastAckSent = 0;
        }
        ChunkedChannel.prototype.push = function (data) {
            var newDataLength = data.length + this.bufferLength;
            if (newDataLength > this.buffer.length) {
                var newBufferLength = this.buffer.length * 2;
                while (newDataLength > newBufferLength) {
                    newBufferLength *= 2;
                }
                if (newBufferLength > MAX_CHUNKED_CHANNEL_BUFFER) {
                    this._fail('Buffer overflow');
                }
                var newBuffer = new Uint8Array(newBufferLength);
                newBuffer.set(this.buffer);
                this.buffer = newBuffer;
            }
            for (var i = 0, j = this.bufferLength; i < data.length; i++, j++) {
                this.buffer[j] = data[i];
            }
            this.bufferLength = newDataLength;
            this.bytesReceived += data.length;
            if (this.peerAckWindowSize &&
                (this.bytesReceived - this.lastAckSent) >= this.peerAckWindowSize) {
                this._sendAck();
            }
            while (this.bufferLength > 0) {
                // release || console.log('current bufferLength: ' + this.bufferLength + ' state:' + this.state);
                var shiftBy = 0;
                switch (this.state) {
                    case 'uninitialized':
                        if (this.bufferLength < 1) {
                            return;
                        }
                        this.serverVersion = this.buffer[0];
                        shiftBy = 1;
                        if (this.serverVersion !== PROTOCOL_VERSION) {
                            this._fail('Unsupported protocol version: ' + this.serverVersion);
                        }
                        this.state = 'version_received';
                        break;
                    case 'version_received':
                        if (this.bufferLength < RANDOM_DATA_SIZE) {
                            return;
                        }
                        shiftBy = RANDOM_DATA_SIZE;
                        var timestamp = (Date.now() - this.epochStart) | 0;
                        this.buffer[4] = (timestamp >>> 24) & 0xFF;
                        this.buffer[5] = (timestamp >>> 16) & 0xFF;
                        this.buffer[6] = (timestamp >>> 8) & 0xFF;
                        this.buffer[7] = timestamp & 0xFF;
                        this.ondata(this.buffer.subarray(0, RANDOM_DATA_SIZE));
                        this.state = 'ack_sent';
                        break;
                    case 'ack_sent':
                        if (this.bufferLength < RANDOM_DATA_SIZE) {
                            return;
                        }
                        shiftBy = RANDOM_DATA_SIZE;
                        for (var i = 8; i < RANDOM_DATA_SIZE; i++) {
                            if (this.buffer[i] !== this.randomData[i]) {
                                this._fail('Random data do not match @' + i);
                            }
                        }
                        this.state = 'handshake_done';
                        this.lastAckSent = this.bytesReceived;
                        this._initialize();
                        break;
                    case 'handshake_done':
                        shiftBy = this._parseChunkedData();
                        if (!shiftBy) {
                            return;
                        }
                        break;
                    default:
                        return;
                }
                this.buffer.set(this.buffer.subarray(shiftBy, this.bufferLength), 0);
                this.bufferLength -= shiftBy;
            }
        };
        ChunkedChannel.prototype._initialize = function () {
            var controlStream = this._getChunkStream(CONTROL_CHUNK_STREAM_ID);
            controlStream.setBuffer(true);
            controlStream.onmessage = function (e) {
                if (e.streamId !== 0) {
                    return;
                }
                release || console.log('Control message: ' + e.typeId);
                var ackWindowSize;
                switch (e.typeId) {
                    case SET_CHUNK_SIZE_CONTROL_MESSAGE_ID:
                        var newChunkSize = (e.data[0] << 24) | (e.data[1] << 16) |
                            (e.data[2] << 8) | e.data[3];
                        if (newChunkSize >= 1 && newChunkSize <= 0x7FFFFFFF) {
                            this.peerChunkSize = newChunkSize;
                        }
                        break;
                    case ABORT_MESSAGE_CONTROL_MESSAGE_ID:
                        var chunkStreamId = (e.data[0] << 24) | (e.data[1] << 16) |
                            (e.data[2] << 8) | e.data[3];
                        if (MIN_CHUNK_STREAM_ID <= chunkStreamId &&
                            chunkStreamId <= MAX_CHUNK_STREAM_ID) {
                            var chunkStream = this._getChunkStream(chunkStreamId);
                            chunkStream.abort();
                        }
                        break;
                    case ACK_MESSAGE_ID:
                        if (this.onack) {
                            this.onack();
                        }
                        break;
                    case USER_CONTROL_MESSAGE_ID:
                        if (this.onusercontrolmessage) {
                            this.onusercontrolmessage({
                                type: (e.data[0] << 8) | e.data[1],
                                data: e.data.subarray(2)
                            });
                        }
                        break;
                    case ACK_WINDOW_SIZE_MESSAGE_ID:
                        ackWindowSize = (e.data[0] << 24) | (e.data[1] << 16) |
                            (e.data[2] << 8) | e.data[3];
                        if (ackWindowSize < 0) {
                            break;
                        }
                        this.peerAckWindowSize = ackWindowSize;
                        break;
                    case SET_PEER_BANDWIDTH_MESSAGE_ID:
                        ackWindowSize = (e.data[0] << 24) | (e.data[1] << 16) |
                            (e.data[2] << 8) | e.data[3];
                        var limitType = e.data[4];
                        if (ackWindowSize < 0 || limitType > 2) {
                            break;
                        }
                        if (limitType === 1 ||
                            (limitType === 2 && this.bandwidthLimitType === 1)) {
                            ackWindowSize = Math.min(this.windowAckSize, ackWindowSize);
                        }
                        if (ackWindowSize !== this.ackWindowSize) {
                            this.ackWindowSize = ackWindowSize;
                            var ackData = new Uint8Array([(ackWindowSize >>> 24) & 0xFF,
                                (ackWindowSize >>> 16) & 0xFF,
                                (ackWindowSize >>> 8) & 0xFF,
                                ackWindowSize & 0xFF]);
                            this._sendMessage(CONTROL_CHUNK_STREAM_ID, {
                                typeId: ACK_WINDOW_SIZE_MESSAGE_ID,
                                streamId: 0,
                                data: ackData
                            });
                            if (limitType !== 2) {
                                this.bandwidthLimitType = limitType;
                            }
                        }
                        break;
                }
            }.bind(this);
            if (this.oncreated) {
                this.oncreated();
            }
        };
        ChunkedChannel.prototype.setChunkSize = function (chunkSize) {
            if (chunkSize < 1 || chunkSize > 0x7FFFFFFF) {
                throw new Error('Invalid chunk size');
            }
            this._sendMessage(CONTROL_CHUNK_STREAM_ID, {
                streamId: 0,
                typeId: SET_CHUNK_SIZE_CONTROL_MESSAGE_ID,
                data: new Uint8Array([(chunkSize >>> 24) & 0xFF,
                    (chunkSize >>> 16) & 0xFF,
                    (chunkSize >>> 8) & 0xFF,
                    chunkSize & 0xFF])
            });
            this.chunkSize = chunkSize;
        };
        ChunkedChannel.prototype.send = function (chunkStreamId, message) {
            if (chunkStreamId < MIN_CHUNK_STREAM_ID ||
                chunkStreamId > MAX_CHUNK_STREAM_ID) {
                throw new Error('Invalid chunkStreamId');
            }
            return this._sendMessage(chunkStreamId, message);
        };
        ChunkedChannel.prototype.sendUserControlMessage = function (type, data) {
            var eventData = new Uint8Array(2 + data.length);
            eventData[0] = (type >> 8) & 0xFF;
            eventData[1] = type & 0xFF;
            eventData.set(data, 2);
            this._sendMessage(CONTROL_CHUNK_STREAM_ID, {
                typeId: USER_CONTROL_MESSAGE_ID,
                streamId: 0,
                data: eventData
            });
        };
        ChunkedChannel.prototype._sendAck = function () {
            var ackData = new Uint8Array([(this.bytesReceived >>> 24) & 0xFF,
                (this.bytesReceived >>> 16) & 0xFF,
                (this.bytesReceived >>> 8) & 0xFF,
                this.bytesReceived & 0xFF]);
            this._sendMessage(CONTROL_CHUNK_STREAM_ID, {
                typeId: ACK_MESSAGE_ID,
                streamId: 0,
                data: ackData
            });
        };
        ChunkedChannel.prototype._sendMessage = function (chunkStreamId, message) {
            var data = message.data;
            var messageLength = data.length;
            var chunkStream = this._getChunkStream(chunkStreamId);
            var timestamp = ('timestamp' in message ? message.timestamp : (Date.now() - this.epochStart)) | 0;
            var timestampDelta = (timestamp - chunkStream.sentTimestamp) | 0;
            var buffer = new Uint8Array(this.chunkSize + MAX_CHUNK_HEADER_SIZE);
            var chunkStreamIdSize;
            if (chunkStreamId < 64) {
                chunkStreamIdSize = 1;
                buffer[0] = chunkStreamId;
            }
            else if (chunkStreamId < 320) {
                chunkStreamIdSize = 2;
                buffer[0] = 0;
                buffer[1] = chunkStreamId - 64;
            }
            else {
                chunkStreamIdSize = 3;
                buffer[0] = 1;
                buffer[1] = ((chunkStreamId - 64) >> 8) & 0xFF;
                buffer[2] = (chunkStreamId - 64) & 0xFF;
            }
            var position = chunkStreamIdSize;
            var extendTimestamp = 0;
            if (message.streamId !== chunkStream.sentStreamId || timestampDelta < 0) {
                // chunk type 0
                if ((timestamp & 0xFF000000) !== 0) {
                    extendTimestamp = timestamp;
                    buffer[position] = buffer[position + 1] = buffer[position + 2] = 0xFF;
                }
                else {
                    buffer[position] = (timestamp >> 16) & 0xFF;
                    buffer[position + 1] = (timestamp >> 8) & 0xFF;
                    buffer[position + 2] = timestamp & 0xFF;
                }
                position += 3;
                buffer[position++] = (messageLength >> 16) & 0xFF;
                buffer[position++] = (messageLength >> 8) & 0xFF;
                buffer[position++] = messageLength & 0xFF;
                buffer[position++] = message.typeId;
                buffer[position++] = message.streamId & 0xFF; // little-endian
                buffer[position++] = (message.streamId >> 8) & 0xFF;
                buffer[position++] = (message.streamId >> 16) & 0xFF;
                buffer[position++] = (message.streamId >> 24) & 0xFF;
            }
            else if (messageLength !== chunkStream.sentLength ||
                message.typeId !== chunkStream.sentTypeId) {
                // chunk type 1
                buffer[0] |= 0x40;
                if ((timestampDelta & 0xFF000000) !== 0) {
                    extendTimestamp = timestampDelta;
                    buffer[position] = buffer[position + 1] = buffer[position + 2] = 0xFF;
                }
                else {
                    buffer[position] = (timestampDelta >> 16) & 0xFF;
                    buffer[position + 1] = (timestampDelta >> 8) & 0xFF;
                    buffer[position + 2] = timestampDelta & 0xFF;
                }
                position += 3;
                buffer[position++] = (messageLength >> 16) & 0xFF;
                buffer[position++] = (messageLength >> 8) & 0xFF;
                buffer[position++] = messageLength & 0xFF;
                buffer[position++] = message.typeId;
            }
            else if (timestampDelta !== 0) {
                // chunk type 2
                buffer[0] |= 0x80;
                if ((timestampDelta & 0xFF000000) !== 0) {
                    extendTimestamp = timestampDelta;
                    buffer[position] = buffer[position + 1] = buffer[position + 2] = 0xFF;
                }
                else {
                    buffer[position] = (timestampDelta >> 16) & 0xFF;
                    buffer[position + 1] = (timestampDelta >> 8) & 0xFF;
                    buffer[position + 2] = timestampDelta & 0xFF;
                }
                position += 3;
            }
            else {
                // chunk type 3
                buffer[0] |= 0xC0;
            }
            if (extendTimestamp) {
                buffer[position++] = (extendTimestamp >>> 24) & 0xFF;
                buffer[position++] = (extendTimestamp >>> 16) & 0xFF;
                buffer[position++] = (extendTimestamp >>> 8) & 0xFF;
                buffer[position++] = extendTimestamp & 0xFF;
            }
            chunkStream.sentTimestamp = timestamp;
            chunkStream.sentStreamId = message.streamId;
            chunkStream.sentTypeId = message.typeId;
            chunkStream.sentLength = messageLength;
            var sent = 0;
            while (sent < messageLength) {
                var currentChunkLength = Math.min(messageLength - sent, this.chunkSize);
                buffer.set(data.subarray(sent, sent + currentChunkLength), position);
                sent += currentChunkLength;
                this.ondata(buffer.subarray(0, position + currentChunkLength));
                // reset position and chunk type
                buffer[0] |= 0xC0;
                position = chunkStreamIdSize;
            }
            return timestamp;
        };
        ChunkedChannel.prototype._getChunkStream = function (id) {
            var chunkStream = this.chunkStreams[id];
            if (!chunkStream) {
                this.chunkStreams[id] = chunkStream = new ChunkedStream(id);
                chunkStream.setBuffer(true);
                chunkStream.onmessage = function (message) {
                    if (this.onmessage) {
                        this.onmessage(message);
                    }
                }.bind(this);
            }
            return chunkStream;
        };
        ChunkedChannel.prototype._parseChunkedData = function () {
            if (this.bufferLength < 1) {
                return 0;
            }
            var chunkType = (this.buffer[0] >> 6) & 3;
            var chunkHeaderPosition = 1;
            var chunkStreamId = this.buffer[0] & 0x3F;
            if (chunkStreamId === 0) {
                if (this.bufferLength < 2) {
                    return 0;
                }
                chunkStreamId = this.buffer[1] + 64;
                chunkHeaderPosition = 2;
            }
            else if (chunkStreamId === 1) {
                if (this.bufferLength < 2) {
                    return 0;
                }
                chunkStreamId = (this.buffer[1] << 8) + this.buffer[2] + 64;
                chunkHeaderPosition = 3;
            }
            var chunkHeaderSize = chunkType === 0 ? 11 : chunkType === 1 ? 7 :
                chunkType === 2 ? 3 : 0;
            if (this.bufferLength < chunkHeaderPosition + chunkHeaderSize) {
                return 0;
            }
            var extendTimestampSize = chunkType !== 3 &&
                this.buffer[chunkHeaderPosition] === 0xFF &&
                this.buffer[chunkHeaderPosition + 1] === 0xFF &&
                this.buffer[chunkHeaderPosition + 2] === 0xFF ? 4 : 0;
            var totalChunkHeaderSize = chunkHeaderPosition + chunkHeaderSize +
                extendTimestampSize;
            if (this.bufferLength < totalChunkHeaderSize) {
                return 0;
            }
            var chunkStream = this._getChunkStream(chunkStreamId);
            var chunkTimestamp;
            if (chunkType === 3) {
                chunkTimestamp = chunkStream.lastTimestamp;
            }
            else {
                chunkTimestamp = (this.buffer[chunkHeaderPosition] << 16) |
                    (this.buffer[chunkHeaderPosition + 1] << 8) |
                    this.buffer[chunkHeaderPosition + 2];
            }
            if (extendTimestampSize) {
                var chunkTimestampPosition = chunkHeaderPosition + chunkHeaderSize;
                chunkTimestamp = (this.buffer[chunkTimestampPosition] << 24) |
                    (this.buffer[chunkTimestampPosition + 1] << 16) |
                    (this.buffer[chunkTimestampPosition + 2] << 8) |
                    this.buffer[chunkTimestampPosition + 3];
            }
            if (chunkType === 1 || chunkType === 2) {
                chunkTimestamp = (chunkStream.lastTimestamp + chunkTimestamp) | 0;
            }
            var messageLength = chunkStream.lastLength;
            var messageTypeId = chunkStream.lastTypeId;
            var messageStreamId = chunkStream.lastStreamId;
            if (chunkType === 0 || chunkType === 1) {
                messageLength = (this.buffer[chunkHeaderPosition + 3] << 16) |
                    (this.buffer[chunkHeaderPosition + 4] << 8) |
                    this.buffer[chunkHeaderPosition + 5];
                messageTypeId = this.buffer[chunkHeaderPosition + 6];
            }
            if (chunkType === 0) {
                // little-endian
                messageStreamId = (this.buffer[chunkHeaderPosition + 10] << 24) |
                    (this.buffer[chunkHeaderPosition + 9] << 16) |
                    (this.buffer[chunkHeaderPosition + 8] << 8) |
                    this.buffer[chunkHeaderPosition + 7];
            }
            var read, tailLength, firstChunk;
            if (chunkType === 3 && chunkStream.waitingForBytes) {
                firstChunk = false;
                read = Math.min(chunkStream.waitingForBytes, this.peerChunkSize);
                tailLength = chunkStream.waitingForBytes - read;
            }
            else {
                firstChunk = true;
                read = Math.min(messageLength, this.peerChunkSize);
                tailLength = messageLength - read;
            }
            if (this.bufferLength < totalChunkHeaderSize + read) {
                return 0;
            }
            release || (!firstChunk && tailLength) || // limiting trace to first/last chunks
                console.log('Chunk received: cs:' + chunkStreamId + '; ' +
                    'f/l:' + firstChunk + '/' + (!tailLength) + ';  len:' + messageLength);
            chunkStream.lastTimestamp = chunkTimestamp;
            chunkStream.lastLength = messageLength;
            chunkStream.lastTypeId = messageTypeId;
            chunkStream.lastStreamId = messageStreamId;
            chunkStream.lastMessageComplete = !tailLength;
            chunkStream.waitingForBytes = tailLength;
            chunkStream._push(this.buffer.subarray(totalChunkHeaderSize, totalChunkHeaderSize + read), firstChunk, !tailLength);
            return totalChunkHeaderSize + read;
        };
        ChunkedChannel.prototype.start = function () {
            this.epochStart = Date.now();
            this.ondata(new Uint8Array([PROTOCOL_VERSION])); // c0
            this.randomData = new Uint8Array(RANDOM_DATA_SIZE);
            this.randomData[0] = 0;
            this.randomData[1] = 0;
            this.randomData[2] = 0;
            this.randomData[3] = 0;
            for (var i = 8; i < RANDOM_DATA_SIZE; i++) {
                this.randomData[i] = (Math.random() * 256) | 0;
            }
            this.ondata(this.randomData); // c1
            console.log('## connected');
        };
        ChunkedChannel.prototype.stop = function (error) {
            if (error) {
                console.error('socket error!!!');
            }
            console.log('## closed');
        };
        ChunkedChannel.prototype._fail = function (message) {
            console.error('failed: ' + message);
            this.state = 'failed';
            this.onclose();
            throw new Error(message);
        };
        return ChunkedChannel;
    }());
    RtmpJs.ChunkedChannel = ChunkedChannel;
})(RtmpJs || (RtmpJs = {}));
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
var RtmpJs;
(function (RtmpJs) {
    var flash = Shumway.AVMX.AS.flash;
    var TRANSPORT_ENCODING = 0;
    var MAIN_CHUNKED_STREAM_ID = 3;
    var CONNECT_TRANSACTION_ID = 1;
    var DEFAULT_STREAM_ID = 0;
    var COMMAND_MESSAGE_AMF0_ID = 20;
    var COMMAND_MESSAGE_AMF3_ID = 17;
    var SET_BUFFER_CONTROL_MESSAGE_ID = 3;
    var PING_REQUEST_CONTROL_MESSAGE_ID = 6;
    var PING_RESPONSE_CONTROL_MESSAGE_ID = 7;
    var BaseTransport = /** @class */ (function () {
        function BaseTransport() {
            this._streams = [];
        }
        BaseTransport.prototype.connect = function (properties, args) {
            throw new Error('Abstract BaseTransport.connect method');
        };
        BaseTransport.prototype._initChannel = function (properties, args) {
            var channel = new RtmpJs.ChunkedChannel();
            var transport = this;
            channel.oncreated = function () {
                var ba = new flash.utils.ByteArray();
                ba.objectEncoding = TRANSPORT_ENCODING;
                ba.writeObject('connect');
                ba.writeObject(CONNECT_TRANSACTION_ID);
                ba.writeObject(properties);
                ba.writeObject(args || null);
                release || console.log('.. Connect sent');
                channel.send(MAIN_CHUNKED_STREAM_ID, {
                    streamId: DEFAULT_STREAM_ID,
                    typeId: TRANSPORT_ENCODING ? COMMAND_MESSAGE_AMF3_ID : COMMAND_MESSAGE_AMF0_ID,
                    data: new Uint8Array(ba._buffer, 0, ba.length)
                });
            };
            channel.onmessage = function (message) {
                release || console.log('.. Data received: typeId:' + message.typeId +
                    ', streamId:' + message.streamId +
                    ', cs: ' + message.chunkedStreamId);
                if (message.streamId !== 0) {
                    transport._streams[message.streamId]._push(message);
                    return;
                }
                if (message.typeId === COMMAND_MESSAGE_AMF0_ID ||
                    message.typeId === COMMAND_MESSAGE_AMF3_ID) {
                    var ba = new flash.utils.ByteArray();
                    ba.writeRawBytes(message.data);
                    ba.position = 0;
                    ba.objectEncoding = message.typeId === COMMAND_MESSAGE_AMF0_ID ? 0 : 3;
                    var commandName = ba.readObject();
                    if (commandName === undefined) {
                        ba.objectEncoding = 0;
                        commandName = ba.readObject();
                    }
                    var transactionId = ba.readObject();
                    if (commandName === '_result' || commandName === '_error') {
                        var isError = commandName === '_error';
                        if (transactionId === CONNECT_TRANSACTION_ID) {
                            var properties_1 = ba.readObject();
                            var information = ba.readObject();
                            if (transport.onconnected) {
                                transport.onconnected({
                                    properties: properties_1,
                                    information: information,
                                    isError: isError
                                });
                            }
                        }
                        else {
                            var commandObject = ba.readObject();
                            var streamId = ba.readObject();
                            if (transport.onstreamcreated) {
                                var stream = new NetStream(transport, streamId);
                                transport._streams[streamId] = stream;
                                transport.onstreamcreated({
                                    transactionId: transactionId,
                                    commandObject: commandObject,
                                    streamId: streamId,
                                    stream: stream,
                                    isError: isError
                                });
                            }
                        }
                    }
                    else if (commandName === 'onBWCheck' || commandName === 'onBWDone') {
                        // TODO skipping those for now
                        transport.sendCommandOrResponse('_error', transactionId, null, { code: 'NetConnection.Call.Failed', level: 'error' });
                    }
                    else {
                        var commandObject = ba.readObject();
                        var response = ba.position < ba.length ? ba.readObject() : undefined;
                        if (transport.onresponse) {
                            transport.onresponse({
                                commandName: commandName,
                                transactionId: transactionId,
                                commandObject: commandObject,
                                response: response
                            });
                        }
                    }
                    return;
                }
                // TODO misc messages
            };
            channel.onusercontrolmessage = function (e) {
                release || console.log('.. Event ' + e.type + ' +' + e.data.length + ' bytes');
                if (e.type === PING_REQUEST_CONTROL_MESSAGE_ID) {
                    channel.sendUserControlMessage(PING_RESPONSE_CONTROL_MESSAGE_ID, e.data);
                }
                if (transport.onevent) {
                    transport.onevent({ type: e.type, data: e.data });
                }
            };
            return (this.channel = channel);
        };
        BaseTransport.prototype.call = function (procedureName, transactionId, commandObject, args) {
            var channel = this.channel;
            var ba = new flash.utils.ByteArray();
            ba.objectEncoding = TRANSPORT_ENCODING;
            ba.writeObject(procedureName);
            ba.writeObject(transactionId);
            ba.writeObject(commandObject);
            ba.writeObject(args);
            channel.send(MAIN_CHUNKED_STREAM_ID, {
                streamId: DEFAULT_STREAM_ID,
                typeId: TRANSPORT_ENCODING ? COMMAND_MESSAGE_AMF3_ID : COMMAND_MESSAGE_AMF0_ID,
                data: new Uint8Array(ba._buffer, 0, ba.length)
            });
        };
        BaseTransport.prototype.createStream = function (transactionId, commandObject) {
            this.sendCommandOrResponse('createStream', transactionId, commandObject);
        };
        BaseTransport.prototype.sendCommandOrResponse = function (commandName, transactionId, commandObject, response) {
            var channel = this.channel;
            var ba = new flash.utils.ByteArray();
            ba.writeByte(0); // ???
            ba.objectEncoding = 0; // TRANSPORT_ENCODING;
            ba.writeObject(commandName);
            ba.writeObject(transactionId);
            ba.writeObject(commandObject || null);
            if (arguments.length > 3) {
                ba.writeObject(response);
            }
            channel.send(MAIN_CHUNKED_STREAM_ID, {
                streamId: DEFAULT_STREAM_ID,
                typeId: COMMAND_MESSAGE_AMF3_ID,
                data: new Uint8Array(ba._buffer, 0, ba.length)
            });
            /*     // really weird that this does not work
             let ba = new flash.utils.ByteArray();
             ba.objectEncoding = TRANSPORT_ENCODING;
             ba.writeObject('createStream');
             ba.writeObject(transactionId);
             ba.writeObject(commandObject || null);
             channel.send(MAIN_CHUNKED_STREAM_ID, {
             streamId: DEFAULT_STREAM_ID,
             typeId: TRANSPORT_ENCODING ? COMMAND_MESSAGE_AMF3_ID : COMMAND_MESSAGE_AMF0_ID,
             data: new Uint8Array((<any> ba)._buffer, 0, (<any> ba).length)
             });
             */
        };
        BaseTransport.prototype._setBuffer = function (streamId, ms) {
            this.channel.sendUserControlMessage(SET_BUFFER_CONTROL_MESSAGE_ID, new Uint8Array([
                (streamId >> 24) & 0xFF,
                (streamId >> 16) & 0xFF,
                (streamId >> 8) & 0xFF,
                streamId & 0xFF,
                (ms >> 24) & 0xFF,
                (ms >> 16) & 0xFF,
                (ms >> 8) & 0xFF,
                ms & 0xFF
            ]));
        };
        BaseTransport.prototype._sendCommand = function (streamId, data) {
            this.channel.send(8, {
                streamId: streamId,
                typeId: TRANSPORT_ENCODING ? COMMAND_MESSAGE_AMF3_ID : COMMAND_MESSAGE_AMF0_ID,
                data: data
            });
        };
        return BaseTransport;
    }());
    RtmpJs.BaseTransport = BaseTransport;
    var DEFAULT_BUFFER_LENGTH = 100; // ms
    var NetStream = /** @class */ (function () {
        function NetStream(transport, streamId) {
            this.transport = transport;
            this.streamId = streamId;
        }
        NetStream.prototype.play = function (name, start, duration, reset) {
            var ba = new flash.utils.ByteArray();
            ba.objectEncoding = TRANSPORT_ENCODING;
            ba.writeObject('play');
            ba.writeObject(0);
            ba.writeObject(null);
            ba.writeObject(name);
            if (arguments.length > 1) {
                ba.writeObject(start);
            }
            if (arguments.length > 2) {
                ba.writeObject(duration);
            }
            if (arguments.length > 3) {
                ba.writeObject(reset);
            }
            this.transport._sendCommand(this.streamId, new Uint8Array(ba._buffer, 0, ba.length));
            // set the buffer, otherwise it will stop in ~15 sec
            this.transport._setBuffer(this.streamId, DEFAULT_BUFFER_LENGTH);
        };
        NetStream.prototype._push = function (message) {
            switch (message.typeId) {
                case 8:
                case 9:
                    if (this.ondata) {
                        this.ondata(message);
                    }
                    break;
                case 18:
                case 20:
                    var args = [];
                    var ba = new flash.utils.ByteArray();
                    ba.writeRawBytes(message.data);
                    ba.position = 0;
                    ba.objectEncoding = 0;
                    while (ba.position < ba.length) {
                        args.push(ba.readObject());
                    }
                    if (message.typeId === 18 && this.onscriptdata) {
                        this.onscriptdata.apply(this, args);
                    }
                    if (message.typeId === 20 && this.oncallback) {
                        this.oncallback.apply(this, args);
                    }
                    break;
            }
        };
        return NetStream;
    }());
    function parseConnectionString(s) {
        // The s has to have the following format:
        //   protocol:[//host][:port]/appname[/instanceName]
        var protocolSeparatorIndex = s.indexOf(':');
        if (protocolSeparatorIndex < 0) {
            return null; // no protocol
        }
        if (s[protocolSeparatorIndex + 1] !== '/') {
            return null; // shall have '/' after protocol
        }
        var protocol = s.substring(0, protocolSeparatorIndex).toLocaleLowerCase();
        if (protocol !== 'rtmp' && protocol !== 'rtmpt' && protocol !== 'rtmps' &&
            protocol !== 'rtmpe' && protocol !== 'rtmpte' && protocol !== 'rtmfp') {
            return null;
        }
        var host, port;
        var appnameSeparator = protocolSeparatorIndex + 1;
        if (s[protocolSeparatorIndex + 2] === '/') {
            // has host
            appnameSeparator = s.indexOf('/', protocolSeparatorIndex + 3);
            if (appnameSeparator < 0) {
                return undefined; // has host but no appname
            }
            var portSeparator = s.indexOf(':', protocolSeparatorIndex + 1);
            if (portSeparator >= 0 && portSeparator < appnameSeparator) {
                host = s.substring(protocolSeparatorIndex + 3, portSeparator);
                port = +s.substring(portSeparator + 1, appnameSeparator);
            }
            else {
                host = s.substring(protocolSeparatorIndex + 3, appnameSeparator);
            }
        }
        var app = s.substring(appnameSeparator + 1);
        return {
            protocol: protocol,
            host: host,
            port: port,
            app: app
        };
    }
    RtmpJs.parseConnectionString = parseConnectionString;
})(RtmpJs || (RtmpJs = {}));
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
var RtmpJs;
(function (RtmpJs) {
    var Browser;
    (function (Browser) {
        var DEFAULT_RTMP_PORT = 1935;
        var COMBINE_RTMPT_DATA = true;
        var RtmpTransport = /** @class */ (function (_super) {
            __extends(RtmpTransport, _super);
            function RtmpTransport(connectionSettings) {
                var _this = _super.call(this) || this;
                if (typeof connectionSettings === 'string') {
                    connectionSettings = { host: connectionSettings };
                }
                _this.host = connectionSettings.host || 'localhost';
                _this.port = connectionSettings.port || DEFAULT_RTMP_PORT;
                _this.ssl = !!connectionSettings.ssl || false;
                return _this;
            }
            RtmpTransport.prototype.connect = function (properties, args) {
                var TCPSocket = typeof navigator !== 'undefined' &&
                    navigator.mozTCPSocket;
                if (!TCPSocket) {
                    throw new Error('Your browser does not support socket communication.\n' +
                        'Currenly only Firefox with enabled mozTCPSocket is allowed (see README.md).');
                }
                var channel = this._initChannel(properties, args);
                var writeQueue = [], socketError = false;
                var socket = typeof Browser.ShumwayComRtmpSocket !== 'undefined' && Browser.ShumwayComRtmpSocket.isAvailable ?
                    new Browser.ShumwayComRtmpSocket(this.host, this.port, {
                        useSecureTransport: this.ssl,
                        binaryType: 'arraybuffer'
                    }) :
                    TCPSocket.open(this.host, this.port, { useSecureTransport: this.ssl, binaryType: 'arraybuffer' });
                var sendData = function (data) {
                    return socket.send(data.buffer, data.byteOffset, data.byteLength);
                };
                socket.onopen = function (e) {
                    channel.ondata = function (data) {
                        var buf = new Uint8Array(data);
                        writeQueue.push(buf);
                        if (writeQueue.length > 1) {
                            return;
                        }
                        release || console.log('Bytes written: ' + buf.length);
                        if (sendData(buf)) {
                            writeQueue.shift();
                        }
                    };
                    channel.onclose = function () {
                        socket.close();
                    };
                    channel.start();
                };
                socket.ondrain = function (e) {
                    writeQueue.shift();
                    release || console.log('Write completed');
                    while (writeQueue.length > 0) {
                        release || console.log('Bytes written: ' + writeQueue[0].length);
                        if (!sendData(writeQueue[0])) {
                            break;
                        }
                        writeQueue.shift();
                    }
                };
                socket.onclose = function (e) {
                    channel.stop(socketError);
                };
                socket.onerror = function (e) {
                    socketError = true;
                    console.error('socket error: ' + e.data);
                };
                socket.ondata = function (e) {
                    release || console.log('Bytes read: ' + e.data.byteLength);
                    channel.push(new Uint8Array(e.data));
                };
            };
            return RtmpTransport;
        }(RtmpJs.BaseTransport));
        Browser.RtmpTransport = RtmpTransport;
        /*
         * RtmptTransport uses systemXHR to send HTTP requests.
         * See https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#XMLHttpRequest%28%29 and
         * https://github.com/mozilla-b2g/gaia/blob/master/apps/email/README.md#running-in-firefox
         *
         * Spec at http://red5.electroteque.org/dev/doc/html/rtmpt.html
         */
        var RtmptTransport = /** @class */ (function (_super) {
            __extends(RtmptTransport, _super);
            function RtmptTransport(connectionSettings) {
                var _this = _super.call(this) || this;
                var host = connectionSettings.host || 'localhost';
                var url = (connectionSettings.ssl ? 'https' : 'http') + '://' + host;
                if (connectionSettings.port) {
                    url += ':' + connectionSettings.port;
                }
                _this.baseUrl = url;
                _this.stopped = false;
                _this.sessionId = null;
                _this.requestId = 0;
                _this.data = [];
                return _this;
            }
            RtmptTransport.prototype.connect = function (properties, args) {
                var channel = this._initChannel(properties, args);
                channel.ondata = function (data) {
                    release || console.log('Bytes written: ' + data.length);
                    this.data.push(new Uint8Array(data));
                }.bind(this);
                channel.onclose = function () {
                    this.stopped = true;
                }.bind(this);
                post(this.baseUrl + '/fcs/ident2', null, function (data, status) {
                    if (status !== 404) {
                        throw new Error('Unexpected response: ' + status);
                    }
                    post(this.baseUrl + '/open/1', null, function (data, status) {
                        this.sessionId = String.fromCharCode.apply(null, data).slice(0, -1); // - '\n'
                        console.log('session id: ' + this.sessionId);
                        this.tick();
                        channel.start();
                    }.bind(this));
                }.bind(this));
            };
            RtmptTransport.prototype.tick = function () {
                var continueSend = function (data, status) {
                    if (status !== 200) {
                        throw new Error('Invalid HTTP status');
                    }
                    var idle = data[0];
                    if (data.length > 1) {
                        this.channel.push(data.subarray(1));
                    }
                    setTimeout(this.tick.bind(this), idle * 16);
                }.bind(this);
                if (this.stopped) {
                    post(this.baseUrl + '/close/2', null, function () {
                        // do nothing
                    });
                    return;
                }
                if (this.data.length > 0) {
                    var data_1;
                    if (COMBINE_RTMPT_DATA) {
                        var length_1 = 0;
                        this.data.forEach(function (i) {
                            length_1 += i.length;
                        });
                        var pos_1 = 0;
                        data_1 = new Uint8Array(length_1);
                        this.data.forEach(function (i) {
                            data_1.set(i, pos_1);
                            pos_1 += i.length;
                        });
                        this.data.length = 0;
                    }
                    else {
                        data_1 = this.data.shift();
                    }
                    post(this.baseUrl + '/send/' + this.sessionId + '/' + (this.requestId++), data_1, continueSend);
                }
                else {
                    post(this.baseUrl + '/idle/' + this.sessionId + '/' + (this.requestId++), null, continueSend);
                }
            };
            return RtmptTransport;
        }(RtmpJs.BaseTransport));
        Browser.RtmptTransport = RtmptTransport;
        var emptyPostData = new Uint8Array([0]);
        function post(path, data, onload) {
            data || (data = emptyPostData);
            var xhr = typeof Browser.ShumwayComRtmpXHR !== 'undefined' && Browser.ShumwayComRtmpXHR.isAvailable ?
                new Browser.ShumwayComRtmpXHR() : new XMLHttpRequest({ mozSystem: true });
            xhr.open('POST', path, true);
            xhr.responseType = 'arraybuffer';
            xhr.setRequestHeader('Content-Type', 'application/x-fcs');
            xhr.onload = function (e) {
                onload(new Uint8Array(xhr.response), xhr.status);
            };
            xhr.onerror = function (e) {
                console.log('error');
                throw new Error('HTTP error');
            };
            xhr.send(data);
        }
    })(Browser = RtmpJs.Browser || (RtmpJs.Browser = {}));
})(RtmpJs || (RtmpJs = {}));
/**
 * Copyright 2015 Mozilla Foundation
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
var RtmpJs;
(function (RtmpJs) {
    var MP4;
    (function (MP4) {
        var Iso;
        (function (Iso) {
            var utf8decode = Shumway.StringUtilities.utf8decode;
            var START_DATE = -2082844800000;
            /* midnight after Jan. 1, 1904 */
            var DEFAULT_MOVIE_MATRIX = [1.0, 0, 0, 0, 1.0, 0, 0, 0, 1.0];
            var DEFAULT_OP_COLOR = [0, 0, 0];
            function concatArrays(arg0) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return Array.prototype.concat.apply(arg0, args);
            }
            function writeInt32(data, offset, value) {
                data[offset] = (value >> 24) & 255;
                data[offset + 1] = (value >> 16) & 255;
                data[offset + 2] = (value >> 8) & 255;
                data[offset + 3] = value & 255;
            }
            function decodeInt32(s) {
                return (s.charCodeAt(0) << 24) | (s.charCodeAt(1) << 16) |
                    (s.charCodeAt(2) << 8) | s.charCodeAt(3);
            }
            function encodeDate(d) {
                return ((d - START_DATE) / 1000) | 0;
            }
            function encodeFloat_16_16(f) {
                return (f * 0x10000) | 0;
            }
            function encodeFloat_2_30(f) {
                return (f * 0x40000000) | 0;
            }
            function encodeFloat_8_8(f) {
                return (f * 0x100) | 0;
            }
            function encodeLang(s) {
                return ((s.charCodeAt(0) & 0x1F) << 10) | ((s.charCodeAt(1) & 0x1F) << 5) | (s.charCodeAt(2) & 0x1F);
            }
            var Box = /** @class */ (function () {
                function Box(boxtype, extendedType) {
                    this.boxtype = boxtype;
                    if (boxtype === 'uuid') {
                        this.userType = extendedType;
                    }
                }
                /**
                 * @param offset Position where writing will start in the output array
                 * @returns {number} Size of the written data
                 */
                Box.prototype.layout = function (offset) {
                    this.offset = offset;
                    var size = 8;
                    if (this.userType) {
                        size += 16;
                    }
                    this.size = size;
                    return size;
                };
                /**
                 * @param data Output array
                 * @returns {number} Amount of written bytes by this Box and its children only.
                 */
                Box.prototype.write = function (data) {
                    writeInt32(data, this.offset, this.size);
                    writeInt32(data, this.offset + 4, decodeInt32(this.boxtype));
                    if (!this.userType) {
                        return 8;
                    }
                    data.set(this.userType, this.offset + 8);
                    return 24;
                };
                Box.prototype.toUint8Array = function () {
                    var size = this.layout(0);
                    var data = new Uint8Array(size);
                    this.write(data);
                    return data;
                };
                return Box;
            }());
            Iso.Box = Box;
            var FullBox = /** @class */ (function (_super) {
                __extends(FullBox, _super);
                function FullBox(boxtype, version, flags) {
                    if (version === void 0) { version = 0; }
                    if (flags === void 0) { flags = 0; }
                    var _this = _super.call(this, boxtype) || this;
                    _this.version = version;
                    _this.flags = flags;
                    return _this;
                }
                FullBox.prototype.layout = function (offset) {
                    this.size = _super.prototype.layout.call(this, offset) + 4;
                    return this.size;
                };
                FullBox.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    writeInt32(data, this.offset + offset, (this.version << 24) | this.flags);
                    return offset + 4;
                };
                return FullBox;
            }(Box));
            Iso.FullBox = FullBox;
            var FileTypeBox = /** @class */ (function (_super) {
                __extends(FileTypeBox, _super);
                function FileTypeBox(majorBrand, minorVersion, compatibleBrands) {
                    var _this = _super.call(this, 'ftype') || this;
                    _this.majorBrand = majorBrand;
                    _this.minorVersion = minorVersion;
                    _this.compatibleBrands = compatibleBrands;
                    return _this;
                }
                FileTypeBox.prototype.layout = function (offset) {
                    this.size = _super.prototype.layout.call(this, offset) + 4 * (2 + this.compatibleBrands.length);
                    return this.size;
                };
                FileTypeBox.prototype.write = function (data) {
                    var _this = this;
                    var offset = _super.prototype.write.call(this, data);
                    writeInt32(data, this.offset + offset, decodeInt32(this.majorBrand));
                    writeInt32(data, this.offset + offset + 4, this.minorVersion);
                    offset += 8;
                    this.compatibleBrands.forEach(function (brand) {
                        writeInt32(data, _this.offset + offset, decodeInt32(brand));
                        offset += 4;
                    }, this);
                    return offset;
                };
                return FileTypeBox;
            }(Box));
            Iso.FileTypeBox = FileTypeBox;
            var BoxContainerBox = /** @class */ (function (_super) {
                __extends(BoxContainerBox, _super);
                function BoxContainerBox(type, children) {
                    var _this = _super.call(this, type) || this;
                    _this.children = children;
                    return _this;
                }
                BoxContainerBox.prototype.layout = function (offset) {
                    var size = _super.prototype.layout.call(this, offset);
                    this.children.forEach(function (child) {
                        if (!child) {
                            return; // skipping undefined
                        }
                        size += child.layout(offset + size);
                    });
                    return (this.size = size);
                };
                BoxContainerBox.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    this.children.forEach(function (child) {
                        if (!child) {
                            return; // skipping undefined
                        }
                        offset += child.write(data);
                    });
                    return offset;
                };
                return BoxContainerBox;
            }(Box));
            Iso.BoxContainerBox = BoxContainerBox;
            var MovieBox = /** @class */ (function (_super) {
                __extends(MovieBox, _super);
                function MovieBox(header, tracks, extendsBox, userData) {
                    var _this = _super.call(this, 'moov', concatArrays([header], tracks, [extendsBox, userData])) || this;
                    _this.header = header;
                    _this.tracks = tracks;
                    _this.extendsBox = extendsBox;
                    _this.userData = userData;
                    return _this;
                }
                return MovieBox;
            }(BoxContainerBox));
            Iso.MovieBox = MovieBox;
            var MovieHeaderBox = /** @class */ (function (_super) {
                __extends(MovieHeaderBox, _super);
                function MovieHeaderBox(timescale, duration, nextTrackId, rate, volume, matrix, creationTime, modificationTime) {
                    if (rate === void 0) { rate = 1.0; }
                    if (volume === void 0) { volume = 1.0; }
                    if (matrix === void 0) { matrix = DEFAULT_MOVIE_MATRIX; }
                    if (creationTime === void 0) { creationTime = START_DATE; }
                    if (modificationTime === void 0) { modificationTime = START_DATE; }
                    var _this = _super.call(this, 'mvhd', 0, 0) || this;
                    _this.timescale = timescale;
                    _this.duration = duration;
                    _this.nextTrackId = nextTrackId;
                    _this.rate = rate;
                    _this.volume = volume;
                    _this.matrix = matrix;
                    _this.creationTime = creationTime;
                    _this.modificationTime = modificationTime;
                    return _this;
                }
                MovieHeaderBox.prototype.layout = function (offset) {
                    this.size = _super.prototype.layout.call(this, offset) + 16 + 4 + 2 + 2 + 8 + 36 + 24 + 4;
                    return this.size;
                };
                MovieHeaderBox.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    // Only version 0
                    writeInt32(data, this.offset + offset, encodeDate(this.creationTime));
                    writeInt32(data, this.offset + offset + 4, encodeDate(this.modificationTime));
                    writeInt32(data, this.offset + offset + 8, this.timescale);
                    writeInt32(data, this.offset + offset + 12, this.duration);
                    offset += 16;
                    writeInt32(data, this.offset + offset, encodeFloat_16_16(this.rate));
                    writeInt32(data, this.offset + offset + 4, encodeFloat_8_8(this.volume) << 16);
                    writeInt32(data, this.offset + offset + 8, 0);
                    writeInt32(data, this.offset + offset + 12, 0);
                    offset += 16;
                    writeInt32(data, this.offset + offset, encodeFloat_16_16(this.matrix[0]));
                    writeInt32(data, this.offset + offset + 4, encodeFloat_16_16(this.matrix[1]));
                    writeInt32(data, this.offset + offset + 8, encodeFloat_16_16(this.matrix[2]));
                    writeInt32(data, this.offset + offset + 12, encodeFloat_16_16(this.matrix[3]));
                    writeInt32(data, this.offset + offset + 16, encodeFloat_16_16(this.matrix[4]));
                    writeInt32(data, this.offset + offset + 20, encodeFloat_16_16(this.matrix[5]));
                    writeInt32(data, this.offset + offset + 24, encodeFloat_2_30(this.matrix[6]));
                    writeInt32(data, this.offset + offset + 28, encodeFloat_2_30(this.matrix[7]));
                    writeInt32(data, this.offset + offset + 32, encodeFloat_2_30(this.matrix[8]));
                    offset += 36;
                    writeInt32(data, this.offset + offset, 0);
                    writeInt32(data, this.offset + offset + 4, 0);
                    writeInt32(data, this.offset + offset + 8, 0);
                    writeInt32(data, this.offset + offset + 12, 0);
                    writeInt32(data, this.offset + offset + 16, 0);
                    writeInt32(data, this.offset + offset + 20, 0);
                    offset += 24;
                    writeInt32(data, this.offset + offset, this.nextTrackId);
                    offset += 4;
                    return offset;
                };
                return MovieHeaderBox;
            }(FullBox));
            Iso.MovieHeaderBox = MovieHeaderBox;
            var TrackHeaderFlags;
            (function (TrackHeaderFlags) {
                TrackHeaderFlags[TrackHeaderFlags["TRACK_ENABLED"] = 1] = "TRACK_ENABLED";
                TrackHeaderFlags[TrackHeaderFlags["TRACK_IN_MOVIE"] = 2] = "TRACK_IN_MOVIE";
                TrackHeaderFlags[TrackHeaderFlags["TRACK_IN_PREVIEW"] = 4] = "TRACK_IN_PREVIEW";
            })(TrackHeaderFlags = Iso.TrackHeaderFlags || (Iso.TrackHeaderFlags = {}));
            var TrackHeaderBox = /** @class */ (function (_super) {
                __extends(TrackHeaderBox, _super);
                function TrackHeaderBox(flags, trackId, duration, width, height, volume, alternateGroup, layer, matrix, creationTime, modificationTime) {
                    if (alternateGroup === void 0) { alternateGroup = 0; }
                    if (layer === void 0) { layer = 0; }
                    if (matrix === void 0) { matrix = DEFAULT_MOVIE_MATRIX; }
                    if (creationTime === void 0) { creationTime = START_DATE; }
                    if (modificationTime === void 0) { modificationTime = START_DATE; }
                    var _this = _super.call(this, 'tkhd', 0, flags) || this;
                    _this.trackId = trackId;
                    _this.duration = duration;
                    _this.width = width;
                    _this.height = height;
                    _this.volume = volume;
                    _this.alternateGroup = alternateGroup;
                    _this.layer = layer;
                    _this.matrix = matrix;
                    _this.creationTime = creationTime;
                    _this.modificationTime = modificationTime;
                    return _this;
                }
                TrackHeaderBox.prototype.layout = function (offset) {
                    this.size = _super.prototype.layout.call(this, offset) + 20 + 8 + 6 + 2 + 36 + 8;
                    return this.size;
                };
                TrackHeaderBox.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    // Only version 0
                    writeInt32(data, this.offset + offset, encodeDate(this.creationTime));
                    writeInt32(data, this.offset + offset + 4, encodeDate(this.modificationTime));
                    writeInt32(data, this.offset + offset + 8, this.trackId);
                    writeInt32(data, this.offset + offset + 12, 0);
                    writeInt32(data, this.offset + offset + 16, this.duration);
                    offset += 20;
                    writeInt32(data, this.offset + offset, 0);
                    writeInt32(data, this.offset + offset + 4, 0);
                    writeInt32(data, this.offset + offset + 8, (this.layer << 16) | this.alternateGroup);
                    writeInt32(data, this.offset + offset + 12, encodeFloat_8_8(this.volume) << 16);
                    offset += 16;
                    writeInt32(data, this.offset + offset, encodeFloat_16_16(this.matrix[0]));
                    writeInt32(data, this.offset + offset + 4, encodeFloat_16_16(this.matrix[1]));
                    writeInt32(data, this.offset + offset + 8, encodeFloat_16_16(this.matrix[2]));
                    writeInt32(data, this.offset + offset + 12, encodeFloat_16_16(this.matrix[3]));
                    writeInt32(data, this.offset + offset + 16, encodeFloat_16_16(this.matrix[4]));
                    writeInt32(data, this.offset + offset + 20, encodeFloat_16_16(this.matrix[5]));
                    writeInt32(data, this.offset + offset + 24, encodeFloat_2_30(this.matrix[6]));
                    writeInt32(data, this.offset + offset + 28, encodeFloat_2_30(this.matrix[7]));
                    writeInt32(data, this.offset + offset + 32, encodeFloat_2_30(this.matrix[8]));
                    offset += 36;
                    writeInt32(data, this.offset + offset, encodeFloat_16_16(this.width));
                    writeInt32(data, this.offset + offset + 4, encodeFloat_16_16(this.height));
                    offset += 8;
                    return offset;
                };
                return TrackHeaderBox;
            }(FullBox));
            Iso.TrackHeaderBox = TrackHeaderBox;
            var MediaHeaderBox = /** @class */ (function (_super) {
                __extends(MediaHeaderBox, _super);
                function MediaHeaderBox(timescale, duration, language, creationTime, modificationTime) {
                    if (language === void 0) { language = 'unk'; }
                    if (creationTime === void 0) { creationTime = START_DATE; }
                    if (modificationTime === void 0) { modificationTime = START_DATE; }
                    var _this = _super.call(this, 'mdhd', 0, 0) || this;
                    _this.timescale = timescale;
                    _this.duration = duration;
                    _this.language = language;
                    _this.creationTime = creationTime;
                    _this.modificationTime = modificationTime;
                    return _this;
                }
                MediaHeaderBox.prototype.layout = function (offset) {
                    this.size = _super.prototype.layout.call(this, offset) + 16 + 4;
                    return this.size;
                };
                MediaHeaderBox.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    // Only version 0
                    writeInt32(data, this.offset + offset, encodeDate(this.creationTime));
                    writeInt32(data, this.offset + offset + 4, encodeDate(this.modificationTime));
                    writeInt32(data, this.offset + offset + 8, this.timescale);
                    writeInt32(data, this.offset + offset + 12, this.duration);
                    writeInt32(data, this.offset + offset + 16, encodeLang(this.language) << 16);
                    return offset + 20;
                };
                return MediaHeaderBox;
            }(FullBox));
            Iso.MediaHeaderBox = MediaHeaderBox;
            var HandlerBox = /** @class */ (function (_super) {
                __extends(HandlerBox, _super);
                function HandlerBox(handlerType, name) {
                    var _this = _super.call(this, 'hdlr', 0, 0) || this;
                    _this.handlerType = handlerType;
                    _this.name = name;
                    _this._encodedName = utf8decode(_this.name);
                    return _this;
                }
                HandlerBox.prototype.layout = function (offset) {
                    this.size = _super.prototype.layout.call(this, offset) + 8 + 12 + (this._encodedName.length + 1);
                    return this.size;
                };
                HandlerBox.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    writeInt32(data, this.offset + offset, 0);
                    writeInt32(data, this.offset + offset + 4, decodeInt32(this.handlerType));
                    writeInt32(data, this.offset + offset + 8, 0);
                    writeInt32(data, this.offset + offset + 12, 0);
                    writeInt32(data, this.offset + offset + 16, 0);
                    offset += 20;
                    data.set(this._encodedName, this.offset + offset);
                    data[this.offset + offset + this._encodedName.length] = 0;
                    offset += this._encodedName.length + 1;
                    return offset;
                };
                return HandlerBox;
            }(FullBox));
            Iso.HandlerBox = HandlerBox;
            var SoundMediaHeaderBox = /** @class */ (function (_super) {
                __extends(SoundMediaHeaderBox, _super);
                function SoundMediaHeaderBox(balance) {
                    if (balance === void 0) { balance = 0.0; }
                    var _this = _super.call(this, 'smhd', 0, 0) || this;
                    _this.balance = balance;
                    return _this;
                }
                SoundMediaHeaderBox.prototype.layout = function (offset) {
                    this.size = _super.prototype.layout.call(this, offset) + 4;
                    return this.size;
                };
                SoundMediaHeaderBox.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    writeInt32(data, this.offset + offset, encodeFloat_8_8(this.balance) << 16);
                    return offset + 4;
                };
                return SoundMediaHeaderBox;
            }(FullBox));
            Iso.SoundMediaHeaderBox = SoundMediaHeaderBox;
            var VideoMediaHeaderBox = /** @class */ (function (_super) {
                __extends(VideoMediaHeaderBox, _super);
                function VideoMediaHeaderBox(graphicsMode, opColor) {
                    if (graphicsMode === void 0) { graphicsMode = 0; }
                    if (opColor === void 0) { opColor = DEFAULT_OP_COLOR; }
                    var _this = _super.call(this, 'vmhd', 0, 0) || this;
                    _this.graphicsMode = graphicsMode;
                    _this.opColor = opColor;
                    return _this;
                }
                VideoMediaHeaderBox.prototype.layout = function (offset) {
                    this.size = _super.prototype.layout.call(this, offset) + 8;
                    return this.size;
                };
                VideoMediaHeaderBox.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    writeInt32(data, this.offset + offset, (this.graphicsMode << 16) | this.opColor[0]);
                    writeInt32(data, this.offset + offset + 4, (this.opColor[1] << 16) | this.opColor[2]);
                    return offset + 8;
                };
                return VideoMediaHeaderBox;
            }(FullBox));
            Iso.VideoMediaHeaderBox = VideoMediaHeaderBox;
            Iso.SELF_CONTAINED_DATA_REFERENCE_FLAG = 0x000001;
            var DataEntryUrlBox = /** @class */ (function (_super) {
                __extends(DataEntryUrlBox, _super);
                function DataEntryUrlBox(flags, location) {
                    if (location === void 0) { location = null; }
                    var _this = _super.call(this, 'url ', 0, flags) || this;
                    _this.location = location;
                    if (!(flags & Iso.SELF_CONTAINED_DATA_REFERENCE_FLAG)) {
                        _this._encodedLocation = utf8decode(location);
                    }
                    return _this;
                }
                DataEntryUrlBox.prototype.layout = function (offset) {
                    var size = _super.prototype.layout.call(this, offset);
                    if (this._encodedLocation) {
                        size += this._encodedLocation.length + 1;
                    }
                    return (this.size = size);
                };
                DataEntryUrlBox.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    if (this._encodedLocation) {
                        data.set(this._encodedLocation, this.offset + offset);
                        data[this.offset + offset + this._encodedLocation.length] = 0;
                        offset += this._encodedLocation.length;
                    }
                    return offset;
                };
                return DataEntryUrlBox;
            }(FullBox));
            Iso.DataEntryUrlBox = DataEntryUrlBox;
            var DataReferenceBox = /** @class */ (function (_super) {
                __extends(DataReferenceBox, _super);
                function DataReferenceBox(entries) {
                    var _this = _super.call(this, 'dref', 0, 0) || this;
                    _this.entries = entries;
                    return _this;
                }
                DataReferenceBox.prototype.layout = function (offset) {
                    var size = _super.prototype.layout.call(this, offset) + 4;
                    this.entries.forEach(function (entry) {
                        size += entry.layout(offset + size);
                    });
                    return (this.size = size);
                };
                DataReferenceBox.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    writeInt32(data, this.offset + offset, this.entries.length);
                    this.entries.forEach(function (entry) {
                        offset += entry.write(data);
                    });
                    return offset;
                };
                return DataReferenceBox;
            }(FullBox));
            Iso.DataReferenceBox = DataReferenceBox;
            var DataInformationBox = /** @class */ (function (_super) {
                __extends(DataInformationBox, _super);
                function DataInformationBox(dataReference) {
                    var _this = _super.call(this, 'dinf', [dataReference]) || this;
                    _this.dataReference = dataReference;
                    return _this;
                }
                return DataInformationBox;
            }(BoxContainerBox));
            Iso.DataInformationBox = DataInformationBox;
            var SampleDescriptionBox = /** @class */ (function (_super) {
                __extends(SampleDescriptionBox, _super);
                function SampleDescriptionBox(entries) {
                    var _this = _super.call(this, 'stsd', 0, 0) || this;
                    _this.entries = entries;
                    return _this;
                }
                SampleDescriptionBox.prototype.layout = function (offset) {
                    var size = _super.prototype.layout.call(this, offset);
                    size += 4;
                    this.entries.forEach(function (entry) {
                        size += entry.layout(offset + size);
                    });
                    return (this.size = size);
                };
                SampleDescriptionBox.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    writeInt32(data, this.offset + offset, this.entries.length);
                    offset += 4;
                    this.entries.forEach(function (entry) {
                        offset += entry.write(data);
                    });
                    return offset;
                };
                return SampleDescriptionBox;
            }(FullBox));
            Iso.SampleDescriptionBox = SampleDescriptionBox;
            var SampleTableBox = /** @class */ (function (_super) {
                __extends(SampleTableBox, _super);
                function SampleTableBox(sampleDescriptions, timeToSample, sampleToChunk, sampleSizes, // optional?
                    chunkOffset) {
                    var _this = _super.call(this, 'stbl', [sampleDescriptions, timeToSample, sampleToChunk, sampleSizes, chunkOffset]) || this;
                    _this.sampleDescriptions = sampleDescriptions;
                    _this.timeToSample = timeToSample;
                    _this.sampleToChunk = sampleToChunk;
                    _this.sampleSizes = sampleSizes;
                    _this.chunkOffset = chunkOffset;
                    return _this;
                }
                return SampleTableBox;
            }(BoxContainerBox));
            Iso.SampleTableBox = SampleTableBox;
            var MediaInformationBox = /** @class */ (function (_super) {
                __extends(MediaInformationBox, _super);
                function MediaInformationBox(header, // SoundMediaHeaderBox|VideoMediaHeaderBox
                    info, sampleTable) {
                    var _this = _super.call(this, 'minf', [header, info, sampleTable]) || this;
                    _this.header = header;
                    _this.info = info;
                    _this.sampleTable = sampleTable;
                    return _this;
                }
                return MediaInformationBox;
            }(BoxContainerBox));
            Iso.MediaInformationBox = MediaInformationBox;
            var MediaBox = /** @class */ (function (_super) {
                __extends(MediaBox, _super);
                function MediaBox(header, handler, info) {
                    var _this = _super.call(this, 'mdia', [header, handler, info]) || this;
                    _this.header = header;
                    _this.handler = handler;
                    _this.info = info;
                    return _this;
                }
                return MediaBox;
            }(BoxContainerBox));
            Iso.MediaBox = MediaBox;
            var TrackBox = /** @class */ (function (_super) {
                __extends(TrackBox, _super);
                function TrackBox(header, media) {
                    var _this = _super.call(this, 'trak', [header, media]) || this;
                    _this.header = header;
                    _this.media = media;
                    return _this;
                }
                return TrackBox;
            }(BoxContainerBox));
            Iso.TrackBox = TrackBox;
            var TrackExtendsBox = /** @class */ (function (_super) {
                __extends(TrackExtendsBox, _super);
                function TrackExtendsBox(trackId, defaultSampleDescriptionIndex, defaultSampleDuration, defaultSampleSize, defaultSampleFlags) {
                    var _this = _super.call(this, 'trex', 0, 0) || this;
                    _this.trackId = trackId;
                    _this.defaultSampleDescriptionIndex = defaultSampleDescriptionIndex;
                    _this.defaultSampleDuration = defaultSampleDuration;
                    _this.defaultSampleSize = defaultSampleSize;
                    _this.defaultSampleFlags = defaultSampleFlags;
                    return _this;
                }
                TrackExtendsBox.prototype.layout = function (offset) {
                    this.size = _super.prototype.layout.call(this, offset) + 20;
                    return this.size;
                };
                TrackExtendsBox.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    writeInt32(data, this.offset + offset, this.trackId);
                    writeInt32(data, this.offset + offset + 4, this.defaultSampleDescriptionIndex);
                    writeInt32(data, this.offset + offset + 8, this.defaultSampleDuration);
                    writeInt32(data, this.offset + offset + 12, this.defaultSampleSize);
                    writeInt32(data, this.offset + offset + 16, this.defaultSampleFlags);
                    return offset + 20;
                };
                return TrackExtendsBox;
            }(FullBox));
            Iso.TrackExtendsBox = TrackExtendsBox;
            var MovieExtendsBox = /** @class */ (function (_super) {
                __extends(MovieExtendsBox, _super);
                function MovieExtendsBox(header, tracDefaults, levels) {
                    var _this = _super.call(this, 'mvex', concatArrays([header], tracDefaults, [levels])) || this;
                    _this.header = header;
                    _this.tracDefaults = tracDefaults;
                    _this.levels = levels;
                    return _this;
                }
                return MovieExtendsBox;
            }(BoxContainerBox));
            Iso.MovieExtendsBox = MovieExtendsBox;
            var MetaBox = /** @class */ (function (_super) {
                __extends(MetaBox, _super);
                function MetaBox(handler, otherBoxes) {
                    var _this = _super.call(this, 'meta', 0, 0) || this;
                    _this.handler = handler;
                    _this.otherBoxes = otherBoxes;
                    return _this;
                }
                MetaBox.prototype.layout = function (offset) {
                    var size = _super.prototype.layout.call(this, offset);
                    size += this.handler.layout(offset + size);
                    this.otherBoxes.forEach(function (box) {
                        size += box.layout(offset + size);
                    });
                    return (this.size = size);
                };
                MetaBox.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    offset += this.handler.write(data);
                    this.otherBoxes.forEach(function (box) {
                        offset += box.write(data);
                    });
                    return offset;
                };
                return MetaBox;
            }(FullBox));
            Iso.MetaBox = MetaBox;
            var MovieFragmentHeaderBox = /** @class */ (function (_super) {
                __extends(MovieFragmentHeaderBox, _super);
                function MovieFragmentHeaderBox(sequenceNumber) {
                    var _this = _super.call(this, 'mfhd', 0, 0) || this;
                    _this.sequenceNumber = sequenceNumber;
                    return _this;
                }
                MovieFragmentHeaderBox.prototype.layout = function (offset) {
                    this.size = _super.prototype.layout.call(this, offset) + 4;
                    return this.size;
                };
                MovieFragmentHeaderBox.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    writeInt32(data, this.offset + offset, this.sequenceNumber);
                    return offset + 4;
                };
                return MovieFragmentHeaderBox;
            }(FullBox));
            Iso.MovieFragmentHeaderBox = MovieFragmentHeaderBox;
            var TrackFragmentFlags;
            (function (TrackFragmentFlags) {
                TrackFragmentFlags[TrackFragmentFlags["BASE_DATA_OFFSET_PRESENT"] = 1] = "BASE_DATA_OFFSET_PRESENT";
                TrackFragmentFlags[TrackFragmentFlags["SAMPLE_DESCRIPTION_INDEX_PRESENT"] = 2] = "SAMPLE_DESCRIPTION_INDEX_PRESENT";
                TrackFragmentFlags[TrackFragmentFlags["DEFAULT_SAMPLE_DURATION_PRESENT"] = 8] = "DEFAULT_SAMPLE_DURATION_PRESENT";
                TrackFragmentFlags[TrackFragmentFlags["DEFAULT_SAMPLE_SIZE_PRESENT"] = 16] = "DEFAULT_SAMPLE_SIZE_PRESENT";
                TrackFragmentFlags[TrackFragmentFlags["DEFAULT_SAMPLE_FLAGS_PRESENT"] = 32] = "DEFAULT_SAMPLE_FLAGS_PRESENT";
            })(TrackFragmentFlags = Iso.TrackFragmentFlags || (Iso.TrackFragmentFlags = {}));
            var TrackFragmentHeaderBox = /** @class */ (function (_super) {
                __extends(TrackFragmentHeaderBox, _super);
                function TrackFragmentHeaderBox(flags, trackId, baseDataOffset, sampleDescriptionIndex, defaultSampleDuration, defaultSampleSize, defaultSampleFlags) {
                    var _this = _super.call(this, 'tfhd', 0, flags) || this;
                    _this.trackId = trackId;
                    _this.baseDataOffset = baseDataOffset;
                    _this.sampleDescriptionIndex = sampleDescriptionIndex;
                    _this.defaultSampleDuration = defaultSampleDuration;
                    _this.defaultSampleSize = defaultSampleSize;
                    _this.defaultSampleFlags = defaultSampleFlags;
                    return _this;
                }
                TrackFragmentHeaderBox.prototype.layout = function (offset) {
                    var size = _super.prototype.layout.call(this, offset) + 4;
                    var flags = this.flags;
                    if (!!(flags & 1 /* BASE_DATA_OFFSET_PRESENT */)) {
                        size += 8;
                    }
                    if (!!(flags & 2 /* SAMPLE_DESCRIPTION_INDEX_PRESENT */)) {
                        size += 4;
                    }
                    if (!!(flags & 8 /* DEFAULT_SAMPLE_DURATION_PRESENT */)) {
                        size += 4;
                    }
                    if (!!(flags & 16 /* DEFAULT_SAMPLE_SIZE_PRESENT */)) {
                        size += 4;
                    }
                    if (!!(flags & 32 /* DEFAULT_SAMPLE_FLAGS_PRESENT */)) {
                        size += 4;
                    }
                    return (this.size = size);
                };
                TrackFragmentHeaderBox.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    var flags = this.flags;
                    writeInt32(data, this.offset + offset, this.trackId);
                    offset += 4;
                    if (!!(flags & 1 /* BASE_DATA_OFFSET_PRESENT */)) {
                        writeInt32(data, this.offset + offset, 0);
                        writeInt32(data, this.offset + offset + 4, this.baseDataOffset);
                        offset += 8;
                    }
                    if (!!(flags & 2 /* SAMPLE_DESCRIPTION_INDEX_PRESENT */)) {
                        writeInt32(data, this.offset + offset, this.sampleDescriptionIndex);
                        offset += 4;
                    }
                    if (!!(flags & 8 /* DEFAULT_SAMPLE_DURATION_PRESENT */)) {
                        writeInt32(data, this.offset + offset, this.defaultSampleDuration);
                        offset += 4;
                    }
                    if (!!(flags & 16 /* DEFAULT_SAMPLE_SIZE_PRESENT */)) {
                        writeInt32(data, this.offset + offset, this.defaultSampleSize);
                        offset += 4;
                    }
                    if (!!(flags & 32 /* DEFAULT_SAMPLE_FLAGS_PRESENT */)) {
                        writeInt32(data, this.offset + offset, this.defaultSampleFlags);
                        offset += 4;
                    }
                    return offset;
                };
                return TrackFragmentHeaderBox;
            }(FullBox));
            Iso.TrackFragmentHeaderBox = TrackFragmentHeaderBox;
            var TrackFragmentBaseMediaDecodeTimeBox = /** @class */ (function (_super) {
                __extends(TrackFragmentBaseMediaDecodeTimeBox, _super);
                function TrackFragmentBaseMediaDecodeTimeBox(baseMediaDecodeTime) {
                    var _this = _super.call(this, 'tfdt', 0, 0) || this;
                    _this.baseMediaDecodeTime = baseMediaDecodeTime;
                    return _this;
                }
                TrackFragmentBaseMediaDecodeTimeBox.prototype.layout = function (offset) {
                    this.size = _super.prototype.layout.call(this, offset) + 4;
                    return this.size;
                };
                TrackFragmentBaseMediaDecodeTimeBox.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    writeInt32(data, this.offset + offset, this.baseMediaDecodeTime);
                    return offset + 4;
                };
                return TrackFragmentBaseMediaDecodeTimeBox;
            }(FullBox));
            Iso.TrackFragmentBaseMediaDecodeTimeBox = TrackFragmentBaseMediaDecodeTimeBox;
            var TrackFragmentBox = /** @class */ (function (_super) {
                __extends(TrackFragmentBox, _super);
                function TrackFragmentBox(header, decodeTime, // move after run?
                    run) {
                    var _this = _super.call(this, 'traf', [header, decodeTime, run]) || this;
                    _this.header = header;
                    _this.decodeTime = decodeTime;
                    _this.run = run;
                    return _this;
                }
                return TrackFragmentBox;
            }(BoxContainerBox));
            Iso.TrackFragmentBox = TrackFragmentBox;
            var SampleFlags;
            (function (SampleFlags) {
                SampleFlags[SampleFlags["IS_LEADING_MASK"] = 201326592] = "IS_LEADING_MASK";
                SampleFlags[SampleFlags["SAMPLE_DEPENDS_ON_MASK"] = 50331648] = "SAMPLE_DEPENDS_ON_MASK";
                SampleFlags[SampleFlags["SAMPLE_DEPENDS_ON_OTHER"] = 16777216] = "SAMPLE_DEPENDS_ON_OTHER";
                SampleFlags[SampleFlags["SAMPLE_DEPENDS_ON_NO_OTHERS"] = 33554432] = "SAMPLE_DEPENDS_ON_NO_OTHERS";
                SampleFlags[SampleFlags["SAMPLE_IS_DEPENDED_ON_MASK"] = 12582912] = "SAMPLE_IS_DEPENDED_ON_MASK";
                SampleFlags[SampleFlags["SAMPLE_HAS_REDUNDANCY_MASK"] = 3145728] = "SAMPLE_HAS_REDUNDANCY_MASK";
                SampleFlags[SampleFlags["SAMPLE_PADDING_VALUE_MASK"] = 917504] = "SAMPLE_PADDING_VALUE_MASK";
                SampleFlags[SampleFlags["SAMPLE_IS_NOT_SYNC"] = 65536] = "SAMPLE_IS_NOT_SYNC";
                SampleFlags[SampleFlags["SAMPLE_DEGRADATION_PRIORITY_MASK"] = 65535] = "SAMPLE_DEGRADATION_PRIORITY_MASK";
            })(SampleFlags = Iso.SampleFlags || (Iso.SampleFlags = {}));
            var TrackRunFlags;
            (function (TrackRunFlags) {
                TrackRunFlags[TrackRunFlags["DATA_OFFSET_PRESENT"] = 1] = "DATA_OFFSET_PRESENT";
                TrackRunFlags[TrackRunFlags["FIRST_SAMPLE_FLAGS_PRESENT"] = 4] = "FIRST_SAMPLE_FLAGS_PRESENT";
                TrackRunFlags[TrackRunFlags["SAMPLE_DURATION_PRESENT"] = 256] = "SAMPLE_DURATION_PRESENT";
                TrackRunFlags[TrackRunFlags["SAMPLE_SIZE_PRESENT"] = 512] = "SAMPLE_SIZE_PRESENT";
                TrackRunFlags[TrackRunFlags["SAMPLE_FLAGS_PRESENT"] = 1024] = "SAMPLE_FLAGS_PRESENT";
                TrackRunFlags[TrackRunFlags["SAMPLE_COMPOSITION_TIME_OFFSET"] = 2048] = "SAMPLE_COMPOSITION_TIME_OFFSET";
            })(TrackRunFlags = Iso.TrackRunFlags || (Iso.TrackRunFlags = {}));
            var TrackRunBox = /** @class */ (function (_super) {
                __extends(TrackRunBox, _super);
                function TrackRunBox(flags, samples, dataOffset, firstSampleFlags) {
                    var _this = _super.call(this, 'trun', 1, flags) || this;
                    _this.samples = samples;
                    _this.dataOffset = dataOffset;
                    _this.firstSampleFlags = firstSampleFlags;
                    return _this;
                }
                TrackRunBox.prototype.layout = function (offset) {
                    var size = _super.prototype.layout.call(this, offset) + 4;
                    var samplesCount = this.samples.length;
                    var flags = this.flags;
                    if (!!(flags & 1 /* DATA_OFFSET_PRESENT */)) {
                        size += 4;
                    }
                    if (!!(flags & 4 /* FIRST_SAMPLE_FLAGS_PRESENT */)) {
                        size += 4;
                    }
                    if (!!(flags & 256 /* SAMPLE_DURATION_PRESENT */)) {
                        size += 4 * samplesCount;
                    }
                    if (!!(flags & 512 /* SAMPLE_SIZE_PRESENT */)) {
                        size += 4 * samplesCount;
                    }
                    if (!!(flags & 1024 /* SAMPLE_FLAGS_PRESENT */)) {
                        size += 4 * samplesCount;
                    }
                    if (!!(flags & 2048 /* SAMPLE_COMPOSITION_TIME_OFFSET */)) {
                        size += 4 * samplesCount;
                    }
                    return (this.size = size);
                };
                TrackRunBox.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    var samplesCount = this.samples.length;
                    var flags = this.flags;
                    writeInt32(data, this.offset + offset, samplesCount);
                    offset += 4;
                    if (!!(flags & 1 /* DATA_OFFSET_PRESENT */)) {
                        writeInt32(data, this.offset + offset, this.dataOffset);
                        offset += 4;
                    }
                    if (!!(flags & 4 /* FIRST_SAMPLE_FLAGS_PRESENT */)) {
                        writeInt32(data, this.offset + offset, this.firstSampleFlags);
                        offset += 4;
                    }
                    for (var i = 0; i < samplesCount; i++) {
                        var sample = this.samples[i];
                        if (!!(flags & 256 /* SAMPLE_DURATION_PRESENT */)) {
                            writeInt32(data, this.offset + offset, sample.duration);
                            offset += 4;
                        }
                        if (!!(flags & 512 /* SAMPLE_SIZE_PRESENT */)) {
                            writeInt32(data, this.offset + offset, sample.size);
                            offset += 4;
                        }
                        if (!!(flags & 1024 /* SAMPLE_FLAGS_PRESENT */)) {
                            writeInt32(data, this.offset + offset, sample.flags);
                            offset += 4;
                        }
                        if (!!(flags & 2048 /* SAMPLE_COMPOSITION_TIME_OFFSET */)) {
                            writeInt32(data, this.offset + offset, sample.compositionTimeOffset);
                            offset += 4;
                        }
                    }
                    return offset;
                };
                return TrackRunBox;
            }(FullBox));
            Iso.TrackRunBox = TrackRunBox;
            var MovieFragmentBox = /** @class */ (function (_super) {
                __extends(MovieFragmentBox, _super);
                function MovieFragmentBox(header, trafs) {
                    var _this = _super.call(this, 'moof', concatArrays([header], trafs)) || this;
                    _this.header = header;
                    _this.trafs = trafs;
                    return _this;
                }
                return MovieFragmentBox;
            }(BoxContainerBox));
            Iso.MovieFragmentBox = MovieFragmentBox;
            var MediaDataBox = /** @class */ (function (_super) {
                __extends(MediaDataBox, _super);
                function MediaDataBox(chunks) {
                    var _this = _super.call(this, 'mdat') || this;
                    _this.chunks = chunks;
                    return _this;
                }
                MediaDataBox.prototype.layout = function (offset) {
                    var size = _super.prototype.layout.call(this, offset);
                    this.chunks.forEach(function (chunk) {
                        size += chunk.length;
                    });
                    return (this.size = size);
                };
                MediaDataBox.prototype.write = function (data) {
                    var _this = this;
                    var offset = _super.prototype.write.call(this, data);
                    this.chunks.forEach(function (chunk) {
                        data.set(chunk, _this.offset + offset);
                        offset += chunk.length;
                    }, this);
                    return offset;
                };
                return MediaDataBox;
            }(Box));
            Iso.MediaDataBox = MediaDataBox;
            var SampleEntry = /** @class */ (function (_super) {
                __extends(SampleEntry, _super);
                function SampleEntry(format, dataReferenceIndex) {
                    var _this = _super.call(this, format) || this;
                    _this.dataReferenceIndex = dataReferenceIndex;
                    return _this;
                }
                SampleEntry.prototype.layout = function (offset) {
                    this.size = _super.prototype.layout.call(this, offset) + 8;
                    return this.size;
                };
                SampleEntry.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    writeInt32(data, this.offset + offset, 0);
                    writeInt32(data, this.offset + offset + 4, this.dataReferenceIndex);
                    return offset + 8;
                };
                return SampleEntry;
            }(Box));
            Iso.SampleEntry = SampleEntry;
            var AudioSampleEntry = /** @class */ (function (_super) {
                __extends(AudioSampleEntry, _super);
                function AudioSampleEntry(codingName, dataReferenceIndex, channelCount, sampleSize, sampleRate, otherBoxes) {
                    if (channelCount === void 0) { channelCount = 2; }
                    if (sampleSize === void 0) { sampleSize = 16; }
                    if (sampleRate === void 0) { sampleRate = 44100; }
                    if (otherBoxes === void 0) { otherBoxes = null; }
                    var _this = _super.call(this, codingName, dataReferenceIndex) || this;
                    _this.channelCount = channelCount;
                    _this.sampleSize = sampleSize;
                    _this.sampleRate = sampleRate;
                    _this.otherBoxes = otherBoxes;
                    return _this;
                }
                AudioSampleEntry.prototype.layout = function (offset) {
                    var size = _super.prototype.layout.call(this, offset) + 20;
                    this.otherBoxes && this.otherBoxes.forEach(function (box) {
                        size += box.layout(offset + size);
                    });
                    return (this.size = size);
                };
                AudioSampleEntry.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    writeInt32(data, this.offset + offset, 0);
                    writeInt32(data, this.offset + offset + 4, 0);
                    writeInt32(data, this.offset + offset + 8, (this.channelCount << 16) | this.sampleSize);
                    writeInt32(data, this.offset + offset + 12, 0);
                    writeInt32(data, this.offset + offset + 16, (this.sampleRate << 16));
                    offset += 20;
                    this.otherBoxes && this.otherBoxes.forEach(function (box) {
                        offset += box.write(data);
                    });
                    return offset;
                };
                return AudioSampleEntry;
            }(SampleEntry));
            Iso.AudioSampleEntry = AudioSampleEntry;
            Iso.COLOR_NO_ALPHA_VIDEO_SAMPLE_DEPTH = 0x0018;
            var VideoSampleEntry = /** @class */ (function (_super) {
                __extends(VideoSampleEntry, _super);
                function VideoSampleEntry(codingName, dataReferenceIndex, width, height, compressorName, horizResolution, vertResolution, frameCount, depth, otherBoxes) {
                    if (compressorName === void 0) { compressorName = ''; }
                    if (horizResolution === void 0) { horizResolution = 72; }
                    if (vertResolution === void 0) { vertResolution = 72; }
                    if (frameCount === void 0) { frameCount = 1; }
                    if (depth === void 0) { depth = Iso.COLOR_NO_ALPHA_VIDEO_SAMPLE_DEPTH; }
                    if (otherBoxes === void 0) { otherBoxes = null; }
                    var _this = _super.call(this, codingName, dataReferenceIndex) || this;
                    _this.width = width;
                    _this.height = height;
                    _this.compressorName = compressorName;
                    _this.horizResolution = horizResolution;
                    _this.vertResolution = vertResolution;
                    _this.frameCount = frameCount;
                    _this.depth = depth;
                    _this.otherBoxes = otherBoxes;
                    if (compressorName.length > 31) {
                        throw new Error('invalid compressor name');
                    }
                    return _this;
                }
                VideoSampleEntry.prototype.layout = function (offset) {
                    var size = _super.prototype.layout.call(this, offset) + 16 + 12 + 4 + 2 + 32 + 2 + 2;
                    this.otherBoxes && this.otherBoxes.forEach(function (box) {
                        size += box.layout(offset + size);
                    });
                    return (this.size = size);
                };
                VideoSampleEntry.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    writeInt32(data, this.offset + offset, 0);
                    writeInt32(data, this.offset + offset + 4, 0);
                    writeInt32(data, this.offset + offset + 8, 0);
                    writeInt32(data, this.offset + offset + 12, 0);
                    offset += 16;
                    writeInt32(data, this.offset + offset, (this.width << 16) | this.height);
                    writeInt32(data, this.offset + offset + 4, encodeFloat_16_16(this.horizResolution));
                    writeInt32(data, this.offset + offset + 8, encodeFloat_16_16(this.vertResolution));
                    offset += 12;
                    writeInt32(data, this.offset + offset, 0);
                    writeInt32(data, this.offset + offset + 4, (this.frameCount << 16));
                    offset += 6; // weird offset
                    data[this.offset + offset] = this.compressorName.length;
                    for (var i = 0; i < 31; i++) {
                        data[this.offset + offset + i + 1] = i < this.compressorName.length ? (this.compressorName.charCodeAt(i) & 127) : 0;
                    }
                    offset += 32;
                    writeInt32(data, this.offset + offset, (this.depth << 16) | 0xFFFF);
                    offset += 4;
                    this.otherBoxes && this.otherBoxes.forEach(function (box) {
                        offset += box.write(data);
                    });
                    return offset;
                };
                return VideoSampleEntry;
            }(SampleEntry));
            Iso.VideoSampleEntry = VideoSampleEntry;
            var RawTag = /** @class */ (function (_super) {
                __extends(RawTag, _super);
                function RawTag(type, data) {
                    var _this = _super.call(this, type) || this;
                    _this.data = data;
                    return _this;
                }
                RawTag.prototype.layout = function (offset) {
                    this.size = _super.prototype.layout.call(this, offset) + this.data.length;
                    return this.size;
                };
                RawTag.prototype.write = function (data) {
                    var offset = _super.prototype.write.call(this, data);
                    data.set(this.data, this.offset + offset);
                    return offset + this.data.length;
                };
                return RawTag;
            }(Box));
            Iso.RawTag = RawTag;
        })(Iso = MP4.Iso || (MP4.Iso = {}));
    })(MP4 = RtmpJs.MP4 || (RtmpJs.MP4 = {}));
})(RtmpJs || (RtmpJs = {}));
/**
 * Copyright 2015 Mozilla Foundation
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
var RtmpJs;
(function (RtmpJs) {
    var MP4;
    (function (MP4) {
        function hex(s) {
            var len = s.length >> 1;
            var arr = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                arr[i] = parseInt(s.substr(i * 2, 2), 16);
            }
            return arr;
        }
        var SOUNDRATES = [5500, 11025, 22050, 44100];
        var SOUNDFORMATS = ['PCM', 'ADPCM', 'MP3', 'PCM le', 'Nellymouser16', 'Nellymouser8', 'Nellymouser', 'G.711 A-law', 'G.711 mu-law', null, 'AAC', 'Speex', 'MP3 8khz'];
        var MP3_SOUND_CODEC_ID = 2;
        var AAC_SOUND_CODEC_ID = 10;
        var AudioPacketType;
        (function (AudioPacketType) {
            AudioPacketType[AudioPacketType["HEADER"] = 0] = "HEADER";
            AudioPacketType[AudioPacketType["RAW"] = 1] = "RAW";
        })(AudioPacketType || (AudioPacketType = {}));
        function parseAudiodata(data) {
            var i = 0;
            var packetType = AudioPacketType.RAW;
            var flags = data[i];
            var codecId = flags >> 4;
            var soundRateId = (flags >> 2) & 3;
            var sampleSize = (flags & 2) !== 0 ? 16 : 8;
            var channels = (flags & 1) !== 0 ? 2 : 1;
            var samples;
            i++;
            switch (codecId) {
                case AAC_SOUND_CODEC_ID:
                    var type = data[i++];
                    packetType = type;
                    samples = 1024; // AAC implementations typically represent 1024 PCM audio samples
                    break;
                case MP3_SOUND_CODEC_ID:
                    var version = (data[i + 1] >> 3) & 3; // 3 - MPEG 1
                    var layer = (data[i + 1] >> 1) & 3; // 3 - Layer I, 2 - II, 1 - III
                    samples = layer === 1 ? (version === 3 ? 1152 : 576) :
                        (layer === 3 ? 384 : 1152);
                    break;
            }
            return {
                codecDescription: SOUNDFORMATS[codecId],
                codecId: codecId,
                data: data.subarray(i),
                rate: SOUNDRATES[soundRateId],
                size: sampleSize,
                channels: channels,
                samples: samples,
                packetType: packetType
            };
        }
        var VIDEOCODECS = [null, 'JPEG', 'Sorenson', 'Screen', 'VP6', 'VP6 alpha', 'Screen2', 'AVC'];
        var VP6_VIDEO_CODEC_ID = 4;
        var AVC_VIDEO_CODEC_ID = 7;
        var VideoFrameType;
        (function (VideoFrameType) {
            VideoFrameType[VideoFrameType["KEY"] = 1] = "KEY";
            VideoFrameType[VideoFrameType["INNER"] = 2] = "INNER";
            VideoFrameType[VideoFrameType["DISPOSABLE"] = 3] = "DISPOSABLE";
            VideoFrameType[VideoFrameType["GENERATED"] = 4] = "GENERATED";
            VideoFrameType[VideoFrameType["INFO"] = 5] = "INFO";
        })(VideoFrameType || (VideoFrameType = {}));
        var VideoPacketType;
        (function (VideoPacketType) {
            VideoPacketType[VideoPacketType["HEADER"] = 0] = "HEADER";
            VideoPacketType[VideoPacketType["NALU"] = 1] = "NALU";
            VideoPacketType[VideoPacketType["END"] = 2] = "END";
        })(VideoPacketType || (VideoPacketType = {}));
        function parseVideodata(data) {
            var i = 0;
            var frameType = data[i] >> 4;
            var codecId = data[i] & 15;
            i++;
            var result = {
                frameType: frameType,
                codecId: codecId,
                codecDescription: VIDEOCODECS[codecId]
            };
            switch (codecId) {
                case AVC_VIDEO_CODEC_ID:
                    var type = data[i++];
                    result.packetType = type;
                    result.compositionTime = ((data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8)) >> 8;
                    i += 3;
                    break;
                case VP6_VIDEO_CODEC_ID:
                    result.packetType = VideoPacketType.NALU;
                    result.horizontalOffset = (data[i] >> 4) & 15;
                    result.verticalOffset = data[i] & 15;
                    result.compositionTime = 0;
                    i++;
                    break;
            }
            result.data = data.subarray(i);
            return result;
        }
        var AUDIO_PACKET = 8;
        var VIDEO_PACKET = 9;
        var MAX_PACKETS_IN_CHUNK = 200;
        var SPLIT_AT_KEYFRAMES = false;
        var MP4MuxState;
        (function (MP4MuxState) {
            MP4MuxState[MP4MuxState["CAN_GENERATE_HEADER"] = 0] = "CAN_GENERATE_HEADER";
            MP4MuxState[MP4MuxState["NEED_HEADER_DATA"] = 1] = "NEED_HEADER_DATA";
            MP4MuxState[MP4MuxState["MAIN_PACKETS"] = 2] = "MAIN_PACKETS";
        })(MP4MuxState || (MP4MuxState = {}));
        var MP4Mux = /** @class */ (function () {
            function MP4Mux(metadata) {
                var _this = this;
                this.oncodecinfo = function (codecs) {
                    //
                };
                this.ondata = function (data) {
                    throw new Error('MP4Mux.ondata is not set');
                };
                this.metadata = metadata;
                this.trackStates = this.metadata.tracks.map(function (t, index) {
                    var state = {
                        trackId: index + 1,
                        trackInfo: t,
                        cachedDuration: 0,
                        samplesProcessed: 0,
                        initializationData: []
                    };
                    if (_this.metadata.audioTrackId === index) {
                        _this.audioTrackState = state;
                    }
                    if (_this.metadata.videoTrackId === index) {
                        _this.videoTrackState = state;
                    }
                    return state;
                }, this);
                this._checkIfNeedHeaderData();
                this.filePos = 0;
                this.cachedPackets = [];
                this.chunkIndex = 0;
            }
            MP4Mux.prototype.pushPacket = function (type, data, timestamp) {
                if (this.state === MP4MuxState.CAN_GENERATE_HEADER) {
                    this._tryGenerateHeader();
                }
                switch (type) {
                    case AUDIO_PACKET:// audio
                        var audioTrack = this.audioTrackState;
                        var audioPacket = parseAudiodata(data);
                        if (!audioTrack || audioTrack.trackInfo.codecId !== audioPacket.codecId) {
                            throw new Error('Unexpected audio packet codec: ' + audioPacket.codecDescription);
                        }
                        switch (audioPacket.codecId) {
                            default:
                                throw new Error('Unsupported audio codec: ' + audioPacket.codecDescription);
                            case MP3_SOUND_CODEC_ID:
                                break; // supported codec
                            case AAC_SOUND_CODEC_ID:
                                if (audioPacket.packetType === AudioPacketType.HEADER) {
                                    audioTrack.initializationData.push(audioPacket.data);
                                    return;
                                }
                                break;
                        }
                        this.cachedPackets.push({ packet: audioPacket, timestamp: timestamp, trackId: audioTrack.trackId });
                        break;
                    case VIDEO_PACKET:
                        var videoTrack = this.videoTrackState;
                        var videoPacket = parseVideodata(data);
                        if (!videoTrack || videoTrack.trackInfo.codecId !== videoPacket.codecId) {
                            throw new Error('Unexpected video packet codec: ' + videoPacket.codecDescription);
                        }
                        switch (videoPacket.codecId) {
                            default:
                                throw new Error('unsupported video codec: ' + videoPacket.codecDescription);
                            case VP6_VIDEO_CODEC_ID:
                                break; // supported
                            case AVC_VIDEO_CODEC_ID:
                                if (videoPacket.packetType === VideoPacketType.HEADER) {
                                    videoTrack.initializationData.push(videoPacket.data);
                                    return;
                                }
                                break;
                        }
                        this.cachedPackets.push({ packet: videoPacket, timestamp: timestamp, trackId: videoTrack.trackId });
                        break;
                    default:
                        throw new Error('unknown packet type: ' + type);
                }
                if (this.state === MP4MuxState.NEED_HEADER_DATA) {
                    this._tryGenerateHeader();
                }
                if (this.cachedPackets.length >= MAX_PACKETS_IN_CHUNK &&
                    this.state === MP4MuxState.MAIN_PACKETS) {
                    this._chunk();
                }
            };
            MP4Mux.prototype.flush = function () {
                if (this.cachedPackets.length > 0) {
                    this._chunk();
                }
            };
            MP4Mux.prototype._checkIfNeedHeaderData = function () {
                if (this.trackStates.some(function (ts) {
                    return ts.trackInfo.codecId === AAC_SOUND_CODEC_ID || ts.trackInfo.codecId === AVC_VIDEO_CODEC_ID;
                })) {
                    this.state = MP4MuxState.NEED_HEADER_DATA;
                }
                else {
                    this.state = MP4MuxState.CAN_GENERATE_HEADER;
                }
            };
            MP4Mux.prototype._tryGenerateHeader = function () {
                var allInitializationDataExists = this.trackStates.every(function (ts) {
                    switch (ts.trackInfo.codecId) {
                        case AAC_SOUND_CODEC_ID:
                        case AVC_VIDEO_CODEC_ID:
                            return ts.initializationData.length > 0;
                        default:
                            return true;
                    }
                });
                if (!allInitializationDataExists) {
                    return; // not enough data, waiting more
                }
                var brands = ['isom'];
                var audioDataReferenceIndex = 1, videoDataReferenceIndex = 1;
                var traks = [];
                for (var i = 0; i < this.trackStates.length; i++) {
                    var trackState = this.trackStates[i];
                    var trackInfo = trackState.trackInfo;
                    var sampleEntry = void 0;
                    switch (trackInfo.codecId) {
                        case AAC_SOUND_CODEC_ID:
                            var audioSpecificConfig = trackState.initializationData[0];
                            sampleEntry = new MP4.Iso.AudioSampleEntry('mp4a', audioDataReferenceIndex, trackInfo.channels, trackInfo.samplesize, trackInfo.samplerate);
                            var esdsData = new Uint8Array(41 + audioSpecificConfig.length);
                            esdsData.set(hex('0000000003808080'), 0);
                            esdsData[8] = 32 + audioSpecificConfig.length;
                            esdsData.set(hex('00020004808080'), 9);
                            esdsData[16] = 18 + audioSpecificConfig.length;
                            esdsData.set(hex('40150000000000FA000000000005808080'), 17);
                            esdsData[34] = audioSpecificConfig.length;
                            esdsData.set(audioSpecificConfig, 35);
                            esdsData.set(hex('068080800102'), 35 + audioSpecificConfig.length);
                            sampleEntry.otherBoxes = [
                                new MP4.Iso.RawTag('esds', esdsData)
                            ];
                            var objectType = (audioSpecificConfig[0] >> 3); // TODO 31
                            // mp4a.40.objectType
                            trackState.mimeTypeCodec = 'mp4a.40.' + objectType;
                            break;
                        case MP3_SOUND_CODEC_ID:
                            sampleEntry = new MP4.Iso.AudioSampleEntry('.mp3', audioDataReferenceIndex, trackInfo.channels, trackInfo.samplesize, trackInfo.samplerate);
                            trackState.mimeTypeCodec = 'mp3';
                            break;
                        case AVC_VIDEO_CODEC_ID:
                            var avcC = trackState.initializationData[0];
                            sampleEntry = new MP4.Iso.VideoSampleEntry('avc1', videoDataReferenceIndex, trackInfo.width, trackInfo.height);
                            sampleEntry.otherBoxes = [
                                new MP4.Iso.RawTag('avcC', avcC)
                            ];
                            var codecProfile = (avcC[1] << 16) | (avcC[2] << 8) | avcC[3];
                            // avc1.XXYYZZ -- XX - profile + YY - constraints + ZZ - level
                            trackState.mimeTypeCodec = 'avc1.' + (0x1000000 | codecProfile).toString(16).substr(1);
                            brands.push('iso2', 'avc1', 'mp41');
                            break;
                        case VP6_VIDEO_CODEC_ID:
                            sampleEntry = new MP4.Iso.VideoSampleEntry('VP6F', videoDataReferenceIndex, trackInfo.width, trackInfo.height);
                            sampleEntry.otherBoxes = [
                                new MP4.Iso.RawTag('glbl', hex('00'))
                            ];
                            // TODO to lie about codec to get it playing in MSE?
                            trackState.mimeTypeCodec = 'avc1.42001E';
                            break;
                        default:
                            throw new Error('not supported track type');
                    }
                    var trak = void 0;
                    var trakFlags = 1 /* TRACK_ENABLED */ | 2 /* TRACK_IN_MOVIE */;
                    if (trackState === this.audioTrackState) {
                        trak = new MP4.Iso.TrackBox(new MP4.Iso.TrackHeaderBox(trakFlags, trackState.trackId, -1, 0 /*width*/, 0 /*height*/, 1.0, i), new MP4.Iso.MediaBox(new MP4.Iso.MediaHeaderBox(trackInfo.timescale, -1, trackInfo.language), new MP4.Iso.HandlerBox('soun', 'SoundHandler'), new MP4.Iso.MediaInformationBox(new MP4.Iso.SoundMediaHeaderBox(), new MP4.Iso.DataInformationBox(new MP4.Iso.DataReferenceBox([new MP4.Iso.DataEntryUrlBox(MP4.Iso.SELF_CONTAINED_DATA_REFERENCE_FLAG)])), new MP4.Iso.SampleTableBox(new MP4.Iso.SampleDescriptionBox([sampleEntry]), new MP4.Iso.RawTag('stts', hex('0000000000000000')), new MP4.Iso.RawTag('stsc', hex('0000000000000000')), new MP4.Iso.RawTag('stsz', hex('000000000000000000000000')), new MP4.Iso.RawTag('stco', hex('0000000000000000'))))));
                    }
                    else if (trackState === this.videoTrackState) {
                        trak = new MP4.Iso.TrackBox(new MP4.Iso.TrackHeaderBox(trakFlags, trackState.trackId, -1, trackInfo.width, trackInfo.height, 0 /* volume */, i), new MP4.Iso.MediaBox(new MP4.Iso.MediaHeaderBox(trackInfo.timescale, -1, trackInfo.language), new MP4.Iso.HandlerBox('vide', 'VideoHandler'), new MP4.Iso.MediaInformationBox(new MP4.Iso.VideoMediaHeaderBox(), new MP4.Iso.DataInformationBox(new MP4.Iso.DataReferenceBox([new MP4.Iso.DataEntryUrlBox(MP4.Iso.SELF_CONTAINED_DATA_REFERENCE_FLAG)])), new MP4.Iso.SampleTableBox(new MP4.Iso.SampleDescriptionBox([sampleEntry]), new MP4.Iso.RawTag('stts', hex('0000000000000000')), new MP4.Iso.RawTag('stsc', hex('0000000000000000')), new MP4.Iso.RawTag('stsz', hex('000000000000000000000000')), new MP4.Iso.RawTag('stco', hex('0000000000000000'))))));
                    }
                    traks.push(trak);
                }
                var mvex = new MP4.Iso.MovieExtendsBox(null, [
                    new MP4.Iso.TrackExtendsBox(1, 1, 0, 0, 0),
                    new MP4.Iso.TrackExtendsBox(2, 1, 0, 0, 0)
                ], null);
                var udat = new MP4.Iso.BoxContainerBox('udat', [
                    new MP4.Iso.MetaBox(new MP4.Iso.RawTag('hdlr', hex('00000000000000006D6469726170706C000000000000000000')), // notice weird stuff in reserved field
                    [new MP4.Iso.RawTag('ilst', hex('00000025A9746F6F0000001D6461746100000001000000004C61766635342E36332E313034'))])
                ]);
                var mvhd = new MP4.Iso.MovieHeaderBox(1000, 0 /* unknown duration */, this.trackStates.length + 1);
                var moov = new MP4.Iso.MovieBox(mvhd, traks, mvex, udat);
                var ftype = new MP4.Iso.FileTypeBox('isom', 0x00000200, brands);
                var ftypeSize = ftype.layout(0);
                var moovSize = moov.layout(ftypeSize);
                var header = new Uint8Array(ftypeSize + moovSize);
                ftype.write(header);
                moov.write(header);
                this.oncodecinfo(this.trackStates.map(function (ts) { return ts.mimeTypeCodec; }));
                this.ondata(header);
                this.filePos += header.length;
                this.state = MP4MuxState.MAIN_PACKETS;
            };
            MP4Mux.prototype._chunk = function () {
                var cachedPackets = this.cachedPackets;
                if (SPLIT_AT_KEYFRAMES) {
                    var j = cachedPackets.length - 1;
                    var videoTrackId = this.videoTrackState.trackId;
                    // Finding last video keyframe.
                    while (j > 0 &&
                        (cachedPackets[j].trackId !== videoTrackId || cachedPackets[j].packet.frameType !== VideoFrameType.KEY)) {
                        j--;
                    }
                    if (j > 0) {
                        // We have keyframes and not only the first frame is a keyframe...
                        cachedPackets = cachedPackets.slice(0, j);
                    }
                }
                if (cachedPackets.length === 0) {
                    return; // No data to produce.
                }
                var tdatParts = [];
                var tdatPosition = 0;
                var trafs = [];
                var trafDataStarts = [];
                var _loop_1 = function (i) {
                    var trackState = this_1.trackStates[i];
                    var trackInfo = trackState.trackInfo;
                    var trackId = trackState.trackId;
                    // Finding all packets for this track.
                    var trackPackets = cachedPackets.filter(function (cp) { return cp.trackId === trackId; });
                    if (trackPackets.length === 0) {
                        return "continue";
                    }
                    //let currentTimestamp = (trackPackets[0].timestamp * trackInfo.timescale / 1000) | 0;
                    var tfdt = new MP4.Iso.TrackFragmentBaseMediaDecodeTimeBox(trackState.cachedDuration);
                    var tfhd = void 0;
                    var trun = void 0;
                    var trunSamples = void 0;
                    var tfhdFlags = void 0, trunFlags = void 0;
                    trafDataStarts.push(tdatPosition);
                    switch (trackInfo.codecId) {
                        case AAC_SOUND_CODEC_ID:
                        case MP3_SOUND_CODEC_ID:
                            trunSamples = [];
                            for (var j = 0; j < trackPackets.length; j++) {
                                var audioPacket = trackPackets[j].packet;
                                var audioFrameDuration = Math.round(audioPacket.samples * trackInfo.timescale / trackInfo.samplerate);
                                tdatParts.push(audioPacket.data);
                                tdatPosition += audioPacket.data.length;
                                trunSamples.push({ duration: audioFrameDuration, size: audioPacket.data.length });
                                trackState.samplesProcessed += audioPacket.samples;
                            }
                            tfhdFlags = 32 /* DEFAULT_SAMPLE_FLAGS_PRESENT */;
                            tfhd = new MP4.Iso.TrackFragmentHeaderBox(tfhdFlags, trackId, 0 /* offset */, 0 /* index */, 0 /* duration */, 0 /* size */, 33554432 /* SAMPLE_DEPENDS_ON_NO_OTHERS */);
                            trunFlags = 1 /* DATA_OFFSET_PRESENT */ |
                                256 /* SAMPLE_DURATION_PRESENT */ | 512 /* SAMPLE_SIZE_PRESENT */;
                            trun = new MP4.Iso.TrackRunBox(trunFlags, trunSamples, 0 /* data offset */, 0 /* first flags */);
                            trackState.cachedDuration = Math.round(trackState.samplesProcessed * trackInfo.timescale / trackInfo.samplerate);
                            break;
                        case AVC_VIDEO_CODEC_ID:
                        case VP6_VIDEO_CODEC_ID:
                            trunSamples = [];
                            var samplesProcessed = trackState.samplesProcessed;
                            var decodeTime = samplesProcessed * trackInfo.timescale / trackInfo.framerate;
                            var lastTime = Math.round(decodeTime);
                            for (var j = 0; j < trackPackets.length; j++) {
                                var videoPacket = trackPackets[j].packet;
                                samplesProcessed++;
                                var nextTime = Math.round(samplesProcessed * trackInfo.timescale / trackInfo.framerate);
                                var videoFrameDuration = nextTime - lastTime;
                                lastTime = nextTime;
                                var compositionTime = Math.round(samplesProcessed * trackInfo.timescale / trackInfo.framerate +
                                    videoPacket.compositionTime * trackInfo.timescale / 1000);
                                tdatParts.push(videoPacket.data);
                                tdatPosition += videoPacket.data.length;
                                var frameFlags = videoPacket.frameType === VideoFrameType.KEY ?
                                    33554432 /* SAMPLE_DEPENDS_ON_NO_OTHERS */ :
                                    (16777216 /* SAMPLE_DEPENDS_ON_OTHER */ | 65536 /* SAMPLE_IS_NOT_SYNC */);
                                trunSamples.push({
                                    duration: videoFrameDuration, size: videoPacket.data.length,
                                    flags: frameFlags, compositionTimeOffset: (compositionTime - nextTime)
                                });
                            }
                            tfhdFlags = 32 /* DEFAULT_SAMPLE_FLAGS_PRESENT */;
                            tfhd = new MP4.Iso.TrackFragmentHeaderBox(tfhdFlags, trackId, 0 /* offset */, 0 /* index */, 0 /* duration */, 0 /* size */, 33554432 /* SAMPLE_DEPENDS_ON_NO_OTHERS */);
                            trunFlags = 1 /* DATA_OFFSET_PRESENT */ |
                                256 /* SAMPLE_DURATION_PRESENT */ | 512 /* SAMPLE_SIZE_PRESENT */ |
                                1024 /* SAMPLE_FLAGS_PRESENT */ | 2048 /* SAMPLE_COMPOSITION_TIME_OFFSET */;
                            trun = new MP4.Iso.TrackRunBox(trunFlags, trunSamples, 0 /* data offset */, 0 /* first flag */);
                            trackState.cachedDuration = lastTime;
                            trackState.samplesProcessed = samplesProcessed;
                            break;
                        default:
                            throw new Error('Un codec');
                    }
                    var traf = new MP4.Iso.TrackFragmentBox(tfhd, tfdt, trun);
                    trafs.push(traf);
                };
                var this_1 = this;
                for (var i = 0; i < this.trackStates.length; i++) {
                    _loop_1(i);
                }
                this.cachedPackets.splice(0, cachedPackets.length);
                var moofHeader = new MP4.Iso.MovieFragmentHeaderBox(++this.chunkIndex);
                var moof = new MP4.Iso.MovieFragmentBox(moofHeader, trafs);
                var moofSize = moof.layout(0);
                var mdat = new MP4.Iso.MediaDataBox(tdatParts);
                var mdatSize = mdat.layout(moofSize);
                var tdatOffset = moofSize + 8 /* 'mdat' header size */;
                for (var i = 0; i < trafs.length; i++) {
                    trafs[i].run.dataOffset = tdatOffset + trafDataStarts[i];
                }
                var chunk = new Uint8Array(moofSize + mdatSize);
                moof.write(chunk);
                mdat.write(chunk);
                this.ondata(chunk);
                this.filePos += chunk.length;
            };
            return MP4Mux;
        }());
        MP4.MP4Mux = MP4Mux;
        function parseFLVMetadata(metadata) {
            var tracks = [];
            var audioTrackId = -1;
            var videoTrackId = -1;
            var duration = +metadata.axGetPublicProperty('duration');
            var audioCodec, audioCodecId;
            var audioCodecCode = metadata.axGetPublicProperty('audiocodecid');
            switch (audioCodecCode) {
                case MP3_SOUND_CODEC_ID:
                case 'mp3':
                    audioCodec = 'mp3';
                    audioCodecId = MP3_SOUND_CODEC_ID;
                    break;
                case AAC_SOUND_CODEC_ID:
                case 'mp4a':
                    audioCodec = 'mp4a';
                    audioCodecId = AAC_SOUND_CODEC_ID;
                    break;
                default:
                    if (!isNaN(audioCodecCode)) {
                        throw new Error('Unsupported audio codec: ' + audioCodecCode);
                    }
                    audioCodec = null;
                    audioCodecId = -1;
                    break;
            }
            var videoCodec, videoCodecId;
            var videoCodecCode = metadata.axGetPublicProperty('videocodecid');
            switch (videoCodecCode) {
                case VP6_VIDEO_CODEC_ID:
                case 'vp6f':
                    videoCodec = 'vp6f';
                    videoCodecId = VP6_VIDEO_CODEC_ID;
                    break;
                case AVC_VIDEO_CODEC_ID:
                case 'avc1':
                    videoCodec = 'avc1';
                    videoCodecId = AVC_VIDEO_CODEC_ID;
                    break;
                default:
                    if (!isNaN(videoCodecCode)) {
                        throw new Error('Unsupported video codec: ' + videoCodecCode);
                    }
                    videoCodec = null;
                    videoCodecId = -1;
                    break;
            }
            var audioTrack = (audioCodec === null) ? null : {
                codecDescription: audioCodec,
                codecId: audioCodecId,
                language: 'und',
                timescale: +metadata.axGetPublicProperty('audiosamplerate') || 44100,
                samplerate: +metadata.axGetPublicProperty('audiosamplerate') || 44100,
                channels: +metadata.axGetPublicProperty('audiochannels') || 2,
                samplesize: 16
            };
            var videoTrack = (videoCodec === null) ? null : {
                codecDescription: videoCodec,
                codecId: videoCodecId,
                language: 'und',
                timescale: 60000,
                framerate: +metadata.axGetPublicProperty('videoframerate') ||
                    +metadata.axGetPublicProperty('framerate'),
                width: +metadata.axGetPublicProperty('width'),
                height: +metadata.axGetPublicProperty('height')
            };
            var trackInfos = metadata.axGetPublicProperty('trackinfo');
            if (trackInfos) {
                // Not in the Adobe's references, red5 specific?
                for (var i = 0; i < trackInfos.length; i++) {
                    var info = trackInfos[i];
                    var sampleDescription = info.axGetPublicProperty('sampledescription')[0];
                    if (sampleDescription.axGetPublicProperty('sampletype') === audioCodecCode) {
                        audioTrack.language = info.axGetPublicProperty('language');
                        audioTrack.timescale = +info.axGetPublicProperty('timescale');
                    }
                    else if (sampleDescription.axGetPublicProperty('sampletype') === videoCodecCode) {
                        videoTrack.language = info.axGetPublicProperty('language');
                        videoTrack.timescale = +info.axGetPublicProperty('timescale');
                    }
                }
            }
            if (videoTrack) {
                videoTrackId = tracks.length;
                tracks.push(videoTrack);
            }
            if (audioTrack) {
                audioTrackId = tracks.length;
                tracks.push(audioTrack);
            }
            return {
                tracks: tracks,
                duration: duration,
                audioTrackId: audioTrackId,
                videoTrackId: videoTrackId
            };
        }
        MP4.parseFLVMetadata = parseFLVMetadata;
    })(MP4 = RtmpJs.MP4 || (RtmpJs.MP4 = {}));
})(RtmpJs || (RtmpJs = {}));
/**
 * Copyright 2015 Mozilla Foundation
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
var RtmpJs;
(function (RtmpJs) {
    var FLV;
    (function (FLV) {
        var FLVParser = /** @class */ (function () {
            function FLVParser() {
                this.state = 0;
                this.state = 0;
                this.buffer = new ArrayBuffer(1024);
                this.bufferSize = 0;
                this.previousTagSize = 0;
                this.onError = null;
                this.onHeader = null;
                this.onTag = null;
                this.onClose = null;
            }
            FLVParser.prototype.push = function (data) {
                var parseBuffer;
                if (this.bufferSize > 0) {
                    var needLength = this.bufferSize + data.length;
                    if (this.buffer.byteLength < needLength) {
                        var tmp = new Uint8Array(this.buffer, 0, this.bufferSize);
                        this.buffer = new ArrayBuffer(needLength);
                        parseBuffer = new Uint8Array(this.buffer);
                        parseBuffer.set(tmp);
                    }
                    else {
                        parseBuffer = new Uint8Array(this.buffer, 0, needLength);
                    }
                    parseBuffer.set(data, this.bufferSize);
                }
                else {
                    parseBuffer = data;
                }
                var parsed = 0, end = parseBuffer.length;
                while (parsed < end) {
                    var chunkParsed = 0;
                    var flags = void 0;
                    switch (this.state) {
                        case 0:
                            if (parsed + 9 > end) {
                                break;
                            }
                            var headerLength = (parseBuffer[parsed + 5] << 24) | (parseBuffer[parsed + 6] << 16) |
                                (parseBuffer[parsed + 7] << 8) | parseBuffer[parsed + 8];
                            if (headerLength < 9) {
                                this._error('Invalid header length');
                                break;
                            }
                            if (parsed + headerLength > end) {
                                break;
                            }
                            if (parseBuffer[parsed] !== 0x46 /* F */ ||
                                parseBuffer[parsed + 1] !== 0x4C /* L */ ||
                                parseBuffer[parsed + 2] !== 0x56 /* V */ ||
                                parseBuffer[parsed + 3] !== 1 /* version 1 */ ||
                                (parseBuffer[parsed + 4] & 0xFA) !== 0) {
                                this._error('Invalid FLV header');
                                break;
                            }
                            flags = parseBuffer[parsed + 4];
                            var extra = headerLength > 9 ? parseBuffer.subarray(parsed + 9, parsed + headerLength) : null;
                            this.onHeader && this.onHeader({
                                hasAudio: !!(flags & 4),
                                hasVideo: !!(flags & 1),
                                extra: extra
                            });
                            this.state = 2;
                            chunkParsed = headerLength;
                            break;
                        case 2:
                            if (parsed + 4 + 11 > end) {
                                break;
                            }
                            var previousTagSize = (parseBuffer[parsed + 0] << 24) | (parseBuffer[parsed + 1] << 16) |
                                (parseBuffer[parsed + 2] << 8) | parseBuffer[parsed + 3];
                            if (previousTagSize !== this.previousTagSize) {
                                this._error('Invalid PreviousTagSize');
                                break;
                            }
                            var dataSize = (parseBuffer[parsed + 5] << 16) |
                                (parseBuffer[parsed + 6] << 8) | parseBuffer[parsed + 7];
                            var dataOffset = parsed + 4 + 11;
                            if (dataOffset + dataSize > end) {
                                break;
                            }
                            flags = parseBuffer[parsed + 4];
                            var streamID = (parseBuffer[parsed + 12] << 16) |
                                (parseBuffer[parsed + 13] << 8) | parseBuffer[parsed + 14];
                            if (streamID !== 0 || (flags & 0xC0) !== 0) {
                                this._error('Invalid FLV tag');
                                break;
                            }
                            var dataType = flags & 0x1F;
                            if (dataType !== 8 && dataType !== 9 && dataType !== 18) {
                                this._error('Invalid FLV tag type');
                                break;
                            }
                            var needPreprocessing = !!(flags & 0x20);
                            var timestamp = (parseBuffer[parsed + 8] << 16) |
                                (parseBuffer[parsed + 9] << 8) | parseBuffer[parsed + 10] |
                                (parseBuffer[parsed + 11] << 24) /* signed part */;
                            this.onTag && this.onTag({
                                type: dataType,
                                needPreprocessing: needPreprocessing,
                                timestamp: timestamp,
                                data: parseBuffer.subarray(dataOffset, dataOffset + dataSize)
                            });
                            chunkParsed += 4 + 11 + dataSize;
                            this.previousTagSize = dataSize + 11;
                            this.state = 2;
                            break;
                        default:
                            throw new Error('invalid state');
                    }
                    if (chunkParsed === 0) {
                        break; // not enough data
                    }
                    parsed += chunkParsed;
                }
                if (parsed < parseBuffer.length) {
                    this.bufferSize = parseBuffer.length - parsed;
                    if (this.buffer.byteLength < this.bufferSize) {
                        this.buffer = new ArrayBuffer(this.bufferSize);
                    }
                    new Uint8Array(this.buffer).set(parseBuffer.subarray(parsed));
                }
                else {
                    this.bufferSize = 0;
                }
            };
            FLVParser.prototype._error = function (message) {
                this.state = -1;
                this.onError && this.onError(message);
            };
            FLVParser.prototype.close = function () {
                this.onClose && this.onClose();
            };
            return FLVParser;
        }());
        FLV.FLVParser = FLVParser;
    })(FLV = RtmpJs.FLV || (RtmpJs.FLV = {}));
})(RtmpJs || (RtmpJs = {}));
///<reference path='external.ts' />
///<reference path='rtmp.ts' />
///<reference path='transport.ts' />
///<reference path='transport-browser.ts' />
///<reference path='mp4iso.ts' />
///<reference path='mp4mux.ts' />
///<reference path='flvparser.ts' />
//# sourceMappingURL=rtmp.js.map
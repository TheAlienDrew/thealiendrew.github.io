declare module RtmpJs.Browser {
    class ShumwayComRtmpSocket {
        static readonly isAvailable: boolean;
        private _socket;
        private _onopen;
        private _ondata;
        private _ondrain;
        private _onerror;
        private _onclose;
        constructor(host: string, port: number, params: any);
        onopen: () => void;
        ondata: (e: {
            data: ArrayBuffer;
        }) => void;
        ondrain: () => void;
        onerror: (e: any) => void;
        onclose: () => void;
        send(buffer: ArrayBuffer, offset: number, count: number): boolean;
        close(): void;
    }
    class ShumwayComRtmpXHR {
        static readonly isAvailable: boolean;
        private _xhr;
        private _onload;
        private _onerror;
        readonly status: number;
        readonly response: any;
        responseType: string;
        onload: () => void;
        onerror: () => void;
        constructor();
        open(method: string, path: string, async?: boolean): void;
        setRequestHeader(header: string, value: string): void;
        send(data?: any): void;
    }
}
declare module RtmpJs {
    interface IChunkedStreamMessage {
        timestamp: number;
        streamId: number;
        chunkedStreamId: number;
        typeId: number;
        data: Uint8Array;
        firstChunk: boolean;
        lastChunk: boolean;
    }
    class ChunkedStream {
        private id;
        private buffer;
        private bufferLength;
        lastStreamId: number;
        lastTimestamp: number;
        lastLength: number;
        lastTypeId: number;
        lastMessageComplete: boolean;
        waitingForBytes: number;
        sentStreamId: number;
        sentTimestamp: number;
        sentLength: number;
        sentTypeId: number;
        onmessage: (message: IChunkedStreamMessage) => void;
        constructor(id: number);
        setBuffer(enabled: boolean): void;
        abort(): void;
        _push(data: Uint8Array, firstChunk: boolean, lastChunk: boolean): void;
    }
    interface IChunkedChannelUserControlMessage {
        type: number;
        data: Uint8Array;
    }
    interface ISendMessage {
        streamId: number;
        typeId: number;
        data: Uint8Array;
        timestamp?: number;
    }
    class ChunkedChannel {
        private state;
        private buffer;
        private bufferLength;
        private chunkSize;
        private chunkStreams;
        private peerChunkSize;
        private peerAckWindowSize;
        private bandwidthLimitType;
        private windowAckSize;
        private bytesReceived;
        private lastAckSent;
        private serverVersion;
        private epochStart;
        private randomData;
        onusercontrolmessage: (message: IChunkedChannelUserControlMessage) => void;
        onack: () => void;
        ondata: (data: Uint8Array) => void;
        onclose: () => void;
        oncreated: () => void;
        onmessage: (message: IChunkedStreamMessage) => void;
        constructor();
        push(data: Uint8Array): void;
        private _initialize();
        setChunkSize(chunkSize: number): void;
        send(chunkStreamId: number, message: ISendMessage): number;
        sendUserControlMessage(type: number, data: Uint8Array): void;
        private _sendAck();
        private _sendMessage(chunkStreamId, message);
        private _getChunkStream(id);
        private _parseChunkedData();
        start(): void;
        stop(error: any): void;
        private _fail(message);
    }
}
declare module RtmpJs {
    interface ITransportConnectedParameters {
        properties: any;
        information: any;
        isError: boolean;
    }
    interface ITransportStreamCreatedParameters {
        transactionId: number;
        commandObject: any;
        streamId: number;
        stream: INetStream;
        isError: boolean;
    }
    interface ITransportResponse {
        commandName: string;
        transactionId: number;
        commandObject: any;
        response: any;
    }
    interface ITransportEvent {
        type: number;
        data: Uint8Array;
    }
    class BaseTransport {
        channel: ChunkedChannel;
        onconnected: (props: ITransportConnectedParameters) => void;
        onstreamcreated: (props: ITransportStreamCreatedParameters) => void;
        onresponse: (response: ITransportResponse) => void;
        onevent: (event: ITransportEvent) => void;
        private _streams;
        constructor();
        connect(properties: any, args?: any): void;
        _initChannel(properties: any, args?: any): ChunkedChannel;
        call(procedureName: string, transactionId: number, commandObject: any, args: any): void;
        createStream(transactionId: number, commandObject: any): void;
        sendCommandOrResponse(commandName: string, transactionId: number, commandObject: any, response?: any): void;
        _setBuffer(streamId: number, ms: number): void;
        _sendCommand(streamId: number, data: Uint8Array): void;
    }
    interface INetStreamData {
        typeId: number;
        data: Uint8Array;
        timestamp: number;
    }
    interface INetStream {
        ondata: (data: INetStreamData) => void;
        onscriptdata: (type: string, ...data: any[]) => void;
        oncallback: (...args: any[]) => void;
        play(name: string, start?: number, duration?: number, reset?: boolean): void;
    }
    interface RtmpConnectionString {
        protocol: string;
        host: string;
        port: number;
        app: string;
    }
    function parseConnectionString(s: string): RtmpConnectionString;
}
declare module RtmpJs.Browser {
    class RtmpTransport extends BaseTransport {
        host: string;
        port: number;
        ssl: boolean;
        constructor(connectionSettings: any);
        connect(properties: any, args?: any): void;
    }
    class RtmptTransport extends BaseTransport {
        baseUrl: string;
        stopped: boolean;
        sessionId: string;
        requestId: number;
        data: Uint8Array[];
        constructor(connectionSettings: any);
        connect(properties: any, args?: any): void;
        tick(): void;
    }
}
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
declare module RtmpJs.MP4.Iso {
    class Box {
        offset: number;
        size: number;
        boxtype: string;
        userType: Uint8Array;
        constructor(boxtype: string, extendedType?: Uint8Array);
        /**
         * @param offset Position where writing will start in the output array
         * @returns {number} Size of the written data
         */
        layout(offset: number): number;
        /**
         * @param data Output array
         * @returns {number} Amount of written bytes by this Box and its children only.
         */
        write(data: Uint8Array): number;
        toUint8Array(): Uint8Array;
    }
    class FullBox extends Box {
        version: number;
        flags: number;
        constructor(boxtype: string, version?: number, flags?: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class FileTypeBox extends Box {
        majorBrand: string;
        minorVersion: number;
        compatibleBrands: string[];
        constructor(majorBrand: string, minorVersion: number, compatibleBrands: string[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class BoxContainerBox extends Box {
        children: Box[];
        constructor(type: string, children: Box[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class MovieBox extends BoxContainerBox {
        header: MovieHeaderBox;
        tracks: Box[];
        extendsBox: MovieExtendsBox;
        userData: Box;
        constructor(header: MovieHeaderBox, tracks: Box[], extendsBox: MovieExtendsBox, userData: Box);
    }
    class MovieHeaderBox extends FullBox {
        timescale: number;
        duration: number;
        nextTrackId: number;
        rate: number;
        volume: number;
        matrix: number[];
        creationTime: number;
        modificationTime: number;
        constructor(timescale: number, duration: number, nextTrackId: number, rate?: number, volume?: number, matrix?: number[], creationTime?: number, modificationTime?: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    const enum TrackHeaderFlags {
        TRACK_ENABLED = 1,
        TRACK_IN_MOVIE = 2,
        TRACK_IN_PREVIEW = 4,
    }
    class TrackHeaderBox extends FullBox {
        trackId: number;
        duration: number;
        width: number;
        height: number;
        volume: number;
        alternateGroup: number;
        layer: number;
        matrix: number[];
        creationTime: number;
        modificationTime: number;
        constructor(flags: number, trackId: number, duration: number, width: number, height: number, volume: number, alternateGroup?: number, layer?: number, matrix?: number[], creationTime?: number, modificationTime?: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class MediaHeaderBox extends FullBox {
        timescale: number;
        duration: number;
        language: string;
        creationTime: number;
        modificationTime: number;
        constructor(timescale: number, duration: number, language?: string, creationTime?: number, modificationTime?: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class HandlerBox extends FullBox {
        handlerType: string;
        name: string;
        private _encodedName;
        constructor(handlerType: string, name: string);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class SoundMediaHeaderBox extends FullBox {
        balance: number;
        constructor(balance?: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class VideoMediaHeaderBox extends FullBox {
        graphicsMode: number;
        opColor: number[];
        constructor(graphicsMode?: number, opColor?: number[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    let SELF_CONTAINED_DATA_REFERENCE_FLAG: number;
    class DataEntryUrlBox extends FullBox {
        location: string;
        private _encodedLocation;
        constructor(flags: number, location?: string);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class DataReferenceBox extends FullBox {
        entries: Box[];
        constructor(entries: Box[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class DataInformationBox extends BoxContainerBox {
        dataReference: Box;
        constructor(dataReference: Box);
    }
    class SampleDescriptionBox extends FullBox {
        entries: Box[];
        constructor(entries: Box[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class SampleTableBox extends BoxContainerBox {
        sampleDescriptions: SampleDescriptionBox;
        timeToSample: Box;
        sampleToChunk: Box;
        sampleSizes: Box;
        chunkOffset: Box;
        constructor(sampleDescriptions: SampleDescriptionBox, timeToSample: Box, sampleToChunk: Box, sampleSizes: Box, chunkOffset: Box);
    }
    class MediaInformationBox extends BoxContainerBox {
        header: Box;
        info: DataInformationBox;
        sampleTable: SampleTableBox;
        constructor(header: Box, info: DataInformationBox, sampleTable: SampleTableBox);
    }
    class MediaBox extends BoxContainerBox {
        header: MediaHeaderBox;
        handler: HandlerBox;
        info: MediaInformationBox;
        constructor(header: MediaHeaderBox, handler: HandlerBox, info: MediaInformationBox);
    }
    class TrackBox extends BoxContainerBox {
        header: TrackHeaderBox;
        media: Box;
        constructor(header: TrackHeaderBox, media: Box);
    }
    class TrackExtendsBox extends FullBox {
        trackId: number;
        defaultSampleDescriptionIndex: number;
        defaultSampleDuration: number;
        defaultSampleSize: number;
        defaultSampleFlags: number;
        constructor(trackId: number, defaultSampleDescriptionIndex: number, defaultSampleDuration: number, defaultSampleSize: number, defaultSampleFlags: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class MovieExtendsBox extends BoxContainerBox {
        header: Box;
        tracDefaults: TrackExtendsBox[];
        levels: Box;
        constructor(header: Box, tracDefaults: TrackExtendsBox[], levels: Box);
    }
    class MetaBox extends FullBox {
        handler: Box;
        otherBoxes: Box[];
        constructor(handler: Box, otherBoxes: Box[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class MovieFragmentHeaderBox extends FullBox {
        sequenceNumber: number;
        constructor(sequenceNumber: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    const enum TrackFragmentFlags {
        BASE_DATA_OFFSET_PRESENT = 1,
        SAMPLE_DESCRIPTION_INDEX_PRESENT = 2,
        DEFAULT_SAMPLE_DURATION_PRESENT = 8,
        DEFAULT_SAMPLE_SIZE_PRESENT = 16,
        DEFAULT_SAMPLE_FLAGS_PRESENT = 32,
    }
    class TrackFragmentHeaderBox extends FullBox {
        trackId: number;
        baseDataOffset: number;
        sampleDescriptionIndex: number;
        defaultSampleDuration: number;
        defaultSampleSize: number;
        defaultSampleFlags: number;
        constructor(flags: number, trackId: number, baseDataOffset: number, sampleDescriptionIndex: number, defaultSampleDuration: number, defaultSampleSize: number, defaultSampleFlags: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class TrackFragmentBaseMediaDecodeTimeBox extends FullBox {
        baseMediaDecodeTime: number;
        constructor(baseMediaDecodeTime: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class TrackFragmentBox extends BoxContainerBox {
        header: TrackFragmentHeaderBox;
        decodeTime: TrackFragmentBaseMediaDecodeTimeBox;
        run: TrackRunBox;
        constructor(header: TrackFragmentHeaderBox, decodeTime: TrackFragmentBaseMediaDecodeTimeBox, run: TrackRunBox);
    }
    const enum SampleFlags {
        IS_LEADING_MASK = 201326592,
        SAMPLE_DEPENDS_ON_MASK = 50331648,
        SAMPLE_DEPENDS_ON_OTHER = 16777216,
        SAMPLE_DEPENDS_ON_NO_OTHERS = 33554432,
        SAMPLE_IS_DEPENDED_ON_MASK = 12582912,
        SAMPLE_HAS_REDUNDANCY_MASK = 3145728,
        SAMPLE_PADDING_VALUE_MASK = 917504,
        SAMPLE_IS_NOT_SYNC = 65536,
        SAMPLE_DEGRADATION_PRIORITY_MASK = 65535,
    }
    const enum TrackRunFlags {
        DATA_OFFSET_PRESENT = 1,
        FIRST_SAMPLE_FLAGS_PRESENT = 4,
        SAMPLE_DURATION_PRESENT = 256,
        SAMPLE_SIZE_PRESENT = 512,
        SAMPLE_FLAGS_PRESENT = 1024,
        SAMPLE_COMPOSITION_TIME_OFFSET = 2048,
    }
    interface TrackRunSample {
        duration?: number;
        size?: number;
        flags?: number;
        compositionTimeOffset?: number;
    }
    class TrackRunBox extends FullBox {
        samples: TrackRunSample[];
        dataOffset: number;
        firstSampleFlags: number;
        constructor(flags: number, samples: TrackRunSample[], dataOffset?: number, firstSampleFlags?: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class MovieFragmentBox extends BoxContainerBox {
        header: MovieFragmentHeaderBox;
        trafs: TrackFragmentBox[];
        constructor(header: MovieFragmentHeaderBox, trafs: TrackFragmentBox[]);
    }
    class MediaDataBox extends Box {
        chunks: Uint8Array[];
        constructor(chunks: Uint8Array[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class SampleEntry extends Box {
        dataReferenceIndex: number;
        constructor(format: string, dataReferenceIndex: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class AudioSampleEntry extends SampleEntry {
        channelCount: number;
        sampleSize: number;
        sampleRate: number;
        otherBoxes: Box[];
        constructor(codingName: string, dataReferenceIndex: number, channelCount?: number, sampleSize?: number, sampleRate?: number, otherBoxes?: Box[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    let COLOR_NO_ALPHA_VIDEO_SAMPLE_DEPTH: number;
    class VideoSampleEntry extends SampleEntry {
        width: number;
        height: number;
        compressorName: string;
        horizResolution: number;
        vertResolution: number;
        frameCount: number;
        depth: number;
        otherBoxes: Box[];
        constructor(codingName: string, dataReferenceIndex: number, width: number, height: number, compressorName?: string, horizResolution?: number, vertResolution?: number, frameCount?: number, depth?: number, otherBoxes?: Box[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class RawTag extends Box {
        data: Uint8Array;
        constructor(type: string, data: Uint8Array);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
}
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
declare module RtmpJs.MP4 {
    interface MP4Track {
        codecDescription?: string;
        codecId: number;
        language: string;
        timescale: number;
        samplerate?: number;
        channels?: number;
        samplesize?: number;
        framerate?: number;
        width?: number;
        height?: number;
    }
    interface MP4Metadata {
        tracks: MP4Track[];
        duration: number;
        audioTrackId: number;
        videoTrackId: number;
    }
    class MP4Mux {
        private metadata;
        private filePos;
        private cachedPackets;
        private trackStates;
        private audioTrackState;
        private videoTrackState;
        private state;
        private chunkIndex;
        oncodecinfo: (codecs: string[]) => void;
        ondata: (data: any) => void;
        constructor(metadata: MP4Metadata);
        pushPacket(type: number, data: Uint8Array, timestamp: number): void;
        flush(): void;
        private _checkIfNeedHeaderData();
        private _tryGenerateHeader();
        _chunk(): void;
    }
    function parseFLVMetadata(metadata: any): MP4Metadata;
}
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
declare module RtmpJs.FLV {
    interface FLVHeader {
        hasAudio: boolean;
        hasVideo: boolean;
        extra: Uint8Array;
    }
    interface FLVTag {
        type: number;
        needPreprocessing: boolean;
        timestamp: number;
        data: Uint8Array;
    }
    class FLVParser {
        private state;
        private buffer;
        private bufferSize;
        private previousTagSize;
        onHeader: (header: FLVHeader) => void;
        onTag: (tag: FLVTag) => void;
        onClose: () => void;
        onError: (error: any) => void;
        constructor();
        push(data: Uint8Array): void;
        private _error(message);
        close(): void;
    }
}

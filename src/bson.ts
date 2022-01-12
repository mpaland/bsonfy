///////////////////////////////////////////////////////////////////////////////
// \author (c) Marco Paland (marco@paland.com)
//             2016-2018, PALANDesign Hannover, Germany
//
// \license The MIT License (MIT)
//
// This file is part of the bsonfy library.
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// \brief Extrem fast BSON implementation in typescript with NO dependencies
//        See http://bsonspec.org for details
//        Usage:
//        import { BSON } from './bsonfy';
//        let obj  = { id: 10, time: new BSON.UTC(), arr: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]) };
//        let bson = BSON.serialize(obj);
//        let orig = BSON.deserialize(bson);
//
///////////////////////////////////////////////////////////////////////////////


export namespace BSON {

  /**
   * BSON module version
   */
  const version: string = '1.0.2';


  /**
   * UUID class
   */
  export class UUID {
    private _id: Uint8Array;

    constructor(id: Uint8Array | Array<number>) {
      this._id = new Uint8Array(id);
    }

    buffer(): Uint8Array {
      return this._id;
    }
  }


  /**
   * ObjectId class (for mongoDB usage)
   */
  export class ObjectId {
    private _id: Uint8Array;

    constructor(id: Uint8Array | Array<number>) {
      this._id = new Uint8Array(id);
    }

    buffer(): Uint8Array {
      return this._id;
    }
  }


  /**
   * The UTC class contains the milliseconds since the Unix epoch (1.1.1970 00:00:00 UTC)
   */
  export class UTC {
    private _time: Uint8Array;

    constructor(time?: Uint8Array | Array<number> | string) {
      this._time = (typeof time !== 'string') ? new Uint8Array(time || number2long(Date.now())) : number2long(+new Date(time));
    }

    buffer(): Uint8Array {
      return this._time;
    }

    /**
     * Convert an (ISO) date string
     * @param {String} date (ISO) Date string
     */
    fromString(date: string): void {
      this._time = number2long(+new Date(date));
    }

    /**
     * Returns the milliseconds since the Unix epoch (UTC)
     */
    toNumber(): number {
      return long2number(this._time);
    }

    toDate(): Date {
      return new Date(long2number(this._time));
    }
  }


  /**
   * Private, return the size of the given object
   * @param {Object} obj The object to get the size from
   * @return {Number} The object size in bytes
   */
  function getObjectSize(obj: Object): number {
    let len = 4 + 1;                                // handle the obj.length prefix + terminating '0'
    for (let key in obj) {
      len += getElementSize(key, obj[key]);
    }
    return len;
  }


  /**
   * Private, get the size of the given element
   * @param {String} name
   * @param {Object} value
   * @return {Number} The element size in bytes
   */
  function getElementSize(name: string, value: any): number {
    let len = 1;                                    // always starting with 1 for the data type byte
    if (name) {
      len += strlen(name) + 1;                      // cstring: name + '0' termination
    }

    if (value === undefined || value === null) {
      return len;                                   // just the type byte plus name cstring
    }

    switch (value.constructor) {
      case String:
        return len + 4 + strlen(value) + 1;

      case Number:
        if (Math.floor(value) === value) {
          if (value <= 2147483647 && value >= -2147483647)
            return len + 4;                         // 32 bit
          else
            return len + 8;                         // 64 bit
        }
        else
          return len + 8;                           // 64 bit double & float

      case Boolean:
        return len + 1;

      case Array:
      case Object:
        return len + getObjectSize(value);

      case Int8Array:
      case Uint8Array:
        return len + 5 + value.byteLength;

      case Date:
      case UTC:
        return len + 8;

      case UUID:
        return len + 5 + 16;

      case ObjectId:
        return len + 12;

      default:
        // unsupported type
        return 0;
    }
  }


  /**
   * Serialize an object to BSON format
   * @param {Object} object The object to serialize
   * @return {Uint8Array} An byte array with the BSON representation
   */
  export function serialize(object: any): Uint8Array {
    let buffer = new Uint8Array(getObjectSize(object));
    serializeEx(object, buffer);
    return buffer;
  }


  /**
   * Private, used by serialize() and is called recursively
   * @param object
   * @param buffer
   * @param i
   */
  function serializeEx(object: any, buffer: Uint8Array, i: number = 0): number {
    i += int32(buffer.length, buffer, i);

    if (object.constructor === Array) {
      for (let j = 0, len = object.length; j < len; j++) {
        i = packElement(j.toString(), object[j], buffer, i);
      }
    }
    else {
      for (let key in object) {
        i = packElement(key, object[key], buffer, i);
      }
    }
    buffer[i++] = 0;  // terminating zero
    return i;
  }


  /**
   * Private, assemble BSON cstring element
   * @param name
   * @param buffer
   * @param offset
   * @return Element length in bytes
   */
  function cstring(name: string, buffer: Uint8Array, offset: number): number {
    let cstring = str2bin(name);
    let clen = cstring.length;
    buffer.set(cstring, offset);
    buffer[offset + clen++] = 0;
    return clen;
  }


  /**
   * Private, assemble BSON int32 element
   * @param size
   * @param buffer
   * @param offset
   * @return Element length in bytes
   */
  function int32(size: number, buffer: Uint8Array, offset: number): number {
    buffer[offset++] = (size)        & 0xff;
    buffer[offset++] = (size >>>  8) & 0xff;
    buffer[offset++] = (size >>> 16) & 0xff;
    buffer[offset++] = (size >>> 24) & 0xff;
    return 4;
  }


  /**
   * Private, assemble BSON elements
   * @param name
   * @param value
   * @param buffer
   * @param i
   */
  function packElement(name: string, value: any, buffer: Uint8Array, i: number): number {
    if (value === undefined || value === null) {
      buffer[i++] = 0x0A;             // BSON type: Null
      i += cstring(name, buffer, i);
      return i;
    }
    switch (value.constructor) {
      case String:
        buffer[i++] = 0x02;           // BSON type: String
        i += cstring(name, buffer, i);
        let size = cstring(value, buffer, i + 4);
        i += int32(size, buffer, i);
        return i + size;

      case Number:
        if (Math.floor(value) === value) {
          if (value <= 2147483647 && value >= -2147483647) { /// = BSON.BSON_INT32_MAX / MIN asf.
            buffer[i++] = 0x10;       // BSON type: int32
            i += cstring(name, buffer, i);
            i += int32(value, buffer, i);
          }
          else {
            buffer[i++] = 0x12;       // BSON type: int64
            i += cstring(name, buffer, i);
            buffer.set(number2long(value), i);
            i += 8;
          }
        }
        else {
          // it's a float / double
          buffer[i++] = 0x01;         // BSON type: 64-bit floating point
          i += cstring(name, buffer, i);
          let f = new Float64Array([value]);
          let d = new Uint8Array(f.buffer);
          buffer.set(d, i);
          i += 8;
        }
        return i;

      case Boolean:
        buffer[i++] = 0x08;           // BSON type: Boolean
        i += cstring(name, buffer, i);
        buffer[i++] = value ? 1 : 0;
        return i;

      case Array:
      case Object:
        buffer[i++] = value.constructor === Array ? 0x04 : 0x03;  // BSON type: Array / Document
        i += cstring(name, buffer, i);
        let end = serializeEx(value, buffer, i);
        int32(end - i, buffer, i);    // correct size
        return end;

      case Int8Array:
      case Uint8Array:
        buffer[i++] = 0x05;           // BSON type: Binary data
        i += cstring(name, buffer, i);
        i += int32(value.byteLength, buffer, i);
        buffer[i++] = 0;              // use generic binary subtype 0
        buffer.set(value, i);
        i += value.byteLength;
        return i;

      case Date:
        buffer[i++] = 0x09;           // BSON type: UTC datetime
        i += cstring(name, buffer, i);
        buffer.set(number2long(value.getTime()), i);
        i += 8;
        return i;

      case UTC:
        buffer[i++] = 0x09;           // BSON type: UTC datetime
        i += cstring(name, buffer, i);
        buffer.set(value.buffer(), i);
        i += 8;
        return i;

      case UUID:
        buffer[i++] = 0x05;           // BSON type: Binary data
        i += cstring(name, buffer, i);
        i += int32(16, buffer, i);
        buffer[i++] = 4;              // use UUID subtype
        buffer.set(value.buffer(), i);
        i += 16;
        return i;

      case ObjectId:
        buffer[i++] = 0x07;           // BSON type: ObjectId
        i += cstring(name, buffer, i);
        buffer.set(value.buffer(), i);
        i += 12;
        return i;

      case RegExp:
        buffer[i++] = 0x0B;           // BSON type: Regular expression
        i += cstring(name, buffer, i);
        i += cstring(value.source, buffer, i);
        if (value.global)     buffer[i++] = 0x73;   // s = 'g'
        if (value.ignoreCase) buffer[i++] = 0x69;   // i
        if (value.multiline)  buffer[i++] = 0x6d;   // m
        buffer[i++] = 0;
        return i;

      default:
        return i;                     // unknown type (ignore element)
    }
  }


  /**
   * Deserialize (parse) BSON data to an object
   * @param {Uint8Array} buffer The buffer with BSON data to convert
   * @param {Boolean} useUTC Optional, if set an UTC object is created for 'UTC datetime', else an Date object. Defaults to false
   * @return {Object} Returns an object or an array
   */
  export function deserialize(buffer: Uint8Array, useUTC: boolean = false, i: number = 0, returnArray: boolean = false): Array<any> | Object {
    // check size
    if (buffer.length < 5) {
      // Document error: Size < 5 bytes
      return undefined;
    }
    let size = buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24;
    if (size < 5 || size > buffer.length) {
      // Document error: Size mismatch
      return undefined;
    }
    if (buffer[buffer.length - 1] !== 0x00) {
      // Document error: Missing termination
      return undefined;
    }

    let object = returnArray ? [] : {};   // needed for type ARRAY recursion later

    for (;;) {
      // get element type
      let elementType = buffer[i++];  // read type
      if (elementType === 0) break;   // zero means last byte, exit

      // get element name
      let end = i;
      for (; buffer[end] !== 0x00 && end < buffer.length; end++);
      if (end >= buffer.length - 1) {
        // Document error: Illegal key name
        return undefined;
      }
      let name: any = bin2str(buffer.subarray(i, end));
      if (returnArray) {
        name = parseInt(name);        // convert to number as array index
      }
      i = ++end;                      // skip terminating zero

      switch (elementType) {
        case 0x01:                    // BSON type: 64-bit floating point
          object[name] = (new Float64Array(buffer.slice(i, i += 8).buffer))[0];   // use slice() here to get a new array
          break;

        case 0x02:                    // BSON type: String
          size = buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24;
          object[name] = bin2str(buffer.subarray(i, i += size - 1));
          i++;
          break;

        case 0x03:                    // BSON type: Document (Object)
          size = buffer[i] | buffer[i + 1] << 8 | buffer[i + 2] << 16 | buffer[i + 3] << 24;
          object[name] = deserialize(buffer, useUTC, i, false);   // isArray = false => Object
          i += size;
          break;

        case 0x04:                    // BSON type: Array
          size = buffer[i] | buffer[i + 1] << 8 | buffer[i + 2] << 16 | buffer[i + 3] << 24;  // NO 'i' increment since the size bytes are reread during the recursion
          object[name] = deserialize(buffer, useUTC, i, true);  // pass current index & return an array
          i += size;
          break;

        case 0x05:                    // BSON type: Binary data
          size = buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24;
          if (buffer[i++] === 0x04) { // BSON subtype: UUID
            if (size !== 16) {
              // Element error: Wrong UUID length
              return undefined;
            }
            object[name] = new UUID(buffer.subarray(i, i += size));
          }
          else {
            // all other subtypes
            object[name] = buffer.slice(i, i += size);    // use slice() here to get a new array
          }
          break;

        case 0x06:                    // BSON type: Undefined (deprecated)
          object[name] = null;
          break;

        case 0x07:                    // BSON type: ObjectId
          object[name] = new ObjectId(buffer.subarray(i, i += 12));
          break;

        case 0x08:                    // BSON type: Boolean
          object[name] = buffer[i++] === 1;
          break;

        case 0x09:                    // BSON type: UTC datetime
          object[name] = useUTC ? new UTC(buffer.subarray(i, i += 8)) : new Date(long2number(buffer.subarray(i, i += 8)));
          break;

        case 0x0A:                    // BSON type: Null
          object[name] = null;
          break;

        case 0x0B:                    // BSON type: RegExp
          end = i;
          // pattern
          while (end < buffer.length && buffer[end++] !== 0x00);
          if (end >= buffer.length) {
            // Document error: Illegal key name
            return undefined;
          }
          let pat = bin2str(buffer.subarray(i, end));
          i = end;
          // flags
          while (end < buffer.length && buffer[end++] !== 0x00);
          if (end >= buffer.length) {
            // Document error: Illegal key name
            return undefined;
          }
          let flags = bin2str(buffer.subarray(i, end));
          i = end;
          object[name] = new RegExp(pat, flags);
          break;

        case 0x10:                    // BSON type: 32-bit integer
          object[name] = buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24;
          break;

        case 0x12:                    // BSON type: 64-bit integer
          object[name] = long2number(buffer.subarray(i, i += 8));
          break;

        default:
          // Parsing error: Unknown element
          return undefined;
      }
    }
    return object;
  }


  /////////////////////////////////////////////////////////////////////////////
  // H E L P E R

  /**
   * Convert a number to a 64 bit integer representation
   * @param {Number} value Number to convert
   * @return {Uint8Array} Converted number
   */
  function number2long(value: number): Uint8Array {
    let buf = new Uint8Array(8);
    if (Math.floor(value) === value) {
      const TWO_PWR_32 = 4294967296;
      let lo = (value % TWO_PWR_32) | 0, hi = (value / TWO_PWR_32) | 0;
      if (value < 0) {
        lo = ~(-value % TWO_PWR_32) | 0, hi = ~(-value / TWO_PWR_32) | 0;
        lo = (lo + 1) & 0xffffffff;
        if (!lo) hi++;
      }
      let i = 0;
      buf[i++] = (lo & 0xff); buf[i++] = (lo >>> 8) & 0xff; buf[i++] = (lo >>> 16) & 0xff; buf[i++] = (lo >>> 24) & 0xff;
      buf[i++] = (hi & 0xff); buf[i++] = (hi >>> 8) & 0xff; buf[i++] = (hi >>> 16) & 0xff; buf[i]   = (hi >>> 24) & 0xff;
    }
    else {    // it's a float / double
      let f = new Float64Array([value]);
      let d = new Uint8Array(f.buffer);
      buf.set(d);
    }
    return buf;
  }


  /**
   * Convert 64 bit integer to Number
   * @param {Uint8Array} buffer Buffer containing a 64 bit integer as typed array at offset position. LSB is [0], MSB is [7]
   * @param {Number} offset Offset in buffer, where the integer starts
   * @return {Number} Converted number
   */
  function long2number(buffer: Uint8Array, offset: number = 0): number {
    const TWO_PWR_32 = 4294967296;
    let lo = buffer[offset++] | buffer[offset++] << 8 | buffer[offset++] << 16 | buffer[offset++] << 24;
    let hi = buffer[offset++] | buffer[offset++] << 8 | buffer[offset++] << 16 | buffer[offset]   << 24;
    return hi * TWO_PWR_32 + ((lo >= 0) ? lo : TWO_PWR_32 + lo);
  }

  const utf8Encoder = new TextEncoder();
  const utf8Decoder = new TextDecoder();

  /**
   * Convert a string (UTF-8 encoded) to a byte array
   * @param {String} str UTF-8 encoded string
   * @return {Uint8Array} Byte array
   */
   const str2bin = utf8Encoder.encode.bind(utf8Encoder);


  /**
   * Convert a byte array to an UTF-8 string
   * @param {Uint8Array} bin UTF-8 text given as array of bytes
   * @return {String} UTF-8 Text string
   */
   const bin2str = utf8Decoder.decode.bind(utf8Decoder);


  /**
   * Returns the UTF-8 string length in bytes
   * @param {String} Input string
   * @return {Number} Stringlength in bytes (not in chars)
   */
  function strlen(str: string): number {
    return utf8Encoder.encode(str).length;
  }

} // namespace BSON

///////////////////////////////////////////////////////////////////////////////
// \author (c) Marco Paland (marco@paland.com)
//             2018, PALANDesign Hannover, Germany
//
// \license The MIT License (MIT)
//
// This file is part of the bysonfy library.
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
// \brief BSON test cases
//
///////////////////////////////////////////////////////////////////////////////

import { BSON } from '../../src/bson';

import { expect, assert } from 'chai';
import 'mocha';


describe('BSON', () => {

  class UnknownObj {
    _dummy: number = 123;
    test() {
    }
  }

  let serialize_vector = [
    {
      obj: { "BSON": ["awesome", 5.05, 1986] },
      bson: "310000000442534f4e002600000002300008000000617765736f6d65000131003333333333331440103200c20700000000",
    },
    {
      obj: { int32: 10, int64: 1125899906842624, flo: 3.141592653, str: "Hello äöü", utc: new BSON.UTC("2011-10-10T14:48:00Z"), bool: true, date: new Date("2011-10-10T14:48:00Z") },
      bson: "6400000010696e743332000a00000012696e74363400000000000000040001666c6f0038e92f54fb21094002737472000d00000048656c6c6f20c3a4c3b6c3bc00097574630000f94dee3201000008626f6f6c000109646174650000f94dee3201000000"
    },
    {
      obj: { arr: ["foo", "bar", 100, 1000], ta: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), obj: { int32: 10, int64: 1125899906842624, flo: 3.141592653 } },
      bson: "7500000004617272002900000002300004000000666f6f00023100040000006261720010320064000000103300e8030000000574610008000000000102030405060708036f626a002c00000010696e743332000a00000012696e74363400000000000000040001666c6f0038e92f54fb2109400000"
    },
    {
      obj: { da: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], uuid: new BSON.UUID(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])) },
      bson: "80000000046461005c0000000430001a000000103000010000001031000200000010320003000000000431001a000000103000040000001031000500000010320006000000000432001a000000103000070000001031000800000010320009000000000005757569640010000000040102030405060708090a0b0c0d0e0f1000"
    },
    {
      obj: { id: 123456, sk: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), pk: new Uint8Array([255, 254, 253, 252, 251, 250, 249, 248]) },
      bson: "2f0000001069640040e2010005736b000800000000010203040506070805706b000800000000fffefdfcfbfaf9f800"
    },
    {
      obj: { id: 10, obj: new UnknownObj(), str: "Test", n: null, b: true },
      bson: "22000000106964000a00000002737472000500000054657374000a6e000862000100"
    }
  ];


  let deserialize_vector = [
    {
      obj: { "BSON": ["awesome", 5.05, 1986] },
      bson: "310000000442534f4e002600000002300008000000617765736f6d65000131003333333333331440103200c20700000000",
    },
    {
      obj: { int32: 10, int64: 1125899906842624, flo: 3.141592653, str: "Hello äöü", utc: new BSON.UTC("2011-10-10T14:48:00Z"), bool: true, date: new Uint8Array([1,2,3,4]), nu: null },
      bson: "6900000010696e743332000a00000012696e74363400000000000000040001666c6f0038e92f54fb21094002737472000d00000048656c6c6f20c3a4c3b6c3bc00097574630000f94dee3201000008626f6f6c00010564617465000400000000010203040a6e750000"
    },
    {
      obj: { arr: ["foo", "bar", 100, 1000], ta: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), obj: { int32: 10, int64: 1125899906842624, flo: 3.141592653 } },
      bson: "7500000004617272002900000002300004000000666f6f00023100040000006261720010320064000000103300e8030000000574610008000000000102030405060708036f626a002c00000010696e743332000a00000012696e74363400000000000000040001666c6f0038e92f54fb2109400000"
    },
    {
      obj: { da: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], uuid: new BSON.UUID(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])) },
      bson: "80000000046461005c0000000430001a000000103000010000001031000200000010320003000000000431001a000000103000040000001031000500000010320006000000000432001a000000103000070000001031000800000010320009000000000005757569640010000000040102030405060708090a0b0c0d0e0f1000"
    },
    {
      obj: { id: 123456, sk: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), pk: new Uint8Array([255, 254, 253, 252, 251, 250, 249, 248]) },
      bson: "2f0000001069640040e2010005736b000800000000010203040506070805706b000800000000fffefdfcfbfaf9f800"
    },
    {
      obj: { id: 10, oid: new BSON.ObjectId(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])), str: "Test", n: null, b: true },
      bson: "33000000106964000a000000076f6964000102030405060708090a0b0c02737472000500000054657374000a6e000862000100"
    }
  ];


  describe("serialize", function () {
    it("checks empty/unknown object", function () {
      let bson = BSON.serialize("");
      expect(bin2hex(bson)).to.deep.equal("0500000000");
      bson = BSON.serialize({ obj: new UnknownObj() });
      expect(bin2hex(bson)).to.deep.equal("0500000000");
    });

    it("checks int32", function () {
      let bson = BSON.serialize({ int: 0x1234 });
      expect(bin2hex(bson)).to.deep.equal("0e00000010696e74003412000000");
    });

    it("checks negative int32", function () {
      let bson = BSON.serialize({ int: -10 });
      expect(bin2hex(bson)).to.deep.equal("0e00000010696e7400f6ffffff00");
    });

    it("checks int64", function () {
      let bson = BSON.serialize({ int: 0x1234567890 });
      expect(bin2hex(bson)).to.deep.equal("1200000012696e7400907856341200000000");
    });

    it("checks negative int64", function () {
      let bson = BSON.serialize({ int: -78187493520 });
      expect(bin2hex(bson)).to.deep.equal("1200000012696e74007087a9cbedffffff00");
    });

    it("checks double (64-bit binary floating point)", function () {
      let bson = BSON.serialize({ flo: 3.1415926535 });
      expect(bin2hex(bson)).to.deep.equal("1200000001666c6f0044174154fb21094000");
    });

    it("checks string", function () {
      let bson = BSON.serialize({ str: "Hello World" });
      expect(bin2hex(bson)).to.deep.equal("1a00000002737472000c00000048656c6c6f20576f726c640000");
    });

    it("checks UTF-8 string", function () {
      let bson = BSON.serialize({ str: "\u00C4\u00D6\u00DC\u00DF" });
      expect(bin2hex(bson)).to.deep.equal("17000000027374720009000000c384c396c39cc39f0000");
    });

    it("checks boolean", function () {
      let bson = BSON.serialize({ bool: false });
      expect(bin2hex(bson)).to.deep.equal("0c00000008626f6f6c000000");
      bson = BSON.serialize({ bool: true });
      expect(bin2hex(bson)).to.deep.equal("0c00000008626f6f6c000100");
    });

    it("checks null", function () {
      let bson = BSON.serialize({ nul: null });
      expect(bin2hex(bson)).to.deep.equal("0a0000000a6e756c0000");
    });

    it("checks binary", function () {
      let bson = BSON.serialize({ bin: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0xFF]) });
      expect(bin2hex(bson)).to.deep.equal("190000000562696e000a00000000010203040506070809ff00");
    });

    it("checks array", function () {
      let bson = BSON.serialize({ arr: [0xFA, 0xFB, 0xFC, 0xFD] });
      expect(bin2hex(bson)).to.deep.equal("2b000000046172720021000000103000fa000000103100fb000000103200fc000000103300fd0000000000");
    });

    it("checks array in array", function () {
      let bson = BSON.serialize({ arr: [[0x10, 0x11, 0x12, 0x13], 0xFA, 0xFB, 0xFC, 0xFD] });
      expect(bin2hex(bson)).to.deep.equal("4f000000046172720045000000043000210000001030001000000010310011000000103200120000001033001300000000103100fa000000103200fb000000103300fc000000103400fd0000000000");
    });

    it("checks object", function () {
      let bson = BSON.serialize({ obj: { int: 10, str: "" } });
      expect(bin2hex(bson)).to.deep.equal("22000000036f626a001800000010696e74000a000000027374720001000000000000");
    });

    it("checks Date", function () {
      let bson = BSON.serialize({ dat: new Date("2016-06-25T14:48:11Z") });
      expect(bin2hex(bson)).to.deep.equal("120000000964617400f84308885501000000");
    });

    it("checks UTC", function () {
      let bson = BSON.serialize({ utc1: new BSON.UTC("2016-06-25T14:48:11Z"), utc2: new BSON.UTC("2016-06-25T14:48:11+0200"), utc3: new BSON.UTC([0x3D, 0x53, 0xAE, 0x91, 0x55, 0x01, 0x00, 0x00]) });
      expect(bin2hex(bson)).to.deep.equal("2f000000097574633100f843088855010000097574633200f8669a87550100000975746333003d53ae915501000000");
    });

    it("checks UUID", function () {
      let bson = BSON.serialize({ uuid: new BSON.UUID(new Uint8Array([0x43, 0xab, 0x2e, 0x98, 0x62, 0x3c, 0x03, 0xe8, 0x5f, 0x54, 0x1a, 0x17, 0x45, 0xe0, 0x1b, 0xda])) });
      expect(bin2hex(bson)).to.deep.equal("20000000057575696400100000000443ab2e98623c03e85f541a1745e01bda00");
    });

    it("checks ObjectId", function () {
      let bson = BSON.serialize({ oid: new BSON.ObjectId([0xa8, 0x05, 0x57, 0xf0, 0x5c, 0x6d, 0x7a, 0xd0, 0x9f, 0xa7, 0x35, 0x70]) });
      expect(bin2hex(bson)).to.deep.equal("16000000076f696400a80557f05c6d7ad09fa7357000");
    });

    it("checks complex objects", function () {
      for (let i = 0; i < serialize_vector.length; i++) {
        let bson = BSON.serialize(serialize_vector[i].obj);
        expect(bin2hex(bson)).to.deep.equal(serialize_vector[i].bson);
      }
    });
  });


  describe("deserialize", function () {
    it("checks empty/unknown object", function () {
      let obj = BSON.deserialize(hex2bin("0500000000"));
      expect(obj).to.deep.equal({ });
    });

    it("checks int32", function () {
      let obj = BSON.deserialize(hex2bin("0e00000010696e74003412000000"));
      expect(obj).to.deep.equal({ int: 0x1234 });
    });

    it("checks negative int32", function () {
      let obj = BSON.deserialize(hex2bin("0e00000010696e7400f6ffffff00"));
      expect(obj).to.deep.equal({ int: -10 });
    });

    it("checks int64", function () {
      let obj = BSON.deserialize(hex2bin("1200000012696e7400907856341200000000"));
      expect(obj).to.deep.equal({ int: 0x1234567890 });
    });

    it("checks int64 > 2^53", function () {
      let obj = BSON.deserialize(hex2bin("1200000012696e7400FFDEBC9A7856341200"));
      expect(obj).to.deep.equal({ int: 0x123456789ABCDEFF });
    });

    it("checks negative int64", function () {
      let obj = BSON.deserialize(hex2bin("1200000012696e74007087a9cbedffffff00"));
      expect(obj).to.deep.equal({ int: -78187493520 });
    });

    it("checks double (64-bit binary floating point)", function () {
      let obj = BSON.deserialize(hex2bin("1200000001666c6f0044174154fb21094000"));
      expect(obj).to.deep.equal({ flo: 3.1415926535 });
    });

    it("checks string", function () {
      let obj = BSON.deserialize(hex2bin("1a00000002737472000c00000048656c6c6f20576f726c640000"));
      expect(obj).to.deep.equal({ str: "Hello World" });
    });

    it("checks UTF-8 string", function () {
      let obj = BSON.deserialize(hex2bin("17000000027374720009000000c384c396c39cc39f0000"));
      expect(obj).to.deep.equal({ str: "\u00C4\u00D6\u00DC\u00DF" });
    });

    it("checks boolean", function () {
      let obj = BSON.deserialize(hex2bin("0c00000008626f6f6c000000"));
      expect(obj).to.deep.equal({ bool: false });
      obj = BSON.deserialize(hex2bin("0c00000008626f6f6c000100"));
      expect(obj).to.deep.equal({ bool: true });
    });

    it("checks null", function () {
      let obj = BSON.deserialize(hex2bin("0a0000000a6e756c0000"));
      expect(obj).to.deep.equal({ nul: null });
    });

    it("checks binary", function () {
      let obj = BSON.deserialize(hex2bin("190000000562696e000a00000000010203040506070809ff00"));
      expect(obj).to.deep.equal({ bin: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0xFF]) });
    });

    it("checks array", function () {
      let obj = BSON.deserialize(hex2bin("2b000000046172720021000000103000fa000000103100fb000000103200fc000000103300fd0000000000"));
      expect(obj).to.deep.equal({ arr: [0xFA, 0xFB, 0xFC, 0xFD] });
    });

    it("checks array in array", function () {
      let obj = BSON.deserialize(hex2bin("4f000000046172720045000000043000210000001030001000000010310011000000103200120000001033001300000000103100fa000000103200fb000000103300fc000000103400fd0000000000"));
      expect(obj).to.deep.equal({ arr: [[0x10, 0x11, 0x12, 0x13], 0xFA, 0xFB, 0xFC, 0xFD] });
    });

    it("checks object", function () {
      let obj = BSON.deserialize(hex2bin("22000000036f626a001800000010696e74000a000000027374720001000000000000"));
      expect(obj).to.deep.equal({ obj: { int: 10, str: "" } });
    });

    it("checks Date", function () {
      let obj = BSON.deserialize(hex2bin("120000000964617400f84308885501000000"));
      expect(obj).to.deep.equal({ dat: new Date("2016-06-25T14:48:11Z") });
    });

    it("checks UTC", function () {
      let obj = BSON.deserialize(hex2bin("2f000000097574633100f843088855010000097574633200f8669a87550100000975746333003d53ae915501000000"), true);
      expect(obj).to.deep.equal({ utc1: new BSON.UTC("2016-06-25T14:48:11Z"), utc2: new BSON.UTC("2016-06-25T14:48:11+0200"), utc3: new BSON.UTC([0x3D, 0x53, 0xAE, 0x91, 0x55, 0x01, 0x00, 0x00]) });
    });

    it("checks UUID", function () {
      let obj = BSON.deserialize(hex2bin("20000000057575696400100000000443ab2e98623c03e85f541a1745e01bda00"));
      expect(obj).to.deep.equal({ uuid: new BSON.UUID(new Uint8Array([0x43, 0xab, 0x2e, 0x98, 0x62, 0x3c, 0x03, 0xe8, 0x5f, 0x54, 0x1a, 0x17, 0x45, 0xe0, 0x1b, 0xda])) });
      obj = BSON.deserialize(hex2bin("2100000005757569640011000000040143ab2e98623c03e85f541a1745e01bda00"));
      expect(obj).to.equal(undefined);
    });

    it("checks ObjectId", function () {
      let obj = BSON.deserialize(hex2bin("16000000076f696400a80557f05c6d7ad09fa7357000"));
      expect(obj).to.deep.equal({ oid: new BSON.ObjectId([0xa8, 0x05, 0x57, 0xf0, 0x5c, 0x6d, 0x7a, 0xd0, 0x9f, 0xa7, 0x35, 0x70]) });
    });

    it("checks complex objects", function () {
      for (let i = 0; i < deserialize_vector.length; i++) {
        let bson = BSON.serialize(deserialize_vector[i].obj);
        let obj = BSON.deserialize(hex2bin(deserialize_vector[i].bson), true);
        expect(obj).to.deep.equal(deserialize_vector[i].obj);
      }
    });

    it("checks document too small", function () {
      let obj = BSON.deserialize(hex2bin("04000000"));
      expect(obj).to.equal(undefined);
    });

    it("checks document termination", function () {
      let obj = BSON.deserialize(hex2bin("0c00000008626f6f6c000001"));
      expect(obj).to.equal(undefined);
      obj = BSON.deserialize(hex2bin("0c00000008626f6f6c0000"));
      expect(obj).to.equal(undefined);
    });

    it("checks document size mismatch", function () {
      let obj = BSON.deserialize(hex2bin("0d00000008626f6f6c000000"));
      expect(obj).to.equal(undefined);
    });

    it("checks illegal keyname", function () {
      let obj = BSON.deserialize(hex2bin("0c00000008626f6f6c010100"));
      expect(obj).to.equal(undefined);
    });

    it("checks unknown element", function () {
      let obj = BSON.deserialize(hex2bin("0c00000018626f6f6c000000"));
      expect(obj).to.equal(undefined);
    });
  });

  /////////////////////////////////////////////////////////////////////////////

  function bin2hex(bin: Uint8Array, uppercase: boolean = false): string {
    let hex = uppercase ? "0123456789ABCDEF" : "0123456789abcdef";
    let str = "";
    for (let i = 0, len = bin.length; i < len; i++) {
      str += hex.charAt((bin[i] >>> 4) & 0x0f) + hex.charAt(bin[i] & 0x0f);
    }
    return str;
  }

  function hex2bin(hex: string): Uint8Array {
    let bin = new Uint8Array(hex.length >>> 1);
    for (let i = 0, len = hex.length >>> 1; i < len; i++) {
      bin[i] = parseInt(hex.substr(i << 1, 2), 16);
    }
    return bin;
  }

});

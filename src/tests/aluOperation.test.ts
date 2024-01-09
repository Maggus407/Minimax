import {Add, SubA, SubB, transfer, increment, Multiplikation} from '../store/ALUManagement';
import {describe, expect, it} from "vitest";

describe("add function", () => {
    it("should add two numbers correctly", () => {
      const a = new Int32Array([10]); // binary: 1010
      const b = new Int32Array([5]); // binary: 0101
      const expected = new Int32Array([15]); // binary: 1111
      const result = Add(a, b);
      expect(result).toEqual(expected);
    });
  
    it("should handle carry correctly", () => {
      const a = new Int32Array([0xffffffff]); // binary: 1111 1111 1111 1111 1111 1111 1111 1111
      const b = new Int32Array([1]); // binary: 0000 0000 0000 0000 0000 0000 0000 0001
      const expected = new Int32Array([0]); // binary: 0000 0000 0000 0000 0000 0000 0000 0000
      const result = Add(a, b);
      expect(result).toEqual(expected);
    });
  
    it("should handle zero inputs correctly", () => {
      const a = new Int32Array([0b00101]); // 5
      const b = new Int32Array([0]);
      const expected = new Int32Array([0b00101]); // 5
      const result = Add(a, b);
      expect(result).toEqual(expected);
    });
  });

  describe("subA function", () => {
    it("should subtract two numbers correctly", () => {
      const a = new Int32Array([10]); // binary: 1010
      const b = new Int32Array([5]); // binary: 0101
      const expected = new Int32Array([5]); // binary: 0101
      const result = SubA(a, b);
      expect(result).toEqual(expected);
    });
  });


  describe('increment function', () => {
    it('increments a number correctly', () => {
      const a = new Int32Array([0x12345678]);
      const expected = new Int32Array([0x12345679]);
      const result = increment(a);
      expect(result).toEqual(expected);
    });
    it('increments a number correctly', () => {
      const a = new Int32Array([22]);
      const expected = new Int32Array([23]);
      const result = increment(a);
      expect(result).toEqual(expected);
    });
    it('increments a number correctly', () => {
      const a = new Int32Array([0b10110]); // 22
      const expected = new Int32Array([0b10111]); // 23
      const result = increment(a);
      expect(result).toEqual(expected);
    });
  });

  describe('transfer function', () => {
    it('transfer a number correctly', () => {
      const a = new Int32Array([0x12345678]);
      const expected = new Int32Array([0x12345678]);
      const result = transfer(a);
      expect(result).toEqual(expected);
    });
    it('transfer a number correctly', () => {
      const a = new Int32Array([22]);
      const expected = new Int32Array([22]);
      const result = transfer(a);
      expect(result).toEqual(expected);
    });
    it('transfer a number correctly', () => {
      const a = new Int32Array([]);
      const expected = new Int32Array([]);
      const result = transfer(a);
      expect(result).toEqual(expected);
    });
  });

  describe('multiply function', () => {
    it('multiply a number correctly', () => {
      const a = new Int32Array([11]);
      const b = new Int32Array([11]);
      const expected = new Int32Array([121]);
      const result = Multiplikation(a, b);
      expect(result).toEqual(expected);
    });
    it('multiply a number correctly', () => {
      const a = new Int32Array([-1]);
      const b = new Int32Array([22]);
      const expected = new Int32Array([-22]);
      const result = Multiplikation(a, b);
      expect(result).toEqual(expected);
    });
    it('multiply a number correctly', () => {
      const a = new Int32Array([0b10110]); // 22
      const b = new Int32Array([0b10110]); // 22
      const expected = new Int32Array([0b101100100]); // 484
      const result = Multiplikation(a, b);
      expect(result).toEqual(expected);
  });
});

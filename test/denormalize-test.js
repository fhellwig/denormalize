'use strict';

const assert = require('assert');
const {
  setProperty,
  getProperty,
  denormalizeProperties,
  normalizeProperties,
  copyProperties,
} = require('../denormalize');

describe('denormalize', function () {
  describe('setProperty', function () {
    it('should set a property value for an object', function () {
      const obj = {};
      const ret = setProperty(obj, 'person.name.first', 'Joe');
      assert.deepEqual(
        obj,
        { person: { name: { first: 'Joe' } } },
        'object does not have the expected properties'
      );
      assert.strictEqual(obj, ret, 'object does not equal the return value');
    });
    it('should set a create an object if none specified', function () {
      const obj = setProperty(null, 'person.name.first', 'Joe');
      assert.deepEqual(
        obj,
        { person: { name: { first: 'Joe' } } },
        'object does not have the expected properties'
      );
    });
    it('should set an array value for an array property', function () {
      const obj = {};
      setProperty(obj, 'people[0].name.first', 'Joe');
      assert.deepEqual(
        obj,
        { people: [{ name: { first: 'Joe' } }] },
        'object does not have the expected properties'
      );
    });
    it('should set a create an array if none specified', function () {
      const obj = setProperty(null, '[0]', 'item0');
      setProperty(obj, '[1]', 'item1');
      assert.deepEqual(obj, ['item0', 'item1'], 'array does not have the expected elements');
    });
    it('should handle primitive values', function () {
      const val = setProperty(null, '', 5);
      assert.strictEqual(val, 5, 'primitive value was not returned');
    });
    it('should fail if given an invalid property name', function () {
      assert.throws(
        () => {
          setProperty(null, 'invalid.[1]', null);
        },
        Error,
        'error not thrown for invalid property name'
      );
    });
    it('should fail if the data type does not match the property name', function () {
      assert.throws(
        () => {
          setProperty({}, '[0]', 'item0');
        },
        Error,
        'error not thrown for object-array mismatch'
      );
      assert.throws(
        () => {
          setProperty([], 'name', 'Joe');
        },
        Error,
        'error not thrown for array-object mismatch'
      );
    });
  });
  describe('getProperty', function () {
    it('should get a property value from an object', function () {
      const obj = { person: { name: { first: 'Joe' } } };
      const val = getProperty(obj, 'person.name.first');
      assert.strictEqual(val, 'Joe', 'did not return the expected value');
    });
    it('should get a property value from an array', function () {
      const obj = { people: [{ name: { first: 'Joe' } }] };
      const val = getProperty(obj, 'people[0].name.first');
      assert.strictEqual(val, 'Joe', 'did not return the expected value');
    });
    it('should get an intermediate property from an object', function () {
      const obj = { person: { name: { first: 'Joe' } } };
      const val = getProperty(obj, 'person.name');
      assert.deepEqual(val, { first: 'Joe' }, 'did not return the expected value');
    });
    it('should handle primitive values', function () {
      const val = getProperty(5, '');
      assert.strictEqual(val, 5, 'primitive value was not returned');
    });
    it('should return undefined if property is not available', function () {
      const obj = { person: { name: { first: 'Joe' } } };
      const val = getProperty(obj, 'people[0].name.first');
      assert.strictEqual(val, undefined, 'did not return undefined');
    });
    it('should return the fallback value if fallback is provided', function () {
      const obj = { person: { name: { first: 'Joe' } } };
      const val = getProperty(obj, 'people[0].name.first', 'fallback');
      assert.strictEqual(val, 'fallback', 'did not return the fallback value');
    });
    it('should handle getting properties from null data', function () {
      const val = getProperty({ person: null }, 'person.name.first', 'not found');
      assert.strictEqual(val, 'not found', 'did not return the fallback value');
    });
    it('should handle getting properties from undefined data', function () {
      const val = getProperty({ person: undefined }, 'person.name.first', 'not found');
      assert.strictEqual(val, 'not found', 'did not return the fallback value');
    });
    it('should fail if given an invalid property name', function () {
      assert.throws(
        () => {
          getProperty(null, 'invalid.[1]', null);
        },
        Error,
        'error not thrown for invalid property name'
      );
    });
  });
  describe('denormalizeProperties', function () {
    it('should denormalize all properties in an object', function () {
      const obj = {
        name: {
          first: 'John',
          last: 'Smith',
        },
        friends: ['Alice', 'Bob'],
        dates: [
          {
            type: 'birthdate',
            date: '1994-03-12',
          },
          {
            type: 'graduation',
            date: '2012-06-20',
          },
        ],
      };
      const map = denormalizeProperties(obj);
      assert.deepEqual(
        map,
        {
          'name.first': 'John',
          'name.last': 'Smith',
          'friends[0]': 'Alice',
          'friends[1]': 'Bob',
          'dates[0].type': 'birthdate',
          'dates[0].date': '1994-03-12',
          'dates[1].type': 'graduation',
          'dates[1].date': '2012-06-20',
        },
        'did not return the expected value'
      );
    });
  });
  describe('normalizeProperties', function () {
    it('should normalize all items in a denormalized map', function () {
      const map = {
        'name.first': 'John',
        'name.last': 'Smith',
        'friends[0]': 'Alice',
        'friends[1]': 'Bob',
        'dates[0].type': 'birthdate',
        'dates[0].date': '1994-03-12',
        'dates[1].type': 'graduation',
        'dates[1].date': '2012-06-20',
      };
      const obj = normalizeProperties(map);
      assert.deepEqual(
        obj,
        {
          name: {
            first: 'John',
            last: 'Smith',
          },
          friends: ['Alice', 'Bob'],
          dates: [
            {
              type: 'birthdate',
              date: '1994-03-12',
            },
            {
              type: 'graduation',
              date: '2012-06-20',
            },
          ],
        },
        'did not return the expected value'
      );
    });
  });
  describe('copyProperties', function () {
    it('should copy all properties', function () {
      const obj = {
        name: {
          first: 'John',
          last: 'Smith',
        },
        friends: ['Alice', undefined, 'Bob'],
        dates: [
          undefined,
          {
            type: 'birthdate',
            date: '1994-03-12',
          },
          undefined,
          {
            type: 'graduation',
            date: '2012-06-20',
          },
        ],
      };
      const copy = copyProperties(obj, false);
      assert.deepEqual(copy, obj, 'did not return the expected value');
    });
    it('should copy all properties and normalize arrays', function () {
      const obj = {
        name: {
          first: 'John',
          last: 'Smith',
        },
        friends: ['Alice', undefined, 'Bob'],
        dates: [
          undefined,
          {
            type: 'birthdate',
            date: '1994-03-12',
          },
          undefined,
          {
            type: 'graduation',
            date: '2012-06-20',
          },
        ],
      };
      const copy = copyProperties(obj);
      assert.deepEqual(
        copy,
        {
          name: {
            first: 'John',
            last: 'Smith',
          },
          friends: ['Alice', 'Bob'],
          dates: [
            {
              type: 'birthdate',
              date: '1994-03-12',
            },
            {
              type: 'graduation',
              date: '2012-06-20',
            },
          ],
        },
        'did not return the expected value'
      );
    });
  });
});

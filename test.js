const {
  getProperty,
  denormalizeProperties,
  normalizeProperties,
  copyProperties,
} = require('./index');

if (normalizeProperties(denormalizeProperties(5)) !== 5) {
  throw new Error('Test for primitive failed.');
}

const arr = normalizeProperties(denormalizeProperties([7]));

if (arr.length !== 1 || arr[0] !== 7) {
  throw new Error('Test for array failed.');
}

const data = {
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

const fields = denormalizeProperties(data);

// Create a hole in an array.
fields['friends[8]'] = getProperty(data, 'friends[1]');
delete fields['friends[1]'];

const data1 = normalizeProperties(fields);

const data2 = copyProperties(data1);

if (JSON.stringify(data) !== JSON.stringify(data2)) {
  throw new Error('Test for complex data failed.');
}

console.log('Test passed.');

# denormalize

Functions that work with JavaScript objects and arrays using named properties.

## Example

Given the following object...

```javascript
const person = {
  name: {
    first: 'John',
    last: 'Smith'
  },
  friends: ['Alice', 'Bob'],
  dates: [
    {
      type: 'birthdate',
      date: '1994-03-12'
    },
    {
      type: 'graduation',
      date: '2012-06-20'
    }
  ]
};
```

...we can use the methods provided by this package to get and set properties by name.

```javascript
const { getProperty, setProperty } = require('denormalize');
// import { getProperty, setProperty } from 'denormalize';

getProperty(person, 'name.first'); // returns 'John'
getProperty(person, 'friends[0]'); // returns 'Alice'
getProperty(person, 'dates[1].type'); // returns 'graduation'

getProperty(person, 'dates'); // returns the entire array
getProperty(person, 'dates[1]'); // returns one object

setProperty(person, 'dates[2].type', 'wedding'); // adds an object to the array
setProperty(person, 'dates[2].date', '2016-09-30'); // adds a property to the object
```

## Syntax

The syntax for naming a property follows the conventional JavaScript dotted notation. Arrays elements are identified using the bracket notation.

The following are all valid property names:

```javascript
'parts[5].supplier.address.city';
'[3]'; // assumes that the data is an array
'theme.dark.colors';
'name';
'phone-numbers[3].area-code';
```

## API

The `denormalize` package exports the following functions:

`getProperty(data, name)`

- Returns the property value from the data specified by the name.

`setProperty(data, name, value)`

- Sets the property value in the data specified by the name. Intermediate objects and arrays are created as needed. Please note that, using the array syntax, it is possible to create "holes" in arrays (i.e., unassigned elements).

- This function modifies the specified data and returns it. If the `data` parameter is `null`, then the first element of the `name` is examined and the appropriate object is created, modified, and returned. If the first element of the name is a number, then an array is created, modified, and returned. Otherwise, an object is created, modified, and returned.

`createPropertyName(...args)`

- Given a set of strings and numbers, creates a property name. For example, calling `createPropertyName('parts', 5, 'supplier', 'address', 'city')` returns the string `'parts[5].supplier.address.city'`. Numbers (i.e., `typeof arg === 'number'`) automatically get the bracket syntax as they are assumed to be an array index.

`parsePropertyName(name)`

- Performs the inverse of the `createPropertyName` function. Calling `parsePropertyName('parts[5].supplier.address.city')` returns the array `['parts', 5, 'supplier', 'address', 'city']`.

`denormalizeProperties(data)`

- Given an object or an array, creates a map of property names to property values. For example, calling this function with the data in the example above returns the following map object:

```javascript
{
  "name.first": "John",
  "name.last": "Smith",
  "friends[0]": "Alice",
  "friends[1]": "Bob",
  "dates[0].type": "birthdate",
  "dates[0].date": "1994-03-12",
  "dates[1].type": "graduation",
  "dates[1].date": "2012-06-20"
}
```

`normalizeProperties(map [, normalizeArrays])`

- Performs the inverse of the `denormalizeProperties` function. Calling this with the map from the previous example results in the original JavaScript object being returned.

- The second parameter defaults to `true` meaning that the `normalizeArrayProperties` function (see below) is called on the return value before it is returned. This eliminates holes in all arrays.

`normalizeArrayProperties(data)`

- Recursively traverses the data and eliminates holes in arrays. The specified data is _not_ modified. The normalized data is returned.

## Motivation

This utility came about because I had a large HTML form representing a complex data structure with varying number of array elements in some of the properties. Since HTML forms are a linear collection of name-value pairs, I needed a syntax that allowed me to translate from the data to the form and back again on form submission.

Creating property names that represented the location of the value in the data object was the solution. What I needed next was the means to easily go back and forth between the field representation used by the form and the data object retrieved from (and sent to) the server. This package is the result of that exercise.

On getting the data from the server, I call `denormalizeProperties` to turn the data into a "field map" that could be used when populating the form. Then, when the form is submitted, I call `normalizeProperties` to get back to the JavaScript object.

## License

MIT License

Copyright (c) 2019 Frank Hellwig

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

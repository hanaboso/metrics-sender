#metrics-sender

## How to install:
`$ npm install metrics-sender`

## How to use (Typescript)

Import dependencies (Typescript):
```typescript
import {Metrics} from "metrics-sender";

// Define initial values
const tags = {name: "app", host: "1.1.1.1", foo: "bar"};
const fields = {value1: 10000, value2: "some value"};

// Set connection details
const m = new Metrics("measurementName", tags, "localhost", 3333);

// Add more tag
m.addTag("added", "foo");

// Or remove some unnecessary tag
m.removeTag("host");

// And finally send UDP packet
m.send(fields);
```

## How to contribute:

Create pull request to `https://github.com/hanaboso/metrics-sender` repository.
Please note that this lib is written in typescript. 

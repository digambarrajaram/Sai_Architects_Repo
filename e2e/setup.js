import {
  device,
  element,
  by,
  waitFor,
  expect,
} from 'detox';

// Make globals available for Jest
global.device = device;
global.element = element;
global.by = by;
global.waitFor = waitFor;
global.expect = expect;

import * as React from 'react';
import { mount } from 'enzyme';
import { App } from './index';

test('initial App Test', () => {
  const wrapper = mount(<App />);
  expect(wrapper).not.toBeNull();
});

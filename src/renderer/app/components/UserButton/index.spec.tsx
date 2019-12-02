import * as React from 'react'
import {shallow} from 'enzyme'
import UserIcon from './index'

test("test initial", ()=>{
    const props = {
        icon: ""
    }
    const wrapper = shallow(<UserIcon {...props} />);

    expect(wrapper).not.toBeNull();
})
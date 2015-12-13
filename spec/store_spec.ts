declare var describe, it, expect, hot, cold, expectObservable, expectSubscriptions, console;

import {store} from '../src/store';

describe('sanity check', () => {
	it('should work', () => {
		
		expect(store).toBeDefined()
		
	});
})
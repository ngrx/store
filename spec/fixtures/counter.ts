export const INCREMENT = 'INCREMENT';
export const DECREMENT = 'DECREMENT';
export const RESET = 'RESET';

export const counterStore = (state, action) => {
	
	switch (action.type) {
		case INCREMENT:
			return state + 1;
			break;
		
		case DECREMENT:
			return state - 1;
			break;
			
		case RESET:
			return 0;
			break;
	
		default:
			return state;
			break;
	}
}
import {switchReduce} from '../src/utils';
import {TypedAction} from '../src/dispatcher';
interface TestState {
  num: number;
}

class AddNumberAction implements TypedAction<number> {
  type: 'ADD_NUMBER';
  constructor(public payload: number) {}
}

class SubtractNumberAction implements TypedAction<number> {
  type: 'SUBTRACT_NUMBER';
  constructor(public payload: number) {}
}

let testState: TestState;
describe('switchReduce', () => {
  beforeEach(() => {
    testState = {
      num: 1
    };
  });

  it('should return initial state with no cases and no default', () => {
    const runSpy = jasmine.createSpy('spy');
    const payload = 1;

    switchReduce(testState, new AddNumberAction(payload)).reduce();

    expect(runSpy).not.toHaveBeenCalled();
  });

  it('should take default if nothing else specified', () => {
    const newState = switchReduce(testState, new AddNumberAction(1))
      .reduce(() => ({
        num: 5
      }));

    expect(newState.num).toBe(5);
  });

  it('should take default if nothing else matches', () => {
    const runSpy = jasmine.createSpy('spy');

    const newState = switchReduce(testState, new AddNumberAction(1))
      .byClass(SubtractNumberAction, runSpy)
      .byType('NOT_EXISTING', runSpy)
      .reduce(() => ({
        num: 5
      }));

    expect(newState.num).toBe(5);
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('should execute run function only once', () => {
    const runSpy = jasmine.createSpy('spy');
    const payload = 1;

    switchReduce(testState, new AddNumberAction(payload))
      .byClass(AddNumberAction, runSpy)
      .byClasses([AddNumberAction, SubtractNumberAction], runSpy)
      .byType('ADD_NUMBER', runSpy)
      .byTypes(['ADD_NUMBER', 'SUBTRACT_NUMBER'], runSpy)
      .reduce(runSpy);

    expect(runSpy).toHaveBeenCalledWith(payload, jasmine.any(AddNumberAction), jasmine.anything());
    expect(runSpy.calls.count()).toBe(1);
  });

  it('should execute same byClasses for each action', () => {
    const applySwitchReduce = (state: TestState, action: TypedAction<number>) =>
      switchReduce(state, action)
        .byClasses([AddNumberAction, SubtractNumberAction], (payload: number, innerAction: TypedAction<number>) => {
          const addend: number = innerAction instanceof AddNumberAction ? payload : -payload;
          return Object.assign({}, state, {
            num: state.num + addend
          });
        })
        .reduce();

    const newState1 = applySwitchReduce(testState, new AddNumberAction(1));
    const newState2 = applySwitchReduce(newState1, new SubtractNumberAction(2));
    expect(newState1.num).toBe(2);
    expect(newState2.num).toBe(0);
  });
});

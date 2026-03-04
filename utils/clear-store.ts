import {
  create as _create,
  StateCreator,
  StoreMutatorIdentifier,
} from 'zustand';

/**
 * Represents the different store categories that can be used within the application.
 *
 * - 'all': Refers to all categories.
 * - 'theme': Pertains to theme-related categories.
 * - 'auth': Relates to authentication categories.
 * - 'notification': Refers to notification categories.
 *
 * **NB:** Feel free to add your own custom categories here
 */
type Category =
  | 'all'
  | 'theme'
  | 'auth'
  | 'oauth'
  | 'notification'
  | 'sidebar'
  | 'athlete-onboarding'
  | 'agent-onboarding'
  | 'academy-onboarding'
  | 'club-onboarding'
  | 'applications'
  | 'query-filters';

const storeResetFns = new Map<Category, Set<() => void>>();

/**
 * Creates a store with the ability to reset its state to the initial state.
 *
 * @param categories - An array of categories to associate with the store.
 * @returns A function that creates a store with reset capabilities.
 *
 * The function takes a state creator function and returns a store. It registers
 * the store's reset function under the specified categories, allowing the store
 * to be reset to its initial state when `resetStores` is called with the same categories.
 */
export const createClearable =
  (categories: Category[]) =>
  <T, Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    f: StateCreator<T, [], Mos>
  ) => {
    const store = _create<T, Mos>(f);
    const initialState = store.getState();

    for (const category of categories) {
      const list = storeResetFns.get(category) ?? new Set();
      list.add(() => {
        // @ts-expect-error: We know that the initial state is a valid state for the store.
        store.setState(initialState, true);
      });
      storeResetFns.set(category, list);
    }

    return store;
  };

/**
 * Resets the state of all stores associated with the specified categories
 * to their initial state.
 *
 * @param categories - An array of categories whose associated stores should be reset.
 */
export const resetStores = (categories: Category[]) => {
  for (const category of categories) {
    const list = storeResetFns.get(category);
    list?.forEach((fn) => fn());
  }
};

import {HYDRATE, HydrateAction} from "../types/types";

/**
 * Action creator for the HYDRATE action to merge state.
 *
 * @param state - The state to be merged into the Redux store.
 * @returns A HydrateAction with the provided state.
 */
export const hydrate = <S>(state: S): HydrateAction<S> => ({
    type: HYDRATE,
    payload: state,
});

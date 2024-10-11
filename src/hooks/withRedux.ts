import {
    GetServerSideProps,
    GetServerSidePropsContext,
    GetServerSidePropsResult,
} from 'next';
import {Store, Reducer, UnknownAction} from 'redux';
import {HYDRATE, NextPageContextWithStore} from "../types/types";
import {hasProps} from "../helpers";


/**
 * A higher-order function to wrap Next.js's getServerSideProps with Redux store integration.
 *
 * @param getServerSidePropsFunc - original getServerSideProps function.
 * @param initializeStore - Function to initialize and return the Redux store.
 * @returns A result of getServerSideProps with store actions.
 */
export function withReduxWrapper<S, P extends { [key: string]: any } = {}>(
    getServerSidePropsFunc: GetServerSideProps<P, any> | undefined,
    initializeStore: () => Store<S, UnknownAction>
): GetServerSideProps<P & { initialReduxState: S }> {
    return async (
        context: GetServerSidePropsContext
    ): Promise<GetServerSidePropsResult<P & { initialReduxState: S }>> => {
        // Initialize the Redux store
        const store = initializeStore();

        // Cast context to include the store
        const contextWithStore = context as NextPageContextWithStore<S>;
        contextWithStore.store = store;

        // Initialize result with default props
        let result: GetServerSidePropsResult<P> = { props: {} as P };

        // Execute the original getServerSideProps function if provided
        if (typeof getServerSidePropsFunc === 'function') {
            result = await getServerSidePropsFunc(contextWithStore);
        }

        const initialReduxState = store.getState();

        if (hasProps(result)) {
            return {
                ...result,
                props: {
                    ...result.props,
                    initialReduxState,
                },
            };
        }

        return result as GetServerSidePropsResult<P & { initialReduxState: S }>;
    };
}

/**
 * Creates a root reducer that handles the HYDRATE action to merge server and client state.
 *
 * @param reducer - The original root reducer.
 * @param hydrationAction - The action to handle hydration.
 * @returns A new root reducer with HYDRATE handling.
 */
export const createRootReducer = <S>(
    reducer: Reducer<S, UnknownAction>,
    hydrationAction: (state: S | undefined, action: UnknownAction) => S,
): Reducer<S, UnknownAction> => {
    return (state: S | undefined, action: UnknownAction): S => {
        if (action.type === HYDRATE) {
           return hydrationAction(state, action);
        }
        return reducer(state, action);
    };
};


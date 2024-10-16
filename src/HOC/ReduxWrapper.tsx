import React, { createContext, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import isEqual from 'lodash/isEqual';
import { Store, UnknownAction } from 'redux';
import {hydrate} from "../actions";
import {InjectedProps, ReduxWrapperProps} from "../types/types";

export const HydrationContext = createContext<boolean>(false);

//
/**
 * Define the Higher-Order Component which handle state hydration.
 *
 * @param Component - The wrapper component.
 * @param initializeStore - Method that handles store initialization by using createRootReducer.
 * @returns A component with store passed in props that stars hydration on mount.
 */
export function reduxWrapper<S, P>(
    Component: React.ComponentType<P & InjectedProps<S>>,
    initializeStore: () => Store<S, UnknownAction>
): React.FC<ReduxWrapperProps<S, P>> {
    return (props: ReduxWrapperProps<S, P>) => {
        const { initialReduxState } = props.pageProps;

        const isHydrated = useRef<boolean>(false);
        const storeRef = useRef<Store<S, UnknownAction> | null>(null);
        if (!storeRef.current) {
            storeRef.current = initializeStore();
        }

        const store = storeRef.current;
        const { events } = useRouter();

        useEffect(() => {
            const handleStart = () => {
                isHydrated.current = false;
            };

            events?.on('routeChangeStart', handleStart);
            return () => {
                events?.off('routeChangeStart', handleStart);
            };
        }, [events]);

        useEffect(() => {
            if (initialReduxState && !isHydrated.current) {
                const currentState = store.getState();
                const incomingState = initialReduxState;
                if (!isEqual(currentState, incomingState)) {
                    store.dispatch(hydrate(incomingState));
                }
            }

            isHydrated.current = true;
        }, [initialReduxState, store]);

        return (
            <HydrationContext.Provider value={isHydrated.current}>
                <Component {...props} store={store} />
            </HydrationContext.Provider>
        );
    };
}

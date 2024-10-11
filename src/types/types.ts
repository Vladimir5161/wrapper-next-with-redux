import {GetServerSidePropsContext} from "next";
import {Store, UnknownAction} from "redux";

export const HYDRATE = 'HYDRATE' as const;

/**
 * Define the HydrateAction interface extending Redux's AnyAction
 */
export interface HydrateAction<S> extends UnknownAction {
    type: typeof HYDRATE;
    payload: S;
}

/**
 * Extend Next.js's GetServerSidePropsContext to include the Redux store
 */
export interface NextPageContextWithStore<S> extends GetServerSidePropsContext {
    store: Store<S, UnknownAction>;
}


/**
 * Define the shape of pageProps, ensuring it includes initialReduxState
 */
export interface PageProps<S> {
    initialReduxState: S;
    [key: string]: any; // Allow other props
}

/**
 * Define the injected props that the HOC will provide to the wrapped component
 */
export interface InjectedProps<S> {
    store: Store<S, UnknownAction>;
}

/**
 * Define the type for the HOC's props
 */
export type ReduxWrapperProps<S, P> = P & {
    pageProps: PageProps<S>;
};
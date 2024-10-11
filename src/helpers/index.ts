import {GetServerSidePropsResult} from "next";

/**
 * Type guard to check if the result has props.
 *
 * @param result - The result returned by getServerSideProps.
 * @returns True if result has props, false otherwise.
 */
export function hasProps<P>(result: GetServerSidePropsResult<P>): result is { props: P } {
    return Object.prototype.hasOwnProperty.call(result, 'props');
}
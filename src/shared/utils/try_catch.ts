// A utility function to handle async try-catch patterns
// Returns a tuple with [success flag, error, result]
//
// @param promise The promise to execute within try-catch
// @returns [true, null, result] if successful, [false, error, null] if error
//
// @example
// const [ok, error, data] = await try_catch(fetch_data());
// if (!ok) {
//   // handle error
//   console.error(error);
//   return;
// }
// // use data
export async function try_catch<T>(promise: Promise<T>): Promise<[true, null, T] | [false, Error, null]> {
    try {
        const result = await promise
        return [true, null, result]
    } catch (error) {
        return [false, error instanceof Error ? error : new Error(String(error)), null]
    }
}

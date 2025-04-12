type TryResult<T> = [ok: true, err: null, data: T] | [ok: false, err: any, data: undefined]

export async function try_catch<T>(promise: Promise<T>): Promise<TryResult<T>> {
    try {
        const data = await promise
        return [true, null, data]
    } catch (err: any) {
        return [false, err, undefined]
    }
}

/**
 * Simple debounce for async functions with automatic cleanup
 * @param func Async function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced async function
 */
export function debounce_async<T extends (...args: any[]) => Promise<any>>(func: T, delay: number): T {
    let timeout_id: NodeJS.Timeout | null = null

    return ((...args: Parameters<T>) => {
        return new Promise<ReturnType<T>>((resolve, reject) => {
            // Clear existing timeout
            if (timeout_id) {
                clearTimeout(timeout_id)
            }

            // Set new timeout
            timeout_id = setTimeout(async () => {
                try {
                    const result = await func(...args)
                    resolve(result)
                } catch (error) {
                    reject(error)
                }
                timeout_id = null
            }, delay)
        })
    }) as T
}

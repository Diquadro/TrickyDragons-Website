/**
 * Tracks an event with Umami analytics, handling cases where Umami might not be loaded yet
 * @param event_name The name of the event to track
 * @param event_data The data to send with the event
 * @param max_wait_time Maximum time to wait for Umami to load (in milliseconds)
 */
export function umami_track(event_name: string, event_data: any, max_wait_time: number = 5000): void {
    // Check if Umami is already loaded
    if (typeof window !== 'undefined' && typeof window.umami !== 'undefined') {
        // Umami is ready, track the event immediately
        window.umami.track(event_name, event_data)
        return
    }

    // Umami is not ready yet, set up a periodic check
    let elapsed_time = 0
    const check_interval = 1000 // Check every 1 second to reduce system load

    const check_umami = setInterval(() => {
        // Increment elapsed time
        elapsed_time += check_interval

        // Check if Umami is now available
        if (typeof window !== 'undefined' && typeof window.umami !== 'undefined') {
            // Umami is ready, track the event
            window.umami.track(event_name, event_data)
            clearInterval(check_umami)
            console.log(`Umami loaded after ${elapsed_time}ms - Event tracked: ${event_name}`)
        }
        // Check if we've exceeded the maximum wait time
        else if (elapsed_time >= max_wait_time) {
            clearInterval(check_umami)
            console.warn(`Umami not loaded after ${max_wait_time}ms - Event not tracked: ${event_name}`)
        }
    }, check_interval)
}

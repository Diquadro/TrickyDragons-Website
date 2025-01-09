export default function error_toast(message: string): void {
    // Check if the toast already exists
    if (document.getElementById('error_toast')) {
        return // Skip creation if the toast already exists
    }

    const toast = document.createElement('div')
    toast.id = 'error_toast' // Assign a unique ID
    toast.textContent = message

    // Style for the toast
    toast.style.position = 'fixed'
    toast.style.top = '-50px' // Start outside the visible area
    toast.style.left = '50%'
    toast.style.transform = 'translateX(-50%)'
    toast.style.backgroundColor = '#da2d2a' // Your red color
    toast.style.color = 'white'
    toast.style.padding = '10px 20px'
    toast.style.borderRadius = '5px'
    toast.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)'
    toast.style.fontSize = '1rem'
    toast.style.fontWeight = 'bold'
    toast.style.zIndex = '9999'
    toast.style.transition = 'top 0.5s ease' // Animation for sliding down
    toast.style.boxShadow = '0px 0px 15px rgba(0, 0, 0, 0.5)' // Add slightly larger shadow
    toast.style.textAlign = 'center'

    if (window.innerWidth < 1400) {
        toast.style.fontSize = '1.4rem'
        toast.style.padding = '15px 25px'
        toast.style.borderRadius = '8px'
    }

    document.body.appendChild(toast)

    // Trigger the slide down animation
    requestAnimationFrame(() => {
        toast.style.top = '20px' // Slide down into view
    })

    // Remove the toast after 5 seconds
    setTimeout(() => {
        toast.style.transition = 'top 0.5s ease, opacity 0.5s ease'
        toast.style.top = '-50px' // Slide back up
        toast.style.opacity = '0' // Fade out
        setTimeout(() => toast.remove(), 500) // Remove after fade-out
    }, 2500)
}

import requestIp from 'request-ip'

// IP detection middleware - Detects the client's IP address and adds it to the request object
export const request_ip = requestIp.mw()

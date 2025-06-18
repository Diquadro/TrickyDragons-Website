import express from 'express'

// JSON parser middleware - Parses incoming JSON payloads
// Also handles text/plain for sendBeacon compatibility
export const express_json = express.json({
    limit: '2mb',
    type: ['application/json', 'text/plain'], // Accept both content types
})

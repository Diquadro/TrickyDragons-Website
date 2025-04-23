import express from 'express'

// JSON parser middleware - Parses incoming JSON payloads
export const express_json = express.json({
    limit: '2mb',
})

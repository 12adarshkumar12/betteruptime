import express from "express";

export interface authenticatedRequest extends express.Request {
    user_id?: string
}
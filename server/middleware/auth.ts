import { Request, Response, NextFunction } from 'express';
import { isAuthenticated, isAdminAuthenticated } from '../auth';

export const requireAuth = isAuthenticated;
export const requireAdmin = isAdminAuthenticated;

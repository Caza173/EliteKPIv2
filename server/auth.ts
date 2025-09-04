import type { Express, Request, Response, NextFunction } from "express";

// Simple development authentication system
// Replace with your preferred authentication solution in production

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

// Mock user for development - replace with real authentication
const mockUser: User = {
  id: "dev-user-1",
  username: "developer",
  isAdmin: true
};

// Track logout state in development
let isLoggedOut = false;

// Setup authentication middleware
export function setupAuth(app: Express) {
  // Simple session-like middleware for development
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Don't add user if logged out
    if (!isLoggedOut) {
      (req as any).user = mockUser;
    }
    next();
  });
}

// Logout function for development
export function logout() {
  isLoggedOut = true;
}

// Login function for development  
export function login() {
  isLoggedOut = false;
}

// Check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  next();
}

// Check if user is authenticated and is admin
export function isAdminAuthenticated(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (!user.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  next();
}

// Get current user
export function getCurrentUser(req: Request): User | null {
  return (req as any).user || null;
}

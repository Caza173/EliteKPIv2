import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Development mode bypass for local testing
const isDevelopment = process.env.NODE_ENV === 'development';

if (!process.env.REPLIT_DOMAINS && !isDevelopment) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    if (isDevelopment) {
      // Return a mock config for development
      return null;
    }
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  const userEmail = claims["email"];
  const userId = claims["sub"];
  
  // Check if this is a new user by trying to get existing user
  const existingUser = await storage.getUser(userId).catch(() => null);
  const isNewUser = !existingUser;
  
  // Create/update the user
  await storage.upsertUser({
    id: userId,
    email: userEmail,
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
  
  // If this is a new user, check for pending referrals and credit the referrer
  if (isNewUser && userEmail) {
    try {
      await storage.processPendingReferral(userEmail);
      console.log(`✅ Processed referral signup for email: ${userEmail}`);
    } catch (error) {
      console.error('❌ Error processing referral signup:', error);
      // Don't fail user signup if referral processing fails
    }
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  if (isDevelopment) {
    // Development mode: create a simple login bypass
    console.log('🔧 Development mode: Authentication bypass enabled');
    
    // Create a development user route
    app.get('/api/dev-login', async (req: any, res) => {
      try {
        // Create/get a development user with proper claims structure
        const devUserId = 'dev-user-123';
        const devUserData = {
          id: devUserId,
          email: 'dev@example.com',
          firstName: 'Development',
          lastName: 'User',
          profileImageUrl: null,
        };
        
        // Store user in database
        await storage.upsertUser(devUserData);
        
        // Create user object with claims structure that matches production format
        const devUser = {
          claims: {
            sub: devUserId,
            email: 'dev@example.com',
            name: 'Development User',
            given_name: 'Development',
            family_name: 'User',
            profile_image_url: null,
          },
          ...devUserData
        };
        
        // Set up session properly
        req.login(devUser, (err: any) => {
          if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ error: 'Failed to establish session' });
          }
          
          console.log('Development user logged in:', devUser.claims.email);
          res.json({ success: true, user: devUser, redirect: '/' });
        });
      } catch (error) {
        console.error('Development login error:', error);
        res.status(500).json({ error: 'Failed to create development user' });
      }
    });
    
    // Override the /api/login endpoint in development to auto-login
    app.get("/api/login", async (req: any, res) => {
      try {
        // If already authenticated, just redirect
        if (req.isAuthenticated()) {
          console.log('User already authenticated, redirecting to dashboard');
          return res.redirect('/dashboard');
        }

        // Auto-login the dev user
        const devUserId = 'dev-user-123';
        const devUserData = {
          id: devUserId,
          email: 'dev@example.com',
          firstName: 'Development',
          lastName: 'User',
          profileImageUrl: null,
        };
        
        // Create user object with claims structure
        const devUser = {
          claims: {
            sub: devUserId,
            email: 'dev@example.com',
            name: 'Development User',
            given_name: 'Development',
            family_name: 'User',
            profile_image_url: null,
          },
          ...devUserData
        };
        
        req.login(devUser, (err: any) => {
          if (err) {
            console.error('Auto-login error:', err);
            return res.status(500).json({ error: 'Failed to establish session' });
          }
          console.log('Auto-logged in dev user via /api/login');
          res.redirect('/dashboard');
        });
      } catch (error) {
        console.error('Development auto-login error:', error);
        res.status(500).json({ error: 'Failed to auto-login' });
      }
    });
    
    // Add a development user auto-login for the main page
    app.get('/', async (req: any, res, next) => {
      // If not authenticated, auto-login the dev user
      if (!req.isAuthenticated()) {
        try {
          const devUserId = 'dev-user-123';
          const devUserData = {
            id: devUserId,
            email: 'dev@example.com',
            firstName: 'Development',
            lastName: 'User',
            profileImageUrl: null,
          };
          
          // Create user object with claims structure
          const devUser = {
            claims: {
              sub: devUserId,
              email: 'dev@example.com',
              name: 'Development User',
              given_name: 'Development',
              family_name: 'User',
              profile_image_url: null,
            },
            ...devUserData
          };
          
          req.login(devUser, (err: any) => {
            if (err) {
              console.error('Auto-login error:', err);
              return next();
            }
            console.log('Auto-logged in dev user for main page');
            next();
          });
        } catch (error) {
          console.error('Auto-login error:', error);
          next();
        }
      } else {
        next();
      }
    });
    
    // Setup basic session serialization for development
    passport.serializeUser((user: any, done) => {
      done(null, user);
    });
    
    passport.deserializeUser((user: any, done) => {
      done(null, user);
    });
    
    return; // Skip OAuth setup in development
  }

  const config = await getOidcConfig();
  
  if (!config) {
    console.error('Failed to get OIDC config in production mode');
    return;
  }

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      console.log('Authentication successful for user:', tokens.claims()?.sub);
      verified(null, user);
    } catch (error) {
      console.error('Authentication error:', error);
      verified(error);
    }
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => {
    console.log('Serializing user:', user);
    cb(null, user);
  });
  passport.deserializeUser((user: Express.User, cb) => {
    console.log('Deserializing user:', user);
    cb(null, user);
  });

  app.get("/api/login", (req, res, next) => {
    console.log('Login endpoint hit:', {
      hostname: req.hostname,
      headers: req.headers
    });
    
    // Use the first domain from REPLIT_DOMAINS as fallback for localhost or 127.0.0.1
    const domain = (req.hostname === 'localhost' || req.hostname === '127.0.0.1') ? 
      process.env.REPLIT_DOMAINS!.split(',')[0] : req.hostname;
    
    console.log('Using domain for authentication:', domain);
    console.log('Available strategies:', Object.keys((passport as any)._strategies || {}));
    
    passport.authenticate(`replitauth:${domain}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    // Use the first domain from REPLIT_DOMAINS as fallback for localhost or 127.0.0.1
    const domain = (req.hostname === 'localhost' || req.hostname === '127.0.0.1') ? 
      process.env.REPLIT_DOMAINS!.split(',')[0] : req.hostname;
    
    passport.authenticate(`replitauth:${domain}`, {
      successReturnToOrRedirect: "/dashboard",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // In development mode, bypass authentication checks
  if (isDevelopment) {
    // Ensure dev user is set up if not already
    if (!req.user) {
      req.user = {
        claims: { sub: 'dev-user-123' },
        expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      };
    }
    (req as any).isAuthenticated = () => true;
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    if (!config) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

export const isAdminAuthenticated: RequestHandler = async (req, res, next) => {
  // In development mode, bypass authentication checks and grant admin access
  if (isDevelopment) {
    // Ensure dev user is set up if not already
    if (!req.user) {
      req.user = {
        claims: { sub: 'dev-user-123' },
        expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      };
    }
    (req as any).isAuthenticated = () => true;
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if user is admin
  try {
    const userRecord = await storage.getUser(user.claims.sub);
    if (!userRecord || !userRecord.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error checking admin status" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    if (!config) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

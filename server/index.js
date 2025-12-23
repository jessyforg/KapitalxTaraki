// Load environment variables (only if .env file exists - Railway uses direct env vars)
// In Railway, environment variables are provided directly, so dotenv is optional
if (require('fs').existsSync('.env')) {
	require('dotenv').config();
}

// Import email service
const { sendPasswordResetEmail } = require('./utils/emailService');

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { createProfileViewNotification, createDocumentVerificationNotification, createStartupApplicationNotification } = require('./utils/notificationHelper');
const EventReminderService = require('./utils/eventReminderService');
const app = express();

// CORS Configuration - supports both development and production
const allowedOrigins = process.env.CORS_ORIGINS 
	? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
	: ['http://localhost:3000', 'http://localhost:5000'];

// Add development origins if in development mode
if (process.env.NODE_ENV !== 'production') {
	allowedOrigins.push(
		"http://localhost:3000",
		"http://localhost:5000",
		/^http:\/\/192\.168\.\d+\.\d+:(3000|5000)$/
	);
}

// Middleware
app.use(
	cors({
		origin: function (origin, callback) {
			// Allow requests with no origin (mobile apps, Postman, etc.)
			if (!origin) return callback(null, true);
			
			// In development, allow all local origins
			if (process.env.NODE_ENV !== 'production') {
				return callback(null, true);
			}
			
			// Check if origin is in allowed list
			if (allowedOrigins.includes(origin)) {
				return callback(null, true);
			}
			
			// Check regex patterns for development
			if (process.env.NODE_ENV !== 'production') {
				for (const pattern of allowedOrigins) {
					if (pattern instanceof RegExp && pattern.test(origin)) {
						return callback(null, true);
					}
				}
			}
			
			callback(new Error('Not allowed by CORS'));
		},
		credentials: true,
	})
);

// Add JSON parsing middleware
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
	console.error("Server error:", err);
	res.status(500).json({ error: "Internal server error" });
});

// JWT Secret - use environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
	try {
		let token = null;
		
		// First try to get token from Authorization header
		const authHeader = req.headers["authorization"];
		if (authHeader) {
			token = authHeader.split(" ")[1];
		}
		
		// If no token in header, try to get from query parameter (for file viewing/downloading)
		if (!token && req.query.token) {
			token = req.query.token;
		}
		
		if (!token) {
			return res.status(401).json({ error: "No authorization header or token provided" });
		}

		jwt.verify(token, JWT_SECRET, (err, decoded) => {
			if (err) {
				console.error("Token verification error:", err);
				if (err.name === "TokenExpiredError") {
					return res.status(401).json({ error: "Token expired" });
				}
				return res.status(403).json({ error: "Invalid token" });
			}

			// Add user info to request
			req.user = decoded;
			next();
		});
	} catch (error) {
		console.error("Authentication error:", error);
		res.status(500).json({ error: "Authentication error" });
	}
};

// Database configuration - uses environment variables
// In production (Railway), all these must be set via environment variables
// In development, defaults to localhost for local MySQL
const dbConfig = {
	host: process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? null : "localhost"),
	user: process.env.DB_USER || (process.env.NODE_ENV === 'production' ? null : "root"),
	password: process.env.DB_PASSWORD || (process.env.NODE_ENV === 'production' ? null : ""),
	database: process.env.DB_NAME || (process.env.NODE_ENV === 'production' ? null : "taraki_db"),
};

// Validate required environment variables in production
if (process.env.NODE_ENV === 'production') {
	const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
	const missing = required.filter(key => !process.env[key]);
	if (missing.length > 0) {
		console.error('❌ Missing required database environment variables:', missing.join(', '));
		console.error('   Please set these in Railway Dashboard → Variables');
		process.exit(1);
	}
}

// Debug: Log database configuration
console.log('🔍 Database Config (index.js):');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('  DB_HOST from env:', process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'NOT SET - REQUIRED!' : 'NOT SET - using default localhost'));
console.log('  Using host:', dbConfig.host);

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Now import and use the messages router
const messagesRouter = require("./routes/messages")(pool);
app.use("/api/messages", messagesRouter);

// Add search route
const searchRouter = require("./routes/search")(pool);
app.use("/api/search", searchRouter);

// Add user routes
const userRouter = require("./routes/users");
app.use("/api/users", userRouter);

// Add team routes
const teamRouter = require("./routes/team");
app.use("/api/team", teamRouter(pool));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
const messagesUploadsDir = path.join(__dirname, "uploads", "messages");
const teamUploadsDir = path.join(__dirname, "uploads", "team");

if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(messagesUploadsDir)) {
	fs.mkdirSync(messagesUploadsDir, { recursive: true });
}
if (!fs.existsSync(teamUploadsDir)) {
	fs.mkdirSync(teamUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadsDir);
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + "-" + file.originalname.replace(/\s+/g, "_"));
	},
});
const upload = multer({ storage });

// Logo upload endpoint
app.post(
	"/api/upload-logo",
	authenticateToken,
	upload.single("logo"),
	(req, res) => {
		if (!req.file) {
			return res.status(400).json({ error: "No file uploaded" });
		}
		// Return the file URL (assuming server runs at localhost:5000)
		const fileUrl = `/uploads/${req.file.filename}`;
		res.json({ url: fileUrl });
	}
);

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads/team", express.static(path.join(__dirname, "public", "uploads", "team")));

// Authentication Routes
// Helper to verify admin invite token
const verifyAdminInvite = (token) => {
	const secret = process.env.ADMIN_INVITE_SECRET || JWT_SECRET;
	return jwt.verify(token, secret);
};

app.post("/api/auth/register", async (req, res) => {
	try {
		const { first_name, last_name, email, password, role, adminInviteToken } = req.body;
		const allowedRoles = ["entrepreneur", "investor", "admin"];

		// Validate input
		if (!first_name || !last_name || !email || !password || !role) {
			return res.status(400).json({
				error: "All fields are required",
				details: {
					first_name: !first_name ? "First name is required" : null,
					last_name: !last_name ? "Last name is required" : null,
					email: !email ? "Email is required" : null,
					password: !password ? "Password is required" : null,
					role: !role ? "Role is required" : null,
				},
			});
		}
		if (!allowedRoles.includes(role)) {
			return res.status(400).json({ error: "Invalid role" });
		}

		// Enforce admin signup only via invite token
		if (role === "admin") {
			if (!adminInviteToken) {
				return res.status(403).json({ error: "Admin signup requires an invite." });
			}
			try {
				const payload = verifyAdminInvite(adminInviteToken);
				if (payload.role !== "admin") {
					return res.status(403).json({ error: "Invalid admin invite token." });
				}
				if (payload.email && payload.email.toLowerCase() !== email.toLowerCase()) {
					return res.status(403).json({ error: "This invite is tied to a different email." });
				}
			} catch (err) {
				return res.status(403).json({ error: "Invalid or expired admin invite token." });
			}
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		// Validate password length
		if (password.length < 8) {
			return res
				.status(400)
				.json({ error: "Password must be at least 8 characters long" });
		}

		// Check if user already exists
		const [existingUsers] = await pool.query(
			"SELECT * FROM users WHERE email = ?",
			[email]
		);

		if (existingUsers.length > 0) {
			return res.status(400).json({ error: "Email already registered" });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Generate verification token
		const verificationToken = Math.random().toString(36).substring(2, 15);

		// Insert new user
		const [result] = await pool.query(
			"INSERT INTO users (first_name, last_name, email, password, verification_token, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)",
			[first_name, last_name, email, hashedPassword, verificationToken, role, false]
		);

		// Insert into role-specific table
		if (role === "entrepreneur") {
			await pool.query("INSERT INTO entrepreneurs (entrepreneur_id) VALUES (?)", [
				result.insertId,
			]);
		} else if (role === "investor") {
			await pool.query(
				"INSERT INTO investors (investor_id, investment_range_min, investment_range_max) VALUES (?, 0, 0)",
				[result.insertId]
			);
		}

		// Generate JWT token
		const token = jwt.sign({ id: result.insertId, email, role }, JWT_SECRET, {
			expiresIn: "24h",
		});

		// Return success response
		res.status(201).json({
			token,
			user: {
				id: result.insertId,
				first_name,
				last_name,
				email,
				role,
				is_verified: false,
			},
		});
	} catch (error) {
		console.error("Error registering user:", error);
		res.status(500).json({
			error: "Internal server error",
			message: error.message,
		});
	}
});

app.post("/api/auth/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find user
		const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
			email,
		]);

		if (users.length === 0) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const user = users[0];

		// Verify password
		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Generate JWT token
		const token = jwt.sign(
			{ id: user.id, email: user.email, role: user.role },
			JWT_SECRET,
			{ expiresIn: "24h" }
		);

		res.json({
			token,
			user: {
				id: user.id,
				full_name: user.full_name,
				email: user.email,
				role: user.role,
				is_verified: user.is_verified,
			},
		});
	} catch (error) {
		console.error("Error logging in:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Verify email endpoint
app.post("/api/auth/verify-email", async (req, res) => {
	try {
		const { token } = req.body;

		const [result] = await pool.query(
			"UPDATE users SET is_verified = 1, verification_token = NULL WHERE verification_token = ?",
			[token]
		);

		if (result.affectedRows === 0) {
			return res.status(400).json({ error: "Invalid verification token" });
		}

		res.json({ message: "Email verified successfully" });
	} catch (error) {
		console.error("Error verifying email:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Forgot password endpoint
app.post("/api/auth/forgot-password", async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({ message: "Email is required" });
		}

		// Check if user exists
		const [users] = await pool.query(
			"SELECT id, email, first_name FROM users WHERE email = ?",
			[email]
		);

		// Don't reveal if email exists for security
		if (users.length === 0) {
			return res.json({ message: "If that email exists, a password reset link has been sent." });
		}

		const user = users[0];

		// Generate reset token
		const resetToken = Math.random().toString(36).substring(2, 15) + 
		                  Math.random().toString(36).substring(2, 15) + 
		                  Date.now().toString(36);

		// Store reset token (expires in 1 hour)
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 1);

		await pool.query(
			"UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?",
			[resetToken, expiresAt, user.id]
		);

		// Send email with reset link (non-blocking)
		// We deliberately DON'T await this, so the API responds fast
		// even if email service is slow or misconfigured.
		(async () => {
			try {
				await sendPasswordResetEmail(
					user.email,
					resetToken,
					user.first_name || user.full_name || 'User'
				);
			} catch (emailError) {
				console.error('Error sending password reset email:', emailError);
				// Don't throw - email failures shouldn't break the API response
			}
		})();

		// In development, also log the token for testing
		if (process.env.NODE_ENV === "development") {
			const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
			console.log(`Password reset token for ${email}: ${resetToken}`);
			console.log(`Reset link: ${frontendUrl}/reset-password?token=${resetToken}`);
		}

		res.json({ 
			message: "If that email exists, a password reset link has been sent.",
			// Only return token in development for testing
			...(process.env.NODE_ENV === "development" && { 
				resetToken, 
				resetLink: `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}` 
			})
		});
	} catch (error) {
		console.error("Forgot password error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Reset password endpoint
app.post("/api/auth/reset-password", async (req, res) => {
	try {
		const { token, newPassword } = req.body;

		if (!token || !newPassword) {
			return res.status(400).json({ message: "Token and new password are required" });
		}

		// Find user with valid reset token
		const [users] = await pool.query(
			"SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
			[token]
		);

		if (users.length === 0) {
			return res.status(400).json({ message: "Invalid or expired reset token" });
		}

		const user = users[0];

		// Validate password
		if (newPassword.length < 8) {
			return res.status(400).json({ message: "Password must be at least 8 characters" });
		}
		if (!/[A-Z]/.test(newPassword)) {
			return res.status(400).json({ message: "Password must contain at least one uppercase letter" });
		}
		if (!/[a-z]/.test(newPassword)) {
			return res.status(400).json({ message: "Password must contain at least one lowercase letter" });
		}
		if (!/[0-9]/.test(newPassword)) {
			return res.status(400).json({ message: "Password must contain at least one number" });
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update password and clear reset token
		await pool.query(
			"UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
			[hashedPassword, user.id]
		);

		res.json({ message: "Password reset successfully" });
	} catch (error) {
		console.error("Reset password error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// OAuth Routes (Google and Facebook)
// NOTE: These routes require passport.js to be installed
// Run: npm install passport passport-google-oauth20 passport-facebook express-session
// Then uncomment and configure the passport middleware

// Google OAuth - Redirect to Google
app.get("/api/auth/google", (req, res) => {
	const clientId = process.env.GOOGLE_CLIENT_ID;
	const redirectUri = process.env.GOOGLE_REDIRECT_URI || 
		`${process.env.OAUTH_CALLBACK_URL || 'http://localhost:5000/api/auth'}/google/callback`;
	const scope = "profile email";
	const responseType = "code";
	
	if (!clientId) {
		return res.status(500).json({ error: "Google OAuth not configured. Please set GOOGLE_CLIENT_ID in environment variables." });
	}
	
	const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
	res.redirect(googleAuthUrl);
});

// Google OAuth Callback
app.get("/api/auth/google/callback", async (req, res) => {
	try {
		const { code } = req.query;
		const clientId = process.env.GOOGLE_CLIENT_ID;
		const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
		const redirectUri = process.env.GOOGLE_REDIRECT_URI || 
			`${process.env.OAUTH_CALLBACK_URL || 'http://localhost:5000/api/auth'}/google/callback`;
		const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
		
		if (!code) {
			return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
		}
		
		// Exchange code for access token
		const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				code,
				client_id: clientId,
				client_secret: clientSecret,
				redirect_uri: redirectUri,
				grant_type: "authorization_code"
			})
		});
		
		const tokenData = await tokenResponse.json();
		
		if (!tokenData.access_token) {
			return res.redirect(`${frontendUrl}/login?error=token_failed`);
		}
		
		// Get user info from Google
		const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
			headers: { Authorization: `Bearer ${tokenData.access_token}` }
		});
		
		const googleUser = await userResponse.json();
		
		if (!googleUser.email) {
			return res.redirect(`${frontendUrl}/login?error=no_email`);
		}
		
		// Check if user exists
		const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [googleUser.email]);
		
		let user;
		let isNewUser = false;
		if (users.length > 0) {
			user = users[0];
		} else {
			// Create new user with NULL role. Frontend will prompt to pick a role.
			isNewUser = true;
			const name = googleUser.name.split(" ");
			const firstName = name[0] || "";
			const lastName = name.slice(1).join(" ") || "";
			const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
			
			const [result] = await pool.query(
				"INSERT INTO users (first_name, last_name, full_name, email, password, role, is_verified, verification_status) VALUES (?, ?, ?, ?, ?, NULL, 1, 'verified')",
				[firstName, lastName, googleUser.name, googleUser.email, hashedPassword]
			);
			
			const [newUsers] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
			user = newUsers[0];
		}
		
		// Generate JWT token
		const token = jwt.sign(
			{ id: user.id, email: user.email, role: user.role || null },
			JWT_SECRET,
			{ expiresIn: "24h" }
		);
		
		// Redirect to frontend with token and newUser flag
		const userData = { id: user.id, email: user.email, role: user.role, needsRoleSelection: isNewUser };
		res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}&newUser=${isNewUser}`);
	} catch (error) {
		console.error("Google OAuth error:", error);
		const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
		res.redirect(`${frontendUrl}/login?error=oauth_error`);
	}
});

// Facebook OAuth - Redirect to Facebook
app.get("/api/auth/facebook", (req, res) => {
	const appId = process.env.FACEBOOK_APP_ID;
	const redirectUri = process.env.FACEBOOK_REDIRECT_URI || 
		`${process.env.OAUTH_CALLBACK_URL || 'http://localhost:5000/api/auth'}/facebook/callback`;
	const scope = "email";
	
	if (!appId) {
		return res.status(500).json({ error: "Facebook OAuth not configured. Please set FACEBOOK_APP_ID in environment variables." });
	}
	
	const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
	res.redirect(facebookAuthUrl);
});

// Facebook OAuth Callback
app.get("/api/auth/facebook/callback", async (req, res) => {
	try {
		const { code } = req.query;
		const appId = process.env.FACEBOOK_APP_ID;
		const appSecret = process.env.FACEBOOK_APP_SECRET;
		const redirectUri = process.env.FACEBOOK_REDIRECT_URI || 
			`${process.env.OAUTH_CALLBACK_URL || 'http://localhost:5000/api/auth'}/facebook/callback`;
		const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
		
		if (!code) {
			return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
		}
		
		// Exchange code for access token
		const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`, {
			method: "GET"
		});
		
		const tokenData = await tokenResponse.json();
		
		if (!tokenData.access_token) {
			return res.redirect(`${frontendUrl}/login?error=token_failed`);
		}
		
		// Get user info from Facebook
		const userResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${tokenData.access_token}`);
		const facebookUser = await userResponse.json();
		
		if (!facebookUser.email) {
			return res.redirect(`${frontendUrl}/login?error=no_email`);
		}
		
		// Check if user exists
		const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [facebookUser.email]);
		
		let user;
		let isNewUser = false;
		if (users.length > 0) {
			user = users[0];
		} else {
			// Create new user with NULL role. Frontend will prompt to pick a role.
			isNewUser = true;
			const name = facebookUser.name.split(" ");
			const firstName = name[0] || "";
			const lastName = name.slice(1).join(" ") || "";
			const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
			
			const [result] = await pool.query(
				"INSERT INTO users (first_name, last_name, full_name, email, password, role, is_verified, verification_status) VALUES (?, ?, ?, ?, ?, NULL, 1, 'verified')",
				[firstName, lastName, facebookUser.name, facebookUser.email, hashedPassword]
			);
			
			const [newUsers] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
			user = newUsers[0];
		}
		
		// Generate JWT token
		const token = jwt.sign(
			{ id: user.id, email: user.email, role: user.role || null },
			JWT_SECRET,
			{ expiresIn: "24h" }
		);
		
		// Redirect to frontend with token and newUser flag
		const userData = { id: user.id, email: user.email, role: user.role, needsRoleSelection: isNewUser };
		res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}&newUser=${isNewUser}`);
	} catch (error) {
		console.error("Facebook OAuth error:", error);
		const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
		res.redirect(`${frontendUrl}/login?error=oauth_error`);
	}
});

// Generate admin invite token (admin-only)
app.post("/api/admin/invite-admin", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ error: "Only admins can invite admins" });
		}
		const { email } = req.body;
		const secret = process.env.ADMIN_INVITE_SECRET || JWT_SECRET;
		const token = jwt.sign(
			{
				role: "admin",
				email: email || undefined,
			},
			secret,
			{ expiresIn: "48h" }
		);

		const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
		const link = `${frontendUrl}/?adminInviteToken=${token}`;

		res.json({ token, link });
	} catch (error) {
		console.error("Error generating admin invite:", error);
		res.status(500).json({ error: "Failed to generate admin invite" });
	}
});

// Promote existing user to admin (admin-only)
app.post("/api/admin/users/:id/promote", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ error: "Only admins can promote admins" });
		}
		const { id } = req.params;
		const [existing] = await pool.query("SELECT id, role FROM users WHERE id = ?", [id]);
		if (existing.length === 0) {
			return res.status(404).json({ error: "User not found" });
		}
		await pool.query("UPDATE users SET role = 'admin' WHERE id = ?", [id]);
		res.json({ message: "User promoted to admin" });
	} catch (error) {
		console.error("Error promoting user to admin:", error);
		res.status(500).json({ error: "Failed to promote user" });
	}
});

// Set user role endpoint (for OAuth users)
app.post("/api/users/:id/set-role", authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const { role } = req.body;

		// Validate role
		const allowedRoles = ["entrepreneur", "investor", "admin"];
		if (!role || !allowedRoles.includes(role)) {
			return res.status(400).json({ error: "Invalid role" });
		}

		// Check if user exists
		const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
		if (users.length === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		// Allow setting/overwriting the role (used for OAuth role selection)

		// Update user role
		await pool.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);

		// Insert into role-specific table
		if (role === "entrepreneur") {
			// Check if already exists
			const [existing] = await pool.query("SELECT * FROM entrepreneurs WHERE entrepreneur_id = ?", [id]);
			if (existing.length === 0) {
				await pool.query("INSERT INTO entrepreneurs (entrepreneur_id) VALUES (?)", [id]);
			}
		} else if (role === "investor") {
			// Check if already exists
			const [existing] = await pool.query("SELECT * FROM investors WHERE investor_id = ?", [id]);
			if (existing.length === 0) {
				await pool.query("INSERT INTO investors (investor_id, investment_range_min, investment_range_max) VALUES (?, 0, 0)", [id]);
			}
		}

		// Get updated user
		const [updatedUsers] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
		
		res.json({ 
			message: "Role set successfully",
			user: updatedUsers[0]
		});
	} catch (error) {
		console.error("Error setting user role:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// GET user profile with new structure
app.get("/api/user/:id", authenticateToken, async (req, res) => {
	try {
		const [userRows] = await pool.query(
			`SELECT id, first_name, last_name, email, role, is_verified, verification_status, 
              profile_image, profile_picture_url, location, introduction, 
              gender, birthdate, contact_number, public_email, industry, 
              show_in_search, show_in_messages, show_in_pages, created_at, updated_at
       FROM users WHERE id = ?`,
			[req.params.id]
		);
		if (!userRows[0]) {
			return res.status(404).json({ error: "User not found" });
		}
		// Get employment info (return all as array)
		const [employmentRows] = await pool.query(
			"SELECT company, title, industry, hire_date, employment_type FROM employment WHERE user_id = ?",
			[req.params.id]
		);
		// Get academic profile
		const [academicRows] = await pool.query(
			"SELECT level, course, institution, address, graduation_date FROM academic_profile WHERE user_id = ?",
			[req.params.id]
		);
		// Get social links
		const [socialRows] = await pool.query(
			"SELECT facebook_url, twitter_url, instagram_url, linkedin_url, microsoft_url, whatsapp_url, telegram_url FROM user_social_links WHERE user_id = ?",
			[req.params.id]
		);
		// Get user preferences
		const [preferencesRows] = await pool.query(
			"SELECT position_desired, preferred_industries, preferred_startup_stage, preferred_location, skills FROM user_preferences WHERE user_id = ?",
			[req.params.id]
		);

		// Parse JSON fields safely
		let parsedLocation = userRows[0].location;
		let parsedPreferredLocation = null;
		let parsedPreferredIndustries = [];
		let parsedSkills = [];

		// Parse location from users table
		if (parsedLocation && typeof parsedLocation === 'string') {
			try {
				parsedLocation = JSON.parse(parsedLocation);
			} catch (e) {
				// Keep as string if not valid JSON
			}
		}

		// Parse preferences if they exist
		if (preferencesRows[0]) {
			const prefs = preferencesRows[0];
			
			// Parse preferred_location
			if (prefs.preferred_location && typeof prefs.preferred_location === 'string') {
				try {
					parsedPreferredLocation = JSON.parse(prefs.preferred_location);
				} catch (e) {
					parsedPreferredLocation = prefs.preferred_location;
				}
			} else {
				parsedPreferredLocation = prefs.preferred_location;
			}

			// Parse preferred_industries
			if (prefs.preferred_industries && typeof prefs.preferred_industries === 'string') {
				try {
					parsedPreferredIndustries = JSON.parse(prefs.preferred_industries);
				} catch (e) {
					parsedPreferredIndustries = [];
				}
			} else if (Array.isArray(prefs.preferred_industries)) {
				parsedPreferredIndustries = prefs.preferred_industries;
			}

			// Parse skills
			if (prefs.skills && typeof prefs.skills === 'string') {
				try {
					parsedSkills = JSON.parse(prefs.skills);
				} catch (e) {
					parsedSkills = [];
				}
			} else if (Array.isArray(prefs.skills)) {
				parsedSkills = prefs.skills;
			}
		}

		// Combine all data
		const userData = {
			...userRows[0],
			location: parsedLocation,
			employment: employmentRows || [],
			academic_profile: academicRows || [],
			social_links: socialRows[0] || {},
			// Add preferences data
			position_desired: preferencesRows[0]?.position_desired || null,
			preferred_industries: parsedPreferredIndustries,
			preferred_startup_stage: preferencesRows[0]?.preferred_startup_stage || null,
			preferred_location: parsedPreferredLocation,
			skills: parsedSkills
		};

		// Create profile view notification (only if viewing someone else's profile)
		const viewedUserId = parseInt(req.params.id);
		const viewerUserId = req.user.id;
		
		if (viewedUserId !== viewerUserId) {
			try {
				// Check if we already sent a profile view notification recently (within last hour)
				const [existingNotification] = await pool.query(
					`SELECT notification_id FROM notifications 
					 WHERE user_id = ? AND sender_id = ? AND type = 'profile_view' 
					 AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
					 ORDER BY created_at DESC LIMIT 1`,
					[viewedUserId, viewerUserId]
				);
				
				// Only create notification if none exists in the last hour
				if (!existingNotification || existingNotification.length === 0) {
					// Get viewer and profile owner info to determine context
					const [viewerInfo] = await pool.query(
						'SELECT CONCAT(first_name, " ", last_name) as full_name, role FROM users WHERE id = ?',
						[viewerUserId]
					);
					const [profileOwnerInfo] = await pool.query(
						'SELECT role FROM users WHERE id = ?',
						[viewedUserId]
					);
					
					if (viewerInfo[0] && profileOwnerInfo[0]) {
						// Determine context based on roles (works for all user types)
						let context = 'profile';
						if (viewerInfo[0].role === 'investor' && profileOwnerInfo[0].role === 'entrepreneur') {
							context = 'startup';
						} else if (viewerInfo[0].role === 'entrepreneur' && profileOwnerInfo[0].role === 'investor') {
							context = 'investor';
						} else if (viewerInfo[0].role === 'admin') {
							context = 'admin_view';
						} else if (profileOwnerInfo[0].role === 'admin') {
							context = 'admin_profile';
						}
						
						await createProfileViewNotification(pool, {
							profile_owner_id: viewedUserId,
							viewer_id: viewerUserId,
							viewer_name: viewerInfo[0].full_name,
							viewer_role: viewerInfo[0].role,
							context: context
						});
					}
				}
			} catch (notificationError) {
				console.error('Error creating profile view notification:', notificationError);
				// Don't fail profile view if notification fails
			}
		}

		res.json(userData);
	} catch (error) {
		console.error("Error getting user profile:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// PUT user profile with new structure
app.put("/api/user/:id", authenticateToken, async (req, res) => {
	try {
		const {
			first_name,
			last_name,
			email,
			profile_image,
			birthdate,
			gender,
			contact_number,
			location,
			introduction,
			industry,
			employment,
			academic_profile,
			social_links,
			show_in_search,
			show_in_messages,
			show_in_pages,
			skills,
			position_desired,
			preferred_industries,
			preferred_startup_stage,
			preferred_location,
		} = req.body;
		await pool.query("START TRANSACTION");
		try {
			// Convert location object to JSON string if it's an object
			const locationData = location && typeof location === 'object' ? JSON.stringify(location) : location;
			
			// Update user basic info
			await pool.query(
				`UPDATE users SET 
          first_name = ?, last_name = ?, email = ?, profile_image = ?,
          birthdate = ?, gender = ?, contact_number = ?, location = ?,
          introduction = ?, industry = ?, show_in_search = ?,
          show_in_messages = ?, show_in_pages = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
				[
					first_name,
					last_name,
					email,
					profile_image,
					birthdate,
					gender,
					contact_number,
					locationData,
					introduction,
					industry,
					show_in_search,
					show_in_messages,
					show_in_pages,
					req.params.id,
				]
			);
			// Update employment (support array)
			if (employment && Array.isArray(employment)) {
				await pool.query("DELETE FROM employment WHERE user_id = ?", [req.params.id]);
				for (const emp of employment) {
					await pool.query(
						`INSERT INTO employment (user_id, company, title, industry, hire_date, employment_type)
             VALUES (?, ?, ?, ?, ?, ?)`,
						[
							req.params.id,
							emp.company,
							emp.title,
							emp.industry,
							emp.hire_date,
							emp.employment_type,
						]
					);
				}
			} else if (employment) {
				// Fallback for single object
				await pool.query(
					`INSERT INTO employment (user_id, company, title, industry, hire_date, employment_type)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           company = VALUES(company),
           title = VALUES(title),
           industry = VALUES(industry),
           hire_date = VALUES(hire_date),
           employment_type = VALUES(employment_type)`,
					[
						req.params.id,
						employment.company,
						employment.title,
						employment.industry,
						employment.hire_date,
						employment.employment_type,
					]
				);
			}
			// Update academic profile
			if (academic_profile && academic_profile.length > 0) {
				await pool.query("DELETE FROM academic_profile WHERE user_id = ?", [
					req.params.id,
				]);
				for (const profile of academic_profile) {
					await pool.query(
						`INSERT INTO academic_profile 
             (user_id, level, course, institution, address, graduation_date)
             VALUES (?, ?, ?, ?, ?, ?)`,
						[
							req.params.id,
							profile.level,
							profile.course,
							profile.institution,
							profile.address,
							profile.graduation_date,
						]
					);
				}
			}
			// Update social links
			if (social_links) {
				await pool.query(
					`INSERT INTO user_social_links 
           (user_id, facebook_url, twitter_url, instagram_url, linkedin_url, 
            microsoft_url, whatsapp_url, telegram_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           facebook_url = VALUES(facebook_url),
           twitter_url = VALUES(twitter_url),
           instagram_url = VALUES(instagram_url),
           linkedin_url = VALUES(linkedin_url),
           microsoft_url = VALUES(microsoft_url),
           whatsapp_url = VALUES(whatsapp_url),
           telegram_url = VALUES(telegram_url)`,
					[
						req.params.id,
						social_links.facebook_url,
						social_links.twitter_url,
						social_links.instagram_url,
						social_links.linkedin_url,
						social_links.microsoft_url,
						social_links.whatsapp_url,
						social_links.telegram_url,
					]
				);
			}
			// Update user skills
			if (Array.isArray(skills)) {
				await pool.query("DELETE FROM user_skills WHERE user_id = ?", [req.params.id]);
				for (const skill of skills) {
					await pool.query(
						"INSERT INTO user_skills (user_id, skill_name, skill_level) VALUES (?, ?, ?)",
						[req.params.id, skill, "intermediate"]
					);
				}
			}
			// Update user preferences
			if (
				position_desired !== undefined ||
				preferred_industries !== undefined ||
				preferred_startup_stage !== undefined ||
				preferred_location !== undefined
			) {
				// Convert preferred_location object to JSON string if it's an object
				const preferredLocationData = preferred_location && typeof preferred_location === 'object' ? 
					JSON.stringify(preferred_location) : preferred_location;
				
				await pool.query(
					`INSERT INTO user_preferences (user_id, position_desired, preferred_industries, preferred_startup_stage, preferred_location)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             position_desired = VALUES(position_desired),
             preferred_industries = VALUES(preferred_industries),
             preferred_startup_stage = VALUES(preferred_startup_stage),
             preferred_location = VALUES(preferred_location)`,
					[
						req.params.id,
						position_desired || null,
						preferred_industries ? JSON.stringify(preferred_industries) : null,
						preferred_startup_stage || null,
						preferredLocationData || null,
					]
				);
			}
			await pool.query("COMMIT");
			// Fetch and return the latest profile
			const [userRows] = await pool.query(
				`SELECT id, first_name, last_name, email, role, is_verified, verification_status, 
                profile_image, profile_picture_url, location, introduction, 
                gender, birthdate, contact_number, public_email, industry, 
                show_in_search, show_in_messages, show_in_pages, created_at, updated_at
         FROM users WHERE id = ?`,
				[req.params.id]
			);
			const [employmentRows] = await pool.query(
				"SELECT company, title, industry, hire_date, employment_type FROM employment WHERE user_id = ?",
				[req.params.id]
			);
			const [academicRows] = await pool.query(
				"SELECT level, course, institution, address, graduation_date FROM academic_profile WHERE user_id = ?",
				[req.params.id]
			);
			const [socialRows] = await pool.query(
				"SELECT facebook_url, twitter_url, instagram_url, linkedin_url, microsoft_url, whatsapp_url, telegram_url FROM user_social_links WHERE user_id = ?",
				[req.params.id]
			);
			const userData = {
				...userRows[0],
				employment: employmentRows[0] || null,
				academic_profile: academicRows || [],
				social_links: socialRows[0] || {},
			};
			res.json(userData);
		} catch (error) {
			await pool.query("ROLLBACK");
			throw error;
		}
	} catch (error) {
		console.error("Error updating user profile:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Password update endpoint
app.put("/api/user/:id/password", authenticateToken, async (req, res) => {
	try {
		const { current_password, new_password } = req.body;
		const userId = req.params.id;

		// Validate input
		if (!current_password || !new_password) {
			return res
				.status(400)
				.json({ error: "Current password and new password are required" });
		}

		// Get user's current password
		const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);

		if (users.length === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		const user = users[0];

		// Verify current password
		const validPassword = await bcrypt.compare(current_password, user.password);
		if (!validPassword) {
			return res.status(401).json({ error: "Current password is incorrect" });
		}

		// Validate new password
		if (new_password.length < 8 || new_password.length > 20) {
			return res
				.status(400)
				.json({ error: "Password must be between 8 and 20 characters" });
		}

		if (!/[a-z]/.test(new_password)) {
			return res
				.status(400)
				.json({ error: "Password must contain at least one lowercase character" });
		}

		if (!/[A-Z]/.test(new_password)) {
			return res
				.status(400)
				.json({ error: "Password must contain at least one uppercase character" });
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(new_password, 10);

		// Update password
		const [result] = await pool.query(
			"UPDATE users SET password = ? WHERE id = ?",
			[hashedPassword, userId]
		);

		if (result.affectedRows === 0) {
			return res.status(500).json({ error: "Failed to update password" });
		}

		res.json({
			success: true,
			message: "Password updated successfully",
			user: {
				id: user.id,
				email: user.email,
				first_name: user.first_name,
				last_name: user.last_name,
			},
		});
	} catch (error) {
		console.error("Error updating password:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Add profile image endpoint
app.put("/api/user/:id/profile-image", authenticateToken, async (req, res) => {
	try {
		const { profileImage } = req.body;
		const userId = req.params.id;

		if (!profileImage) {
			console.error(
				"[Profile Image Update] No profileImage provided in request body:",
				req.body
			);
			return res.status(400).json({ error: "Profile image data is required" });
		}

		// Update both profile_image and profile_picture_url columns
		const [result] = await pool.query(
			"UPDATE users SET profile_image = ?, profile_picture_url = ? WHERE id = ?",
			[profileImage, profileImage, userId]
		);

		if (result.affectedRows === 0) {
			console.error(`[Profile Image Update] No user found with id: ${userId}`);
			return res.status(404).json({ error: "User not found" });
		}

		// Get updated user data
		const [user] = await pool.query(
			"SELECT id, full_name, email, profile_image, profile_picture_url FROM users WHERE id = ?",
			[userId]
		);

		res.json({
			message: "Profile image updated successfully",
			user: user[0],
		});
	} catch (error) {
		console.error(
			"[Profile Image Update] Error updating profile image:",
			error,
			"\nRequest body:",
			req.body
		);
		res
			.status(500)
			.json({ error: "Failed to update profile image", details: error.message });
	}
});

// Add social links endpoint
app.get("/api/user/:id/social-links", authenticateToken, async (req, res) => {
	try {
		const [rows] = await pool.query(
			`SELECT facebook_url, twitter_url, instagram_url, linkedin_url 
       FROM users WHERE id = ?`,
			[req.params.id]
		);
		res.json(rows[0] || {});
	} catch (error) {
		console.error("Error getting social links:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Temporary endpoint to hash password
app.post("/api/hash-password", async (req, res) => {
	try {
		const { password } = req.body;
		const hashedPassword = await bcrypt.hash(password, 10);
		res.json({
			original: password,
			hashed: hashedPassword,
		});
	} catch (error) {
		console.error("Error hashing password:", error);
		res.status(500).json({ error: "Failed to hash password" });
	}
});

// Create Startup endpoint
app.post("/api/startups", authenticateToken, async (req, res) => {
	try {
		const {
			name,
			industry,
			description,
			location,
			funding_needed,
			pitch_deck_url,
			business_plan_url,
			logo_url,
			video_url,
			funding_stage,
			website,
			startup_stage,
		} = req.body;

		// Validate required fields
		if (!name || !industry) {
			return res.status(400).json({ error: "Name and industry are required" });
		}

		// Insert into startups table with explicit pending status
		// COMMENTED OUT FOR TESTING - TO BE RESTORED LATER
		// const [result] = await pool.query(
		// 	`INSERT INTO startups 
		//   (entrepreneur_id, name, industry, description, location, funding_needed, 
		//    pitch_deck_url, business_plan_url, logo_url, video_url, funding_stage, 
		//    website, startup_stage, approval_status, created_at, updated_at)
		//  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
		// 	[
		// 		req.user.id,
		// 		name,
		// 		industry,
		// 		description,
		// 		location,
		// 		funding_needed,
		// 		pitch_deck_url,
		// 		business_plan_url,
		// 		logo_url,
		// 		video_url,
		// 		funding_stage,
		// 		website,
		// 		startup_stage,
		// 	]
		// );

		// AUTOMATIC APPROVAL FOR TESTING - TO BE RESTORED LATER
		// Insert into startups table with automatic approved status
		const [result] = await pool.query(
			`INSERT INTO startups 
        (entrepreneur_id, name, industry, description, location, funding_needed, 
         pitch_deck_url, business_plan_url, logo_url, video_url, funding_stage, 
         website, startup_stage, approval_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', NOW(), NOW())`,
			[
				req.user.id,
				name,
				industry,
				description,
				location,
				funding_needed,
				pitch_deck_url,
				business_plan_url,
				logo_url,
				video_url,
				funding_stage,
				website,
				startup_stage,
			]
		);

		// Send startup application notification
		// COMMENTED OUT FOR TESTING - TO BE RESTORED LATER
		// try {
		// 	await createStartupApplicationNotification(pool, {
		// 		entrepreneur_id: req.user.id,
		// 		startup_name: name,
		// 		application_status: 'under_review'
		// 	});
		// } catch (notificationError) {
		// 	console.error('Error creating startup application notification:', notificationError);
		// }
		// AUTOMATIC APPROVAL NOTIFICATION FOR TESTING
		try {
			await createStartupApplicationNotification(pool, {
				entrepreneur_id: req.user.id,
				startup_name: name,
				application_status: 'approved'
			});
		} catch (notificationError) {
			console.error('Error creating startup application notification:', notificationError);
		}

		res.status(201).json({
			message: "Startup created successfully",
			startup_id: result.insertId,
		});
	} catch (error) {
		console.error("Error creating startup:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Get startups with visibility control
app.get("/api/startups", authenticateToken, async (req, res) => {
	try {
		const userId = req.user.id;
		const userRole = req.user.role;

		let query = `
      SELECT s.*, 
             CONCAT(u.first_name, ' ', u.last_name) as entrepreneur_name,
             u.email as entrepreneur_email
      FROM startups s
      JOIN users u ON s.entrepreneur_id = u.id
      WHERE 1=1
    `;
		const params = [];

    // If not admin, only show approved startups or user's own startups
    // COMMENTED OUT FOR TESTING - show all startups without approval gating
    // if (userRole !== "admin") {
    //   query += ` AND (s.approval_status = 'approved' OR s.entrepreneur_id = ?)`;
    //   params.push(userId);
    // }

		// Add filters if provided
		if (req.query.industry) {
			query += ` AND s.industry LIKE ?`;
			params.push(`%${req.query.industry}%`);
		}
		if (req.query.location) {
			query += ` AND s.location LIKE ?`;
			params.push(`%${req.query.location}%`);
		}
		if (req.query.funding_stage) {
			query += ` AND s.funding_stage = ?`;
			params.push(req.query.funding_stage);
		}

		query += ` ORDER BY s.created_at DESC`;

		console.log("DEBUG: /api/startups SQL:", query);
		console.log("DEBUG: /api/startups params:", params);

		const [rows] = await pool.query(query, params);
		console.log("DEBUG: /api/startups result:", rows);
		res.json(rows);
	} catch (error) {
		console.error("Error fetching startups:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});



// Get all investors
app.get("/api/users/role/investor", authenticateToken, async (req, res) => {
	try {
		// Only return investors with verification_status = 'verified'
		// COMMENTED OUT FOR TESTING - TO BE RESTORED LATER
		// const [rows] = await pool.query(`
		//   SELECT u.*, i.preferred_industries, i.preferred_locations, i.funding_stage_preferences,
		//          up.preferred_location
		//   FROM users u
		//   LEFT JOIN investors i ON u.id = i.investor_id
		//   LEFT JOIN user_preferences up ON u.id = up.user_id
		//   WHERE u.role = 'investor' 
		//   AND u.verification_status = 'verified'
		//   AND u.show_in_search = 1
		// `);
		// Return all investors regardless of verification status
		const [rows] = await pool.query(`
      SELECT u.*, i.preferred_industries, i.preferred_locations, i.funding_stage_preferences,
             up.preferred_location
      FROM users u
      LEFT JOIN investors i ON u.id = i.investor_id
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.role = 'investor' 
      AND u.show_in_search = 1
    `);

		// Fetch skills for each investor (gracefully handle if user_skills table doesn't exist)
		const investorIds = rows.map(u => u.id);
		let skillsMap = {};
		if (investorIds.length > 0) {
			try {
				const [skillsRows] = await pool.query(
					`SELECT user_id, skill_name, skill_level FROM user_skills WHERE user_id IN (${investorIds.map(() => '?').join(',')})`,
					investorIds
				);
				skillsMap = skillsRows.reduce((acc, skill) => {
					if (!acc[skill.user_id]) acc[skill.user_id] = [];
					acc[skill.user_id].push(skill.skill_name);
					return acc;
				}, {});
			} catch (skillsError) {
				console.warn('user_skills table not found, skipping skills:', skillsError.message);
				skillsMap = {};
			}
		}

		const investors = rows.map((u) => {
			// Handle double-encoded JSON for preferred_industries
			let preferredIndustries = [];
			if (u.preferred_industries) {
				try {
					let parsed = JSON.parse(u.preferred_industries);
					// If it's still a string, parse again (double-encoded)
					if (typeof parsed === 'string') {
						parsed = JSON.parse(parsed);
					}
					preferredIndustries = Array.isArray(parsed) ? parsed : [];
				} catch (e) {
					console.warn(`Error parsing preferred_industries for investor ${u.id}:`, e.message);
					preferredIndustries = [];
				}
			}

			return {
				id: u.id,
				name: `${u.first_name} ${u.last_name}`,
				email: u.email,
				bio: u.introduction || "",
				profile_image: u.profile_image || null,
				industry: u.industry,
				location: u.location,
				preferred_location: u.preferred_location,
				preferred_industries: preferredIndustries,
				preferred_locations: u.preferred_locations
					? JSON.parse(u.preferred_locations)
					: [],
				funding_stage_preferences: u.funding_stage_preferences
					? JSON.parse(u.funding_stage_preferences)
					: [],
				skills: skillsMap[u.id] || [],
			};
		});

		res.json(investors);
	} catch (error) {
		console.error("Error fetching investors:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Create a match between investor and startup
app.post("/api/investor/match", authenticateToken, async (req, res) => {
	try {
		const investor_id = req.user.id;
		const { startup_id, match_score } = req.body;
		// Prevent duplicate matches
		const [existing] = await pool.query(
			"SELECT * FROM matches WHERE investor_id = ? AND startup_id = ?",
			[investor_id, startup_id]
		);
		if (existing.length > 0) {
			return res.status(400).json({ error: "Already matched" });
		}
		// Insert match
		const [result] = await pool.query(
			"INSERT INTO matches (startup_id, investor_id, match_score) VALUES (?, ?, ?)",
			[startup_id, investor_id, match_score || 0]
		);
		// Get entrepreneur_id and names for notification
		const [[startup]] = await pool.query(
			"SELECT entrepreneur_id, name FROM startups WHERE startup_id = ?",
			[startup_id]
		);
		const [[investor]] = await pool.query(
			"SELECT full_name FROM users WHERE id = ?",
			[investor_id]
		);
		// Notify entrepreneur
		await pool.query(
			`INSERT INTO notifications (user_id, sender_id, type, message, status, created_at)
       VALUES (?, ?, 'investor_match', ?, 'unread', NOW())`,
			[
				startup.entrepreneur_id,
				investor_id,
				`Investor ${investor.full_name} matched with your startup "${startup.name}".`,
			]
		);
		// Notify investor
		await pool.query(
			`INSERT INTO notifications (user_id, sender_id, type, message, status, created_at)
       VALUES (?, ?, 'startup_match', ?, 'unread', NOW())`,
			[
				investor_id,
				startup.entrepreneur_id,
				`You matched with the startup "${startup.name}".`,
			]
		);
		res
			.status(201)
			.json({
				message: "Match created and notifications sent",
				match_id: result.insertId,
			});
	} catch (error) {
		console.error("Error creating match:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Get all matches for the logged-in user (investor or entrepreneur)
app.get("/api/matches", authenticateToken, async (req, res) => {
	try {
		const userId = req.user.id;
		const userRole = req.user.role;
		const { type } = req.query; // 'investor' or 'entrepreneur'
		
		let query;
		let params = [userId];
		
		if (type === 'entrepreneur' || userRole === 'entrepreneur') {
			// Get matches for entrepreneur - show investors who matched with their startups
			query = `
				SELECT m.*, i.*, u.first_name, u.last_name, 
				       CONCAT(u.first_name, ' ', u.last_name) as investor_name,
				       s.name as startup_name, s.startup_id
				FROM matches m
				JOIN startups s ON m.startup_id = s.startup_id
				JOIN investors i ON m.investor_id = i.investor_id
				JOIN users u ON i.investor_id = u.id
				WHERE s.entrepreneur_id = ?
				ORDER BY m.created_at DESC
			`;
		} else {
			// Get matches for investor
			query = "SELECT * FROM matches WHERE investor_id = ?";
		}
		
		const [rows] = await pool.query(query, params);
		res.json(rows);
	} catch (error) {
		console.error("Error fetching matches:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Get all matched startups for the logged-in investor (with startup details)
app.get("/api/investor/matches", authenticateToken, async (req, res) => {
	try {
		const investor_id = req.user.id;
		const [rows] = await pool.query(
			`SELECT s.*, m.match_score, m.created_at as matched_at, m.match_id
       FROM matches m
       JOIN startups s ON m.startup_id = s.startup_id
       WHERE m.investor_id = ? /*AND s.approval_status = 'approved'*/
       ORDER BY m.created_at DESC`,
			[investor_id]
		);
		

		
		res.json(rows);
	} catch (error) {
		console.error("Error fetching matched startups:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Get startups available for matching (not already matched, only approved, with filters)
app.get(
	"/api/investor/available-startups",
	authenticateToken,
	async (req, res) => {
		try {
			const investor_id = req.user.id;
			const { industry, location, funding_stage } = req.query;
			// let filter = "WHERE s.approval_status = 'approved' AND s.startup_id NOT IN (SELECT startup_id FROM matches WHERE investor_id = ?)";
			let filter =
				"WHERE s.startup_id NOT IN (SELECT startup_id FROM matches WHERE investor_id = ?)";
			let params = [investor_id];
			if (industry) {
				filter += " AND s.industry LIKE ?";
				params.push(`%${industry}%`);
			}
			if (location) {
				filter += " AND s.location LIKE ?";
				params.push(`%${location}%`);
			}
			if (funding_stage) {
				filter += " AND s.funding_stage = ?";
				params.push(funding_stage);
			}
			const [rows] = await pool.query(
				`SELECT s.* FROM startups s ${filter} ORDER BY s.created_at DESC`,
				params
			);
			res.json(rows);
		} catch (error) {
			console.error("Error fetching available startups:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Unmatch a startup
app.delete(
	"/api/investor/unmatch/:startup_id",
	authenticateToken,
	async (req, res) => {
		try {
			const investor_id = req.user.id;
			const { startup_id } = req.params;
			await pool.query(
				"DELETE FROM matches WHERE investor_id = ? AND startup_id = ?",
				[investor_id, startup_id]
			);
			res.json({ message: "Unmatched successfully" });
		} catch (error) {
			console.error("Error unmatching:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Get all entrepreneurs (exclude logged-in user)
app.get("/api/entrepreneurs", authenticateToken, async (req, res) => {
	try {
		// Only return verified entrepreneurs
		// COMMENTED OUT FOR TESTING - TO BE RESTORED LATER
		// const [rows] = await pool.query(
		// 	'SELECT id, first_name, last_name, email, introduction, profile_image, industry FROM users WHERE role = ? AND id != ? AND verification_status = "verified"',
		// 	["entrepreneur", req.user.id]
		// );
		// Return all entrepreneurs regardless of verification status
		const [rows] = await pool.query(
			'SELECT id, first_name, last_name, email, introduction, profile_image, industry FROM users WHERE role = ? AND id != ?',
			["entrepreneur", req.user.id]
		);
		const entrepreneurs = rows.map((u) => ({
			id: u.id,
			name: `${u.first_name} ${u.last_name}`,
			email: u.email,
			bio: u.introduction || "",
			profile_image: u.profile_image || null,
			industry: u.industry || "",
		}));
		res.json(entrepreneurs);
	} catch (error) {
		console.error("Error fetching entrepreneurs:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Get single startup details
app.get("/api/startups/:id", async (req, res) => {
	try {
		const [rows] = await pool.query("SELECT * FROM startups WHERE startup_id = ?", [
			req.params.id,
		]);
		if (!rows[0]) return res.status(404).json({ error: "Startup not found" });
		res.json(rows[0]);
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
	}
});

// Update startup (only creator)
app.put(
	"/api/startups/:id",
	authenticateToken,
	upload.single("logo"),
	async (req, res) => {
		try {
			const {
				name,
				industry,
				description,
				location,
				website,
				pitch_deck_url,
				business_plan_url,
				funding_stage,
				startup_stage,
			} = req.body;
			// Check ownership
			const [rows] = await pool.query("SELECT * FROM startups WHERE startup_id = ?", [
				req.params.id,
			]);
			if (!rows[0]) return res.status(404).json({ error: "Startup not found" });
			if (rows[0].entrepreneur_id !== req.user.id)
				return res.status(403).json({ error: "Not authorized" });

			let logo_url = rows[0].logo_url;
			if (req.file) {
				logo_url = `/uploads/${req.file.filename}`;
				// Optionally: delete old logo file here
			}

			await pool.query(
				`UPDATE startups SET name=?, industry=?, description=?, location=?, website=?, pitch_deck_url=?, business_plan_url=?, logo_url=?, funding_stage=?, startup_stage=? WHERE startup_id=?`,
				[
					name,
					industry,
					description,
					location,
					website,
					pitch_deck_url,
					business_plan_url,
					logo_url,
					funding_stage,
					startup_stage,
					req.params.id,
				]
			);
			res.json({ success: true });
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Add this route after authentication middleware is set up
app.get("/api/users/:id/preferences", authenticateToken, async (req, res) => {
	try {
		const [rows] = await pool.query(
			"SELECT * FROM user_preferences WHERE user_id = ?",
			[req.params.id]
		);
		if (!rows[0]) {
			return res.json({}); // Fallback: return empty object if not found
		}
		res.json(rows[0]);
	} catch (error) {
		console.error("Error fetching user preferences:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Get all users endpoint
app.get("/api/users", authenticateToken, async (req, res) => {
	try {
		const [users] = await pool.query(`
      SELECT id, first_name, last_name, full_name, email, role, is_verified, is_suspended,
             location, industry, created_at, verification_status
      FROM users
      ORDER BY created_at DESC
    `);
		
		res.json(users);
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Set up multer for file uploads
const verificationUpload = multer({
	dest: "uploads/verification_documents/",
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
	fileFilter: (req, file, cb) => {
		const allowed = ["application/pdf", "image/jpeg", "image/png"];
		if (allowed.includes(file.mimetype)) cb(null, true);
		else cb(new Error("Invalid file type."));
	},
});

// GET verification status and documents
app.get("/api/verification/status", authenticateToken, async (req, res) => {
	try {
		const user_id = req.user.id;
		// Get user status
		const [[user]] = await pool.query(
			"SELECT verification_status FROM users WHERE id = ?",
			[user_id]
		);
		// Get all documents
		const [documents] = await pool.query(
			"SELECT * FROM verification_documents WHERE user_id = ? ORDER BY uploaded_at DESC",
			[user_id]
		);
		res.json({
			verification_status: user?.verification_status || "pending",
			documents,
		});
	} catch (error) {
		console.error("Error fetching verification status:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// POST upload verification document
app.post(
	"/api/verification/upload",
	authenticateToken,
	verificationUpload.single("document"),
	async (req, res) => {
		try {
			const user_id = req.user.id;
			const {
				document_type,
				document_number,
				issue_date,
				expiry_date,
				issuing_authority,
			} = req.body;
			const file = req.file;
			if (!file) return res.status(400).json({ error: "No file uploaded" });
			// Move file to permanent location with unique name
			const ext = path.extname(file.originalname);
			const newFileName = `${Date.now()}_${user_id}${ext}`;
			const newPath = path.join("uploads/verification_documents/", newFileName);
			fs.renameSync(file.path, newPath);
			// Insert document record
			await pool.query(
				`INSERT INTO verification_documents (user_id, document_type, document_number, issue_date, expiry_date, issuing_authority, file_name, file_path, file_type, file_size, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
				[
					user_id,
					document_type,
					document_number,
					issue_date || null,
					expiry_date || null,
					issuing_authority,
					newFileName,
					newPath,
					file.mimetype,
					file.size,
				]
			);
			// Update user verification status
			const [[counts]] = await pool.query(
				`SELECT 
        COUNT(CASE WHEN status = 'not approved' THEN 1 END) as not_approved_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count
      FROM verification_documents WHERE user_id = ?`,
				[user_id]
			);
			let new_status = "pending";
			if (counts.not_approved_count > 0) new_status = "not approved";
			else if (counts.pending_count > 0) new_status = "pending";
			else if (
				counts.approved_count > 0 &&
				counts.approved_count ===
					counts.not_approved_count + counts.pending_count + counts.approved_count
			)
				new_status = "verified";
			await pool.query("UPDATE users SET verification_status = ? WHERE id = ?", [
				new_status,
				user_id,
			]);
			res.json({ success: true });
		} catch (error) {
			console.error("Error uploading verification document:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// PUT update verification document
app.put(
	"/api/verification/document/:id",
	authenticateToken,
	verificationUpload.single("document"),
	async (req, res) => {
		try {
			const user_id = req.user.id;
			const doc_id = req.params.id;
			// Get the document
			const [[doc]] = await pool.query(
				"SELECT * FROM verification_documents WHERE document_id = ?",
				[doc_id]
			);
			if (!doc) return res.status(404).json({ error: "Document not found" });
			if (doc.user_id !== user_id)
				return res.status(403).json({ error: "Not authorized" });

			// Prepare update fields
			const {
				document_type,
				document_number,
				issue_date,
				expiry_date,
				issuing_authority,
			} = req.body;
			let file_name = doc.file_name;
			let file_path = doc.file_path;
			let file_type = doc.file_type;
			let file_size = doc.file_size;
			// If new file uploaded, replace old file
			if (req.file) {
				// Delete old file
				if (fs.existsSync(doc.file_path)) {
					fs.unlinkSync(doc.file_path);
				}
				const ext = path.extname(req.file.originalname);
				const newFileName = `${Date.now()}_${user_id}${ext}`;
				const newPath = path.join("uploads/verification_documents/", newFileName);
				fs.renameSync(req.file.path, newPath);
				file_name = newFileName;
				file_path = newPath;
				file_type = req.file.mimetype;
				file_size = req.file.size;
			}
			// Update document
			await pool.query(
				`UPDATE verification_documents SET document_type=?, document_number=?, issue_date=?, expiry_date=?, issuing_authority=?, file_name=?, file_path=?, file_type=?, file_size=?, status='pending', rejection_reason=NULL WHERE document_id=?`,
				[
					document_type,
					document_number,
					issue_date || null,
					expiry_date || null,
					issuing_authority,
					file_name,
					file_path,
					file_type,
					file_size,
					doc_id,
				]
			);
			// Update user verification status
			const [[counts]] = await pool.query(
				`SELECT 
        COUNT(CASE WHEN status = 'not approved' THEN 1 END) as not_approved_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count
      FROM verification_documents WHERE user_id = ?`,
				[user_id]
			);
			let new_status = "pending";
			if (counts.not_approved_count > 0) new_status = "not approved";
			else if (counts.pending_count > 0) new_status = "pending";
			else if (
				counts.approved_count > 0 &&
				counts.approved_count ===
					counts.not_approved_count + counts.pending_count + counts.approved_count
			)
				new_status = "verified";
			await pool.query("UPDATE users SET verification_status = ? WHERE id = ?", [
				new_status,
				user_id,
			]);
			res.json({ success: true });
		} catch (error) {
			console.error("Error updating verification document:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// DELETE verification document
app.delete(
	"/api/verification/document/:id",
	authenticateToken,
	async (req, res) => {
		try {
			const user_id = req.user.id;
			const doc_id = req.params.id;
			// Get the document
			const [[doc]] = await pool.query(
				"SELECT * FROM verification_documents WHERE document_id = ?",
				[doc_id]
			);
			if (!doc) return res.status(404).json({ error: "Document not found" });
			if (doc.user_id !== user_id)
				return res.status(403).json({ error: "Not authorized" });
			// Delete file from disk
			if (fs.existsSync(doc.file_path)) {
				fs.unlinkSync(doc.file_path);
			}
			// Delete from database
			await pool.query("DELETE FROM verification_documents WHERE document_id = ?", [
				doc_id,
			]);
			// Update user verification status
			const [[counts]] = await pool.query(
				`SELECT 
        COUNT(CASE WHEN status = 'not approved' THEN 1 END) as not_approved_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count
      FROM verification_documents WHERE user_id = ?`,
				[user_id]
			);
			let new_status = "pending";
			if (counts.not_approved_count > 0) new_status = "not approved";
			else if (counts.pending_count > 0) new_status = "pending";
			else if (
				counts.approved_count > 0 &&
				counts.approved_count ===
					counts.not_approved_count + counts.pending_count + counts.approved_count
			)
				new_status = "verified";
			await pool.query("UPDATE users SET verification_status = ? WHERE id = ?", [
				new_status,
				user_id,
			]);
			res.json({ success: true });
		} catch (error) {
			console.error("Error deleting verification document:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Admin: Get all pending verification documents with user info
app.get(
	"/api/admin/verification/pending",
	authenticateToken,
	async (req, res) => {
		try {
			if (req.user.role !== "admin")
				return res.status(403).json({ error: "Forbidden" });
			const [docs] = await pool.query(`
      SELECT vd.*, u.first_name, u.last_name, u.email, u.role, u.is_verified, u.verification_status
      FROM verification_documents vd
      JOIN users u ON vd.user_id = u.id
      WHERE vd.status = 'pending' AND u.verification_status != 'verified'
      ORDER BY vd.uploaded_at ASC
    `);
			res.json(docs);
		} catch (error) {
			console.error("Error fetching pending verification documents:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Admin: Get details of a specific verification document
app.get(
	"/api/admin/verification/document/:id",
	authenticateToken,
	async (req, res) => {
		try {
			if (req.user.role !== "admin")
				return res.status(403).json({ error: "Forbidden" });
			const doc_id = req.params.id;
			const [[doc]] = await pool.query(
				`
      SELECT vd.*, u.first_name, u.last_name, u.email, u.role, u.is_verified
      FROM verification_documents vd
      JOIN users u ON vd.user_id = u.id
      WHERE vd.document_id = ?
    `,
				[doc_id]
			);
			if (!doc) return res.status(404).json({ error: "Document not found" });
			res.json(doc);
		} catch (error) {
			console.error("Error fetching verification document details:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Admin: Approve a verification document
app.post(
	"/api/admin/verification/document/:id/approve",
	authenticateToken,
	async (req, res) => {
		try {
			if (req.user.role !== "admin")
				return res.status(403).json({ error: "Forbidden" });
			const doc_id = req.params.id;
			const admin_id = req.user.id;
			// Update document status
			await pool.query(
				`UPDATE verification_documents SET status='approved', reviewed_by=?, reviewed_at=NOW(), rejection_reason=NULL WHERE document_id=?`,
				[admin_id, doc_id]
			);
			// Get user_id
			const [[doc]] = await pool.query(
				"SELECT user_id FROM verification_documents WHERE document_id = ?",
				[doc_id]
			);
			if (doc) {
				// Recalculate user verification status
				const user_id = doc.user_id;
				const [[counts]] = await pool.query(
					`SELECT 
          COUNT(CASE WHEN status = 'not approved' THEN 1 END) as not_approved_count,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count
        FROM verification_documents WHERE user_id = ?`,
					[user_id]
				);
				let new_status = "pending";
				if (counts.not_approved_count > 0) new_status = "not approved";
				else if (counts.pending_count > 0) new_status = "pending";
				else if (
					counts.approved_count > 0 &&
					counts.approved_count ===
						counts.not_approved_count + counts.pending_count + counts.approved_count
				)
					new_status = "verified";
				await pool.query("UPDATE users SET verification_status = ? WHERE id = ?", [
					new_status,
					user_id,
				]);

				// Send document verification notification
				try {
					const [[documentInfo]] = await pool.query(
						"SELECT document_type FROM verification_documents WHERE document_id = ?",
						[doc_id]
					);
					
					if (documentInfo) {
						await createDocumentVerificationNotification(pool, {
							user_id: user_id,
							document_type: documentInfo.document_type,
							verification_status: 'rejected',
							rejection_reason: rejection_reason
						});
					}
				} catch (notificationError) {
					console.error('Error creating document verification notification:', notificationError);
				}
			}
			res.json({ success: true });
		} catch (error) {
			console.error("Error approving verification document:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Admin: Reject a verification document
app.post(
	"/api/admin/verification/document/:id/reject",
	authenticateToken,
	async (req, res) => {
		try {
			if (req.user.role !== "admin")
				return res.status(403).json({ error: "Forbidden" });
			const doc_id = req.params.id;
			const admin_id = req.user.id;
			const { rejection_reason } = req.body;
			if (!rejection_reason)
				return res.status(400).json({ error: "Rejection reason is required" });
			// Update document status
			await pool.query(
				`UPDATE verification_documents SET status='not approved', reviewed_by=?, reviewed_at=NOW(), rejection_reason=? WHERE document_id=?`,
				[admin_id, rejection_reason, doc_id]
			);
			// Get user_id
			const [[doc]] = await pool.query(
				"SELECT user_id FROM verification_documents WHERE document_id = ?",
				[doc_id]
			);
			if (doc) {
				// Recalculate user verification status
				const user_id = doc.user_id;
				const [[counts]] = await pool.query(
					`SELECT 
          COUNT(CASE WHEN status = 'not approved' THEN 1 END) as not_approved_count,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count
        FROM verification_documents WHERE user_id = ?`,
					[user_id]
				);
				let new_status = "pending";
				if (counts.not_approved_count > 0) new_status = "not approved";
				else if (counts.pending_count > 0) new_status = "pending";
				else if (
					counts.approved_count > 0 &&
					counts.approved_count ===
						counts.not_approved_count + counts.pending_count + counts.approved_count
				)
					new_status = "verified";
				await pool.query("UPDATE users SET verification_status = ? WHERE id = ?", [
					new_status,
					user_id,
				]);

				// Send document verification notification
				try {
					const [[documentInfo]] = await pool.query(
						"SELECT document_type FROM verification_documents WHERE document_id = ?",
						[doc_id]
					);
					
					if (documentInfo) {
						await createDocumentVerificationNotification(pool, {
							user_id: user_id,
							document_type: documentInfo.document_type,
							verification_status: 'approved'
						});
					}
				} catch (notificationError) {
					console.error('Error creating document verification notification:', notificationError);
				}
			}
			res.json({ success: true });
		} catch (error) {
			console.error("Error rejecting verification document:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// View verification document
app.get(
	"/api/verification/document/:id/view",
	authenticateToken,
	async (req, res) => {
		try {
			const { id } = req.params;

			// Get document details
			const [[document]] = await pool.query(
				"SELECT * FROM verification_documents WHERE document_id = ?",
				[id]
			);

			if (!document) {
				return res.status(404).json({ error: "Document not found" });
			}

			// Check if user owns the document or is admin
			if (req.user.role !== "admin" && document.user_id !== req.user.id) {
				return res.status(403).json({ error: "Access denied" });
			}

			// Check if file exists
			const fs = require('fs');
			const path = require('path');
			const filePath = path.join(__dirname, document.file_path);

			if (!fs.existsSync(filePath)) {
				return res.status(404).json({ error: "File not found" });
			}

			// Set headers for inline viewing
			res.setHeader('Content-Type', document.file_type || 'application/octet-stream');
			res.setHeader('Content-Disposition', `inline; filename="${document.file_name}"`);

			// Send file
			res.sendFile(filePath);
		} catch (error) {
			console.error("Error viewing verification document:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Download verification document
app.get(
	"/api/verification/document/:id/download",
	authenticateToken,
	async (req, res) => {
		try {
			const { id } = req.params;

			// Get document details
			const [[document]] = await pool.query(
				"SELECT * FROM verification_documents WHERE document_id = ?",
				[id]
			);

			if (!document) {
				return res.status(404).json({ error: "Document not found" });
			}

			// Check if user owns the document or is admin
			if (req.user.role !== "admin" && document.user_id !== req.user.id) {
				return res.status(403).json({ error: "Access denied" });
			}

			// Check if file exists
			const fs = require('fs');
			const path = require('path');
			const filePath = path.join(__dirname, document.file_path);

			if (!fs.existsSync(filePath)) {
				return res.status(404).json({ error: "File not found" });
			}

			// Set headers for download
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader('Content-Disposition', `attachment; filename="${document.file_name}"`);

			// Send file
			res.sendFile(filePath);
		} catch (error) {
			console.error("Error downloading verification document:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Get user's verification documents (admin only)
app.get(
	"/api/admin/users/:id/verification-documents",
	authenticateToken,
	async (req, res) => {
		try {
			// Check if user is admin
			if (req.user.role !== "admin") {
				return res.status(403).json({ error: "Only admins can access user verification documents" });
			}

			const { id } = req.params;
			console.log('Fetching verification documents for user_id:', id, 'type:', typeof id);

			// Convert id to number to ensure type consistency
			const userId = parseInt(id, 10);
			console.log('Converted user_id:', userId, 'type:', typeof userId);

			// First, verify the user exists
			const [[user]] = await pool.query(
				'SELECT id FROM users WHERE id = ?',
				[userId]
			);

			if (!user) {
				console.log('User not found with id:', userId);
				return res.status(404).json({ error: "User not found" });
			}

			console.log('User found:', user);

			// Get user's verification documents with debug logging
			const [documents] = await pool.query(
				`SELECT document_id, user_id, document_type, document_number, 
				        file_name, file_path, file_type, file_size,
				        issue_date, expiry_date, issuing_authority,
				        status, uploaded_at, rejection_reason
				 FROM verification_documents 
				 WHERE user_id = ?
				 ORDER BY uploaded_at DESC`,
				[userId]
			);

			console.log('Found documents:', documents);

			// Log the response being sent
			console.log('Sending response with documents:', { documents });
			res.json({ documents });
		} catch (error) {
			console.error("Error fetching user verification documents:", error);
			console.error("Full error details:", error.stack);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Approve startup (admin only)
app.post(
	"/api/admin/startups/:id/approve",
	authenticateToken,
	async (req, res) => {
		try {
			// Check if user is admin
			if (req.user.role !== "admin") {
				return res.status(403).json({ error: "Only admins can approve startups" });
			}

			const { id } = req.params;
			const { approval_comment } = req.body;

			// Update startup status
			await pool.query(
				`UPDATE startups 
       SET approval_status = 'approved', 
           approved_by = ?, 
           approval_comment = ?,
           updated_at = NOW()
       WHERE startup_id = ?`,
				[req.user.id, approval_comment, id]
			);

			// Get startup info for notification
			const [[startupInfo]] = await pool.query(
				"SELECT entrepreneur_id, name FROM startups WHERE startup_id = ?",
				[id]
			);

			// Send startup application notification
			if (startupInfo) {
				try {
					await createStartupApplicationNotification(pool, {
						entrepreneur_id: startupInfo.entrepreneur_id,
						startup_name: startupInfo.name,
						application_status: 'approved'
					});
				} catch (notificationError) {
					console.error('Error creating startup application notification:', notificationError);
				}
			}

			res.json({ message: "Startup approved successfully" });
		} catch (error) {
			console.error("Error approving startup:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Reject startup (admin only)
app.post(
	"/api/admin/startups/:id/reject",
	authenticateToken,
	async (req, res) => {
		try {
			// Check if user is admin
			if (req.user.role !== "admin") {
				return res.status(403).json({ error: "Only admins can reject startups" });
			}

			const { id } = req.params;
			const { approval_comment } = req.body;

			if (!approval_comment) {
				return res.status(400).json({ error: "Rejection reason is required" });
			}

			// Update startup status
			await pool.query(
				`UPDATE startups 
       SET approval_status = 'rejected', 
           approved_by = ?, 
           approval_comment = ?,
           updated_at = NOW()
       WHERE startup_id = ?`,
				[req.user.id, approval_comment, id]
			);

			// Get startup info for notification
			const [[startupInfo]] = await pool.query(
				"SELECT entrepreneur_id, name FROM startups WHERE startup_id = ?",
				[id]
			);

			// Send startup application notification
			if (startupInfo) {
				try {
					await createStartupApplicationNotification(pool, {
						entrepreneur_id: startupInfo.entrepreneur_id,
						startup_name: startupInfo.name,
						application_status: 'rejected'
					});
				} catch (notificationError) {
					console.error('Error creating startup application notification:', notificationError);
				}
			}

			res.json({ message: "Startup rejected successfully" });
		} catch (error) {
			console.error("Error rejecting startup:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Suspend startup (admin only)
app.post(
	"/api/admin/startups/:id/suspend",
	authenticateToken,
	async (req, res) => {
		try {
			// Check if user is admin
			if (req.user.role !== "admin") {
				return res.status(403).json({ error: "Only admins can suspend startups" });
			}

			const { id } = req.params;

			// Update startup status
			await pool.query(
				`UPDATE startups 
				 SET approval_status = 'suspended', 
				     updated_at = NOW()
				 WHERE startup_id = ?`,
				[id]
			);

			res.json({ message: "Startup suspended successfully" });
		} catch (error) {
			console.error("Error suspending startup:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Reactivate startup (admin only)
app.post(
	"/api/admin/startups/:id/reactivate",
	authenticateToken,
	async (req, res) => {
		try {
			// Check if user is admin
			if (req.user.role !== "admin") {
				return res.status(403).json({ error: "Only admins can reactivate startups" });
			}

			const { id } = req.params;

			// Update startup status
			await pool.query(
				`UPDATE startups 
				 SET approval_status = 'approved', 
				     updated_at = NOW()
				 WHERE startup_id = ?`,
				[id]
			);

			res.json({ message: "Startup reactivated successfully" });
		} catch (error) {
			console.error("Error reactivating startup:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Edit startup (admin only)
app.put(
	"/api/admin/startups/:id",
	authenticateToken,
	async (req, res) => {
		try {
			// Check if user is admin
			if (req.user.role !== "admin") {
				return res.status(403).json({ error: "Only admins can edit startups" });
			}

			const { id } = req.params;
			const { name, industry, location, description, startup_stage, approval_status, funding_status } = req.body;

			// Update startup
			await pool.query(
				`UPDATE startups 
				 SET name = ?, industry = ?, location = ?, description = ?, startup_stage = ?, approval_status = ?, funding_status = ?, updated_at = NOW()
				 WHERE startup_id = ?`,
				[name, industry, location, description, startup_stage, approval_status, funding_status, id]
			);

			// Get updated startup with entrepreneur details
			const [rows] = await pool.query(
				`SELECT s.*, 
				        CONCAT(u.first_name, ' ', u.last_name) as entrepreneur_name,
				        u.email as entrepreneur_email
				 FROM startups s
				 LEFT JOIN users u ON s.entrepreneur_id = u.id 
				 WHERE s.startup_id = ?`,
				[id]
			);

			if (rows.length === 0) {
				return res.status(404).json({ error: "Startup not found" });
			}

			res.json(rows[0]);
		} catch (error) {
			console.error("Error editing startup:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Delete startup (admin only)
app.delete(
	"/api/admin/startups/:id",
	authenticateToken,
	async (req, res) => {
		try {
			// Check if user is admin
			if (req.user.role !== "admin") {
				return res.status(403).json({ error: "Only admins can delete startups" });
			}

			const { id } = req.params;

			// Check if startup exists
			const [existingStartup] = await pool.query(
				"SELECT * FROM startups WHERE startup_id = ?",
				[id]
			);

			if (existingStartup.length === 0) {
				return res.status(404).json({ error: "Startup not found" });
			}

			// Delete related records first (if any foreign key constraints)
			// You might need to delete from related tables like matches, etc.
			await pool.query("DELETE FROM matches WHERE startup_id = ?", [id]);
			
			// Delete the startup
			await pool.query("DELETE FROM startups WHERE startup_id = ?", [id]);

			res.json({ message: "Startup deleted successfully" });
		} catch (error) {
			console.error("Error deleting startup:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Bulk action for startups (admin only)
app.post(
	"/api/admin/startups/bulk-action",
	authenticateToken,
	async (req, res) => {
		try {
			// Check if user is admin
			if (req.user.role !== "admin") {
				return res.status(403).json({ error: "Only admins can perform bulk actions" });
			}

			const { startup_ids, action } = req.body;

			if (!startup_ids || !Array.isArray(startup_ids) || startup_ids.length === 0) {
				return res.status(400).json({ error: "startup_ids array is required" });
			}

			if (!action || !['suspend', 'reactivate', 'delete'].includes(action)) {
				return res.status(400).json({ error: "Invalid action. Must be 'suspend', 'reactivate', or 'delete'" });
			}

			const placeholders = startup_ids.map(() => '?').join(',');

			if (action === 'delete') {
				// Delete related records first
				await pool.query(`DELETE FROM matches WHERE startup_id IN (${placeholders})`, startup_ids);
				
				// Delete startups
				await pool.query(`DELETE FROM startups WHERE startup_id IN (${placeholders})`, startup_ids);
			} else {
				// Update approval status
				const status = action === 'suspend' ? 'suspended' : 'approved';
				await pool.query(
					`UPDATE startups 
					 SET approval_status = ?, updated_at = NOW()
					 WHERE startup_id IN (${placeholders})`,
					[status, ...startup_ids]
				);
			}

			res.json({ 
				message: `Successfully ${action}d ${startup_ids.length} startup(s)`,
				affected_count: startup_ids.length
			});
		} catch (error) {
			console.error("Error performing bulk action:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Create Event endpoint
app.post("/api/events", authenticateToken, async (req, res) => {
	try {
		const {
			title,
			description,
			event_date,
			location,
			status,
			rsvp_link,
			time,
			start_time,
			end_time,
			tags,
		} = req.body;
		if (!title || !event_date) {
			return res.status(400).json({ error: "Title and event_date are required" });
		}
		const [result] = await pool.query(
			`INSERT INTO events (title, description, event_date, location, organizer_id, status, rsvp_link, time, start_time, end_time, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
			[
				title,
				description,
				event_date,
				location,
				req.user.id,
				status || "upcoming",
				rsvp_link,
				time,
				start_time,
				end_time,
				tags,
			]
		);
		const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [
			result.insertId,
		]);
		res.status(201).json(rows[0]);
	} catch (error) {
		console.error("Error creating event:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Update Event endpoint
app.put("/api/events/:id", authenticateToken, async (req, res) => {
	try {
		const {
			title,
			description,
			event_date,
			location,
			status,
			rsvp_link,
			time,
			start_time,
			end_time,
			tags,
		} = req.body;
		const eventId = req.params.id;

		if (!title || !event_date) {
			return res.status(400).json({ error: "Title and event_date are required" });
		}

		// Check if event exists and if user is authorized to edit it
		const [existingEvent] = await pool.query(
			"SELECT * FROM events WHERE id = ?",
			[eventId]
		);

		if (existingEvent.length === 0) {
			return res.status(404).json({ error: "Event not found" });
		}

		// Check if user is the organizer or an admin
		if (existingEvent[0].organizer_id !== req.user.id && req.user.role !== 'admin') {
			return res.status(403).json({ error: "Not authorized to edit this event" });
		}

		// Update the event
		await pool.query(
			`UPDATE events 
			 SET title = ?, description = ?, event_date = ?, location = ?, status = ?, rsvp_link = ?, time = ?, start_time = ?, end_time = ?, tags = ?, updated_at = NOW()
			 WHERE id = ?`,
			[
				title,
				description,
				event_date,
				location,
				status || "upcoming",
				rsvp_link,
				time,
				start_time,
				end_time,
				tags,
				eventId,
			]
		);

		// Get the updated event
		const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [eventId]);
		res.json(rows[0]);
	} catch (error) {
		console.error("Error updating event:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Get all events endpoint
app.get("/api/events", async (req, res) => {
	try {
		const [rows] = await pool.query(`
			SELECT e.*, u.full_name as organizer_name 
			FROM events e 
			LEFT JOIN users u ON e.organizer_id = u.id 
			ORDER BY e.event_date DESC
		`);
		res.json(rows);
	} catch (error) {
		console.error("Error fetching events:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Delete Event endpoint
app.delete("/api/events/:id", authenticateToken, async (req, res) => {
	try {
		const eventId = req.params.id;

		// Check if event exists and if user is authorized to delete it
		const [existingEvent] = await pool.query(
			"SELECT * FROM events WHERE id = ?",
			[eventId]
		);

		if (existingEvent.length === 0) {
			return res.status(404).json({ error: "Event not found" });
		}

		// Check if user is the organizer or an admin
		if (existingEvent[0].organizer_id !== req.user.id && req.user.role !== 'admin') {
			return res.status(403).json({ error: "Not authorized to delete this event" });
		}

		// Delete the event
		await pool.query("DELETE FROM events WHERE id = ?", [eventId]);

		res.json({ message: "Event deleted successfully" });
	} catch (error) {
		console.error("Error deleting event:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});



// Get all startups matched with the logged-in investor
app.get("/api/startups/matched", authenticateToken, async (req, res) => {
	console.log("DEBUG: /api/startups/matched endpoint hit by user", req.user);
	try {
		const investor_id = req.user.id;
		const [rows] = await pool.query(
			`SELECT s.*
       FROM startups s
       INNER JOIN matches m ON s.startup_id = m.startup_id
       WHERE m.investor_id = ?`,
			[investor_id]
		);
		console.log("DEBUG: Matched startups SQL result:", rows);
		res.json(rows);
	} catch (error) {
		console.error("Error fetching matched startups:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Get all entrepreneurs
app.get("/api/users/role/entrepreneur", authenticateToken, async (req, res) => {
	try {
		// COMMENTED OUT FOR TESTING - TO BE RESTORED LATER
		// const [rows] = await pool.query(`
		//   SELECT u.*, up.preferred_location, up.preferred_industries, up.preferred_startup_stage
		//   FROM users u
		//   LEFT JOIN user_preferences up ON u.id = up.user_id
		//   WHERE u.role = 'entrepreneur'
		//   AND u.verification_status = 'verified'
		//   AND u.show_in_search = 1
		// `);
		// Return all entrepreneurs regardless of verification status
		const [rows] = await pool.query(`
      SELECT u.*, up.preferred_location, up.preferred_industries, up.preferred_startup_stage
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.role = 'entrepreneur'
      AND u.show_in_search = 1
    `);

		const entrepreneurs = rows.map((u) => ({
			id: u.id,
			name: `${u.first_name} ${u.last_name}`,
			email: u.email,
			bio: u.introduction || "",
			profile_image: u.profile_image || null,
			industry: u.industry,
			location: u.location,
			preferred_location: u.preferred_location,
			preferred_industries: u.preferred_industries
				? JSON.parse(u.preferred_industries)
				: [],
			preferred_startup_stage: u.preferred_startup_stage,
		}));

		res.json(entrepreneurs);
	} catch (error) {
		console.error("Error fetching entrepreneurs:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// User Management Endpoints (Admin only)

// Suspend user (admin only)
app.post(
	"/api/admin/users/:id/suspend",
	authenticateToken,
	async (req, res) => {
		try {
			// Check if user is admin
			if (req.user.role !== "admin") {
				return res.status(403).json({ error: "Only admins can suspend users" });
			}

			const { id } = req.params;

			// Check if user exists
			const [existingUser] = await pool.query(
				"SELECT * FROM users WHERE id = ?",
				[id]
			);

			if (existingUser.length === 0) {
				return res.status(404).json({ error: "User not found" });
			}

					// Update user status
		await pool.query(
			`UPDATE users 
			 SET is_suspended = true, updated_at = NOW()
			 WHERE id = ?`,
			[id]
		);

			res.json({ message: "User suspended successfully" });
		} catch (error) {
			console.error("Error suspending user:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Reactivate user (admin only)
app.post(
	"/api/admin/users/:id/reactivate",
	authenticateToken,
	async (req, res) => {
		try {
			// Check if user is admin
			if (req.user.role !== "admin") {
				return res.status(403).json({ error: "Only admins can reactivate users" });
			}

			const { id } = req.params;

					// Update user status
		await pool.query(
			`UPDATE users 
			 SET is_suspended = false, updated_at = NOW()
			 WHERE id = ?`,
			[id]
		);

			res.json({ message: "User reactivated successfully" });
		} catch (error) {
			console.error("Error reactivating user:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Edit user (admin only)
app.put(
	"/api/admin/users/:id",
	authenticateToken,
	async (req, res) => {
		try {
			// Check if user is admin
			if (req.user.role !== "admin") {
				return res.status(403).json({ error: "Only admins can edit users" });
			}

			const { id } = req.params;
			const { first_name, last_name, email, role, is_verified, is_suspended, industry, location } = req.body;

			// Check if user exists
			const [existingUser] = await pool.query(
				"SELECT * FROM users WHERE id = ?",
				[id]
			);

			if (existingUser.length === 0) {
				return res.status(404).json({ error: "User not found" });
			}

			// Check if email is already taken by another user
			if (email !== existingUser[0].email) {
				const [emailCheck] = await pool.query(
					"SELECT id FROM users WHERE email = ? AND id != ?",
					[email, id]
				);

				if (emailCheck.length > 0) {
					return res.status(400).json({ error: "Email already exists" });
				}
			}

					// Update user
		await pool.query(
			`UPDATE users 
			 SET first_name = ?, last_name = ?, email = ?, role = ?, is_verified = ?, is_suspended = ?, 
			     industry = ?, location = ?, updated_at = NOW()
			 WHERE id = ?`,
			[first_name, last_name, email, role, is_verified, is_suspended, industry, location, id]
		);

		// Get updated user
		const [rows] = await pool.query(
			"SELECT id, first_name, last_name, email, role, is_verified, is_suspended, industry, location, created_at FROM users WHERE id = ?",
			[id]
		);

			res.json(rows[0]);
		} catch (error) {
			console.error("Error editing user:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Delete user (admin only)
app.delete(
	"/api/admin/users/:id",
	authenticateToken,
	async (req, res) => {
		try {
			// Check if user is admin
			if (req.user.role !== "admin") {
				return res.status(403).json({ error: "Only admins can delete users" });
			}

			const { id } = req.params;

			// Check if user exists
			const [existingUser] = await pool.query(
				"SELECT * FROM users WHERE id = ?",
				[id]
			);

			if (existingUser.length === 0) {
				return res.status(404).json({ error: "User not found" });
			}

			// Prevent deletion of admin users by other admins (security measure)
			if (existingUser[0].role === 'admin' && req.user.id !== parseInt(id)) {
				return res.status(403).json({ error: "Cannot delete other admin users" });
			}

			// Delete related records first (if any foreign key constraints)
			await pool.query("DELETE FROM matches WHERE investor_id = ? OR startup_id IN (SELECT startup_id FROM startups WHERE entrepreneur_id = ?)", [id, id]);
			await pool.query("DELETE FROM startups WHERE entrepreneur_id = ?", [id]);
			await pool.query("DELETE FROM entrepreneurs WHERE entrepreneur_id = ?", [id]);
			await pool.query("DELETE FROM investors WHERE investor_id = ?", [id]);
			await pool.query("DELETE FROM user_preferences WHERE user_id = ?", [id]);
			await pool.query("DELETE FROM verification_documents WHERE user_id = ?", [id]);
			
			// Delete the user
			await pool.query("DELETE FROM users WHERE id = ?", [id]);

			res.json({ message: "User deleted successfully" });
		} catch (error) {
			console.error("Error deleting user:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Approve user verification (admin only)
app.post(
	"/api/admin/users/:id/verify",
	authenticateToken,
	async (req, res) => {
		try {
			// Check if user is admin
			if (req.user.role !== "admin") {
				return res.status(403).json({ error: "Only admins can verify users" });
			}

			const { id } = req.params;
			const { verification_comment } = req.body;

			// Update user verification status
		await pool.query(
			`UPDATE users 
			 SET is_verified = true, verification_status = 'verified', 
			     verification_comment = ?, verified_by = ?, verified_at = NOW(), updated_at = NOW()
			 WHERE id = ?`,
			[verification_comment || 'Approved by admin', req.user.id, id]
		);

			res.json({ message: "User verified successfully" });
		} catch (error) {
			console.error("Error verifying user:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Reject user verification (admin only)
app.post(
	"/api/admin/users/:id/reject",
	authenticateToken,
	async (req, res) => {
		try {
			// Check if user is admin
			if (req.user.role !== "admin") {
				return res.status(403).json({ error: "Only admins can reject user verification" });
			}

			const { id } = req.params;
			const { rejection_reason } = req.body;

			if (!rejection_reason) {
				return res.status(400).json({ error: "Rejection reason is required" });
			}

			// Update user verification status
		await pool.query(
			`UPDATE users 
			 SET is_verified = false, verification_status = 'not approved', 
			     verification_comment = ?, verified_by = ?, verified_at = NOW(), updated_at = NOW()
			 WHERE id = ?`,
			[rejection_reason, req.user.id, id]
		);

			res.json({ message: "User verification rejected" });
		} catch (error) {
			console.error("Error rejecting user verification:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Bulk action for users (admin only)
app.post(
	"/api/admin/users/bulk-action",
	authenticateToken,
	async (req, res) => {
		try {
			// Check if user is admin
			if (req.user.role !== "admin") {
				return res.status(403).json({ error: "Only admins can perform bulk actions" });
			}

			const { user_ids, action } = req.body;

			if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
				return res.status(400).json({ error: "user_ids array is required" });
			}

			if (!action || !['suspend', 'reactivate', 'verify', 'reject', 'delete'].includes(action)) {
				return res.status(400).json({ error: "Invalid action. Must be 'suspend', 'reactivate', 'verify', 'reject', or 'delete'" });
			}

			const placeholders = user_ids.map(() => '?').join(',');

			if (action === 'delete') {
				// Prevent deletion of admin users
				const [adminCheck] = await pool.query(
					`SELECT id FROM users WHERE id IN (${placeholders}) AND role = 'admin' AND id != ?`,
					[...user_ids, req.user.id]
				);

				if (adminCheck.length > 0) {
					return res.status(403).json({ error: "Cannot delete admin users" });
				}

				// Delete related records first
				await pool.query(`DELETE FROM matches WHERE investor_id IN (${placeholders}) OR startup_id IN (SELECT startup_id FROM startups WHERE entrepreneur_id IN (${placeholders}))`, user_ids);
				await pool.query(`DELETE FROM startups WHERE entrepreneur_id IN (${placeholders})`, user_ids);
				await pool.query(`DELETE FROM entrepreneurs WHERE entrepreneur_id IN (${placeholders})`, user_ids);
				await pool.query(`DELETE FROM investors WHERE investor_id IN (${placeholders})`, user_ids);
				await pool.query(`DELETE FROM user_preferences WHERE user_id IN (${placeholders})`, user_ids);
				await pool.query(`DELETE FROM verification_documents WHERE user_id IN (${placeholders})`, user_ids);
				
				// Delete users
				await pool.query(`DELETE FROM users WHERE id IN (${placeholders})`, user_ids);
			} else {
				// Update user status
				let updateQuery = '';
				let params = [];

							if (action === 'suspend') {
				updateQuery = `UPDATE users SET is_suspended = true, updated_at = NOW() WHERE id IN (${placeholders})`;
				params = user_ids;
			} else if (action === 'reactivate') {
				updateQuery = `UPDATE users SET is_suspended = false, updated_at = NOW() WHERE id IN (${placeholders})`;
				params = user_ids;
			} else if (action === 'verify') {
				updateQuery = `UPDATE users SET is_verified = true, verification_status = 'verified', updated_at = NOW() WHERE id IN (${placeholders})`;
				params = user_ids;
			} else if (action === 'reject') {
				updateQuery = `UPDATE users SET is_verified = false, verification_status = 'not approved', updated_at = NOW() WHERE id IN (${placeholders})`;
				params = user_ids;
			}

			await pool.query(updateQuery, params);
			}

			res.json({ 
				message: `Successfully ${action}d ${user_ids.length} user(s)`,
				affected_count: user_ids.length
			});
		} catch (error) {
			console.error("Error performing bulk user action:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Dashboard stats endpoint
app.get("/api/admin/dashboard-stats", async (req, res) => {
	try {
		// Get total users count
		const [usersResult] = await pool.query("SELECT COUNT(*) as count FROM users");
		const total_users = usersResult[0].count;

		// Get total startups count
		const [startupsResult] = await pool.query("SELECT COUNT(*) as count FROM startups WHERE approval_status = 'approved'");
		const total_startups = startupsResult[0].count;

		// Get total entrepreneurs count
		const [entrepreneursResult] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'entrepreneur'");
		const total_entrepreneurs = entrepreneursResult[0].count;

		// Get total investors count
		const [investorsResult] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'investor'");
		const total_investors = investorsResult[0].count;

		// Get total funded startups count
		const [fundedStartupsResult] = await pool.query("SELECT COUNT(*) as count FROM startups WHERE approval_status = 'approved' AND funding_status = 'funded'");
		const total_funded_startups = fundedStartupsResult[0].count;

		// Get upcoming events count (if events table exists)
		let total_upcoming_events = 0;
		try {
			const [eventsResult] = await pool.query(`
				SELECT COUNT(*) as count FROM events 
				WHERE event_date >= CURDATE() OR status IN ('upcoming', 'ongoing')
			`);
			total_upcoming_events = eventsResult[0].count;
		} catch (error) {
			// Events table might not exist, default to 0
			console.warn("Events table not found, setting upcoming events to 0");
		}

		res.json({
			total_users,
			total_startups,
			total_entrepreneurs,
			total_investors,
			total_funded_startups,
			total_upcoming_events
		});
	} catch (error) {
		console.error("Error fetching dashboard stats:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Admin: Get storage information
app.get("/api/admin/storage-info", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ error: "Forbidden" });
		}

		const uploadsDir = path.join(__dirname, "uploads");
		
		const getDirectorySize = (dirPath) => {
			if (!fs.existsSync(dirPath)) return 0;
			let totalSize = 0;
			try {
				const files = fs.readdirSync(dirPath);
				files.forEach(file => {
					const filePath = path.join(dirPath, file);
					const stats = fs.statSync(filePath);
					if (stats.isDirectory()) {
						totalSize += getDirectorySize(filePath);
					} else {
						totalSize += stats.size;
					}
				});
			} catch (error) {
				console.error(`Error reading directory ${dirPath}:`, error);
			}
			return totalSize;
		};

		const formatBytes = (bytes) => {
			if (bytes === 0) return "0 Bytes";
			const k = 1024;
			const sizes = ["Bytes", "KB", "MB", "GB"];
			const i = Math.floor(Math.log(bytes) / Math.log(k));
			return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
		};

		const countFiles = (dirPath) => {
			if (!fs.existsSync(dirPath)) return 0;
			let count = 0;
			try {
				const files = fs.readdirSync(dirPath);
				files.forEach(file => {
					const filePath = path.join(dirPath, file);
					const stats = fs.statSync(filePath);
					if (stats.isDirectory()) {
						count += countFiles(filePath);
					} else {
						count++;
					}
				});
			} catch (error) {
				console.error(`Error counting files in ${dirPath}:`, error);
			}
			return count;
		};

		const totalSize = getDirectorySize(uploadsDir);
		const profilePhotosSize = getDirectorySize(path.join(uploadsDir, "profile_photos"));
		const teamSize = getDirectorySize(path.join(uploadsDir, "team"));
		const messagesSize = getDirectorySize(path.join(uploadsDir, "messages"));
		const verificationSize = getDirectorySize(path.join(uploadsDir, "verification_documents"));
		const rootSize = totalSize - profilePhotosSize - teamSize - messagesSize - verificationSize;

		res.json({
			total: formatBytes(totalSize),
			totalBytes: totalSize,
			breakdown: {
				profile_photos: {
					size: formatBytes(profilePhotosSize),
					files: countFiles(path.join(uploadsDir, "profile_photos"))
				},
				team: {
					size: formatBytes(teamSize),
					files: countFiles(path.join(uploadsDir, "team"))
				},
				messages: {
					size: formatBytes(messagesSize),
					files: countFiles(path.join(uploadsDir, "messages"))
				},
				verification_documents: {
					size: formatBytes(verificationSize),
					files: countFiles(path.join(uploadsDir, "verification_documents"))
				},
				other: {
					size: formatBytes(rootSize),
					files: countFiles(uploadsDir) - countFiles(path.join(uploadsDir, "profile_photos")) - countFiles(path.join(uploadsDir, "team")) - countFiles(path.join(uploadsDir, "messages")) - countFiles(path.join(uploadsDir, "verification_documents"))
				}
			},
			totalFiles: countFiles(uploadsDir)
		});
	} catch (error) {
		console.error("Error getting storage info:", error);
		res.status(500).json({ error: "Failed to get storage info", details: error.message });
	}
});

const ticketsRouter = require("./routes/tickets")(pool);
app.use("/api/tickets", authenticateToken, ticketsRouter);

const notificationsRouter = require("./routes/notifications")(pool);
app.use("/api/notifications", authenticateToken, notificationsRouter);

const documentsRouter = require('./routes/documents');

// Register routes
app.use('/api', documentsRouter);

// Update startup funding status (admin only)
app.put(
  "/api/admin/startups/:id/funding-status",
  authenticateToken,
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can update startup funding status" });
      }

      const { id } = req.params;
      const { funding_status } = req.body;

      if (!funding_status || !['funded', 'not_funded'].includes(funding_status)) {
        return res.status(400).json({ error: "Invalid funding status. Must be 'funded' or 'not_funded'" });
      }

      // Update startup funding status
      await pool.query(
        `UPDATE startups 
         SET funding_status = ?, 
             updated_at = NOW()
         WHERE startup_id = ?`,
        [funding_status, id]
      );

      // Get updated startup with entrepreneur details
      const [rows] = await pool.query(
        `SELECT s.*, 
                CONCAT(u.first_name, ' ', u.last_name) as entrepreneur_name,
                u.email as entrepreneur_email
         FROM startups s
         LEFT JOIN users u ON s.entrepreneur_id = u.id 
         WHERE s.startup_id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Startup not found" });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error("Error updating startup funding status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

const PORT = process.env.PORT || 5000;

// Initialize Event Reminder Service
let eventReminderService;
try {
	eventReminderService = new EventReminderService(pool);
	eventReminderService.start();
} catch (error) {
	console.error('Failed to start Event Reminder Service:', error);
}

app.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running on port ${PORT}`);
	console.log(`Local access: http://localhost:${PORT}`);
	console.log(`Network access: http://192.168.0.24:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
	console.log('Shutting down server...');
	if (eventReminderService) {
		eventReminderService.stop();
	}
	process.exit(0);
});

process.on('SIGTERM', () => {
	console.log('Shutting down server...');
	if (eventReminderService) {
		eventReminderService.stop();
	}
	process.exit(0);
});

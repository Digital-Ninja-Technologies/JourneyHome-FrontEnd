// tests/e2e/harness/mock-backend.mjs
// High-fidelity Mock Backend for Journey Home Live Backend v1 API contracts.
// Supports both in-process dispatch (zero socket dependencies) and HTTP server.

import http from 'node:http';

export function createInitialState() {
  const users = [
    {
      _id: 'usr_verified_001',
      id: 'usr_verified_001',
      name: 'Adeola Johnson',
      email: 'adeola@example.com',
      password: 'Password123!',
      role: 'customer',
      isSuperAdmin: false,
      isVerified: true,
      verificationToken: null,
      resetToken: null,
      preferences: {
        paymentReminders: true,
        deficitAlerts: true,
        serviceRequestUpdates: true,
        productNewsOffers: false
      },
      createdAt: '2026-01-15T10:00:00.000Z'
    },
    {
      _id: 'usr_unverified_001',
      id: 'usr_unverified_001',
      name: 'Tunde Bakare',
      email: 'tunde@example.com',
      password: 'Password123!',
      role: 'customer',
      isSuperAdmin: false,
      isVerified: false,
      verificationToken: 'token_valid_tunde_123',
      resetToken: null,
      preferences: {
        paymentReminders: true,
        deficitAlerts: true,
        serviceRequestUpdates: false,
        productNewsOffers: false
      },
      createdAt: '2026-02-01T12:00:00.000Z'
    }
  ];

  const packages = [
    {
      _id: 'pkg_essential_001',
      name: 'Essential Shield',
      description: 'Essential funeral coverage and repatriation guidance.',
      amount: 5000,
      currency: 'NGN',
      billingInterval: 'monthly',
      isActive: true,
      features: [
        'Standard Casket & Transport',
        'Repatriation Assistance',
        'Dedicated Care Coordinator'
      ],
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      _id: 'pkg_comprehensive_002',
      name: 'Comprehensive Shield',
      description: 'Full dignified coverage including executive casket and catering allowance.',
      amount: 12000,
      currency: 'NGN',
      billingInterval: 'monthly',
      isActive: true,
      features: [
        'Executive Casket & Vault',
        'Full Global Repatriation',
        'Catering & Hospitality Stipend',
        '24/7 Priority Emergency Hotline'
      ],
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ];

  const plans = [
    {
      _id: 'plan_active_001',
      userId: 'usr_verified_001',
      packageId: 'pkg_essential_001',
      packageName: 'Essential Shield',
      package: 'pkg_essential_001',
      status: 'Active',
      coveredPerson: {
        fullName: 'Bolanle Johnson',
        relationship: 'Mother',
        dateOfBirth: '1955-04-12',
        gender: 'Female',
        address: '14 Adeleke Crescent, Ikeja, Lagos',
        phoneNumber: '+2348023456789'
      },
      createdAt: '2026-01-16T14:30:00.000Z',
      updatedAt: '2026-01-16T14:35:00.000Z'
    }
  ];

  const payments = [
    {
      _id: 'pay_001',
      userId: 'usr_verified_001',
      planId: 'plan_active_001',
      plan: 'plan_active_001',
      reference: 'ref_initial_pay_001',
      amountMinor: 500000,
      currency: 'NGN',
      status: 'Successful',
      purpose: 'Initial Contribution',
      channel: 'card',
      processedAt: '2026-01-16T14:35:00.000Z',
      createdAt: '2026-01-16T14:34:00.000Z'
    }
  ];

  const subscriptions = [
    {
      _id: 'sub_001',
      userId: 'usr_verified_001',
      plan: 'plan_active_001',
      planId: 'plan_active_001',
      packageId: 'pkg_essential_001',
      status: 'active',
      amountMinor: 500000,
      currency: 'NGN',
      billingInterval: 'monthly',
      nextBillingDate: '2026-02-16T14:35:00.000Z',
      createdAt: '2026-01-16T14:35:00.000Z'
    }
  ];

  const notifications = [
    {
      _id: 'notif_001',
      userId: 'usr_verified_001',
      title: 'Payment Confirmed',
      message: 'Your initial contribution of NGN 5,000 has been verified.',
      event: 'payment.success',
      isRead: false,
      plan: 'plan_active_001',
      createdAt: '2026-01-16T14:35:00.000Z'
    },
    {
      _id: 'notif_002',
      userId: 'usr_verified_001',
      title: 'Plan Activated',
      message: 'Your Essential Shield plan for Bolanle Johnson is now active.',
      event: 'plan.activated',
      isRead: true,
      plan: 'plan_active_001',
      createdAt: '2026-01-16T14:36:00.000Z'
    }
  ];

  return { users, packages, plans, payments, subscriptions, notifications };
}

// Global shared mock instance for in-process dispatch
let globalMockInstance = null;

export function getSharedMockBackend() {
  if (!globalMockInstance) {
    globalMockInstance = new MockBackendServer();
  }
  return globalMockInstance;
}

export class MockBackendServer {
  constructor(port = 0) {
    this.port = port;
    this.server = null;
    this.baseUrl = 'mock://backend/api/v1';
    this.state = createInitialState();
    if (!globalMockInstance) {
      globalMockInstance = this;
    }
  }

  reset() {
    this.state = createInitialState();
    if (this.paymentReferences) this.paymentReferences.clear();
  }

  _getAuthUser(headers) {
    const authHeader = headers['authorization'] || headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.slice(7).trim();
    if (token.startsWith('jwt_')) {
      const userId = token.replace('jwt_token_for_', '');
      const user = this.state.users.find(u => u._id === userId || u.id === userId);
      return user || null;
    }
    return null;
  }

  async handleRequest({ method, path, headers = {}, body = null }) {
    const normalizedMethod = (method || 'GET').toUpperCase();
    let pathname = path || '/';
    let queryString = '';

    const qIdx = pathname.indexOf('?');
    if (qIdx !== -1) {
      queryString = pathname.slice(qIdx + 1);
      pathname = pathname.slice(0, qIdx);
    }
    const searchParams = new URLSearchParams(queryString);

    // Strip leading /api/v1 if present
    if (pathname.startsWith('/api/v1')) {
      pathname = pathname.slice('/api/v1'.length);
    }
    if (!pathname.startsWith('/')) {
      pathname = '/' + pathname;
    }

    // Path traversal check
    if (pathname.includes('..')) {
      return {
        status: 400,
        headers: {},
        data: { success: false, message: 'Invalid path: path traversal detected' }
      };
    }

    // Unsupported method check
    const supportedMethods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'];
    if (!supportedMethods.includes(normalizedMethod)) {
      return {
        status: 405,
        headers: {},
        data: { success: false, message: `Method ${normalizedMethod} Not Allowed` }
      };
    }

    // Parse body if string
    let parsedBody = body;
    if (typeof body === 'string') {
      if (!body.trim()) {
        parsedBody = {};
      } else {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          return {
            status: 400,
            headers: {},
            data: { success: false, message: 'Malformed JSON payload' }
          };
        }
      }
    }
    parsedBody = parsedBody || {};

    // --- TEST UTILITY ROUTES ---
    if (pathname === '/test/reset' && normalizedMethod === 'POST') {
      this.reset();
      return {
        status: 200,
        headers: {},
        data: { success: true, message: 'Mock database reset.' }
      };
    }
    if (pathname === '/test/state' && normalizedMethod === 'GET') {
      return {
        status: 200,
        headers: {},
        data: { success: true, data: this.state }
      };
    }

    // --- 1. AUTH ROUTES ---

    // POST /auth/signup
    if (pathname === '/auth/signup' && normalizedMethod === 'POST') {
      const { name, email, password, role } = parsedBody;

      if (!name || name.trim().length < 2) {
        return {
          status: 400,
          headers: {},
          data: { success: false, message: 'Full name must be at least 2 characters' }
        };
      }
      if (!email || !email.includes('@') || !email.includes('.')) {
        return {
          status: 400,
          headers: {},
          data: { success: false, message: 'Please enter a valid email address' }
        };
      }
      if (!password || password.length < 6) {
        return {
          status: 400,
          headers: {},
          data: { success: false, message: 'Password must be at least 6 characters' }
        };
      }

      // Check existing user case-insensitively
      const existing = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return {
          status: 409,
          headers: {},
          data: { success: false, message: 'Email already registered' }
        };
      }

      const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const verificationToken = `token_verify_${newId}`;
      const newUser = {
        _id: newId,
        id: newId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: role || 'customer',
        isSuperAdmin: false,
        isVerified: false,
        verificationToken,
        resetToken: null,
        preferences: {
          paymentReminders: true,
          deficitAlerts: true,
          serviceRequestUpdates: true,
          productNewsOffers: false
        },
        createdAt: new Date().toISOString()
      };
      this.state.users.push(newUser);

      // Return tokenless response per R3 contract
      return {
        status: 201,
        headers: {},
        data: {
          success: true,
          message: 'Verification email sent. Please check your inbox.',
          data: { email: newUser.email }
        }
      };
    }

    // POST /auth/login
    if (pathname === '/auth/login' && normalizedMethod === 'POST') {
      const { email, password } = parsedBody;

      if (!email || !password) {
        return {
          status: 400,
          headers: {},
          data: { success: false, message: 'Email and password are required' }
        };
      }

      const user = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user || user.password !== password) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Invalid email or password' }
        };
      }

      if (!user.isVerified) {
        return {
          status: 401,
          headers: {},
          data: {
            success: false,
            message: 'Please verify your email before logging in',
            unverified: true,
            email: user.email
          }
        };
      }

      const token = `jwt_token_for_${user._id}`;
      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          message: 'Login successful',
          data: {
            user: {
              id: user._id,
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              isSuperAdmin: user.isSuperAdmin
            },
            token
          }
        }
      };
    }

    // POST /auth/verify-email
    if (pathname === '/auth/verify-email' && normalizedMethod === 'POST') {
      const { token } = parsedBody;

      if (!token || !token.trim()) {
        return {
          status: 400,
          headers: {},
          data: { success: false, message: 'Verification token is required' }
        };
      }

      const user = this.state.users.find(u => u.verificationToken === token);
      if (!user) {
        return {
          status: 400,
          headers: {},
          data: { success: false, message: 'Invalid or expired verification token' }
        };
      }

      user.isVerified = true;
      user.verificationToken = null;

      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          message: 'Email verified successfully. You can now log in.'
        }
      };
    }

    // POST /auth/resend-verification
    if (pathname === '/auth/resend-verification' && normalizedMethod === 'POST') {
      const { email } = parsedBody;

      if (!email || !email.trim()) {
        return {
          status: 400,
          headers: {},
          data: { success: false, message: 'Email is required' }
        };
      }

      const user = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return {
          status: 404,
          headers: {},
          data: { success: false, message: 'User not found with this email' }
        };
      }

      if (user.isVerified) {
        return {
          status: 400,
          headers: {},
          data: { success: false, message: 'Email is already verified' }
        };
      }

      user.verificationToken = `token_verify_resend_${Date.now()}`;
      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          message: 'Verification email sent'
        }
      };
    }

    // POST /auth/forgot-password
    if (pathname === '/auth/forgot-password' && normalizedMethod === 'POST') {
      const { email } = parsedBody;

      if (!email) {
        return {
          status: 400,
          headers: {},
          data: { success: false, message: 'Email is required' }
        };
      }

      const user = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return {
          status: 404,
          headers: {},
          data: { success: false, message: 'No account found with that email address' }
        };
      }

      user.resetToken = `token_reset_${user._id}`;
      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          message: 'Password reset link sent to your email'
        }
      };
    }

    // POST /auth/reset-password
    if (pathname === '/auth/reset-password' && normalizedMethod === 'POST') {
      const { token, newPassword } = parsedBody;

      if (!token || !newPassword) {
        return {
          status: 400,
          headers: {},
          data: { success: false, message: 'Token and newPassword are required' }
        };
      }
      if (newPassword.length < 6) {
        return {
          status: 400,
          headers: {},
          data: { success: false, message: 'New password must be at least 6 characters' }
        };
      }

      const user = this.state.users.find(u => u.resetToken === token);
      if (!user) {
        return {
          status: 400,
          headers: {},
          data: { success: false, message: 'Invalid or expired password reset token' }
        };
      }

      user.password = newPassword;
      user.resetToken = null;
      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          message: 'Password reset successfully'
        }
      };
    }

    // GET /auth/me
    if (pathname === '/auth/me' && normalizedMethod === 'GET') {
      const user = this._getAuthUser(headers);
      if (!user) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Unauthorized' }
        };
      }
      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          data: {
            id: user._id,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            preferences: user.preferences,
            createdAt: user.createdAt
          }
        }
      };
    }

    // PATCH /auth/change-password
    if (pathname === '/auth/change-password' && normalizedMethod === 'PATCH') {
      const user = this._getAuthUser(headers);
      if (!user) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Unauthorized' }
        };
      }
      const { currentPassword, newPassword } = parsedBody;

      if (user.password !== currentPassword) {
        return {
          status: 400,
          headers: {},
          data: { success: false, message: 'Current password is incorrect' }
        };
      }
      if (!newPassword || newPassword.length < 6) {
        return {
          status: 400,
          headers: {},
          data: { success: false, message: 'New password must be at least 6 characters' }
        };
      }

      user.password = newPassword;
      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          message: 'Password changed successfully'
        }
      };
    }

    // PATCH /auth/notification-preferences
    if (pathname === '/auth/notification-preferences' && normalizedMethod === 'PATCH') {
      const user = this._getAuthUser(headers);
      if (!user) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Unauthorized' }
        };
      }
      user.preferences = {
        ...user.preferences,
        ...parsedBody
      };
      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          message: 'Notification preferences updated',
          data: { preferences: user.preferences }
        }
      };
    }

    // DELETE /auth/me
    if (pathname === '/auth/me' && normalizedMethod === 'DELETE') {
      const user = this._getAuthUser(headers);
      if (!user) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Unauthorized' }
        };
      }
      if (!parsedBody.password || parsedBody.password !== user.password) {
        return {
          status: 401,
          headers: {},
          data: {
            success: false,
            message: 'Current password is required and must be correct'
          }
        };
      }

      // Delete user & associated records
      this.state.users = this.state.users.filter(u => u._id !== user._id);
      this.state.plans = this.state.plans.filter(p => p.userId !== user._id);
      this.state.payments = this.state.payments.filter(p => p.userId !== user._id);
      this.state.subscriptions = this.state.subscriptions.filter(s => s.userId !== user._id);
      this.state.notifications = this.state.notifications.filter(n => n.userId !== user._id);

      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          message: 'Account deleted successfully'
        }
      };
    }

    // --- 2. PACKAGES & PLANS ROUTES ---

    // GET /packages
    if (pathname === '/packages' && normalizedMethod === 'GET') {
      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          data: this.state.packages
        }
      };
    }

    // GET /plans/dashboard
    if (pathname === '/plans/dashboard' && normalizedMethod === 'GET') {
      const user = this._getAuthUser(headers);
      if (!user) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Unauthorized' }
        };
      }
      const userPlans = this.state.plans.filter(p => p.userId === user._id);
      const activePlans = userPlans.filter(p => p.status === 'Active');
      const pendingPlans = userPlans.filter(p => p.status === 'Pending');

      const userPayments = this.state.payments.filter(p => p.userId === user._id && p.status === 'Successful');
      const totalContributedMinor = userPayments.reduce((acc, curr) => acc + (curr.amountMinor || 0), 0);

      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          data: {
            totalPlans: userPlans.length,
            activePlans: activePlans.length,
            pendingPlans: pendingPlans.length,
            totalContributedMinor,
            currency: 'NGN',
            recentPlans: userPlans.slice(0, 5)
          }
        }
      };
    }

    // POST /plans
    if (pathname === '/plans' && normalizedMethod === 'POST') {
      const user = this._getAuthUser(headers);
      if (!user) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Unauthorized' }
        };
      }
      const { packageId, coveredPerson } = parsedBody;

      if (!packageId) {
        return {
          status: 400,
          headers: {},
          data: { success: false, message: 'Please select a package' }
        };
      }
      const pkg = this.state.packages.find(p => p._id === packageId);
      if (!pkg) {
        return {
          status: 404,
          headers: {},
          data: { success: false, message: 'Selected package does not exist' }
        };
      }
      if (!coveredPerson || !coveredPerson.fullName || !coveredPerson.relationship || !coveredPerson.address) {
        return {
          status: 400,
          headers: {},
          data: {
            success: false,
            message: 'Covered person fullName, relationship, and address are required'
          }
        };
      }

      const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newPlan = {
        _id: planId,
        userId: user._id,
        packageId,
        packageName: pkg.name,
        package: packageId,
        status: 'Pending',
        coveredPerson: {
          fullName: coveredPerson.fullName,
          relationship: coveredPerson.relationship,
          dateOfBirth: coveredPerson.dateOfBirth || null,
          gender: coveredPerson.gender || null,
          address: coveredPerson.address,
          phoneNumber: coveredPerson.phoneNumber || null
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.state.plans.unshift(newPlan);

      return {
        status: 201,
        headers: {},
        data: {
          success: true,
          message: 'Plan created successfully',
          data: newPlan
        }
      };
    }

    // GET /plans
    if (pathname === '/plans' && normalizedMethod === 'GET') {
      const user = this._getAuthUser(headers);
      if (!user) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Unauthorized' }
        };
      }
      const userPlans = this.state.plans.filter(p => p.userId === user._id);
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '20', 10);

      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          data: {
            items: userPlans,
            pagination: {
              total: userPlans.length,
              page,
              limit,
              totalPages: Math.max(1, Math.ceil(userPlans.length / limit))
            }
          }
        }
      };
    }

    // GET /plans/:id
    if (pathname.startsWith('/plans/') && normalizedMethod === 'GET') {
      const user = this._getAuthUser(headers);
      if (!user) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Unauthorized' }
        };
      }
      const planId = pathname.slice('/plans/'.length);
      const plan = this.state.plans.find(p => p._id === planId && p.userId === user._id);
      if (!plan) {
        return {
          status: 404,
          headers: {},
          data: { success: false, message: 'Plan not found' }
        };
      }
      return {
        status: 200,
        headers: {},
        data: { success: true, data: plan }
      };
    }

    // --- 3. PAYMENTS & SUBSCRIPTIONS ROUTES ---

    // POST /payments/plans/:planId/initialize-initial
    if (pathname.startsWith('/payments/plans/') && pathname.endsWith('/initialize-initial') && normalizedMethod === 'POST') {
      const user = this._getAuthUser(headers);
      if (!user) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Unauthorized' }
        };
      }
      const parts = pathname.split('/');
      const planId = parts[3];
      const plan = this.state.plans.find(p => p._id === planId && p.userId === user._id);

      if (!plan) {
        return {
          status: 404,
          headers: {},
          data: { success: false, message: 'Plan not found' }
        };
      }
      if (plan.status === 'Active') {
        return {
          status: 400,
          headers: {},
          data: { success: false, message: 'Plan is already active and paid' }
        };
      }

      const reference = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      if (!this.paymentReferences) this.paymentReferences = new Map();
      this.paymentReferences.set(reference, planId);

      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          data: {
            paymentId: `pay_init_${reference}`,
            reference,
            authorizationUrl: `https://checkout.paystack.com/${reference}`,
            accessCode: `acc_${reference}`
          }
        }
      };
    }

    // POST /payments/verify/:reference
    if (pathname.startsWith('/payments/verify/') && normalizedMethod === 'POST') {
      const user = this._getAuthUser(headers);
      if (!user) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Unauthorized' }
        };
      }
      const reference = pathname.slice('/payments/verify/'.length);
      if (!reference || reference === 'invalid_ref') {
        return {
          status: 400,
          headers: {},
          data: { success: false, message: 'Payment verification failed at gateway' }
        };
      }

      const planIdFromRef = this.paymentReferences ? this.paymentReferences.get(reference) : null;
      let plan = planIdFromRef ? this.state.plans.find(p => p._id === planIdFromRef) : null;
      if (!plan) {
        plan = this.state.plans.find(p => p.userId === user._id && p.status === 'Pending');
      }
      if (!plan) {
        plan = this.state.plans.find(p => p.userId === user._id) || this.state.plans[0];
      }

      if (plan) {
        plan.status = 'Active';
      }

      const pkg = this.state.packages.find(p => p._id === (plan ? plan.packageId : 'pkg_essential_001')) || this.state.packages[0];
      const amountMinor = pkg ? pkg.amount * 100 : 500000;

      const newPayment = {
        _id: `pay_${Date.now()}`,
        userId: user._id,
        planId: plan ? plan._id : 'plan_active_001',
        plan: plan ? plan._id : 'plan_active_001',
        reference,
        amountMinor,
        currency: 'NGN',
        status: 'Successful',
        purpose: 'Plan Activation',
        channel: 'card',
        processedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      this.state.payments.unshift(newPayment);

      const newSub = {
        _id: `sub_${Date.now()}`,
        userId: user._id,
        plan: plan ? plan._id : 'plan_active_001',
        planId: plan ? plan._id : 'plan_active_001',
        packageId: pkg ? pkg._id : 'pkg_essential_001',
        status: 'active',
        amountMinor,
        currency: 'NGN',
        billingInterval: 'monthly',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
      this.state.subscriptions.unshift(newSub);

      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          message: 'Payment verified and plan activated successfully',
          data: newPayment
        }
      };
    }

    // GET /payments
    if (pathname === '/payments' && normalizedMethod === 'GET') {
      const user = this._getAuthUser(headers);
      if (!user) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Unauthorized' }
        };
      }
      let userPayments = this.state.payments.filter(p => p.userId === user._id);

      const status = searchParams.get('status');
      if (status) {
        userPayments = userPayments.filter(p => p.status.toLowerCase() === status.toLowerCase());
      }
      const planId = searchParams.get('planId');
      if (planId) {
        userPayments = userPayments.filter(p => p.planId === planId || p.plan === planId);
      }

      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '20', 10);

      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          data: {
            items: userPayments,
            pagination: {
              total: userPayments.length,
              page,
              limit,
              totalPages: Math.max(1, Math.ceil(userPayments.length / limit))
            }
          }
        }
      };
    }

    // GET /payments/:id
    if (pathname.startsWith('/payments/') && normalizedMethod === 'GET') {
      const user = this._getAuthUser(headers);
      if (!user) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Unauthorized' }
        };
      }
      const payId = pathname.slice('/payments/'.length);
      const payment = this.state.payments.find(p => p._id === payId && p.userId === user._id);
      if (!payment) {
        return {
          status: 404,
          headers: {},
          data: { success: false, message: 'Payment not found' }
        };
      }
      return {
        status: 200,
        headers: {},
        data: { success: true, data: payment }
      };
    }

    // GET /subscriptions
    if (pathname === '/subscriptions' && normalizedMethod === 'GET') {
      const user = this._getAuthUser(headers);
      if (!user) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Unauthorized' }
        };
      }
      const userSubs = this.state.subscriptions.filter(s => s.userId === user._id);
      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          data: userSubs
        }
      };
    }

    // GET /subscriptions/:id
    if (pathname.startsWith('/subscriptions/') && normalizedMethod === 'GET') {
      const user = this._getAuthUser(headers);
      if (!user) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Unauthorized' }
        };
      }
      const subId = pathname.slice('/subscriptions/'.length);
      const sub = this.state.subscriptions.find(s => s._id === subId && s.userId === user._id);
      if (!sub) {
        return {
          status: 404,
          headers: {},
          data: { success: false, message: 'Subscription not found' }
        };
      }
      return {
        status: 200,
        headers: {},
        data: { success: true, data: sub }
      };
    }

    // --- 4. NOTIFICATIONS ROUTES ---

    // GET /notifications
    if (pathname === '/notifications' && normalizedMethod === 'GET') {
      const user = this._getAuthUser(headers);
      if (!user) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Unauthorized' }
        };
      }
      let userNotifs = this.state.notifications.filter(n => n.userId === user._id);

      const isReadParam = searchParams.get('isRead');
      if (isReadParam !== null && isReadParam !== undefined && isReadParam !== '') {
        const isReadBool = isReadParam === 'true';
        userNotifs = userNotifs.filter(n => n.isRead === isReadBool);
      }

      const totalUnread = this.state.notifications.filter(n => n.userId === user._id && !n.isRead).length;
      const totalAll = this.state.notifications.filter(n => n.userId === user._id).length;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '20', 10);

      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          data: {
            items: userNotifs,
            pagination: {
              total: userNotifs.length,
              page,
              limit,
              totalPages: Math.max(1, Math.ceil(userNotifs.length / limit))
            },
            counts: {
              totalNotifications: totalAll,
              totalUnreadNotifications: totalUnread
            }
          }
        }
      };
    }

    // PATCH /notifications/:id/read
    if (pathname.startsWith('/notifications/') && pathname.endsWith('/read') && normalizedMethod === 'PATCH') {
      const user = this._getAuthUser(headers);
      if (!user) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Unauthorized' }
        };
      }
      const parts = pathname.split('/');
      const notifId = parts[2];
      const notif = this.state.notifications.find(n => n._id === notifId && n.userId === user._id);

      if (!notif) {
        return {
          status: 404,
          headers: {},
          data: { success: false, message: 'Notification not found' }
        };
      }

      notif.isRead = true;
      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          data: notif
        }
      };
    }

    // DELETE /notifications/:id
    if (pathname.startsWith('/notifications/') && normalizedMethod === 'DELETE') {
      const user = this._getAuthUser(headers);
      if (!user) {
        return {
          status: 401,
          headers: {},
          data: { success: false, message: 'Unauthorized' }
        };
      }
      const notifId = pathname.slice('/notifications/'.length);
      const exists = this.state.notifications.some(n => n._id === notifId && n.userId === user._id);

      if (!exists) {
        return {
          status: 404,
          headers: {},
          data: { success: false, message: 'Notification not found' }
        };
      }

      this.state.notifications = this.state.notifications.filter(n => !(n._id === notifId && n.userId === user._id));
      return {
        status: 200,
        headers: {},
        data: {
          success: true,
          message: 'Notification deleted'
        }
      };
    }

    return {
      status: 404,
      headers: {},
      data: { success: false, message: `Cannot ${normalizedMethod} ${pathname}` }
    };
  }

  // Optional HTTP server for live port listening
  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = http.createServer(async (req, res) => {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            const result = await this.handleRequest({
              method: req.method,
              path: req.url,
              headers: req.headers,
              body
            });
            res.writeHead(result.status, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              ...result.headers
            });
            res.end(JSON.stringify(result.data));
          });
        });

        this.server.listen(this.port, '127.0.0.1', () => {
          const address = this.server.address();
          this.port = address.port;
          this.baseUrl = `http://127.0.0.1:${this.port}/api/v1`;
          resolve(this.baseUrl);
        });
        this.server.on('error', (err) => {
          // If listen fails (e.g. sandbox restrictions), fallback to in-process URL
          this.baseUrl = 'mock://backend/api/v1';
          resolve(this.baseUrl);
        });
      } catch {
        this.baseUrl = 'mock://backend/api/v1';
        resolve(this.baseUrl);
      }
    });
  }

  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }
}

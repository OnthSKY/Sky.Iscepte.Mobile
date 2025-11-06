/**
 * E2E Tests for Login Flow
 * 
 * Tests the complete login user flow from UI interaction to authentication
 */

describe('Login E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen on app launch', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should display username and password fields', async () => {
    await expect(element(by.id('username-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
  });

  it('should show error for empty form submission', async () => {
    await element(by.id('login-button')).tap();
    // Wait for validation error
    await waitFor(element(by.text(/required|gerekli/i)))
      .toBeVisible()
      .withTimeout(2000);
  });

  it('should successfully login with valid credentials', async () => {
    // Fill in credentials
    await element(by.id('username-input')).typeText('admin');
    await element(by.id('password-input')).typeText('1234');
    
    // Tap login button
    await element(by.id('login-button')).tap();
    
    // Wait for navigation to dashboard
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show error for invalid credentials', async () => {
    // Fill in invalid credentials
    await element(by.id('username-input')).typeText('invalid');
    await element(by.id('password-input')).typeText('wrong');
    
    // Tap login button
    await element(by.id('login-button')).tap();
    
    // Wait for error message
    await waitFor(element(by.text(/invalid|geçersiz/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should toggle password visibility', async () => {
    await element(by.id('password-input')).typeText('test1234');
    await element(by.id('password-toggle')).tap();
    
    // Password should be visible
    await expect(element(by.id('password-input'))).toHaveValue('test1234');
  });
});


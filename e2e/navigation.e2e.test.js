/**
 * E2E Tests for Navigation Flow
 * 
 * Tests navigation between screens
 */

describe('Navigation E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should navigate to dashboard after login', async () => {
    // Login first
    await element(by.id('username-input')).typeText('admin');
    await element(by.id('password-input')).typeText('1234');
    await element(by.id('login-button')).tap();
    
    // Wait for dashboard
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should navigate to settings screen', async () => {
    // Login first
    await element(by.id('username-input')).typeText('admin');
    await element(by.id('password-input')).typeText('1234');
    await element(by.id('login-button')).tap();
    
    // Navigate to settings
    await waitFor(element(by.id('settings-button')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('settings-button')).tap();
    
    // Verify settings screen
    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should navigate back from detail screen', async () => {
    // Login first
    await element(by.id('username-input')).typeText('admin');
    await element(by.id('password-input')).typeText('1234');
    await element(by.id('login-button')).tap();
    
    // Navigate to a list screen (e.g., products)
    await waitFor(element(by.id('products-list')))
      .toBeVisible()
      .withTimeout(3000);
    
    // Tap on first item
    await element(by.id('product-item-0')).tap();
    
    // Verify detail screen
    await waitFor(element(by.id('product-detail-screen')))
      .toBeVisible()
      .withTimeout(3000);
    
    // Navigate back
    await element(by.id('back-button')).tap();
    
    // Verify list screen is visible again
    await waitFor(element(by.id('products-list')))
      .toBeVisible()
      .withTimeout(3000);
  });
});


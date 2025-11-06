/**
 * E2E Tests for Form Submission
 * 
 * Tests form creation and editing flows
 */

describe('Form E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should create a new product', async () => {
    // Login first
    await element(by.id('username-input')).typeText('admin');
    await element(by.id('password-input')).typeText('1234');
    await element(by.id('login-button')).tap();
    
    // Navigate to products
    await waitFor(element(by.id('products-list')))
      .toBeVisible()
      .withTimeout(3000);
    
    // Tap create button
    await element(by.id('create-product-button')).tap();
    
    // Fill form
    await element(by.id('product-name-input')).typeText('Test Product');
    await element(by.id('product-price-input')).typeText('100');
    
    // Submit form
    await element(by.id('submit-button')).tap();
    
    // Verify success message or navigation
    await waitFor(element(by.text(/success|başarılı/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should validate required fields', async () => {
    // Login first
    await element(by.id('username-input')).typeText('admin');
    await element(by.id('password-input')).typeText('1234');
    await element(by.id('login-button')).tap();
    
    // Navigate to create form
    await waitFor(element(by.id('create-product-button')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('create-product-button')).tap();
    
    // Try to submit without filling required fields
    await element(by.id('submit-button')).tap();
    
    // Verify validation errors
    await waitFor(element(by.text(/required|gerekli/i)))
      .toBeVisible()
      .withTimeout(2000);
  });

  it('should edit existing item', async () => {
    // Login first
    await element(by.id('username-input')).typeText('admin');
    await element(by.id('password-input')).typeText('1234');
    await element(by.id('login-button')).tap();
    
    // Navigate to list
    await waitFor(element(by.id('products-list')))
      .toBeVisible()
      .withTimeout(3000);
    
    // Tap on first item
    await element(by.id('product-item-0')).tap();
    
    // Tap edit button
    await waitFor(element(by.id('edit-button')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('edit-button')).tap();
    
    // Modify form
    await element(by.id('product-name-input')).clearText();
    await element(by.id('product-name-input')).typeText('Updated Product');
    
    // Submit
    await element(by.id('submit-button')).tap();
    
    // Verify update
    await waitFor(element(by.text(/updated|güncellendi/i)))
      .toBeVisible()
      .withTimeout(5000);
  });
});


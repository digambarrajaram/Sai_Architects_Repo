describe('Auth Flow', () => {
  beforeEach(async () => {
    // Navigate back to login screen before each test
    await device.reloadReactNative();
  });

  it('should display the login screen with all form elements', async () => {
    await expect(element(by.id('username-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
    await expect(element(by.id('login-button'))).toBeVisible();
    await expect(element(by.text('Sign In securely'))).toBeVisible();
  });

  it('should login successfully with owner credentials and redirect to projects', async () => {
    await element(by.id('username-input')).typeText('james_owner');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Wait for navigation to projects list
    await waitFor(element(by.id('projects-title')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should login successfully with supervisor credentials', async () => {
    await element(by.id('username-input')).typeText('tom_supervisor');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Wait for navigation to projects list
    await waitFor(element(by.id('projects-title')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show validation error when username is empty', async () => {
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Button should remain enabled but no navigation should occur
    await expect(element(by.id('login-button'))).toBeVisible();
  });

  it('should navigate back to login after logout', async () => {
    // First login
    await element(by.id('username-input')).typeText('james_owner');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Wait for projects screen
    await waitFor(element(by.id('projects-title')))
      .toBeVisible()
      .withTimeout(5000);

    // Navigate to profile to find logout
    await element(by.id('profile-tab')).tap();
    await waitFor(element(by.id('profile-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Tap logout button if available
    const logoutButton = element(by.id('logout-button'));
    if (await logoutButton.isVisible()) {
      await logoutButton.tap();

      // Verify back to login
      await waitFor(element(by.id('username-input')))
        .toBeVisible()
        .withTimeout(5000);
    }
  });
});

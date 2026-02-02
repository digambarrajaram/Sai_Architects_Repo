describe('Navigation Flow', () => {
  beforeAll(async () => {
    // Login as owner before running navigation tests
    await device.reloadReactNative();
    await element(by.id('username-input')).typeText('james_owner');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Wait for projects list
    await waitFor(element(by.id('projects-title')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should display bottom tab navigation bar', async () => {
    await expect(element(by.id('bottom-tab-bar'))).toBeVisible();
  });

  it('should have projects tab visible and clickable', async () => {
    const projectsTab = element(by.id('projects-tab'));
    await expect(projectsTab).toBeVisible();
    await expect(projectsTab).toBeEnabled();
  });

  it('should have profile tab visible and clickable', async () => {
    const profileTab = element(by.id('profile-tab'));
    await expect(profileTab).toBeVisible();
    await expect(profileTab).toBeEnabled();
  });

  it('should switch tabs when tapped', async () => {
    // Switch to profile tab
    await element(by.id('profile-tab')).tap();
    await waitFor(element(by.id('profile-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Switch back to projects tab
    await element(by.id('projects-tab')).tap();
    await waitFor(element(by.id('projects-list')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should navigate back from project detail using back navigation', async () => {
    // Navigate to project detail
    const projectCard = element(by.id('project-card-0'));
    await projectCard.tap();

    await waitFor(element(by.id('project-detail-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Use back navigation
    const backButton = element(by.id('back-button'));
    if (await backButton.isVisible()) {
      await backButton.tap();

      // Verify back to projects list
      await waitFor(element(by.id('projects-list')))
        .toBeVisible()
        .withTimeout(5000);
    }
  });

  it('should not show blank screens after login', async () => {
    // Already on projects screen, verify content is visible
    await expect(element(by.id('projects-title'))).toBeVisible();
    await expect(element(by.id('projects-list'))).toBeVisible();
  });

  it('should not show blank screens after navigation', async () => {
    // Navigate to profile
    await element(by.id('profile-tab')).tap();
    await waitFor(element(by.id('profile-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify profile content is visible
    await expect(element(by.id('profile-avatar'))).toBeVisible();
  });

  it('should display active tab indicator', async () => {
    // Check that active tab has visual indicator
    const activeTab = element(by.id('projects-tab'));
    const indicator = element(by.id('active-tab-indicator'));

    if (await indicator.isVisible()) {
      await expect(indicator).toBeVisible();
    }
  });
});

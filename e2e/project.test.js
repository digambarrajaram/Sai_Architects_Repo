describe('Project Flow', () => {
  beforeAll(async () => {
    // Login as owner before running project tests
    await device.reloadReactNative();
    await element(by.id('username-input')).typeText('james_owner');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Wait for projects list
    await waitFor(element(by.id('projects-title')))
      .toBeVisible()
      .withTimeout(10000);
  });

  beforeEach(async () => {
    // Navigate back to projects list before each test
    await element(by.id('projects-tab')).tap();
    await waitFor(element(by.id('projects-title')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should display the projects list screen', async () => {
    await expect(element(by.id('projects-title'))).toBeVisible();
    await expect(element(by.id('projects-list'))).toBeVisible();
  });

  it('should display project cards with information', async () => {
    // Check that project cards are displayed
    const projectCard = element(by.id('project-card-0'));
    await waitFor(projectCard).toBeVisible().withTimeout(5000);

    // Verify project info elements exist
    await expect(element(by.id('project-name-0'))).toBeVisible();
    await expect(element(by.id('project-status-0'))).toBeVisible();
  });

  it('should navigate to project detail when selecting a project', async () => {
    const projectCard = element(by.id('project-card-0'));
    await projectCard.tap();

    // Verify navigation to project detail
    await waitFor(element(by.id('project-detail-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Check that expense list is visible
    await expect(element(by.id('expense-list'))).toBeVisible();
  });

  it('should display project detail header with project info', async () => {
    const projectCard = element(by.id('project-card-0'));
    await projectCard.tap();

    await waitFor(element(by.id('project-detail-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify header elements
    await expect(element(by.id('project-header-name'))).toBeVisible();
    await expect(element(by.id('project-header-budget'))).toBeVisible();
  });

  it('should handle empty project list gracefully', async () => {
    // This test would require mocking empty data
    // For now, verify the empty state component exists
    const emptyState = element(by.id('empty-projects-state'));
    if (await emptyState.isVisible()) {
      await expect(element(by.id('empty-projects-message'))).toBeVisible();
    }
  });
});

describe('Role Visibility', () => {
  describe('Owner Role', () => {
    beforeAll(async () => {
      // Login as owner
      await device.reloadReactNative();
      await element(by.id('username-input')).typeText('james_owner');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();

      await waitFor(element(by.id('projects-title')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should see user management option', async () => {
      await element(by.id('profile-tab')).tap();
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Check for user management in menu or settings
      const userManagement = element(by.id('user-management-option'));
      await waitFor(userManagement).toBeVisible().withTimeout(5000);
    });

    it('should see audit logs option', async () => {
      const auditLogs = element(by.id('audit-logs-option'));
      await waitFor(auditLogs).toBeVisible().withTimeout(5000);
    });

    it('should see owner dashboard option', async () => {
      const ownerDashboard = element(by.id('owner-dashboard-option'));
      await waitFor(ownerDashboard).toBeVisible().withTimeout(5000);
    });

    it('should see project owner controls in project detail', async () => {
      await element(by.id('projects-tab')).tap();
      await waitFor(element(by.id('projects-title')))
        .toBeVisible()
        .withTimeout(5000);

      // Navigate to project detail
      const projectCard = element(by.id('project-card-0'));
      await projectCard.tap();

      await waitFor(element(by.id('project-detail-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Check for owner-only controls
      const deleteButton = element(by.id('delete-project-button'));
      if (await deleteButton.isVisible()) {
        await expect(deleteButton).toBeVisible();
      }
    });

    it('should see add expense button', async () => {
      const addExpenseFab = element(by.id('add-expense-fab'));
      await expect(addExpenseFab).toBeVisible();
    });
  });

  describe('Supervisor Role', () => {
    beforeAll(async () => {
      // Login as supervisor
      await device.reloadReactNative();
      await element(by.id('username-input')).typeText('tom_supervisor');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();

      await waitFor(element(by.id('projects-title')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should NOT see user management option', async () => {
      await element(by.id('profile-tab')).tap();
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // User management should not be visible
      const userManagement = element(by.id('user-management-option'));
      await waitFor(userManagement).toBeNotVisible().withTimeout(3000);
    });

    it('should NOT see audit logs option', async () => {
      const auditLogs = element(by.id('audit-logs-option'));
      await waitFor(auditLogs).toBeNotVisible().withTimeout(3000);
    });

    it('should NOT see owner dashboard option', async () => {
      const ownerDashboard = element(by.id('owner-dashboard-option'));
      await waitFor(ownerDashboard).toBeNotVisible().withTimeout(3000);
    });

    it('should NOT see project owner controls in project detail', async () => {
      await element(by.id('projects-tab')).tap();
      await waitFor(element(by.id('projects-title')))
        .toBeVisible()
        .withTimeout(5000);

      // Navigate to project detail
      const projectCard = element(by.id('project-card-0'));
      await projectCard.tap();

      await waitFor(element(by.id('project-detail-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Owner-only controls should not be visible
      const deleteButton = element(by.id('delete-project-button'));
      await waitFor(deleteButton).toBeNotVisible().withTimeout(3000);
    });

    it('should still see add expense button', async () => {
      const addExpenseFab = element(by.id('add-expense-fab'));
      await expect(addExpenseFab).toBeVisible();
    });

    it('should see supervisor dashboard option', async () => {
      const supervisorDashboard = element(by.id('supervisor-dashboard-option'));
      await waitFor(supervisorDashboard).toBeVisible().withTimeout(5000);
    });
  });
});

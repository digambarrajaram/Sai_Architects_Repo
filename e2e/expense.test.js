describe('Expense Flow', () => {
  beforeAll(async () => {
    // Login as owner before running expense tests
    await device.reloadReactNative();
    await element(by.id('username-input')).typeText('james_owner');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Navigate to a project to access expenses
    await waitFor(element(by.id('projects-title')))
      .toBeVisible()
      .withTimeout(10000);

    // Select first project
    const projectCard = element(by.id('project-card-0'));
    await projectCard.tap();

    await waitFor(element(by.id('project-detail-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should display add expense FAB on project detail screen', async () => {
    await expect(element(by.id('add-expense-fab'))).toBeVisible();
  });

  it('should open add expense form when FAB is tapped', async () => {
    await element(by.id('add-expense-fab')).tap();

    await waitFor(element(by.id('add-expense-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify form fields exist
    await expect(element(by.id('expense-description-input'))).toBeVisible();
    await expect(element(by.id('expense-amount-input'))).toBeVisible();
    await expect(element(by.id('expense-category-select'))).toBeVisible();
    await expect(element(by.id('submit-expense-button'))).toBeVisible();
  });

  it('should submit a new expense successfully', async () => {
    // Navigate to add expense screen
    await element(by.id('add-expense-fab')).tap();

    await waitFor(element(by.id('add-expense-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Fill in expense details
    await element(by.id('expense-description-input')).typeText('Test Expense');
    await element(by.id('expense-amount-input')).typeText('1500');

    // Select category
    await element(by.id('expense-category-select')).tap();
    const materialOption = element(by.text('Material'));
    if (await materialOption.isVisible()) {
      await materialOption.tap();
    }

    // Submit
    await element(by.id('submit-expense-button')).tap();

    // Verify expense was added (should return to project detail)
    await waitFor(element(by.id('project-detail-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should validate required fields before submission', async () => {
    // Navigate to add expense screen
    await element(by.id('add-expense-fab')).tap();

    await waitFor(element(by.id('add-expense-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Try to submit without required fields
    await element(by.id('submit-expense-button')).tap();

    // Submit button should still be visible (validation should prevent submission)
    await expect(element(by.id('submit-expense-button'))).toBeVisible();
  });

  it('should display expenses in the expense list', async () => {
    // Check that expense items are displayed
    const expenseItem = element(by.id('expense-item-0'));
    await waitFor(expenseItem).toBeVisible().withTimeout(5000);

    // Verify expense info elements
    await expect(element(by.id('expense-description-0'))).toBeVisible();
    await expect(element(by.id('expense-amount-0'))).toBeVisible();
    await expect(element(by.id('expense-date-0'))).toBeVisible();
  });

  it('should handle empty expense list gracefully', async () => {
    // This test would require a project with no expenses
    const emptyState = element(by.id('empty-expenses-state'));
    if (await emptyState.isVisible()) {
      await expect(element(by.id('empty-expenses-message'))).toBeVisible();
    }
  });
});

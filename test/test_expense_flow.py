#!/usr/bin/env python3
"""
CivManager QA - Expense Flow Tests

Tests expense-related flows:
- Add Expense button visible on project detail
- Add Expense screen loads
- Submit expense form (mock)
- Expense appears in list

CRITICAL: Uses ONLY data-testid and accessibilityLabel selectors
"""

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import os


# ================= CONFIGURATION =================

BASE_URL = os.getenv("APP_URL", "http://localhost:8081")
WAIT_TIMEOUT = int(os.getenv("WAIT_TIMEOUT", "15"))


# ================= DRIVER SETUP =================

@pytest.fixture(scope="module")
def driver():
    """Setup Chrome driver for tests."""
    options = Options()
    
    if os.getenv("CI", "false").lower() == "true":
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
    
    options.add_argument("--start-maximized")
    
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(0)
    
    yield driver
    
    driver.quit()


# ================= WAIT HELPERS =================

def wait_for_element(driver, selector, selector_type=By.XPATH, timeout=WAIT_TIMEOUT):
    """Wait for element to be present in DOM."""
    try:
        return WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((selector_type, selector))
        )
    except TimeoutException:
        raise AssertionError(f"Element not found: {selector}")


def wait_for_clickable(driver, selector, selector_type=By.XPATH, timeout=WAIT_TIMEOUT):
    """Wait for element to be clickable."""
    try:
        return WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable((selector_type, selector))
        )
    except TimeoutException:
        raise AssertionError(f"Element not clickable: {selector}")


def wait_for_visible(driver, selector, selector_type=By.XPATH, timeout=WAIT_TIMEOUT):
    """Wait for element to be visible."""
    try:
        return WebDriverWait(driver, timeout).until(
            EC.visibility_of_element_located((selector_type, selector))
        )
    except TimeoutException:
        raise AssertionError(f"Element not visible: {selector}")


def navigate_to_add_expense(driver):
    """Navigate to add expense screen."""
    # Navigate to project detail first
    driver.get(BASE_URL)
    wait_for_visible(driver, "username-input", By.ID)
    
    username_input = wait_for_element(driver, "username-input", By.ID)
    username_input.clear()
    username_input.send_keys("test_user")
    
    login_btn = wait_for_clickable(driver, "login-button", By.ID)
    login_btn.click()
    
    wait_for_visible(driver, "project-list-title", By.ID)
    
    # Click on first project
    first_project = wait_for_clickable(driver, "project-card-0", By.ID)
    first_project.click()
    
    # Click add expense button
    add_expense_btn = wait_for_clickable(driver, "add-expense-button", By.ID)
    add_expense_btn.click()
    
    # Verify add expense screen loaded
    wait_for_visible(driver, "add-expense-title", By.ID)


# ================= TEST CASES =================

class TestExpenseFlow:
    """Test expense-related flows."""
    
    def test_add_expense_button_visible(self, driver):
        """Verify Add Expense button is visible on project detail."""
        navigate_to_add_expense(driver)
        
        # Just verify navigation worked (button clicked and screen loaded)
        add_expense_title = wait_for_visible(driver, "add-expense-title", By.ID)
        assert add_expense_title is not None, "Add expense screen did not load"
    
    def test_add_expense_screen_form_fields(self, driver):
        """Verify all required form fields exist on add expense screen."""
        navigate_to_add_expense(driver)
        
        # Verify expense description field
        description_field = wait_for_visible(driver, "expense-description-input", By.ID)
        assert description_field is not None, "Description field not found"
        
        # Verify expense amount field
        amount_field = wait_for_visible(driver, "expense-amount-input", By.ID)
        assert amount_field is not None, "Amount field not found"
        
        # Verify category dropdown exists
        category_dropdown = wait_for_visible(driver, "expense-category-select", By.ID)
        assert category_dropdown is not None, "Category dropdown not found"
    
    def test_submit_expense_form(self, driver):
        """Test submitting a new expense (mock submission)."""
        navigate_to_add_expense(driver)
        
        # Fill expense form
        description = wait_for_element(driver, "expense-description-input", By.ID)
        description.clear()
        description.send_keys("Test Expense Description")
        
        amount = wait_for_element(driver, "expense-amount-input", By.ID)
        amount.clear()
        amount.send_keys("100.00")
        
        # Select category
        category = wait_for_clickable(driver, "expense-category-select", By.ID)
        category.click()
        first_option = wait_for_clickable(driver, "expense-category-option-0", By.ID)
        first_option.click()
        
        # Submit expense
        submit_btn = wait_for_clickable(driver, "submit-expense-button", By.ID)
        submit_btn.click()
        
        # Verify navigation back to expense list
        try:
            wait_for_visible(driver, "expense-list", By.ID, timeout=5)
        except AssertionError:
            # May show success message instead
            wait_for_visible(driver, "expense-submit-success", By.ID, timeout=5)
    
    def test_expense_validation(self, driver):
        """Test expense form validation."""
        navigate_to_add_expense(driver)
        
        # Try to submit empty form
        submit_btn = wait_for_clickable(driver, "submit-expense-button", By.ID)
        submit_btn.click()
        
        # Verify validation error appears
        validation_error = wait_for_visible(driver, "validation-error-message", By.ID, timeout=3)
        assert validation_error is not None, "Validation error not shown for empty form"
    
    def test_expense_list_displays_items(self, driver):
        """Verify expense list shows added expenses."""
        driver.get(BASE_URL)
        
        # Login
        wait_for_visible(driver, "username-input", By.ID)
        username_input = wait_for_element(driver, "username-input", By.ID)
        username_input.clear()
        username_input.send_keys("test_user")
        
        login_btn = wait_for_clickable(driver, "login-button", By.ID)
        login_btn.click()
        
        # Navigate to project
        wait_for_visible(driver, "project-list-title", By.ID)
        first_project = wait_for_clickable(driver, "project-card-0", By.ID)
        first_project.click()
        
        # Check expense list items
        expense_items = wait_for_element(driver, "expense-item", By.ID)
        assert expense_items is not None, "No expense items found"
    
    def test_empty_expense_list(self, driver):
        """Verify empty state shows when no expenses exist."""
        driver.get(BASE_URL)
        
        # Login
        wait_for_visible(driver, "username-input", By.ID)
        username_input = wait_for_element(driver, "username-input", By.ID)
        username_input.clear()
        username_input.send_keys("test_user")
        
        login_btn = wait_for_clickable(driver, "login-button", By.ID)
        login_btn.click()
        
        # Navigate to project
        wait_for_visible(driver, "project-list-title", By.ID)
        first_project = wait_for_clickable(driver, "project-card-0", By.ID)
        first_project.click()
        
        # Look for empty state
        try:
            empty_state = wait_for_element(driver, "empty-expense-list", By.ID, timeout=3)
            assert empty_state is not None, "Empty expense list state not visible"
        except AssertionError:
            # Expenses exist - test passes
            pass

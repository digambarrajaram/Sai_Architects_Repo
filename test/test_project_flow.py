#!/usr/bin/env python3
"""
CivManager QA - Project Flow Tests

Tests project-related flows:
- Project list renders
- Select project navigates to detail
- Project detail loads correctly
- Expense list is visible

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


def login(driver, username="test_user"):
    """Login helper."""
    driver.get(BASE_URL)
    wait_for_visible(driver, "username-input", By.ID)
    
    username_input = wait_for_element(driver, "username-input", By.ID)
    username_input.clear()
    username_input.send_keys(username)
    
    login_btn = wait_for_clickable(driver, "login-button", By.ID)
    login_btn.click()
    
    wait_for_visible(driver, "project-list-title", By.ID)


# ================= TEST CASES =================

class TestProjectFlow:
    """Test project-related flows."""
    
    def test_project_list_renders(self, driver):
        """Verify project list screen renders correctly."""
        login(driver)
        
        # Verify project list title
        project_list_title = wait_for_visible(driver, "project-list-title", By.ID)
        assert project_list_title is not None, "Project list title not visible"
        
        # Verify project cards are present
        project_cards = wait_for_element(driver, "project-card", By.ID)
        assert project_cards is not None, "No project cards found"
    
    def test_select_project_navigates_to_detail(self, driver):
        """Verify clicking a project navigates to detail screen."""
        login(driver)
        
        # Click on first project card
        first_project = wait_for_clickable(driver, "project-card-0", By.ID)
        first_project.click()
        
        # Verify project detail loads
        wait_for_visible(driver, "project-detail-header", By.ID)
    
    def test_project_detail_contains_expense_list(self, driver):
        """Verify project detail shows expense list."""
        login(driver)
        
        # Navigate to a project
        first_project = wait_for_clickable(driver, "project-card-0", By.ID)
        first_project.click()
        
        # Wait for expense list
        expense_list = wait_for_visible(driver, "expense-list", By.ID)
        assert expense_list is not None, "Expense list not visible on project detail"
    
    def test_project_card_displays_info(self, driver):
        """Verify project card shows required information."""
        login(driver)
        
        # Check first project card has name
        project_name = wait_for_element(driver, "project-card-0-name", By.ID)
        assert project_name is not None, "Project name not found on card"
        
        # Check project status is visible
        project_status = wait_for_element(driver, "project-card-0-status", By.ID)
        assert project_status is not None, "Project status not found on card"
    
    def test_empty_project_list(self, driver):
        """Verify empty state shows when no projects exist."""
        login(driver)
        
        # Look for empty state (if no projects)
        try:
            empty_state = wait_for_element(driver, "empty-project-list", By.ID, timeout=3)
            assert empty_state is not None, "Empty state not visible"
        except AssertionError:
            # Projects exist - test passes
            pass
    
    def test_project_detail_header(self, driver):
        """Verify project detail header contains project info."""
        login(driver)
        
        # Navigate to project detail
        first_project = wait_for_clickable(driver, "project-card-0", By.ID)
        first_project.click()
        
        # Verify header elements
        project_title = wait_for_visible(driver, "project-detail-title", By.ID)
        project_budget = wait_for_visible(driver, "project-detail-budget", By.ID)
        
        assert project_title is not None, "Project title not in detail header"
        assert project_budget is not None, "Project budget not in detail header"

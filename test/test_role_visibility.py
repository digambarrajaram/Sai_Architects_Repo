#!/usr/bin/env python3
"""
CivManager QA - Role Visibility Tests

Tests role-based UI visibility:
- Owner-only UI hidden for Supervisor
- Supervisor-only UI hidden for Owner

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


def wait_for_invisible(driver, selector, selector_type=By.XPATH, timeout=WAIT_TIMEOUT):
    """Wait for element to be invisible/hidden."""
    try:
        return WebDriverWait(driver, timeout).until(
            EC.invisibility_of_element_located((selector_type, selector))
        )
    except TimeoutException:
        raise AssertionError(f"Element should be invisible: {selector}")


def login_as_user(driver, username="owner_user"):
    """Login as specified user."""
    driver.get(BASE_URL)
    
    wait_for_visible(driver, "username-input", By.ID)
    username_input = wait_for_element(driver, "username-input", By.ID)
    username_input.clear()
    username_input.send_keys(username)
    
    login_btn = wait_for_clickable(driver, "login-button", By.ID)
    login_btn.click()
    
    # Wait for projects list
    wait_for_visible(driver, "project-list-title", By.ID)


def is_element_present(driver, selector, selector_type=By.XPATH):
    """Check if element is present in DOM."""
    try:
        driver.find_element(selector_type, selector)
        return True
    except:
        return False


# ================= TEST CASES =================

class TestRoleVisibility:
    """Test role-based UI visibility."""
    
    def test_owner_sees_user_management(self, driver):
        """Owner should see User Management option."""
        login_as_user(driver, "owner_user")
        
        # Navigate to profile/admin section
        profile_tab = wait_for_clickable(driver, "tab-profile", By.ID)
        profile_tab.click()
        
        wait_for_visible(driver, "profile-screen", By.ID)
        
        # User Management should be visible
        user_mgmt = wait_for_element(driver, "user-management-link", By.ID)
        assert user_mgmt is not None, "User Management should be visible to Owner"
    
    def test_owner_sees_audit_logs(self, driver):
        """Owner should see Audit Logs option."""
        login_as_user(driver, "owner_user")
        
        # Navigate to profile/admin section
        profile_tab = wait_for_clickable(driver, "tab-profile", By.ID)
        profile_tab.click()
        
        wait_for_visible(driver, "profile-screen", By.ID)
        
        # Audit Logs should be visible
        audit_logs = wait_for_element(driver, "audit-logs-link", By.ID)
        assert audit_logs is not None, "Audit Logs should be visible to Owner"
    
    def test_owner_sees_owner_dashboard(self, driver):
        """Owner should see Owner-specific dashboard."""
        login_as_user(driver, "owner_user")
        
        # Financial dashboard should be visible
        dashboard = wait_for_element(driver, "financial-dashboard-owner", By.ID)
        assert dashboard is not None, "Owner dashboard should be visible"
    
    def test_supervisor_hides_user_management(self, driver):
        """Supervisor should NOT see User Management."""
        login_as_user(driver, "supervisor_user")
        
        # Navigate to profile section
        profile_tab = wait_for_clickable(driver, "tab-profile", By.ID)
        profile_tab.click()
        
        wait_for_visible(driver, "profile-screen", By.ID)
        
        # User Management should NOT be present
        assert not is_element_present(driver, "user-management-link", By.ID), \
            "User Management should NOT be visible to Supervisor"
    
    def test_supervisor_hides_audit_logs(self, driver):
        """Supervisor should NOT see Audit Logs."""
        login_as_user(driver, "supervisor_user")
        
        # Navigate to profile section
        profile_tab = wait_for_clickable(driver, "tab-profile", By.ID)
        profile_tab.click()
        
        wait_for_visible(driver, "profile-screen", By.ID)
        
        # Audit Logs should NOT be present
        assert not is_element_present(driver, "audit-logs-link", By.ID), \
            "Audit Logs should NOT be visible to Supervisor"
    
    def test_supervisor_hides_owner_dashboard(self, driver):
        """Supervisor should NOT see Owner-specific dashboard."""
        login_as_user(driver, "supervisor_user")
        
        # Owner dashboard should NOT be present
        assert not is_element_present(driver, "financial-dashboard-owner", By.ID), \
            "Owner dashboard should NOT be visible to Supervisor"
    
    def test_supervisor_sees_supervisor_dashboard(self, driver):
        """Supervisor should see Supervisor-specific dashboard."""
        login_as_user(driver, "supervisor_user")
        
        # Supervisor dashboard should be visible
        dashboard = wait_for_element(driver, "supervisor-dashboard", By.ID)
        assert dashboard is not None, "Supervisor dashboard should be visible"
    
    def test_owner_sees_project_owner_controls(self, driver):
        """Owner should see owner-specific project controls."""
        login_as_user(driver, "owner_user")
        
        # Navigate to project detail
        first_project = wait_for_clickable(driver, "project-card-0", By.ID)
        first_project.click()
        
        wait_for_visible(driver, "project-detail-owner", By.ID)
        
        # Owner controls should be visible
        owner_controls = wait_for_element(driver, "project-owner-controls", By.ID)
        assert owner_controls is not None, "Owner controls should be visible"
    
    def test_supervisor_hides_project_owner_controls(self, driver):
        """Supervisor should NOT see owner-specific project controls."""
        login_as_user(driver, "supervisor_user")
        
        # Navigate to project detail
        first_project = wait_for_clickable(driver, "project-card-0", By.ID)
        first_project.click()
        
        wait_for_visible(driver, "project-detail-supervisor", By.ID)
        
        # Owner controls should NOT be present
        assert not is_element_present(driver, "project-owner-controls", By.ID), \
            "Owner controls should NOT be visible to Supervisor"
    
    def test_add_expense_visible_to_both_roles(self, driver):
        """Both Owner and Supervisor should see Add Expense button."""
        # Test as Owner
        login_as_user(driver, "owner_user")
        assert is_element_present(driver, "add-expense-button", By.ID), \
            "Add Expense should be visible to Owner"
        
        # Test as Supervisor
        driver.get(BASE_URL)
        wait_for_visible(driver, "username-input", By.ID)
        username_input = wait_for_element(driver, "username-input", By.ID)
        username_input.clear()
        username_input.send_keys("supervisor_user")
        
        login_btn = wait_for_clickable(driver, "login-button", By.ID)
        login_btn.click()
        
        wait_for_visible(driver, "project-list-title", By.ID)
        
        assert is_element_present(driver, "add-expense-button", By.ID), \
            "Add Expense should be visible to Supervisor"
    
    def test_view_expense_visible_to_both_roles(self, driver):
        """Both Owner and Supervisor should be able to view expenses."""
        # Test as Owner
        login_as_user(driver, "owner_user")
        
        first_project = wait_for_clickable(driver, "project-card-0", By.ID)
        first_project.click()
        
        wait_for_visible(driver, "expense-list", By.ID)
        
        # Test as Supervisor
        driver.get(BASE_URL)
        wait_for_visible(driver, "username-input", By.ID)
        username_input = wait_for_element(driver, "username-input", By.ID)
        username_input.clear()
        username_input.send_keys("supervisor_user")
        
        login_btn = wait_for_clickable(driver, "login-button", By.ID)
        login_btn.click()
        
        wait_for_visible(driver, "project-list-title", By.ID)
        
        first_project = wait_for_clickable(driver, "project-card-0", By.ID)
        first_project.click()
        
        wait_for_visible(driver, "expense-list", By.ID)
    
    def test_role_visibility_consistent_across_screens(self, driver):
        """Test role visibility is consistent across different screens."""
        # Test Owner
        login_as_user(driver, "owner_user")
        
        # Owner dashboard visible
        assert is_element_present(driver, "financial-dashboard-owner", By.ID)
        
        # Switch tabs and verify consistency
        profile_tab = wait_for_clickable(driver, "tab-profile", By.ID)
        profile_tab.click()
        
        wait_for_visible(driver, "user-management-link", By.ID)
        
        # Test Supervisor
        driver.get(BASE_URL)
        wait_for_visible(driver, "username-input", By.ID)
        username_input = wait_for_element(driver, "username-input", By.ID)
        username_input.clear()
        username_input.send_keys("supervisor_user")
        
        login_btn = wait_for_clickable(driver, "login-button", By.ID)
        login_btn.click()
        
        wait_for_visible(driver, "project-list-title", By.ID)
        
        # Supervisor dashboard visible
        assert is_element_present(driver, "supervisor-dashboard", By.ID)
        
        # Owner dashboard NOT visible
        assert not is_element_present(driver, "financial-dashboard-owner", By.ID)

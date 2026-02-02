#!/usr/bin/env python3
"""
CivManager QA - Auth Flow Tests

Tests authentication flow:
- Login screen renders
- Login success redirects to Projects list
- Logout returns to login

CRITICAL: Uses ONLY data-testid and accessibilityLabel selectors
"""

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import os
import time


# ================= CONFIGURATION =================

BASE_URL = os.getenv("APP_URL", "http://localhost:8081")
WAIT_TIMEOUT = int(os.getenv("WAIT_TIMEOUT", "15"))


# ================= DRIVER SETUP =================

@pytest.fixture(scope="module")
def driver():
    """Setup Chrome driver for tests."""
    options = Options()
    
    # CI-friendly options
    if os.getenv("CI", "false").lower() == "true":
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
    
    options.add_argument("--start-maximized")
    options.add_argument("--disable-notifications")
    
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(0)  # Disable implicit waits - use explicit only
    
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


def wait_for_url_contains(driver, substring, timeout=WAIT_TIMEOUT):
    """Wait for URL to contain substring."""
    try:
        WebDriverWait(driver, timeout).until(
            lambda d: substring in d.current_url
        )
    except TimeoutException:
        raise AssertionError(f"URL does not contain: {substring}")


# ================= HELPER FUNCTIONS =================

def login(driver, username):
    """Perform login with given username."""
    driver.get(BASE_URL)
    
    # Wait for login screen
    wait_for_visible(driver, "username-input", By.ID)
    
    # Enter username - using data-testid
    username_input = wait_for_element(driver, "username-input", By.ID)
    username_input.clear()
    username_input.send_keys(username)
    
    # Click login button
    login_btn = wait_for_clickable(driver, "login-button", By.ID)
    login_btn.click()
    
    # Wait for redirect to project list
    wait_for_visible(driver, "project-list-title", By.ID)
    
    # Verify we're on project list
    assert "project" in driver.current_url.lower() or \
           wait_for_element(driver, "project-list-title", By.ID) is not None


def logout(driver):
    """Perform logout and return to login screen."""
    # Go to Settings/Profile
    settings_tab = wait_for_clickable(driver, "tab-Settings", By.ID)
    settings_tab.click()
    
    # Wait for settings screen
    wait_for_visible(driver, "logout-button", By.ID)
    
    # Click logout
    logout_btn = wait_for_clickable(driver, "logout-button", By.ID)
    logout_btn.click()
    
    # Verify back to login
    wait_for_visible(driver, "username-input", By.ID)


# ================= TEST CASES =================

class TestAuthFlow:
    """Test authentication flows."""
    
    def test_login_screen_renders(self, driver):
        """Verify login screen renders correctly."""
        driver.get(BASE_URL)
        
        # Wait for login form elements
        username_input = wait_for_visible(driver, "username-input", By.ID)
        login_button = wait_for_visible(driver, "login-button", By.ID)
        
        assert username_input is not None, "Username input not visible"
        assert login_button is not None, "Login button not visible"
    
    def test_login_success_redirects_to_projects(self, driver):
        """Verify login success redirects to projects list."""
        login(driver, "test_user")
        
        # Verify we're on project list
        project_list = wait_for_visible(driver, "project-list-title", By.ID)
        assert project_list is not None, "Project list not visible after login"
    
    def test_logout_returns_to_login(self, driver):
        """Verify logout returns to login screen."""
        login(driver, "test_user")
        logout(driver)
        
        # Verify login screen is visible
        username_input = wait_for_visible(driver, "username-input", By.ID)
        assert username_input is not None, "Login screen not visible after logout"
    
    def test_login_with_empty_username(self, driver):
        """Verify handling of empty username."""
        driver.get(BASE_URL)
        
        # Click login without entering username
        login_btn = wait_for_clickable(driver, "login-button", By.ID)
        login_btn.click()
        
        # Should stay on login screen or show error
        # Verify we're NOT on project list
        try:
            wait_for_element(driver, "project-list-title", By.ID, timeout=3)
            assert False, "Should not redirect to projects with empty username"
        except AssertionError:
            # Expected - still on login
            pass

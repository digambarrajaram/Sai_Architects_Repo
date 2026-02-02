#!/usr/bin/env python3
"""
CivManager QA - Navigation Flow Tests

Tests navigation-related flows:
- Bottom tab navigation works
- Back navigation stable
- No blank screens

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


def wait_for_url_contains(driver, substring, timeout=WAIT_TIMEOUT):
    """Wait for URL to contain substring."""
    try:
        WebDriverWait(driver, timeout).until(
            lambda d: substring in d.current_url
        )
        return True
    except TimeoutException:
        return False


def login_as_user(driver, username="test_user"):
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


# ================= TEST CASES =================

class TestNavigationFlow:
    """Test navigation-related flows."""
    
    def test_bottom_tab_navigation_exists(self, driver):
        """Verify bottom tab navigation is present."""
        login_as_user(driver)
        
        # Check for bottom tabs container
        tabs_container = wait_for_element(driver, "bottom-tabs-container", By.ID)
        assert tabs_container is not None, "Bottom tabs container not found"
        
        # Verify all expected tabs exist
        projects_tab = wait_for_element(driver, "tab-projects", By.ID)
        assert projects_tab is not None, "Projects tab not found"
        
        reports_tab = wait_for_element(driver, "tab-reports", By.ID)
        assert reports_tab is not None, "Reports tab not found"
        
        profile_tab = wait_for_element(driver, "tab-profile", By.ID)
        assert profile_tab is not None, "Profile tab not found"
    
    def test_tab_switching(self, driver):
        """Test switching between tabs."""
        login_as_user(driver)
        
        # Switch to Reports tab
        reports_tab = wait_for_clickable(driver, "tab-reports", By.ID)
        reports_tab.click()
        
        # Verify reports screen loaded
        wait_for_visible(driver, "reports-screen", By.ID)
        
        # Switch back to Projects tab
        projects_tab = wait_for_clickable(driver, "tab-projects", By.ID)
        projects_tab.click()
        
        # Verify projects screen visible
        wait_for_visible(driver, "project-list-title", By.ID)
    
    def test_back_navigation_from_project_detail(self, driver):
        """Test back navigation from project detail to list."""
        login_as_user(driver)
        
        # Navigate to project detail
        first_project = wait_for_clickable(driver, "project-card-0", By.ID)
        first_project.click()
        
        wait_for_visible(driver, "project-detail-title", By.ID)
        
        # Click back button
        back_btn = wait_for_clickable(driver, "back-button", By.ID)
        back_btn.click()
        
        # Verify back at project list
        wait_for_visible(driver, "project-list-title", By.ID)
    
    def test_no_blank_screens_after_login(self, driver):
        """Verify no blank screens appear after login."""
        driver.get(BASE_URL)
        
        # Login
        wait_for_visible(driver, "username-input", By.ID)
        username_input = wait_for_element(driver, "username-input", By.ID)
        username_input.clear()
        username_input.send_keys("test_user")
        
        login_btn = wait_for_clickable(driver, "login-button", By.ID)
        login_btn.click()
        
        # Verify content exists (not blank)
        page_content = wait_for_element(driver, "app-container", By.ID)
        assert page_content is not None, "App container not found"
        
        # Check that page has actual content
        body_text = driver.find_element(By.TAG_NAME, "body").text
        assert len(body_text) > 0, "Page appears to be blank"
    
    def test_no_blank_screens_after_navigation(self, driver):
        """Verify no blank screens after navigation."""
        login_as_user(driver)
        
        # Navigate to project detail
        first_project = wait_for_clickable(driver, "project-card-0", By.ID)
        first_project.click()
        
        # Verify content exists
        page_content = wait_for_element(driver, "project-detail-container", By.ID)
        assert page_content is not None, "Project detail container not found"
        
        body_text = driver.find_element(By.TAG_NAME, "body").text
        assert len(body_text) > 0, "Project detail appears blank"
    
    def test_deep_link_navigation(self, driver):
        """Test direct URL navigation to specific screens."""
        # Navigate directly to project list
        driver.get(f"{BASE_URL}/projects")
        
        # Should show project list or redirect
        try:
            wait_for_visible(driver, "project-list-title", By.ID, timeout=5)
        except AssertionError:
            # May redirect to login first
            wait_for_visible(driver, "login-button", By.ID, timeout=5)
    
    def test_navigation_history(self, driver):
        """Test browser back/forward with app navigation."""
        login_as_user(driver)
        
        # Navigate to project detail
        first_project = wait_for_clickable(driver, "project-card-0", By.ID)
        first_project.click()
        
        wait_for_visible(driver, "project-detail-title", By.ID)
        
        # Go back in browser
        driver.back()
        
        # Verify back at project list
        wait_for_visible(driver, "project-list-title", By.ID)
    
    def test_active_tab_indicator(self, driver):
        """Verify active tab has visual indicator."""
        login_as_user(driver)
        
        # Default should be projects tab active
        projects_tab = wait_for_element(driver, "tab-projects-active", By.ID)
        assert projects_tab is not None, "Projects tab should be active by default"
        
        # Switch to reports tab
        reports_tab = wait_for_clickable(driver, "tab-reports", By.ID)
        reports_tab.click()
        
        # Verify reports tab is now active
        reports_tab_active = wait_for_element(driver, "tab-reports-active", By.ID)
        assert reports_tab_active is not None, "Reports tab should be active"
    
    def test_navigation_service_responsive(self, driver):
        """Test navigation responds within expected time."""
        login_as_user(driver)
        
        # Time navigation to reports tab
        import time
        start = time.time()
        
        reports_tab = wait_for_clickable(driver, "tab-reports", By.ID)
        reports_tab.click()
        
        wait_for_visible(driver, "reports-screen", By.ID)
        
        elapsed = time.time() - start
        assert elapsed < 10, f"Navigation took too long: {elapsed}s"

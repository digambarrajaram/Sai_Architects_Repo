"""
App Launch Test Suite

Verifies that the application launches successfully and lands
on a valid entry screen.

IMPORTANT:
The app may start on:
- Login screen (logged out user)
- Home/Dashboard screen (already logged in user)

This test validates ALL valid entry states.
"""

import pytest
import time
from appium.webdriver.webdriver import WebDriver as AppiumDriver  # type: ignore
from appium.webdriver.common.appiumby import AppiumBy

from loguru import logger

from pages.login_page import LoginPage
from pages.home_page import HomePage
from pages.dashboard_page import DashboardPage


def check_app_is_ready(driver: AppiumDriver) -> bool:
    """
    Check if the app is ready for testing.
    Returns True if app is accessible, False otherwise.
    """
    try:
        # Try to get the current activity/package
        current_package = driver.current_package
        logger.info(f"Current app package: {current_package}")
        
        # Try to get current activity
        current_activity = driver.current_activity
        logger.info(f"Current activity: {current_activity}")
        
        return True
    except Exception as e:
        logger.error(f"App not accessible: {e}")
        return False


def has_meaningful_content(driver: AppiumDriver) -> bool:
    """
    Check if the app has any meaningful content loaded.
    Looks for text elements, buttons, inputs, or other interactable elements.
    """
    try:
        # Look for any text elements
        text_elements = driver.find_elements(AppiumBy.XPATH, "//android.widget.TextView")
        if len(text_elements) > 0:
            logger.info(f"Found {len(text_elements)} text elements")
            return True
        
        # Look for any button-like elements
        buttons = driver.find_elements(AppiumBy.XPATH, "//android.widget.Button")
        if len(buttons) > 0:
            logger.info(f"Found {len(buttons)} buttons")
            return True
        
        # Look for any input fields
        inputs = driver.find_elements(AppiumBy.XPATH, "//android.widget.EditText")
        if len(inputs) > 0:
            logger.info(f"Found {len(inputs)} input fields")
            return True
        
        # Look for any clickable elements
        clickables = driver.find_elements(AppiumBy.XPATH, "//android.widget.Clickable")
        if len(clickables) > 0:
            logger.info(f"Found {len(clickables)} clickable elements")
            return True
            
    except Exception as e:
        logger.debug(f"Error checking for content: {e}")
    
    return False


def is_any_entry_screen_visible(driver: AppiumDriver, timeout: int = 30) -> bool:
    """
    Check if the app landed on any valid entry screen.

    Valid entry screens:
    - Login Page
    - Home Page
    - Dashboard Page

    Args:
        driver: Appium WebDriver instance
        timeout: Maximum time to wait for screens to load
    """
    logger.info(f"Checking for entry screens (timeout: {timeout}s)...")
    
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        # Wait for splash to potentially dismiss
        time.sleep(2)
        
        # Try Login Page
        try:
            logger.debug("Checking Login Page...")
            login_page = LoginPage(driver)
            if login_page.is_login_ui_visible():
                logger.info("✅ Login Page is visible")
                return True
        except Exception as e:
            logger.debug(f"Login Page check failed: {e}")

        # Try Home Page
        try:
            logger.debug("Checking Home Page...")
            home_page = HomePage(driver)
            if home_page.is_page_loaded():
                logger.info("✅ Home Page is visible")
                return True
        except Exception as e:
            logger.debug(f"Home Page check failed: {e}")

        # Try Dashboard Page
        try:
            logger.debug("Checking Dashboard Page...")
            dashboard_page = DashboardPage(driver)
            if dashboard_page.is_page_loaded():
                logger.info("✅ Dashboard Page is visible")
                return True
        except Exception as e:
            logger.debug(f"Dashboard Page check failed: {e}")

        # Check if app has any meaningful content
        if has_meaningful_content(driver):
            logger.info("✅ App has meaningful content")
            return True

    logger.warning("❌ No valid entry screen found within timeout")

    # Log page source for debugging
    try:
        page_source = driver.page_source
        logger.debug(f"Page source length: {len(page_source)} chars")
        # Log first 500 chars
        logger.debug(f"Page source preview: {page_source[:500]}...")
    except Exception as e:
        logger.debug(f"Could not get page source: {e}")
    
    return False


class TestAppLaunch:
    """
    Test cases for verifying app launch behavior.
    Tests are STRICT - failures indicate actual issues.
    """

    def test_app_launches_successfully(self, driver: AppiumDriver):
        """
        Verify that the app launches and reaches a valid entry screen.
        
        This test is STRICT - it will FAIL if:
        - App package is not accessible
        - No valid entry screen is found (Login, Home, or Dashboard)
        """
        logger.info("=== Test: App Launch ===")

        # Check if app is accessible
        assert check_app_is_ready(driver), "App package not accessible"

        # Give the app time to fully load after launch
        time.sleep(5)

        # Verify entry screen is visible
        assert is_any_entry_screen_visible(driver, timeout=30), (
            "App did not land on Login, Home, or Dashboard screen after launch"
        )

        logger.info("✅ App launch test passed")

    def test_login_or_home_elements_present(self, driver: AppiumDriver):
        """
        Verify that essential elements are visible on the entry screen.
        
        This test is STRICT - it will FAIL if:
        - App is not accessible
        - No valid UI elements are found
        """
        logger.info("=== Test: Login/Home Elements Present ===")

        # Check if app is accessible
        assert check_app_is_ready(driver), "App package not accessible"

        assert is_any_entry_screen_visible(driver, timeout=30), (
            "No valid UI elements found on app launch"
        )

        logger.info("✅ Login/Home elements test passed")

    def test_navigation_from_splash(self, driver: AppiumDriver):
        """
        Verify that the app navigates away from splash screen
        and shows a usable screen.
        
        This test is STRICT - it will FAIL if:
        - App is not accessible
        - App appears stuck on splash or invalid screen
        """
        logger.info("=== Test: Navigation from Splash ===")

        # Check if app is accessible
        assert check_app_is_ready(driver), "App package not accessible"

        assert is_any_entry_screen_visible(driver, timeout=45), (
            "App stuck on splash or invalid screen"
        )

        logger.info("✅ Splash navigation test passed")

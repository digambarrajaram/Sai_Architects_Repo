"""
Production-Grade Pytest Configuration and Fixtures

This file contains all the pytest fixtures and configuration needed for
the complete end-to-end mobile automation test suite.
"""

import pytest
import os
import sys
import time
import logging
from typing import Dict, Any, Optional
from datetime import datetime

# Add project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from appium import webdriver
from appium.webdriver.webdriver import WebDriver as AppiumDriver  # type: ignore

from utils.environment_loader import EnvironmentLoader
from utils.device_manager import DeviceManager
from utils.supabase_client import SupabaseClient
from utils.driver_factory import create_driver
from utils.logger import setup_logging
from utils.helpers import take_screenshot_on_failure, cleanup_resources


# Configure logging
logger = setup_logging(__name__)


@pytest.fixture(scope="session")
def env_loader() -> EnvironmentLoader:
    """Load environment variables from .env file."""
    logger.info("Loading environment configuration...")
    return EnvironmentLoader()


@pytest.fixture(scope="session")
def device_manager(env_loader: EnvironmentLoader) -> DeviceManager:
    """Initialize device manager for Android device management."""
    logger.info("Initializing device manager...")
    return DeviceManager(env_loader)


@pytest.fixture(scope="session")
def supabase_client(env_loader: EnvironmentLoader) -> SupabaseClient:
    """Initialize Supabase client for database validation."""
    logger.info("Initializing Supabase client...")
    return SupabaseClient(env_loader)


@pytest.fixture(scope="session")
def driver():
    """
    Create and configure Appium WebDriver for Android device using production-grade factory.
    
    This fixture handles:
    - Appium driver initialization using W3C-compliant UiAutomator2Options
    - Fail-fast approach - crashes if driver cannot be created
    - Driver cleanup on test completion
    """
    logger.info("Starting Appium driver with production-grade factory")
    
    # Create driver using the production-grade factory
    driver = create_driver()
    
    # Fail fast if driver creation failed
    if driver is None:
        pytest.exit(
            "❌ Appium driver failed to initialize. "
            "Check driver_factory.py imports and Appium logs.",
            returncode=1
        )
    
    logger.info("✅ Appium driver initialized successfully")
    yield driver
    
    # Cleanup driver
    try:
        logger.info("Cleaning up Appium driver...")
        driver.quit()
        logger.info("Appium driver closed successfully")
    except Exception as e:
        logger.error(f"Error during driver cleanup: {e}")


@pytest.fixture(scope="function")
def authenticated_driver(driver: AppiumDriver, env_loader: EnvironmentLoader) -> AppiumDriver:
    """
    Create an authenticated driver session for tests requiring login.
    
    This fixture handles the complete login flow and returns a driver
    that is already authenticated and ready for testing.
    """
    from pages.login_page import LoginPage
    
    try:
        logger.info("Setting up authenticated driver session...")
        
        # Initialize login page
        login_page = LoginPage(driver, env_loader)
        
        # Wait for login page to be ready
        if not login_page.wait_for_page_load():
            logger.error("Login page did not load properly")
            pytest.fail("Login page failed to load")
        
        # Get credentials from environment (supporting role-based credentials)
        test_email = env_loader.get_test_user_email()
        test_password = env_loader.get_test_user_password()
        
        logger.info(f"Attempting login with user: {test_email}")
        
        # Perform login with comprehensive assertion
        login_success = login_page.login_with_assertion(test_email, test_password, expected_success=True)
        
        if not login_success:
            error_msg = login_page.get_error_message()
            logger.error(f"Login failed: {error_msg}")
            take_screenshot_on_failure(driver, "auth_setup_failure")
            pytest.fail(f"Authentication failed: {error_msg}")
        
        logger.info("✅ Login successful - authenticated driver ready")
        return driver
        
    except Exception as e:
        logger.error(f"Authentication setup failed: {e}")
        take_screenshot_on_failure(driver, "auth_setup_failure")
        pytest.fail(f"Authentication setup failed: {e}")


@pytest.fixture(scope="function")
def owner_driver(driver: AppiumDriver, env_loader: EnvironmentLoader) -> AppiumDriver:
    """
    Create a driver session authenticated as an Owner role user.
    """
    from pages.login_page import LoginPage
    
    try:
        logger.info("Setting up Owner role authenticated driver session...")
        
        # Initialize login page
        login_page = LoginPage(driver, env_loader)
        
        # Wait for login page to be ready
        if not login_page.wait_for_page_load():
            logger.error("Login page did not load properly")
            pytest.fail("Login page failed to load")
        
        # Get Owner credentials from environment
        owner_credentials = env_loader.get_role_credentials('owner')
        owner_email = owner_credentials['email']
        owner_password = owner_credentials['password']
        
        logger.info(f"Attempting login with Owner user: {owner_email}")
        
        # Perform login with comprehensive assertion
        login_success = login_page.login_with_assertion(owner_email, owner_password, expected_success=True)
        
        if not login_success:
            error_msg = login_page.get_error_message()
            logger.error(f"Owner login failed: {error_msg}")
            take_screenshot_on_failure(driver, "owner_auth_setup_failure")
            pytest.fail(f"Owner authentication failed: {error_msg}")
        
        logger.info("✅ Owner login successful - authenticated driver ready")
        return driver
        
    except Exception as e:
        logger.error(f"Owner authentication setup failed: {e}")
        take_screenshot_on_failure(driver, "owner_auth_setup_failure")
        pytest.fail(f"Owner authentication setup failed: {e}")


@pytest.fixture(scope="function")
def supervisor_driver(driver: AppiumDriver, env_loader: EnvironmentLoader) -> AppiumDriver:
    """
    Create a driver session authenticated as a Supervisor role user.
    """
    from pages.login_page import LoginPage
    
    try:
        logger.info("Setting up Supervisor role authenticated driver session...")
        
        # Initialize login page
        login_page = LoginPage(driver, env_loader)
        
        # Wait for login page to be ready
        if not login_page.wait_for_page_load():
            logger.error("Login page did not load properly")
            pytest.fail("Login page failed to load")
        
        # Get Supervisor credentials from environment
        supervisor_credentials = env_loader.get_role_credentials('supervisor')
        supervisor_email = supervisor_credentials['email']
        supervisor_password = supervisor_credentials['password']
        
        logger.info(f"Attempting login with Supervisor user: {supervisor_email}")
        
        # Perform login with comprehensive assertion
        login_success = login_page.login_with_assertion(supervisor_email, supervisor_password, expected_success=True)
        
        if not login_success:
            error_msg = login_page.get_error_message()
            logger.error(f"Supervisor login failed: {error_msg}")
            take_screenshot_on_failure(driver, "supervisor_auth_setup_failure")
            pytest.fail(f"Supervisor authentication failed: {error_msg}")
        
        logger.info("✅ Supervisor login successful - authenticated driver ready")
        return driver
        
    except Exception as e:
        logger.error(f"Supervisor authentication setup failed: {e}")
        take_screenshot_on_failure(driver, "supervisor_auth_setup_failure")
        pytest.fail(f"Supervisor authentication setup failed: {e}")





def pytest_configure(config):
    """Configure pytest session settings."""
    # Create necessary directories
    directories = [
        "reports",
        "screenshots", 
        "logs",
        "test_data"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"Created directory: {directory}")
    
    logger.info("Pytest session configured successfully")


def pytest_unconfigure(config):
    """Clean up pytest session settings."""
    logger.info("Pytest session cleanup completed")


# Custom pytest markers for test organization


def pytest_collection_modifyitems(config, items):
    """Modify test collection to add custom markers and skip conditions."""
    for item in items:
        # Add android marker to all tests
        item.add_marker(pytest.mark.android)
        
        # Add slow marker to long-running tests
        if "performance" in item.name or "load" in item.name:
            item.add_marker(pytest.mark.slow)
        
        # Add data marker to tests that interact with database
        if any(keyword in item.name for keyword in ["create", "update", "delete", "validate"]):
            item.add_marker(pytest.mark.data)


# Error handling and retry logic


class TestRetryHandler:
    """Handle test retries for flaky tests or transient failures."""
    
    @staticmethod
    def retry_with_backoff(func, max_retries=3, base_delay=1.0, max_delay=10.0):
        """
        Retry a function with exponential backoff.
        
        Args:
            func: Function to retry
            max_retries: Maximum number of retry attempts
            base_delay: Base delay in seconds
            max_delay: Maximum delay in seconds
            
        Returns:
            Function result if successful, raises last exception otherwise
        """
        last_exception = None
        
        for attempt in range(max_retries + 1):
            try:
                return func()
            except Exception as e:
                last_exception = e
                if attempt == max_retries:
                    logger.error(f"Max retries ({max_retries}) exceeded for function: {func.__name__}")
                    raise e
                
                delay = min(base_delay * (2 ** attempt), max_delay)
                logger.warning(f"Attempt {attempt + 1} failed: {e}. Retrying in {delay}s...")
                time.sleep(delay)
        
        # This should never be reached, but just in case
        raise last_exception


# Test data management


@pytest.fixture(scope="session")
def test_data_manager(env_loader: EnvironmentLoader):
    """Manage test data lifecycle for the test session."""
    from utils.test_data_manager import TestDataManager
    return TestDataManager(env_loader)


@pytest.fixture(scope="function")
def clean_test_data(test_data_manager, supabase_client):
    """Ensure clean test data before and after each test."""
    # Clean up any existing test data before test
    test_data_manager.cleanup_test_data()
    
    yield
    
    # Clean up test data after test
    test_data_manager.cleanup_test_data()
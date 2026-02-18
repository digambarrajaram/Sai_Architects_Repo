"""
Test Helper Utilities

Provides common utility functions for mobile automation testing including:
- Screenshot capture and management
- Element waiting and retry logic
- Test data generation
- Resource cleanup
- Common assertions and validations
"""

import os
import time
import logging
import traceback
from typing import Optional, Union, List, Dict, Any
from datetime import datetime, timedelta
from pathlib import Path

from appium.webdriver.webdriver import WebDriver as AppiumDriver  # type: ignore
from selenium.webdriver.remote.webelement import WebElement
from selenium.common.exceptions import WebDriverException, TimeoutException

logger = logging.getLogger(__name__)


def take_screenshot(driver: AppiumDriver, name: str = "screenshot") -> str:
    """
    Take a screenshot and save it with timestamp.
    
    Args:
        driver: Appium WebDriver instance
        name: Screenshot name prefix
        
    Returns:
        Path to saved screenshot
    """
    try:
        # Create screenshots directory
        screenshots_dir = Path("screenshots")
        screenshots_dir.mkdir(exist_ok=True)
        
        # Generate timestamped filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]  # Include milliseconds
        filename = f"{name}_{timestamp}.png"
        filepath = screenshots_dir / filename
        
        # Take screenshot
        success = driver.save_screenshot(str(filepath))
        
        if success:
            logger.info(f"Screenshot saved: {filepath}")
            return str(filepath)
        else:
            logger.warning("Failed to save screenshot")
            return ""
            
    except Exception as e:
        logger.error(f"Error taking screenshot: {e}")
        return ""


def take_screenshot_on_failure(driver: AppiumDriver, name: str = "failure") -> str:
    """
    Take a screenshot when a test fails.
    This function is typically called in exception handlers.
    
    Args:
        driver: Appium WebDriver instance
        name: Screenshot name prefix
        
    Returns:
        Path to saved screenshot
    """
    try:
        # Check if screenshots are enabled via environment variable (default: disabled)
        import os
        screenshot_enabled = os.getenv('SCREENSHOT_ENABLED', 'false').lower() in ('true', '1', 'yes', 'on')
        
        if not screenshot_enabled:
            logger.info("Screenshot capture disabled - skipping failure screenshot")
            return ""
        
        # Add failure context to name
        failure_name = f"{name}_failure"
        return take_screenshot(driver, failure_name)
    except Exception as e:
        logger.error(f"Failed to take failure screenshot: {e}")
        return ""


def wait_for_element_visible(driver: AppiumDriver, locator: tuple, timeout: int = 30) -> bool:
    """
    Wait for an element to become visible with retry logic.
    
    Args:
        driver: Appium WebDriver instance
        locator: Element locator tuple (By, value)
        timeout: Maximum wait time in seconds
        
    Returns:
        bool: True if element became visible, False otherwise
    """
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    
    try:
        wait = WebDriverWait(driver, timeout)
        element = wait.until(EC.visibility_of_element_located(locator))
        logger.debug(f"Element became visible: {locator}")
        return True
    except TimeoutException:
        logger.warning(f"Element did not become visible within {timeout}s: {locator}")
        return False
    except Exception as e:
        logger.error(f"Error waiting for element: {e}")
        return False


def wait_for_element_not_visible(driver: AppiumDriver, locator: tuple, timeout: int = 30) -> bool:
    """
    Wait for an element to become not visible (disappear).
    
    Args:
        driver: Appium WebDriver instance
        locator: Element locator tuple (By, value)
        timeout: Maximum wait time in seconds
        
    Returns:
        bool: True if element became not visible, False otherwise
    """
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    
    try:
        wait = WebDriverWait(driver, timeout)
        result = wait.until(EC.invisibility_of_element_located(locator))
        logger.debug(f"Element became not visible: {locator}")
        return True
    except TimeoutException:
        logger.warning(f"Element did not become not visible within {timeout}s: {locator}")
        return False
    except Exception as e:
        logger.error(f"Error waiting for element to disappear: {e}")
        return False


def wait_for_element_clickable(driver: AppiumDriver, locator: tuple, timeout: int = 30) -> bool:
    """
    Wait for an element to become clickable.
    
    Args:
        driver: Appium WebDriver instance
        locator: Element locator tuple (By, value)
        timeout: Maximum wait time in seconds
        
    Returns:
        bool: True if element became clickable, False otherwise
    """
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    
    try:
        wait = WebDriverWait(driver, timeout)
        element = wait.until(EC.element_to_be_clickable(locator))
        logger.debug(f"Element became clickable: {locator}")
        return True
    except TimeoutException:
        logger.warning(f"Element did not become clickable within {timeout}s: {locator}")
        return False
    except Exception as e:
        logger.error(f"Error waiting for element to be clickable: {e}")
        return False


def retry_with_backoff(func, max_retries: int = 3, base_delay: float = 1.0, max_delay: float = 10.0, **kwargs):
    """
    Retry a function with exponential backoff.
    
    Args:
        func: Function to retry
        max_retries: Maximum number of retry attempts
        base_delay: Base delay in seconds
        max_delay: Maximum delay in seconds
        **kwargs: Arguments to pass to the function
        
    Returns:
        Function result if successful, raises last exception otherwise
    """
    last_exception = None
    
    for attempt in range(max_retries + 1):
        try:
            return func(**kwargs)
        except Exception as e:
            last_exception = e
            if attempt == max_retries:
                logger.error(f"Max retries ({max_retries}) exceeded for function: {func.__name__}")
                raise e
            
            delay = min(base_delay * (2 ** attempt), max_delay)
            logger.warning(f"Attempt {attempt + 1} failed: {e}. Retrying in {delay:.2f}s...")
            time.sleep(delay)
    
    # This should never be reached, but just in case
    raise last_exception


def scroll_to_element(driver: AppiumDriver, element: WebElement) -> bool:
    """
    Scroll to an element to make it visible.
    
    Args:
        driver: Appium WebDriver instance
        element: WebElement to scroll to
        
    Returns:
        bool: True if scroll was attempted
    """
    try:
        driver.execute_script("arguments[0].scrollIntoView(true);", element)
        time.sleep(0.5)  # Allow time for scroll animation
        logger.debug("Scrolled to element")
        return True
    except Exception as e:
        logger.warning(f"Scroll to element failed: {e}")
        return False


def scroll_down(driver: AppiumDriver) -> bool:
    """Scroll down the page."""
    try:
        # Get screen dimensions
        size = driver.get_window_size()
        start_x = size['width'] // 2
        start_y = size['height'] * 0.8
        end_y = size['height'] * 0.2
        
        driver.swipe(start_x, start_y, start_x, end_y, 1000)
        logger.debug("Scrolled down")
        return True
    except Exception as e:
        logger.warning(f"Scroll down failed: {e}")
        return False


def scroll_up(driver: AppiumDriver) -> bool:
    """Scroll up the page."""
    try:
        # Get screen dimensions
        size = driver.get_window_size()
        start_x = size['width'] // 2
        start_y = size['height'] * 0.2
        end_y = size['height'] * 0.8
        
        driver.swipe(start_x, start_y, start_x, end_y, 1000)
        logger.debug("Scrolled up")
        return True
    except Exception as e:
        logger.warning(f"Scroll up failed: {e}")
        return False


def generate_test_data(prefix: str = "TEST", length: int = 8) -> str:
    """
    Generate unique test data with timestamp.
    
    Args:
        prefix: Data prefix
        length: Random string length
        
    Returns:
        Unique test data string
    """
    import random
    import string
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    random_string = ''.join(random.choices(string.ascii_letters + string.digits, k=length))
    return f"{prefix}_{timestamp}_{random_string}"


def cleanup_resources():
    """Clean up test resources and temporary files."""
    try:
        # Clean up old screenshots (keep last 50)
        screenshots_dir = Path("screenshots")
        if screenshots_dir.exists():
            screenshots = list(screenshots_dir.glob("*.png"))
            if len(screenshots) > 50:
                # Sort by modification time and remove oldest
                screenshots.sort(key=lambda x: x.stat().st_mtime)
                for old_screenshot in screenshots[:-50]:
                    old_screenshot.unlink()
                logger.info(f"Cleaned up {len(screenshots) - 50} old screenshots")
        
        # Clean up old log files (keep last 10)
        logs_dir = Path("logs")
        if logs_dir.exists():
            log_files = list(logs_dir.glob("*.log"))
            if len(log_files) > 10:
                log_files.sort(key=lambda x: x.stat().st_mtime)
                for old_log in log_files[:-10]:
                    old_log.unlink()
                logger.info(f"Cleaned up {len(log_files) - 10} old log files")
        
        logger.info("Resource cleanup completed")
        
    except Exception as e:
        logger.error(f"Resource cleanup failed: {e}")


def validate_element_text(element: WebElement, expected_text: str, case_sensitive: bool = False) -> bool:
    """
    Validate element text with optional case sensitivity.
    
    Args:
        element: WebElement to check
        expected_text: Expected text
        case_sensitive: Whether comparison should be case sensitive
        
    Returns:
        bool: True if text matches
    """
    try:
        actual_text = element.text or element.get_attribute('text') or element.get_attribute('value') or ""
        
        if not case_sensitive:
            actual_text = actual_text.lower()
            expected_text = expected_text.lower()
        
        if actual_text == expected_text:
            logger.debug(f"Text validation passed: '{actual_text}'")
            return True
        else:
            logger.warning(f"Text validation failed. Expected: '{expected_text}', Got: '{actual_text}'")
            return False
            
    except Exception as e:
        logger.error(f"Text validation error: {e}")
        return False


def validate_element_contains_text(element: WebElement, expected_text: str, case_sensitive: bool = False) -> bool:
    """
    Validate element text contains expected text.
    
    Args:
        element: WebElement to check
        expected_text: Expected text to contain
        case_sensitive: Whether comparison should be case sensitive
        
    Returns:
        bool: True if text contains expected text
    """
    try:
        actual_text = element.text or element.get_attribute('text') or element.get_attribute('value') or ""
        
        if not case_sensitive:
            actual_text = actual_text.lower()
            expected_text = expected_text.lower()
        
        if expected_text in actual_text:
            logger.debug(f"Text contains validation passed: '{expected_text}' in '{actual_text}'")
            return True
        else:
            logger.warning(f"Text contains validation failed. Expected: '{expected_text}' in '{actual_text}'")
            return False
            
    except Exception as e:
        logger.error(f"Text contains validation error: {e}")
        return False


def get_element_screenshot(driver: AppiumDriver, element: WebElement, name: str = "element") -> str:
    """
    Take a screenshot of a specific element.
    
    Args:
        driver: Appium WebDriver instance
        element: WebElement to screenshot
        name: Screenshot name prefix
        
    Returns:
        Path to saved screenshot
    """
    try:
        # Take full screenshot first
        full_screenshot_path = take_screenshot(driver, f"{name}_full")
        if not full_screenshot_path:
            return ""
        
        # For element-specific screenshots, we'd need image processing libraries
        # For now, return the full screenshot path
        logger.debug(f"Element screenshot saved: {full_screenshot_path}")
        return full_screenshot_path
        
    except Exception as e:
        logger.error(f"Error taking element screenshot: {e}")
        return ""


def wait_for_network_idle(driver: AppiumDriver, timeout: int = 30) -> bool:
    """
    Wait for network activity to complete (conceptual - would need network monitoring).
    This is a placeholder for network idle detection.
    
    Args:
        driver: Appium WebDriver instance
        timeout: Maximum wait time in seconds
        
    Returns:
        bool: True if network appears idle
    """
    try:
        # In a real implementation, you might:
        # 1. Monitor network requests
        # 2. Check for loading indicators
        # 3. Wait for specific API responses
        # For now, just wait a short time
        time.sleep(2)
        logger.debug("Network idle wait completed (basic implementation)")
        return True
    except Exception as e:
        logger.error(f"Network idle wait failed: {e}")
        return False


def validate_page_title(driver: AppiumDriver, expected_title: str, timeout: int = 10) -> bool:
    """
    Validate page title with timeout.
    
    Args:
        driver: Appium WebDriver instance
        expected_title: Expected page title
        timeout: Maximum wait time in seconds
        
    Returns:
        bool: True if title matches
    """
    try:
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                current_title = driver.title
                if current_title and expected_title.lower() in current_title.lower():
                    logger.debug(f"Page title validation passed: '{current_title}'")
                    return True
            except Exception:
                pass
            time.sleep(0.5)
        
        logger.warning(f"Page title validation failed. Expected: '{expected_title}', Current: '{driver.title}'")
        return False
        
    except Exception as e:
        logger.error(f"Page title validation error: {e}")
        return False


def extract_text_from_element(element: WebElement) -> str:
    """
    Extract text from element with fallbacks.
    
    Args:
        element: WebElement to extract text from
        
    Returns:
        Extracted text string
    """
    try:
        # Try different text extraction methods
        text = (
            element.text or 
            element.get_attribute('text') or 
            element.get_attribute('value') or 
            element.get_attribute('content-desc') or 
            element.get_attribute('label') or 
            ""
        )
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from element: {e}")
        return ""


def format_test_data_for_logging(data: Any) -> str:
    """
    Format test data for logging with truncation for long strings.
    
    Args:
        data: Data to format
        
    Returns:
        Formatted string for logging
    """
    if isinstance(data, str) and len(data) > 100:
        return f"{data[:97]}..."
    elif isinstance(data, dict):
        # Format dict with limited depth and length
        formatted = {}
        for key, value in list(data.items())[:5]:  # Limit to first 5 items
            formatted[key] = format_test_data_for_logging(value)
        return str(formatted)
    else:
        return str(data)


def validate_test_environment() -> bool:
    """
    Validate that the test environment is properly configured.
    
    Returns:
        bool: True if environment is valid
    """
    try:
        # Check if required directories exist
        required_dirs = ["screenshots", "logs", "reports"]
        for directory in required_dirs:
            Path(directory).mkdir(exist_ok=True)
        
        # Check if environment variables are set (basic check)
        import os
        required_env_vars = ["TEST_USER_EMAIL", "TEST_USER_PASSWORD"]
        missing_vars = [var for var in required_env_vars if not os.getenv(var)]
        
        if missing_vars:
            logger.warning(f"Missing environment variables: {missing_vars}")
            return False
        
        logger.info("Test environment validation passed")
        return True
        
    except Exception as e:
        logger.error(f"Test environment validation failed: {e}")
        return False


def get_traceback_info() -> str:
    """Get current traceback information for debugging."""
    try:
        return traceback.format_exc()
    except Exception:
        return "No traceback available"


def wait_for_element(driver: AppiumDriver, locator: tuple, timeout: int = 10) -> bool:
    """
    Wait for an element to be present and visible.
    This is a simplified wrapper around wait_for_element_visible.
    
    Args:
        driver: Appium WebDriver instance
        locator: Element locator tuple (By, value)
        timeout: Maximum wait time in seconds
        
    Returns:
        bool: True if element is found and visible
    """
    return wait_for_element_visible(driver, locator, timeout)


def safe_execute(func, *args, **kwargs) -> tuple:
    """
    Safely execute a function and return success status and result.
    
    Args:
        func: Function to execute
        *args: Function arguments
        **kwargs: Function keyword arguments
        
    Returns:
        tuple: (success: bool, result: Any, error: Optional[str])
    """
    try:
        result = func(*args, **kwargs)
        return True, result, None
    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
        logger.error(f"Safe execution failed: {error_msg}")
        return False, None, error_msg

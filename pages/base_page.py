"""
Base page class that provides common functionality for all page objects.
Implements explicit waits and common page operations with enhanced stability.
"""
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException
from selenium.webdriver.remote.webelement import WebElement
from typing import List, Optional, Union
import time
import logging

from config import config

logger = logging.getLogger(__name__)


class BasePage:
    """Base page class with common functionality for all pages."""
    
    # Default timeouts
    DEFAULT_TIMEOUT = 10
    SHORT_TIMEOUT = 5
    LONG_TIMEOUT = 30
    
    def __init__(self, driver, timeout: int = None, env: str = None):
        """
        Initialize base page with WebDriver instance.
        
        Args:
            driver: WebDriver instance
            timeout (int, optional): Default timeout for explicit waits in seconds.
                                   Defaults to environment config or DEFAULT_TIMEOUT.
            env (str, optional): Environment name for timeout configuration.
        """
        self.driver = driver
        self.env = env
        
        # Get timeout from environment config or use provided/default value
        if timeout is None:
            try:
                self.timeout = config.get_timeout(env)
            except:
                self.timeout = self.DEFAULT_TIMEOUT
        else:
            self.timeout = timeout
            
        self.wait = WebDriverWait(driver, self.timeout)
        self.short_wait = WebDriverWait(driver, self.SHORT_TIMEOUT)
        self.long_wait = WebDriverWait(driver, self.LONG_TIMEOUT)
    
    def find_element(self, locator: tuple, timeout: int = None) -> WebElement:
        """
        Find element using explicit wait with retry mechanism.
        
        Args:
            locator (tuple): Locator tuple (By, value)
            timeout (int, optional): Custom timeout for this operation
            
        Returns:
            WebElement: Found element
            
        Raises:
            TimeoutException: If element is not found within timeout
        """
        wait = self._get_wait(timeout)
        try:
            return wait.until(
                EC.presence_of_element_located(locator),
                f"Element not found: {locator}"
            )
        except StaleElementReferenceException:
            # Retry once for stale element
            logger.warning(f"Stale element reference for {locator}, retrying...")
            return wait.until(
                EC.presence_of_element_located(locator),
                f"Element not found after retry: {locator}"
            )
    
    def find_elements(self, locator: tuple, timeout: int = None) -> List[WebElement]:
        """
        Find multiple elements using explicit wait.
        
        Args:
            locator (tuple): Locator tuple (By, value)
            timeout (int, optional): Custom timeout for this operation
            
        Returns:
            list: List of found WebElements
            
        Raises:
            TimeoutException: If elements are not found within timeout
        """
        wait = self._get_wait(timeout)
        return wait.until(
            EC.presence_of_all_elements_located(locator),
            f"Elements not found: {locator}"
        )
    
    def click_element(self, locator: tuple, timeout: int = None) -> None:
        """
        Click element after ensuring it's clickable with retry mechanism.
        
        Args:
            locator (tuple): Locator tuple (By, value)
            timeout (int, optional): Custom timeout for this operation
            
        Raises:
            TimeoutException: If element is not clickable within timeout
        """
        wait = self._get_wait(timeout)
        try:
            element = wait.until(
                EC.element_to_be_clickable(locator),
                f"Element not clickable: {locator}"
            )
            element.click()
            logger.debug(f"Clicked element: {locator}")
        except StaleElementReferenceException:
            # Retry once for stale element
            logger.warning(f"Stale element reference for {locator}, retrying click...")
            element = wait.until(
                EC.element_to_be_clickable(locator),
                f"Element not clickable after retry: {locator}"
            )
            element.click()
    
    def send_keys(self, locator: tuple, text: str, timeout: int = None) -> None:
        """
        Send keys to element after ensuring it's visible and enabled.
        
        Args:
            locator (tuple): Locator tuple (By, value)
            text (str): Text to send to the element
            timeout (int, optional): Custom timeout for this operation
            
        Raises:
            TimeoutException: If element is not visible within timeout
        """
        wait = self._get_wait(timeout)
        element = wait.until(
            EC.visibility_of_element_located(locator),
            f"Element not visible: {locator}"
        )
        
        # Clear and send keys with retry
        max_retries = 3
        for attempt in range(max_retries):
            try:
                element.clear()
                element.send_keys(text)
                logger.debug(f"Sent keys '{text}' to element: {locator}")
                return
            except StaleElementReferenceException:
                if attempt == max_retries - 1:
                    raise
                logger.warning(f"Stale element reference for {locator}, retrying send_keys...")
                element = wait.until(
                    EC.visibility_of_element_located(locator),
                    f"Element not visible after retry: {locator}"
                )
    
    def get_text(self, locator: tuple, timeout: int = None) -> str:
        """
        Get text from element after ensuring it's visible.
        
        Args:
            locator (tuple): Locator tuple (By, value)
            timeout (int, optional): Custom timeout for this operation
            
        Returns:
            str: Text content of the element
            
        Raises:
            TimeoutException: If element is not visible within timeout
        """
        wait = self._get_wait(timeout)
        element = wait.until(
            EC.visibility_of_element_located(locator),
            f"Element not visible: {locator}"
        )
        return element.text
    
    def is_element_visible(self, locator: tuple, timeout: int = None) -> bool:
        """
        Check if element is visible with improved error handling.
        
        Args:
            locator (tuple): Locator tuple (By, value)
            timeout (int, optional): Custom timeout for this operation
            
        Returns:
            bool: True if element is visible, False otherwise
        """
        wait = self._get_wait(timeout)
        try:
            element = wait.until(
                EC.visibility_of_element_located(locator),
                f"Element not visible: {locator}"
            )
            return element.is_displayed()
        except (TimeoutException, NoSuchElementException):
            return False
    
    def is_element_present(self, locator: tuple) -> bool:
        """
        Check if element is present in DOM with improved error handling.
        
        Args:
            locator (tuple): Locator tuple (By, value)
            
        Returns:
            bool: True if element is present, False otherwise
        """
        try:
            self.driver.find_element(*locator)
            return True
        except NoSuchElementException:
            return False
    
    def wait_for_element_to_disappear(self, locator: tuple, timeout: int = None) -> bool:
        """
        Wait for element to disappear from DOM with improved error handling.
        
        Args:
            locator (tuple): Locator tuple (By, value)
            timeout (int, optional): Custom timeout for this operation
            
        Returns:
            bool: True if element disappeared, False if still present after timeout
        """
        wait = self._get_wait(timeout)
        try:
            return wait.until(
                EC.invisibility_of_element_located(locator),
                f"Element still visible: {locator}"
            )
        except TimeoutException:
            return False
    
    def get_page_title(self) -> str:
        """
        Get current page title with retry mechanism.
        
        Returns:
            str: Current page title
        """
        max_retries = 3
        for attempt in range(max_retries):
            try:
                return self.driver.title
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                logger.warning(f"Error getting page title (attempt {attempt + 1}): {e}")
                time.sleep(0.5)
    
    def get_current_url(self) -> str:
        """
        Get current page URL with retry mechanism.
        
        Returns:
            str: Current page URL
        """
        max_retries = 3
        for attempt in range(max_retries):
            try:
                return self.driver.current_url
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                logger.warning(f"Error getting current URL (attempt {attempt + 1}): {e}")
                time.sleep(0.5)
    
    def navigate_to(self, url: str) -> None:
        """
        Navigate to specified URL with retry mechanism.
        
        Args:
            url (str): URL to navigate to
        """
        max_retries = 3
        for attempt in range(max_retries):
            try:
                self.driver.get(url)
                logger.debug(f"Navigated to: {url}")
                return
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                logger.warning(f"Error navigating to {url} (attempt {attempt + 1}): {e}")
                time.sleep(1)
    
    def refresh_page(self) -> None:
        """Refresh current page with retry mechanism."""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                self.driver.refresh()
                logger.debug("Page refreshed")
                return
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                logger.warning(f"Error refreshing page (attempt {attempt + 1}): {e}")
                time.sleep(1)
    
    def go_back(self) -> None:
        """Go back to previous page with retry mechanism."""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                self.driver.back()
                logger.debug("Navigated back")
                return
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                logger.warning(f"Error going back (attempt {attempt + 1}): {e}")
                time.sleep(1)
    
    def wait_for_page_load(self, expected_title: str = None, timeout: int = None) -> None:
        """
        Wait for page to load completely with improved error handling.
        
        Args:
            expected_title (str, optional): Expected page title
            timeout (int, optional): Custom timeout for this operation
            
        Raises:
            TimeoutException: If page doesn't load within timeout
        """
        wait = self._get_wait(timeout)
        
        if expected_title:
            wait.until(
                EC.title_contains(expected_title),
                f"Page title does not contain: {expected_title}"
            )
        
        # Wait for document ready state with retry
        max_retries = 3
        for attempt in range(max_retries):
            try:
                wait.until(
                    lambda driver: driver.execute_script("return document.readyState") == "complete",
                    "Page did not finish loading"
                )
                return
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                logger.warning(f"Error waiting for page load (attempt {attempt + 1}): {e}")
                time.sleep(1)
    
    def wait_for_element_to_be_clickable(self, locator: tuple, timeout: int = None) -> WebElement:
        """
        Wait for element to be clickable with retry mechanism.
        
        Args:
            locator (tuple): Locator tuple (By, value)
            timeout (int, optional): Custom timeout for this operation
            
        Returns:
            WebElement: Clickable element
            
        Raises:
            TimeoutException: If element is not clickable within timeout
        """
        wait = self._get_wait(timeout)
        try:
            return wait.until(
                EC.element_to_be_clickable(locator),
                f"Element not clickable: {locator}"
            )
        except StaleElementReferenceException:
            # Retry once for stale element
            logger.warning(f"Stale element reference for {locator}, retrying...")
            return wait.until(
                EC.element_to_be_clickable(locator),
                f"Element not clickable after retry: {locator}"
            )
    
    def scroll_to_element(self, locator: tuple, timeout: int = None) -> None:
        """
        Scroll to element and ensure it's visible.
        
        Args:
            locator (tuple): Locator tuple (By, value)
            timeout (int, optional): Custom timeout for this operation
        """
        element = self.find_element(locator, timeout)
        self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)
        time.sleep(0.5)  # Allow time for scroll animation
    
    def _get_wait(self, timeout: int = None) -> WebDriverWait:
        """
        Get appropriate WebDriverWait instance based on timeout.
        
        Args:
            timeout (int, optional): Custom timeout
            
        Returns:
            WebDriverWait: Configured wait instance
        """
        if timeout is None:
            return self.wait
        elif timeout <= self.SHORT_TIMEOUT:
            return self.short_wait
        elif timeout >= self.LONG_TIMEOUT:
            return self.long_wait
        else:
            return WebDriverWait(self.driver, timeout)

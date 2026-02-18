"""
Base Page Class – Production Grade (React Native + Appium)

RULES ENFORCED:
- ❌ NO Android BACK key
- ❌ NO blind scrolling
- ❌ NO screenshots
- ✅ Explicit waits only
- ✅ UI-driven navigation only
"""

import time
import logging
from typing import Optional, Tuple, List
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.remote.webelement import WebElement
from appium.webdriver.webdriver import WebDriver as AppiumDriver  # type: ignore
from appium.webdriver.common.appiumby import AppiumBy

logger = logging.getLogger(__name__)


class BasePage:
    """
    Base Page Object for all screens.

    This class is intentionally STRICT and MINIMAL.
    Child classes must NOT override safety rules.
    """

    def __init__(self, driver: AppiumDriver, env_loader=None):
        self.driver = driver
        self.env_loader = env_loader
        self.wait_timeout = env_loader.get_element_timeout() if env_loader else 30
        self.wait = WebDriverWait(driver, self.wait_timeout)
        self.logger = logger
        self.logger.info(f"BasePage initialized (timeout={self.wait_timeout}s)")

    # ==========================================================
    # CORE FIND METHODS
    # ==========================================================

    def find(self, locator: Tuple[str, str], timeout: Optional[int] = None) -> WebElement:
        wait_time = timeout or self.wait_timeout
        try:
            return WebDriverWait(self.driver, wait_time).until(
                EC.presence_of_element_located(locator)
            )
        except TimeoutException:
            raise TimeoutException(f"Element not found: {locator}")

    def find_visible(self, locator: Tuple[str, str], timeout: Optional[int] = None) -> WebElement:
        wait_time = timeout or self.wait_timeout
        try:
            return WebDriverWait(self.driver, wait_time).until(
                EC.visibility_of_element_located(locator)
            )
        except TimeoutException:
            raise TimeoutException(f"Visible element not found: {locator}")

    def find_all(self, locator: Tuple[str, str], timeout: Optional[int] = None) -> List[WebElement]:
        wait_time = timeout or self.wait_timeout
        try:
            return WebDriverWait(self.driver, wait_time).until(
                EC.presence_of_all_elements_located(locator)
            )
        except TimeoutException:
            return []

    # ==========================================================
    # INTERACTION METHODS
    # ==========================================================

    def click(self, locator: Tuple[str, str], timeout: Optional[int] = None) -> None:
        element = self.find_visible(locator, timeout)
        element.click()
        self.logger.info(f"Clicked element: {locator}")

    def type_text(self, locator: Tuple[str, str], text: str, timeout: Optional[int] = None) -> None:
        element = self.find_visible(locator, timeout)
        element.clear()
        element.send_keys(text)
        self.logger.info(f"Entered text into: {locator}")

    def get_text(self, locator: Tuple[str, str], timeout: Optional[int] = None) -> Optional[str]:
        try:
            element = self.find_visible(locator, timeout)
            return element.text
        except TimeoutException:
            return None

    # ==========================================================
    # VISIBILITY & STATE CHECKS
    # ==========================================================

    def is_visible(self, locator: Tuple[str, str], timeout: int = 3) -> bool:
        try:
            self.find_visible(locator, timeout)
            return True
        except TimeoutException:
            return False

    def wait_until_gone(self, locator: Tuple[str, str], timeout: Optional[int] = None) -> bool:
        wait_time = timeout or self.wait_timeout
        try:
            WebDriverWait(self.driver, wait_time).until(
                EC.invisibility_of_element_located(locator)
            )
            return True
        except TimeoutException:
            return False

    # ==========================================================
    # KEYBOARD HANDLING (SAFE)
    # ==========================================================

    def dismiss_keyboard(self) -> None:
        """
        SAFE keyboard dismissal.

        ❌ Never uses BACK key.
        """
        try:
            self.driver.hide_keyboard()
            self.logger.info("Keyboard dismissed")
        except Exception:
            self.logger.debug("Keyboard not visible")

    # ==========================================================
    # SCROLLING (CONTROLLED)
    # ==========================================================

    def scroll_if_needed(self, locator: Tuple[str, str]) -> bool:
        """
        Scroll ONLY if element is not visible.
        """
        if self.is_visible(locator, timeout=1):
            return True

        size = self.driver.get_window_size()
        start_x = size["width"] // 2
        start_y = int(size["height"] * 0.7)
        end_y = int(size["height"] * 0.3)

        self.driver.swipe(start_x, start_y, start_x, end_y, 800)
        time.sleep(0.5)

        return self.is_visible(locator, timeout=2)

    # ==========================================================
    # PAGE CONTRACT
    # ==========================================================

    def is_page_loaded(self) -> bool:
        """
        MUST be overridden in child classes.
        """
        raise NotImplementedError(
            "Each page object must implement is_page_loaded()"
        )

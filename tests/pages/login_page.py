"""
Login Page Object – Production Grade (React Native + Appium)

RULES:
- Uses multiple locator strategies for React Native compatibility
- No BACK key
- No blind scrolling
- Deterministic page load detection
"""

import time
from typing import Optional, Tuple
from appium.webdriver.common.appiumby import AppiumBy
from pages.base_page import BasePage


class LoginPageLocators:
    # Input fields - using resource-id as primary, fallback to accessibility
    EMAIL_INPUT = (AppiumBy.ID, "email_input")
    PASSWORD_INPUT = (AppiumBy.ID, "password_input")

    # Actions
    LOGIN_BUTTON = (AppiumBy.ID, "login_button")

    # Errors
    ERROR_TEXT = (AppiumBy.ID, "login-error")

    # Alternative locators using XPATH for React Native
    EMAIL_INPUT_XPATH = (AppiumBy.XPATH, "//*[@testID='email_input' or @resource-id='email_input' or contains(@content-desc, 'email')]")
    PASSWORD_INPUT_XPATH = (AppiumBy.XPATH, "//*[@testID='password_input' or @resource-id='password_input' or contains(@content-desc, 'password')]")
    LOGIN_BUTTON_XPATH = (AppiumBy.XPATH, "//*[@testID='login_button' or @resource-id='login_button' or contains(@content-desc, 'login')]")


class LoginPage(BasePage):
    """
    Page Object for Login Screen
    """

    def __init__(self, driver, env_loader=None):
        super().__init__(driver, env_loader)

    # ==========================================================
    # PAGE STATE
    # ==========================================================

    def is_login_ui_visible(self) -> bool:
        """Alias for is_page_loaded() for backward compatibility."""
        return self.is_page_loaded()

    def is_page_loaded(self) -> bool:
        """
        Login page is loaded if ANY core element is visible.
        This handles splash delays and animations safely.
        """
        # Try multiple locator strategies
        return (
            self.is_visible(LoginPageLocators.EMAIL_INPUT) or
            self.is_visible(LoginPageLocators.PASSWORD_INPUT) or
            self.is_visible(LoginPageLocators.LOGIN_BUTTON) or
            self.is_visible(LoginPageLocators.EMAIL_INPUT_XPATH, timeout=5) or
            self.is_visible(LoginPageLocators.PASSWORD_INPUT_XPATH, timeout=5) or
            self.is_visible(LoginPageLocators.LOGIN_BUTTON_XPATH, timeout=5)
        )

    def wait_for_page(self, timeout: int = 20) -> bool:
        """
        Wait until login UI appears.
        """
        end_time = time.time() + timeout
        while time.time() < end_time:
            if self.is_page_loaded():
                self.logger.info("Login page detected")
                return True
            time.sleep(0.5)

        self.logger.error("Login page did not appear")
        return False

    # ==========================================================
    # ACTIONS
    # ==========================================================

    def enter_email(self, email: str) -> None:
        # Try primary locator first, then fallback
        try:
            self.find_visible(LoginPageLocators.EMAIL_INPUT)
        except:
            self.find_visible(LoginPageLocators.EMAIL_INPUT_XPATH)
        self.type_text(LoginPageLocators.EMAIL_INPUT, email)

    def enter_password(self, password: str) -> None:
        self.dismiss_keyboard()
        try:
            self.find_visible(LoginPageLocators.PASSWORD_INPUT)
        except:
            self.find_visible(LoginPageLocators.PASSWORD_INPUT_XPATH)
        self.type_text(LoginPageLocators.PASSWORD_INPUT, password)

    def tap_login(self) -> None:
        self.dismiss_keyboard()
        try:
            self.find_visible(LoginPageLocators.LOGIN_BUTTON)
        except:
            self.find_visible(LoginPageLocators.LOGIN_BUTTON_XPATH)
        self.click(LoginPageLocators.LOGIN_BUTTON)

    # ==========================================================
    # FLOWS
    # ==========================================================

    def login(self, email: str, password: str) -> None:
        """
        Perform login action.
        Assertions belong in tests, not page object.
        """
        if not self.wait_for_page():
            raise RuntimeError("Login page not loaded")

        self.enter_email(email)
        self.enter_password(password)
        self.tap_login()

    # ==========================================================
    # VALIDATION
    # ==========================================================

    def get_error_message(self) -> Optional[str]:
        return self.get_text(LoginPageLocators.ERROR_TEXT)

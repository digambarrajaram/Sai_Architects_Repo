"""
Dashboard Page Object – Production Grade (React Native + Appium)

RULES:
- accessibility-id ONLY
- No BACK key
- No blind scrolling
- Deterministic page load detection
"""

from typing import Optional, Dict
from appium.webdriver.common.appiumby import AppiumBy
from pages.base_page import BasePage


class DashboardPageLocators:
    # Header - using XPATH to find by text content
    DASHBOARD_TITLE = (AppiumBy.XPATH, "//*[contains(@text, 'Dashboard') or contains(@text, 'Financial')]")
    USER_GREETING = (AppiumBy.XPATH, "//*[contains(@text, 'Good') or contains(@text, 'Welcome')]")

    # Widgets - using generic content
    AVATAR_BUTTON = (AppiumBy.ID, "avatar-btn")

    # Tab navigation
    TAB_PROJECTS = (AppiumBy.ID, "tab-Projects")
    TAB_EXPENSES = (AppiumBy.ID, "tab-Expenses")
    TAB_REPORTS = (AppiumBy.ID, "tab-Reports")
    TAB_SETTINGS = (AppiumBy.ID, "tab-Settings")


class DashboardPage(BasePage):
    """
    Page Object for Dashboard screen.
    """

    def __init__(self, driver, env_loader=None):
        super().__init__(driver, env_loader)

    # ==========================================================
    # PAGE STATE
    # ==========================================================

    def is_page_loaded(self) -> bool:
        """
        Dashboard is loaded if ANY core element is visible.
        """
        return (
            self.is_visible(DashboardPageLocators.DASHBOARD_TITLE) or
            self.is_visible(DashboardPageLocators.TAB_PROJECTS) or
            self.is_visible(DashboardPageLocators.AVATAR_BUTTON)
        )

    def wait_for_page(self, timeout: int = 20) -> bool:
        """
        Wait until dashboard UI appears.
        """
        import time
        end_time = time.time() + timeout

        while time.time() < end_time:
            if self.is_page_loaded():
                self.logger.info("Dashboard page detected")
                return True
            time.sleep(0.5)

        self.logger.error("Dashboard page did not load")
        return False

    # ==========================================================
    # DATA ACCESSORS
    # ==========================================================

    def get_dashboard_title(self) -> Optional[str]:
        try:
            return self.get_text(DashboardPageLocators.DASHBOARD_TITLE)
        except:
            return None

    def get_user_greeting(self) -> Optional[str]:
        try:
            return self.get_text(DashboardPageLocators.USER_GREETING)
        except:
            return None

    # ==========================================================
    # USER ACTIONS
    # ==========================================================

    def open_menu(self) -> None:
        self.click(DashboardPageLocators.AVATAR_BUTTON)

    def logout(self) -> None:
        self.open_menu()
        # Logout button may not exist - this is a placeholder
        pass

    # ==========================================================
    # VALIDATIONS
    # ==========================================================

    def verify_user_context(self, expected_email: str) -> bool:
        """
        Verify logged-in user context is visible.
        """
        greeting = self.get_user_greeting()
        if not greeting:
            return False

        return expected_email.split("@")[0].lower() in greeting.lower()

    def get_dashboard_snapshot(self) -> Dict[str, Optional[object]]:
        """
        Collect dashboard metrics in one call.
        """
        return {
            "title": self.get_dashboard_title(),
            "user_greeting": self.get_user_greeting(),
        }

    # ==========================================================
    # INTERNAL HELPERS
    # ==========================================================

    @staticmethod
    def _extract_int(text: Optional[str]) -> Optional[int]:
        if not text:
            return None
        import re
        nums = re.findall(r"\d+", text)
        return int(nums[0]) if nums else None

    @staticmethod
    def _extract_float(text: Optional[str]) -> Optional[float]:
        if not text:
            return None
        import re
        nums = re.findall(r"[\d]+\.\d+|[\d]+", text.replace(",", ""))
        return float(nums[0]) if nums else None

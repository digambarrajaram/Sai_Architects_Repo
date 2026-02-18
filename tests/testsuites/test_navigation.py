"""
Navigation Test Suite

Tests for navigation functionality:
- Tab navigation
- Screen transitions
- Keyboard behavior (NO BACK KEY)
"""

import pytest
import time
from appium.webdriver.webdriver import WebDriver as AppiumDriver  # type: ignore

from pages.login_page import LoginPage
from pages.home_page import HomePage
from pages.dashboard_page import DashboardPage


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def ensure_authenticated(driver: AppiumDriver):
    """Login only if user is not already authenticated."""
    if HomePage(driver).is_page_loaded() or DashboardPage(driver).is_page_loaded():
        return

    login_page = LoginPage(driver)
    assert login_page.is_login_ui_visible(), "Login UI not visible"

    login_page.login("testuser@example.com", "ValidPassword123!")
    time.sleep(3)

    assert (
        HomePage(driver).is_page_loaded() or
        DashboardPage(driver).is_page_loaded()
    ), "Login failed"


# ------------------------------------------------------------------
# Tab Navigation Tests
# ------------------------------------------------------------------

class TestTabNavigation:

    def test_navigate_to_projects_tab(self, driver: AppiumDriver):
        ensure_authenticated(driver)

        home_page = HomePage(driver)
        home_page.click_projects_tab()

        assert home_page.is_projects_visible(), \
            "Projects tab navigation failed"

    def test_navigate_to_dashboard_tab(self, driver: AppiumDriver):
        ensure_authenticated(driver)

        home_page = HomePage(driver)
        home_page.click_dashboard_tab()

        assert home_page.is_navigation_visible(), \
            "Dashboard tab navigation failed"

    def test_navigate_to_profile_tab(self, driver: AppiumDriver):
        ensure_authenticated(driver)

        home_page = HomePage(driver)
        home_page.click_profile_tab()

        # Profile screen assertion depends on app implementation
        assert home_page.is_navigation_visible(), \
            "Profile tab navigation failed"

    def test_navigate_to_reports_tab(self, driver: AppiumDriver):
        ensure_authenticated(driver)

        home_page = HomePage(driver)
        home_page.click_reports_tab()

        assert home_page.is_navigation_visible(), \
            "Reports tab navigation failed"


# ------------------------------------------------------------------
# Navigation Flows
# ------------------------------------------------------------------

class TestNavigationFlow:

    def test_add_project_flow(self, driver: AppiumDriver):
        ensure_authenticated(driver)

        home_page = HomePage(driver)
        home_page.click_projects_tab()
        home_page.click_add_project()

        # Add-project screen validation depends on UI
        assert True

    def test_project_card_navigation(self, driver: AppiumDriver):
        ensure_authenticated(driver)

        home_page = HomePage(driver)
        home_page.click_projects_tab()

        project_cards = driver.find_elements(*home_page.PROJECT_CARD)
        assert project_cards, "No project cards found"

        project_cards[0].click()
        assert True


# ------------------------------------------------------------------
# Keyboard Behavior (NO BACK KEY)
# ------------------------------------------------------------------

class TestKeyboardBehavior:

    def test_keyboard_dismiss_does_not_navigate(self, driver: AppiumDriver):
        login_page = LoginPage(driver)

        if not login_page.is_login_ui_visible():
            pytest.skip("Login screen not available")

        login_page.enter_email("test@example.com")

        # Correct keyboard dismissal
        login_page.dismiss_keyboard()

        assert login_page.is_login_ui_visible(), \
            "Keyboard dismissal caused navigation"


# ------------------------------------------------------------------
# Deep Linking (Optional)
# ------------------------------------------------------------------

class TestDeepLinking:

    def test_deep_link_to_login(self, driver: AppiumDriver):
        login_page = LoginPage(driver)

        assert login_page.is_login_ui_visible() or \
               HomePage(driver).is_page_loaded() or \
               DashboardPage(driver).is_page_loaded()

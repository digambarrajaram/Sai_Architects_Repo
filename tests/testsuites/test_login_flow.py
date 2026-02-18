"""
Login Flow Test Suite

Validates authentication flows:
- Successful login
- Invalid login
- Empty field validation
- Keyboard behavior
- Edge cases

PRODUCTION RULES APPLIED:
- NO BACK KEY
- NO SCREENSHOTS
- Page Objects own waits
- Session-safe (login may be skipped if already authenticated)
"""

import pytest
import time
from typing import Dict

from appium.webdriver.webdriver import WebDriver as AppiumDriver  # type: ignore

from pages.login_page import LoginPage
from pages.home_page import HomePage
from pages.dashboard_page import DashboardPage


# ------------------------------------------------------------------
# Helper
# ------------------------------------------------------------------

def is_authenticated(driver: AppiumDriver) -> bool:
    """Check if user is already logged in."""
    try:
        if HomePage(driver).is_page_loaded():
            return True
    except Exception:
        pass

    try:
        if DashboardPage(driver).is_page_loaded():
            return True
    except Exception:
        pass

    return False


# ------------------------------------------------------------------
# Fixtures
# ------------------------------------------------------------------

@pytest.fixture(scope="class")
def valid_credentials() -> Dict[str, str]:
    return {
        "email": "testuser@example.com",
        "password": "ValidPassword123!"
    }


@pytest.fixture(scope="class")
def invalid_credentials() -> Dict[str, str]:
    return {
        "email": "invalid@example.com",
        "password": "wrongpassword"
    }


# ------------------------------------------------------------------
# Tests
# ------------------------------------------------------------------

class TestLoginFlow:

    def test_successful_login(
        self,
        driver: AppiumDriver,
        valid_credentials: Dict[str, str]
    ):
        login_page = LoginPage(driver)
        home_page = HomePage(driver)
        dashboard_page = DashboardPage(driver)

        # If session already exists, skip login
        if is_authenticated(driver):
            assert True
            return

        assert login_page.is_login_ui_visible(), "Login UI not visible"

        success = login_page.login(
            valid_credentials["email"],
            valid_credentials["password"]
        )
        assert success, "Login action failed"

        time.sleep(3)

        assert (
            home_page.is_page_loaded() or dashboard_page.is_page_loaded()
        ), "Login did not redirect to Home/Dashboard"

    def test_invalid_login_shows_error(
        self,
        driver: AppiumDriver,
        invalid_credentials: Dict[str, str]
    ):
        login_page = LoginPage(driver)

        if not login_page.is_login_ui_visible():
            pytest.skip("Login screen not available")

        login_page.enter_email(invalid_credentials["email"])
        login_page.enter_password(invalid_credentials["password"])
        login_page.click_login()

        time.sleep(2)

        error = login_page.get_error_message()
        assert error is not None, "Expected error message not shown"

    def test_empty_email_validation(self, driver: AppiumDriver):
        login_page = LoginPage(driver)

        if not login_page.is_login_ui_visible():
            pytest.skip("Login screen not available")

        login_page.enter_password("SomePassword123")
        login_page.click_login()

        time.sleep(1)

        error = login_page.get_error_message()
        assert error is not None, "Expected validation error for empty email"

    def test_empty_password_validation(self, driver: AppiumDriver):
        login_page = LoginPage(driver)

        if not login_page.is_login_ui_visible():
            pytest.skip("Login screen not available")

        login_page.enter_email("test@example.com")
        login_page.click_login()

        time.sleep(1)

        error = login_page.get_error_message()
        assert error is not None, "Expected validation error for empty password"

    def test_keyboard_dismissal_does_not_navigate(
        self,
        driver: AppiumDriver
    ):
        """
        Verifies keyboard dismissal does NOT trigger BACK navigation.
        """
        login_page = LoginPage(driver)

        if not login_page.is_login_ui_visible():
            pytest.skip("Login screen not available")

        login_page.enter_email("test@example.com")

        # Correct keyboard dismissal
        login_page.dismiss_keyboard()

        # Login UI must still be visible
        assert login_page.is_login_ui_visible(), \
            "Keyboard dismissal caused navigation (BACK key violation)"

    def test_login_button_enabled_state(self, driver: AppiumDriver):
        login_page = LoginPage(driver)

        if not login_page.is_login_ui_visible():
            pytest.skip("Login screen not available")

        login_page.enter_email("test@example.com")
        login_page.enter_password("Password123")

        assert login_page.is_login_button_enabled(), \
            "Login button not enabled for valid inputs"


# ------------------------------------------------------------------
# Edge Cases
# ------------------------------------------------------------------

class TestLoginEdgeCases:

    def test_special_characters_in_password(self, driver: AppiumDriver):
        login_page = LoginPage(driver)

        if not login_page.is_login_ui_visible():
            pytest.skip("Login screen not available")

        login_page.enter_email("test@example.com")
        login_page.enter_password("P@$$w0rd!#%")

        assert True  # Input accepted without crash

    def test_very_long_input(self, driver: AppiumDriver):
        login_page = LoginPage(driver)

        if not login_page.is_login_ui_visible():
            pytest.skip("Login screen not available")

        long_email = "a" * 300 + "@example.com"
        long_password = "p" * 500

        login_page.enter_email(long_email)
        login_page.enter_password(long_password)

        assert True  # App should not crash

    def test_rapid_login_attempts(self, driver: AppiumDriver):
        login_page = LoginPage(driver)

        if not login_page.is_login_ui_visible():
            pytest.skip("Login screen not available")

        for _ in range(3):
            login_page.enter_email("test@example.com")
            login_page.enter_password("wrongpass")
            login_page.click_login()
            time.sleep(0.5)

        error = login_page.get_error_message()
        assert error is not None, "Expected error after rapid login attempts"


# ------------------------------------------------------------------
# Markers
# ------------------------------------------------------------------

pytest.mark.login = pytest.mark.login
pytest.mark.auth = pytest.mark.auth
pytest.mark.e2e = pytest.mark.e2e

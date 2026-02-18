import pytest
import time
import logging
from datetime import datetime

from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage
from pages.home_page import HomePage

logger = logging.getLogger(__name__)


def is_any_entry_screen_visible(driver, env_loader) -> bool:
    try:
        if LoginPage(driver, env_loader).is_login_ui_visible():
            return True
    except Exception:
        pass

    try:
        if HomePage(driver).is_page_loaded():
            return True
    except Exception:
        pass

    try:
        if DashboardPage(driver, env_loader).is_page_loaded():
            return True
    except Exception:
        pass

    return False


class TestE2EComplete:

    def test_01_app_launch_and_initialization(
        self, driver, env_loader, device_manager, supabase_client
    ):
        logger.info("=== TEST 1: App Launch and Initialization ===")

        assert device_manager.verify_device_ready()
        assert supabase_client.client is not None
        assert driver is not None

        app_package = env_loader.get_app_package()
        assert device_manager._is_app_installed(app_package)

        assert is_any_entry_screen_visible(driver, env_loader), \
            "App did not land on any valid entry screen"

        logger.info("✅ App launch validated")

    def test_02_valid_user_authentication(
        self, authenticated_driver, env_loader, supabase_client
    ):
        logger.info("=== TEST 2: Valid User Authentication ===")

        email = env_loader.get_test_user_email()
        password = env_loader.get_test_user_password()
        role = env_loader.get_test_user_role()

        assert supabase_client.validate_user_exists(email)
        assert supabase_client.validate_user_role(email, role)

        dashboard_page = DashboardPage(authenticated_driver, env_loader)
        assert dashboard_page.is_page_loaded()
        assert dashboard_page.verify_user_context(email, role)
        assert dashboard_page.verify_role_based_access(role)

        logger.info("✅ Authentication verified")

    def test_03_invalid_user_authentication(self, driver, env_loader, supabase_client):
        logger.info("=== TEST 3: Invalid Authentication ===")

        login_page = LoginPage(driver, env_loader)
        assert login_page.is_login_ui_visible()

        login_page.login("invalid@example.com", "wrongpassword")
        error = login_page.get_error_message()

        assert error is not None
        assert login_page.is_login_ui_visible()
        assert not supabase_client.validate_user_exists("invalid@example.com")

        logger.info("✅ Invalid login handled correctly")

    def test_12_logout_and_cleanup(self, authenticated_driver, env_loader, supabase_client):
        logger.info("=== TEST 12: Logout and Cleanup ===")

        dashboard_page = DashboardPage(authenticated_driver, env_loader)
        assert dashboard_page.is_page_loaded()

        assert dashboard_page.perform_logout()

        login_page = LoginPage(authenticated_driver, env_loader)
        assert login_page.is_login_ui_visible()

        assert supabase_client.cleanup_test_data()

        logger.info("✅ Logout and cleanup completed")

"""
Role-Based Authentication Test Suite

Tests for role-based authentication functionality:
- Owner role authentication and access
- Supervisor role authentication and access
- Role-based navigation and permissions
"""

import pytest
from appium.webdriver.webdriver import WebDriver as AppiumDriver  # type: ignore

from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage


class TestRoleBasedAuthentication:
    
    def test_owner_authentication_and_access(self, owner_driver: AppiumDriver):
        dashboard_page = DashboardPage(owner_driver)

        assert dashboard_page.is_page_loaded(), "Dashboard should be loaded for Owner"

        user_role = dashboard_page.get_user_role()
        assert user_role and "owner" in user_role.lower()

        admin_visible = dashboard_page.is_element_visible(
            dashboard_page.locators.ADMIN_TAB, timeout=5
        )
        assert admin_visible, "Owner should see Admin tab"

        assert dashboard_page.navigate_to_admin(), \
            "Owner should navigate to Admin section"

    def test_supervisor_authentication_and_access(self, supervisor_driver: AppiumDriver):
        dashboard_page = DashboardPage(supervisor_driver)

        assert dashboard_page.is_page_loaded(), "Dashboard should be loaded for Supervisor"

        user_role = dashboard_page.get_user_role()
        assert user_role and "supervisor" in user_role.lower()

        admin_visible = dashboard_page.is_element_visible(
            dashboard_page.locators.ADMIN_TAB, timeout=3
        )
        assert not admin_visible, "Supervisor should NOT see Admin tab"

        assert (
            dashboard_page.navigate_to_projects()
            and dashboard_page.navigate_to_expenses()
            and dashboard_page.navigate_to_reports()
        ), "Supervisor basic navigation failed"


class TestRoleBasedStatistics:

    def test_owner_dashboard_statistics(self, owner_driver: AppiumDriver):
        dashboard_page = DashboardPage(owner_driver)

        stats = dashboard_page.get_dashboard_statistics()
        assert stats.get("total_projects") is not None
        assert stats.get("total_expenses") is not None
        assert stats.get("user_greeting")

    def test_supervisor_dashboard_statistics(self, supervisor_driver: AppiumDriver):
        dashboard_page = DashboardPage(supervisor_driver)

        stats = dashboard_page.get_dashboard_statistics()
        assert stats.get("total_projects") is not None
        assert stats.get("total_expenses") is not None
        assert stats.get("user_greeting")


class TestRoleBasedNavigation:

    def test_owner_admin_navigation(self, owner_driver: AppiumDriver):
        dashboard_page = DashboardPage(owner_driver)
        assert dashboard_page.navigate_to_admin()

    def test_supervisor_no_admin_access(self, supervisor_driver: AppiumDriver):
        dashboard_page = DashboardPage(supervisor_driver)

        admin_visible = dashboard_page.is_element_visible(
            dashboard_page.locators.ADMIN_TAB, timeout=3
        )
        assert not admin_visible

        # Navigation attempt should not crash app
        dashboard_page.navigate_to_admin()
        assert dashboard_page.is_page_loaded()


class TestRoleBasedLogout:

    def test_owner_logout(self, owner_driver: AppiumDriver):
        dashboard_page = DashboardPage(owner_driver)
        assert dashboard_page.perform_logout()

        login_page = LoginPage(owner_driver)
        assert login_page.is_login_ui_visible(), \
            "Owner should return to login screen after logout"

    def test_supervisor_logout(self, supervisor_driver: AppiumDriver):
        dashboard_page = DashboardPage(supervisor_driver)
        assert dashboard_page.perform_logout()

        login_page = LoginPage(supervisor_driver)
        assert login_page.is_login_ui_visible(), \
            "Supervisor should return to login screen after logout"


class TestRoleBasedContextValidation:

    def test_owner_user_context(self, owner_driver: AppiumDriver, env_loader):
        dashboard_page = DashboardPage(owner_driver)
        creds = env_loader.get_role_credentials("owner")

        assert dashboard_page.verify_user_context(
            creds["email"], "owner"
        )

    def test_supervisor_user_context(self, supervisor_driver: AppiumDriver, env_loader):
        dashboard_page = DashboardPage(supervisor_driver)
        creds = env_loader.get_role_credentials("supervisor")

        assert dashboard_page.verify_user_context(
            creds["email"], "supervisor"
        )

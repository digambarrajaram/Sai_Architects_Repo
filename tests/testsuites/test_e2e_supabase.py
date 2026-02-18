"""
End-to-End Supabase Integration Test Suite

Comprehensive tests that verify the complete frontend-backend integration flow.
Tests real API calls, data operations, and user workflows.
"""

import pytest
import time
from typing import Dict
from appium.webdriver.webdriver import WebDriver as AppiumDriver  # type: ignore
from loguru import logger

from pages.login_page import LoginPage
from pages.home_page import HomePage
from pages.dashboard_page import DashboardPage
from pages.project_list_screen import ProjectListScreen
from pages.project_detail_screen import ProjectDetailScreen
from pages.add_expense_screen import AddExpenseScreen


def is_any_entry_screen_visible(driver) -> bool:
    try:
        if LoginPage(driver).is_login_ui_visible():
            return True
    except Exception:
        pass

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


class TestE2ESupabaseIntegration:

    @pytest.fixture(scope="class")
    def test_credentials(self) -> Dict[str, str]:
        return {
            "email": "demo.user@example.com",
            "password": "DemoPassword123!",
            "role": "demo"
        }

    def test_full_authentication_flow(
        self,
        driver: AppiumDriver,
        test_credentials: Dict[str, str]
    ):
        logger.info("=== Supabase Auth Flow Test ===")

        login_page = LoginPage(driver)
        home_page = HomePage(driver)
        dashboard_page = DashboardPage(driver)

        # App launch validation
        assert is_any_entry_screen_visible(driver), \
            "App did not land on a valid entry screen"

        # If already logged in, skip login
        if home_page.is_page_loaded() or dashboard_page.is_page_loaded():
            logger.info("User already authenticated")
            return

        assert login_page.is_login_ui_visible(), "Login UI not visible"

        login_page.enter_email(test_credentials["email"])
        login_page.enter_password(test_credentials["password"])
        login_page.click_login()

        time.sleep(3)

        assert (
            home_page.is_page_loaded() or dashboard_page.is_page_loaded()
        ), "Login did not redirect to Home or Dashboard"

        logger.info("✅ Supabase authentication flow validated")

    def test_project_data_retrieval(self, driver: AppiumDriver):
        logger.info("=== Supabase Project Data Retrieval Test ===")

        project_list = ProjectListScreen(driver)
        project_detail = ProjectDetailScreen(driver)

        project_list.navigate_to_projects()
        assert project_list.is_page_loaded(), "Project list not loaded"

        projects = project_list.get_project_list()
        assert projects, "No projects retrieved from Supabase"

        project_list.select_project(projects[0])
        assert project_detail.is_page_loaded(), "Project detail not loaded"

        project_data = project_detail.get_project_data()
        assert project_data is not None

        logger.info("✅ Project data retrieved successfully")

    def test_expense_creation_workflow(self, driver: AppiumDriver):
        logger.info("=== Supabase Expense Creation Test ===")

        project_list = ProjectListScreen(driver)
        project_detail = ProjectDetailScreen(driver)
        add_expense = AddExpenseScreen(driver)

        project_list.navigate_to_projects()
        projects = project_list.get_project_list()
        assert projects, "No projects available"

        project_list.select_project(projects[0])
        assert project_detail.is_page_loaded()

        project_detail.navigate_to_add_expense()
        assert add_expense.is_page_loaded()

        expense_data = {
            "amount": "500",
            "category": "Materials",
            "description": "Supabase E2E test expense",
            "date": "2024-01-15"
        }

        add_expense.enter_expense_data(expense_data)
        add_expense.submit_expense()

        time.sleep(3)

        assert project_detail.is_page_loaded(), \
            "Did not return to project detail after expense creation"

        logger.info("✅ Expense creation workflow validated")

    def test_error_handling_invalid_login(self, driver: AppiumDriver):
        logger.info("=== Supabase Invalid Login Handling Test ===")

        login_page = LoginPage(driver)

        if not login_page.is_login_ui_visible():
            pytest.skip("Login screen not available for invalid login test")

        login_page.enter_email("invalid@example.com")
        login_page.enter_password("wrongpassword")
        login_page.click_login()

        time.sleep(2)

        error = login_page.get_error_message()
        assert error is not None, "No error shown for invalid login"

        logger.info(f"Invalid login handled correctly: {error}")


pytest.mark.e2e = pytest.mark.e2e
pytest.mark.supabase = pytest.mark.supabase
pytest.mark.integration = pytest.mark.integration

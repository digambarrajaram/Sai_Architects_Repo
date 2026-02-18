"""
Supabase End-to-End Integration Test Suite

Comprehensive single test file for testing complete frontend-backend integration
with actual Supabase database credentials from environment variables.
"""

import pytest
import time
import os
from typing import Dict
from appium.webdriver.webdriver import WebDriver as AppiumDriver  # type: ignore
from loguru import logger

from pages.login_page import LoginPage
from pages.home_page import HomePage
from pages.dashboard_page import DashboardPage
from pages.project_list_screen import ProjectListScreen
from pages.project_detail_screen import ProjectDetailScreen
from pages.add_expense_screen import AddExpenseScreen


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def is_any_entry_screen_visible(driver: AppiumDriver) -> bool:
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


# ------------------------------------------------------------------
# Test Class
# ------------------------------------------------------------------

class TestSupabaseE2E:

    @pytest.fixture(scope="class")
    def test_config(self) -> Dict[str, str]:
        return {
            "supabase_url": os.getenv("EXPO_PUBLIC_SUPABASE_URL"),
            "test_email": os.getenv("EXPO_PUBLIC_TEST_USER_EMAIL"),
            "test_password": os.getenv("EXPO_PUBLIC_TEST_USER_PASSWORD"),
            "test_role": os.getenv("EXPO_PUBLIC_TEST_USER_ROLE", "supervisor"),
        }

    def test_01_supabase_configuration(self, driver: AppiumDriver, test_config):
        logger.info("=== TEST 1: Supabase Configuration ===")

        assert test_config["supabase_url"]
        assert test_config["test_email"]
        assert test_config["test_password"]

        assert is_any_entry_screen_visible(driver), \
            "App did not land on a valid entry screen"

    def test_02_app_initialization(self, driver: AppiumDriver):
        logger.info("=== TEST 2: App Initialization ===")

        assert is_any_entry_screen_visible(driver), \
            "App failed to initialize properly"

    def test_03_authentication_flow(self, driver: AppiumDriver, test_config):
        logger.info("=== TEST 3: Authentication Flow ===")

        login_page = LoginPage(driver)
        home_page = HomePage(driver)
        dashboard_page = DashboardPage(driver)

        if home_page.is_page_loaded() or dashboard_page.is_page_loaded():
            logger.info("User already authenticated")
            return

        assert login_page.is_login_ui_visible(), "Login UI not visible"

        login_page.enter_email(test_config["test_email"])
        login_page.enter_password(test_config["test_password"])
        login_page.click_login()

        time.sleep(3)

        assert (
            home_page.is_page_loaded() or dashboard_page.is_page_loaded()
        ), "Authentication failed"

    def test_04_project_data_retrieval(self, driver: AppiumDriver):
        logger.info("=== TEST 4: Project Data Retrieval ===")

        project_list = ProjectListScreen(driver)
        project_detail = ProjectDetailScreen(driver)

        project_list.navigate_to_projects()
        assert project_list.is_page_loaded()

        projects = project_list.get_project_list()
        assert projects, "No projects found in Supabase"

        project_list.select_project(projects[0])
        assert project_detail.is_page_loaded()

        project_data = project_detail.get_project_data()
        assert project_data is not None

    def test_05_expense_creation_workflow(self, driver: AppiumDriver):
        logger.info("=== TEST 5: Expense Creation Workflow ===")

        project_list = ProjectListScreen(driver)
        project_detail = ProjectDetailScreen(driver)
        add_expense = AddExpenseScreen(driver)

        project_list.navigate_to_projects()
        projects = project_list.get_project_list()
        assert projects

        project_list.select_project(projects[0])
        assert project_detail.is_page_loaded()

        project_detail.navigate_to_add_expense()
        assert add_expense.is_page_loaded()

        add_expense.enter_expense_data({
            "amount": "500",
            "category": "Materials",
            "description": "Supabase E2E test expense",
            "date": "2024-01-15"
        })

        add_expense.submit_expense()
        time.sleep(3)

        assert project_detail.is_page_loaded()

    def test_06_data_synchronization(self, driver: AppiumDriver):
        logger.info("=== TEST 6: Data Synchronization ===")

        project_list = ProjectListScreen(driver)
        project_detail = ProjectDetailScreen(driver)

        project_list.navigate_to_projects()
        projects = project_list.get_project_list()
        assert projects

        project_list.select_project(projects[0])
        assert project_detail.is_page_loaded()

        expenses_before = project_detail.get_expense_list()

        project_detail.navigate_back_to_projects()
        project_list.select_project(projects[0])

        expenses_after = project_detail.get_expense_list()

        assert len(expenses_before) == len(expenses_after)

    def test_07_error_handling(self, driver: AppiumDriver):
        logger.info("=== TEST 7: Error Handling ===")

        login_page = LoginPage(driver)

        if not login_page.is_login_ui_visible():
            pytest.skip("Login UI not available")

        login_page.enter_email("invalid@example.com")
        login_page.enter_password("wrongpassword")
        login_page.click_login()

        time.sleep(2)

        error = login_page.get_error_message()
        assert error is not None

    def test_08_performance_verification(self, driver: AppiumDriver):
        logger.info("=== TEST 8: Performance Verification ===")

        project_list = ProjectListScreen(driver)

        start = time.time()
        project_list.navigate_to_projects()
        assert project_list.is_page_loaded()
        duration = time.time() - start

        assert duration < 15.0, f"Project list load too slow: {duration:.2f}s"


pytest.mark.supabase = pytest.mark.supabase
pytest.mark.e2e = pytest.mark.e2e
pytest.mark.integration = pytest.mark.integration

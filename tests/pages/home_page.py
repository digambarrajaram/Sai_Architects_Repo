"""
Home / Dashboard Page Object – Production Grade

This page represents the post-login landing area.
It covers:
- Projects list
- Dashboard (Expenses tab)
- Reports
- Profile / Settings

RULES:
- accessibility-id ONLY
- No BACK key
- No blind scrolling
- UI-driven navigation only
"""

from appium.webdriver.common.appiumby import AppiumBy
from pages.base_page import BasePage


class HomePageLocators:
    # Header / welcome
    HEADER_TITLE = (AppiumBy.ID, "projects-title")
    WELCOME_TEXT = (AppiumBy.ID, "projects-title")

    # Bottom navigation (React Native tab testIDs)
    TAB_PROJECTS = (AppiumBy.ID, "tab-Projects")
    TAB_DASHBOARD = (AppiumBy.ID, "tab-Expenses")
    TAB_REPORTS = (AppiumBy.ID, "tab-Reports")
    TAB_PROFILE = (AppiumBy.ID, "tab-Settings")

    # Projects screen
    PROJECT_LIST = (AppiumBy.ID, "project-list")
    ADD_PROJECT_BUTTON = (AppiumBy.ID, "add-project-btn")

    # Menu / profile
    AVATAR_BUTTON = (AppiumBy.ID, "avatar-btn")
    LOGOUT_BUTTON = (AppiumBy.ID, "logout-button")


class HomePage(BasePage):
    """
    Page Object for Home / Dashboard area.
    """

    def __init__(self, driver, env_loader=None):
        super().__init__(driver, env_loader)

    # ==========================================================
    # PAGE STATE
    # ==========================================================

    def is_page_loaded(self) -> bool:
        """
        Home page is loaded if ANY core element is visible.
        """
        return (
            self.is_visible(HomePageLocators.PROJECT_LIST) or
            self.is_visible(HomePageLocators.ADD_PROJECT_BUTTON) or
            self.is_visible(HomePageLocators.TAB_PROJECTS)
        )

    def wait_for_page(self, timeout: int = 20) -> bool:
        """
        Wait until home UI is visible after login.
        """
        import time
        end_time = time.time() + timeout

        while time.time() < end_time:
            if self.is_page_loaded():
                self.logger.info("Home page detected")
                return True
            time.sleep(0.5)

        self.logger.error("Home page did not load")
        return False

    # ==========================================================
    # NAVIGATION ACTIONS
    # ==========================================================

    def go_to_projects(self) -> None:
        self.click(HomePageLocators.TAB_PROJECTS)

    def go_to_dashboard(self) -> None:
        self.click(HomePageLocators.TAB_DASHBOARD)

    def go_to_reports(self) -> None:
        self.click(HomePageLocators.TAB_REPORTS)

    def go_to_profile(self) -> None:
        self.click(HomePageLocators.TAB_PROFILE)

    # ==========================================================
    # PROJECT ACTIONS
    # ==========================================================

    def tap_add_project(self) -> None:
        self.scroll_if_needed(HomePageLocators.ADD_PROJECT_BUTTON)
        self.click(HomePageLocators.ADD_PROJECT_BUTTON)

    def is_project_list_visible(self) -> bool:
        return self.is_visible(HomePageLocators.PROJECT_LIST)

    # ==========================================================
    # USER MENU
    # ==========================================================

    def open_menu(self) -> None:
        self.click(HomePageLocators.AVATAR_BUTTON)

    def logout(self) -> None:
        self.open_menu()
        self.click(HomePageLocators.LOGOUT_BUTTON)

"""
Project Detail Screen – Production Grade (React Native + Appium)

RULES:
- accessibility-id ONLY
- ❌ NO BACK key
- ❌ NO blind scrolling
- ✅ UI-driven navigation only
"""

from typing import Optional
from appium.webdriver.common.appiumby import AppiumBy
from pages.base_page import BasePage


class ProjectDetailLocators:
    # Header / title
    PROJECT_TITLE = (AppiumBy.ACCESSIBILITY_ID, "project-title")

    # Actions
    ADD_EXPENSE_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "add-expense-btn")
    VIEW_EXPENSES_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "view-expenses-btn")

    # Navigation
    BACK_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "header-back-btn")

    # Containers
    PROJECT_ACTIONS = (AppiumBy.ACCESSIBILITY_ID, "project-actions")


class ProjectDetailScreen(BasePage):
    """
    Page Object for Project Detail screen.
    """

    def __init__(self, driver, env_loader=None):
        super().__init__(driver, env_loader)

    # ==========================================================
    # PAGE STATE
    # ==========================================================

    def is_page_loaded(self) -> bool:
        return (
            self.is_visible(ProjectDetailLocators.PROJECT_TITLE) or
            self.is_visible(ProjectDetailLocators.ADD_EXPENSE_BUTTON) or
            self.is_visible(ProjectDetailLocators.PROJECT_ACTIONS)
        )

    def wait_for_page(self, timeout: int = 20) -> bool:
        import time
        end_time = time.time() + timeout

        while time.time() < end_time:
            if self.is_page_loaded():
                self.logger.info("Project detail screen detected")
                return True
            time.sleep(0.5)

        self.logger.error("Project detail screen did not load")
        return False

    # ==========================================================
    # DATA ACCESS
    # ==========================================================

    def get_project_title(self) -> Optional[str]:
        return self.get_text(ProjectDetailLocators.PROJECT_TITLE)

    # ==========================================================
    # ACTIONS
    # ==========================================================

    def tap_add_expense(self) -> None:
        self.scroll_if_needed(ProjectDetailLocators.ADD_EXPENSE_BUTTON)
        self.click(ProjectDetailLocators.ADD_EXPENSE_BUTTON)

    def tap_view_expenses(self) -> None:
        self.scroll_if_needed(ProjectDetailLocators.VIEW_EXPENSES_BUTTON)
        self.click(ProjectDetailLocators.VIEW_EXPENSES_BUTTON)

    # ==========================================================
    # NAVIGATION (SAFE)
    # ==========================================================

    def go_back_to_project_list(self) -> None:
        """
        Navigate back using UI back button ONLY.
        """
        self.click(ProjectDetailLocators.BACK_BUTTON)

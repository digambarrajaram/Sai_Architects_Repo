"""
Project List Screen – Production Grade (React Native + Appium)

RULES:
- accessibility-id ONLY
- No BACK key
- No blind scrolling
- Explicit UI-based navigation
"""

from typing import List
from appium.webdriver.common.appiumby import AppiumBy
from pages.base_page import BasePage


class ProjectListLocators:
    # Main container
    PROJECT_LIST = (AppiumBy.ACCESSIBILITY_ID, "project-list")

    # Example project card (prefix-based – multiple cards expected)
    PROJECT_CARD_PREFIX = "project-card-"

    # Actions
    ADD_PROJECT_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "add-project-btn")

    # Navigation
    TAB_PROJECTS = (AppiumBy.ACCESSIBILITY_ID, "tab-Projects")


class ProjectListScreen(BasePage):
    """
    Page Object for Project List screen.
    """

    def __init__(self, driver, env_loader=None):
        super().__init__(driver, env_loader)

    # ==========================================================
    # PAGE STATE
    # ==========================================================

    def is_page_loaded(self) -> bool:
        return (
            self.is_visible(ProjectListLocators.PROJECT_LIST) or
            self.is_visible(ProjectListLocators.ADD_PROJECT_BUTTON)
        )

    def wait_for_page(self, timeout: int = 20) -> bool:
        import time
        end_time = time.time() + timeout

        while time.time() < end_time:
            if self.is_page_loaded():
                self.logger.info("Project list screen detected")
                return True
            time.sleep(0.5)

        self.logger.error("Project list screen did not load")
        return False

    # ==========================================================
    # PROJECT ACTIONS
    # ==========================================================

    def get_project_cards(self) -> List:
        """
        Returns all visible project cards.
        """
        elements = self.driver.find_elements(
            AppiumBy.XPATH,
            f'//*[starts-with(@content-desc, "{ProjectListLocators.PROJECT_CARD_PREFIX}")]'
        )
        return elements

    def get_project_count(self) -> int:
        return len(self.get_project_cards())

    def open_project_by_index(self, index: int = 0) -> None:
        """
        Open project by index (default = first project).
        """
        projects = self.get_project_cards()
        if not projects:
            raise RuntimeError("No projects available to open")

        if index >= len(projects):
            raise IndexError("Project index out of range")

        projects[index].click()
        self.logger.info(f"Opened project at index {index}")

    def open_project_by_id(self, project_id: str) -> None:
        """
        Open project using exact testID.
        Example: project-card-CIV-2023-089
        """
        locator = (AppiumBy.ACCESSIBILITY_ID, f"{ProjectListLocators.PROJECT_CARD_PREFIX}{project_id}")
        self.scroll_if_needed(locator)
        self.click(locator)

    # ==========================================================
    # ADD PROJECT
    # ==========================================================

    def tap_add_project(self) -> None:
        self.scroll_if_needed(ProjectListLocators.ADD_PROJECT_BUTTON)
        self.click(ProjectListLocators.ADD_PROJECT_BUTTON)

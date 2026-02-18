"""
Add Expense Screen – Production Grade (React Native + Appium)

RULES:
- accessibility-id ONLY
- ❌ NO BACK key
- ❌ NO blind scrolling
- ✅ UI-driven navigation only
"""

from typing import Optional
from appium.webdriver.common.appiumby import AppiumBy
from pages.base_page import BasePage


class AddExpenseLocators:
    # Inputs
    AMOUNT_INPUT = (AppiumBy.ACCESSIBILITY_ID, "expense-amount-input")
    CATEGORY_DROPDOWN = (AppiumBy.ACCESSIBILITY_ID, "expense-category-select")
    DESCRIPTION_INPUT = (AppiumBy.ACCESSIBILITY_ID, "expense-description-input")
    DATE_INPUT = (AppiumBy.ACCESSIBILITY_ID, "expense-date-input")

    # Actions
    SAVE_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "expense-save-btn")
    CANCEL_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "expense-cancel-btn")

    # Navigation
    BACK_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "header-back-btn")

    # Errors
    ERROR_TEXT = (AppiumBy.ACCESSIBILITY_ID, "expense-error-text")


class AddExpenseScreen(BasePage):
    """
    Page Object for Add Expense screen.
    """

    def __init__(self, driver, env_loader=None):
        super().__init__(driver, env_loader)

    # ==========================================================
    # PAGE STATE
    # ==========================================================

    def is_page_loaded(self) -> bool:
        return (
            self.is_visible(AddExpenseLocators.AMOUNT_INPUT) or
            self.is_visible(AddExpenseLocators.SAVE_BUTTON)
        )

    def wait_for_page(self, timeout: int = 20) -> bool:
        import time
        end_time = time.time() + timeout

        while time.time() < end_time:
            if self.is_page_loaded():
                self.logger.info("Add Expense screen detected")
                return True
            time.sleep(0.5)

        self.logger.error("Add Expense screen did not load")
        return False

    # ==========================================================
    # INPUT ACTIONS
    # ==========================================================

    def enter_amount(self, amount: str) -> None:
        self.type_text(AddExpenseLocators.AMOUNT_INPUT, amount)

    def select_category(self) -> None:
        """
        Opens category selector.
        Category selection itself should be handled
        by a dedicated modal/page if applicable.
        """
        self.scroll_if_needed(AddExpenseLocators.CATEGORY_DROPDOWN)
        self.click(AddExpenseLocators.CATEGORY_DROPDOWN)

    def enter_description(self, description: str) -> None:
        self.scroll_if_needed(AddExpenseLocators.DESCRIPTION_INPUT)
        self.type_text(AddExpenseLocators.DESCRIPTION_INPUT, description)

    def enter_date(self, date: str) -> None:
        """
        Date format handling depends on your app.
        This assumes direct text input is allowed.
        """
        self.scroll_if_needed(AddExpenseLocators.DATE_INPUT)
        self.type_text(AddExpenseLocators.DATE_INPUT, date)

    # ==========================================================
    # SUBMISSION
    # ==========================================================

    def save_expense(self) -> None:
        self.dismiss_keyboard()
        self.scroll_if_needed(AddExpenseLocators.SAVE_BUTTON)
        self.click(AddExpenseLocators.SAVE_BUTTON)

    def cancel(self) -> None:
        self.click(AddExpenseLocators.CANCEL_BUTTON)

    # ==========================================================
    # VALIDATION
    # ==========================================================

    def get_error_message(self) -> Optional[str]:
        return self.get_text(AddExpenseLocators.ERROR_TEXT)

    # ==========================================================
    # NAVIGATION
    # ==========================================================

    def go_back_to_project(self) -> None:
        """
        Navigate back using UI back button ONLY.
        """
        self.click(AddExpenseLocators.BACK_BUTTON)

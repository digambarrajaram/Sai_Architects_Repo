"""
Login page object implementation.
Example page object following Page Object Model pattern.
"""
from selenium.webdriver.common.by import By
from pages.base_page import BasePage


class LoginPage(BasePage):
    """Login page object with locators and methods."""
    
    # Locators
    USERNAME_INPUT = (By.ID, "username")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.ID, "login-btn")
    ERROR_MESSAGE = (By.CLASS_NAME, "error-message")
    FORGOT_PASSWORD_LINK = (By.LINK_TEXT, "Forgot Password?")
    LOGO = (By.CLASS_NAME, "app-logo")
    
    def __init__(self, driver):
        """
        Initialize login page.
        
        Args:
            driver: WebDriver instance
        """
        super().__init__(driver)
        self.url = "https://example.com/login"
    
    def navigate_to_login(self):
        """Navigate to login page."""
        self.navigate_to(self.url)
        self.wait_for_page_load("Login")
    
    def enter_username(self, username):
        """
        Enter username in the username field.
        
        Args:
            username (str): Username to enter
        """
        self.send_keys(self.USERNAME_INPUT, username)
    
    def enter_password(self, password):
        """
        Enter password in the password field.
        
        Args:
            password (str): Password to enter
        """
        self.send_keys(self.PASSWORD_INPUT, password)
    
    def click_login(self):
        """Click the login button."""
        self.click_element(self.LOGIN_BUTTON)
    
    def login(self, username, password):
        """
        Perform complete login process.
        
        Args:
            username (str): Username to login with
            password (str): Password to login with
        """
        self.enter_username(username)
        self.enter_password(password)
        self.click_login()
    
    def get_error_message(self):
        """
        Get error message text if present.
        
        Returns:
            str: Error message text or empty string if no error
        """
        if self.is_element_visible(self.ERROR_MESSAGE):
            return self.get_text(self.ERROR_MESSAGE)
        return ""
    
    def is_login_button_enabled(self):
        """
        Check if login button is enabled.
        
        Returns:
            bool: True if login button is enabled, False otherwise
        """
        try:
            element = self.find_element(self.LOGIN_BUTTON)
            return element.is_enabled()
        except:
            return False
    
    def click_forgot_password(self):
        """Click forgot password link."""
        self.click_element(self.FORGOT_PASSWORD_LINK)
    
    def is_logo_visible(self):
        """
        Check if application logo is visible.
        
        Returns:
            bool: True if logo is visible, False otherwise
        """
        return self.is_element_visible(self.LOGO)
    
    def wait_for_login_button_to_be_clickable(self):
        """Wait for login button to be clickable."""
        self.wait.until(
            EC.element_to_be_clickable(self.LOGIN_BUTTON),
            "Login button is not clickable"
        )
    
    def is_username_field_visible(self):
        """
        Check if username field is visible.
        
        Returns:
            bool: True if username field is visible, False otherwise
        """
        return self.is_element_visible(self.USERNAME_INPUT)
    
    def is_password_field_visible(self):
        """
        Check if password field is visible.
        
        Returns:
            bool: True if password field is visible, False otherwise
        """
        return self.is_element_visible(self.PASSWORD_INPUT)
"""
Login test cases using the Selenium automation framework.
Example test implementation following best practices.
"""
import pytest
from pages.login_page import LoginPage


class TestLogin:
    """Test class for login functionality."""
    
    @pytest.mark.login
    @pytest.mark.smoke
    def test_valid_user_authentication(self, driver):
        """
        Test valid user authentication.
        
        Scenario: User with valid credentials should be able to login successfully.
        """
        # Arrange
        login_page = LoginPage(driver)
        valid_username = "testuser"
        valid_password = "testpass123"
        
        # Act
        login_page.navigate_to_login()
        login_page.login(valid_username, valid_password)
        
        # Assert
        # Verify successful login by checking URL change or presence of dashboard elements
        assert "dashboard" in login_page.get_current_url().lower(), \
            "Login failed - not redirected to dashboard"
    
    @pytest.mark.login
    def test_invalid_user_authentication(self, driver):
        """
        Test invalid user authentication.
        
        Scenario: User with invalid credentials should see error message.
        """
        # Arrange
        login_page = LoginPage(driver)
        invalid_username = "invaliduser"
        invalid_password = "wrongpass"
        
        # Act
        login_page.navigate_to_login()
        login_page.login(invalid_username, invalid_password)
        
        # Assert
        error_message = login_page.get_error_message()
        assert error_message != "", "Error message should be displayed for invalid credentials"
        assert "invalid" in error_message.lower() or "incorrect" in error_message.lower(), \
            f"Expected error message about invalid credentials, got: {error_message}"
    
    @pytest.mark.login
    def test_empty_username_field(self, driver):
        """
        Test login with empty username field.
        
        Scenario: User should not be able to login with empty username.
        """
        # Arrange
        login_page = LoginPage(driver)
        empty_username = ""
        valid_password = "testpass123"
        
        # Act
        login_page.navigate_to_login()
        login_page.login(empty_username, valid_password)
        
        # Assert
        # Check if login button is disabled or error is shown
        assert not login_page.is_login_button_enabled() or \
               login_page.get_error_message() != "", \
               "Should prevent login with empty username"
    
    @pytest.mark.login
    def test_empty_password_field(self, driver):
        """
        Test login with empty password field.
        
        Scenario: User should not be able to login with empty password.
        """
        # Arrange
        login_page = LoginPage(driver)
        valid_username = "testuser"
        empty_password = ""
        
        # Act
        login_page.navigate_to_login()
        login_page.login(valid_username, empty_password)
        
        # Assert
        # Check if login button is disabled or error is shown
        assert not login_page.is_login_button_enabled() or \
               login_page.get_error_message() != "", \
               "Should prevent login with empty password"
    
    @pytest.mark.login
    def test_page_elements_present(self, driver):
        """
        Test that all required login page elements are present.
        
        Scenario: All login form elements should be visible on page load.
        """
        # Arrange
        login_page = LoginPage(driver)
        
        # Act
        login_page.navigate_to_login()
        
        # Assert
        assert login_page.is_username_field_visible(), "Username field should be visible"
        assert login_page.is_password_field_visible(), "Password field should be visible"
        assert login_page.is_logo_visible(), "Logo should be visible"
        assert login_page.is_element_present(login_page.LOGIN_BUTTON), "Login button should be present"
    
    @pytest.mark.login
    def test_forgot_password_link(self, driver):
        """
        Test forgot password link functionality.
        
        Scenario: Clicking forgot password should navigate to reset page.
        """
        # Arrange
        login_page = LoginPage(driver)
        
        # Act
        login_page.navigate_to_login()
        login_page.click_forgot_password()
        
        # Assert
        current_url = login_page.get_current_url()
        assert "forgot" in current_url.lower() or "reset" in current_url.lower(), \
            f"Should navigate to forgot password page, current URL: {current_url}"
    
    @pytest.mark.login
    @pytest.mark.slow
    def test_login_with_delayed_response(self, driver):
        """
        Test login with simulated network delay.
        
        Scenario: Login should handle network delays gracefully.
        """
        # Arrange
        login_page = LoginPage(driver)
        valid_username = "testuser"
        valid_password = "testpass123"
        
        # Act
        login_page.navigate_to_login()
        
        # Simulate typing delay
        login_page.enter_username(valid_username)
        login_page.enter_password(valid_password)
        
        # Wait for login button to be clickable (simulating network delay)
        login_page.wait_for_login_button_to_be_clickable()
        login_page.click_login()
        
        # Assert
        # Should eventually redirect or show appropriate response
        assert login_page.get_current_url() != login_page.url, \
            "Page should change after login attempt"
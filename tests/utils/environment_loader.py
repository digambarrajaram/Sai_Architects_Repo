"""
Environment Configuration Loader

Handles loading and validation of environment variables from .env file.
Provides centralized access to all configuration values used throughout the test suite.
"""

import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)


class EnvironmentLoader:
    """
    Production-grade environment loader with validation and type conversion.
    """
    
    def __init__(self, env_file: str = ".env"):
        """
        Initialize environment loader.
        
        Args:
            env_file: Path to .env file (relative to project root)
        """
        self.env_file = env_file
        self._load_environment()
        self._validate_required_variables()
        self.logger = logging.getLogger("EnvironmentLoader")
        logger.info("Environment loader initialized successfully")
    
    def _load_environment(self) -> None:
        """Load environment variables from .env file."""
        try:
            # Load .env file from project root
            project_root = self._get_project_root()
            env_path = os.path.join(project_root, self.env_file)
            
            if os.path.exists(env_path):
                load_dotenv(env_path)
                logger.info(f"Environment variables loaded from: {env_path}")
            else:
                logger.warning(f"Environment file not found: {env_path}. Using system environment variables.")
                
        except Exception as e:
            logger.error(f"Failed to load environment variables: {e}")
            raise EnvironmentError(f"Environment loading failed: {e}")
    
    def _get_project_root(self) -> str:
        """Get the project root directory."""
        # Try to find project root by looking for common project files
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Navigate up from tests/utils to project root
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
        
        # Verify this is actually the project root by checking for key files
        if os.path.exists(os.path.join(project_root, 'package.json')) or \
           os.path.exists(os.path.join(project_root, 'App.tsx')) or \
           os.path.exists(os.path.join(project_root, '.env.example')):
            return project_root
        
        # Fallback to current working directory
        return os.getcwd()
    
    def _validate_required_variables(self) -> None:
        """Validate that all required environment variables are present."""
        required_vars = [
            'TEST_USER_EMAIL',
            'TEST_USER_PASSWORD', 
            'SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_KEY',
            'ANDROID_DEVICE_NAME',
            'APP_PACKAGE',
            'APP_ACTIVITY',
            'APPIUM_SERVER_URL'
        ]
        
        missing_vars = []
        for var in required_vars:
            if not self.get_string(var):
                missing_vars.append(var)
        
        if missing_vars:
            error_msg = f"Missing required environment variables: {', '.join(missing_vars)}"
            logger.error(error_msg)
            raise EnvironmentError(error_msg)
        else:
            logger.info("All required environment variables are present")
    
    # String getters
    
    def get_string(self, key: str, default: Optional[str] = None) -> Optional[str]:
        """Get string value from environment."""
        value = os.getenv(key, default)
        if value is not None:
            value = value.strip()
        return value
    
    def get_required_string(self, key: str) -> str:
        """Get required string value from environment."""
        value = self.get_string(key)
        if not value:
            raise ValueError(f"Required environment variable '{key}' is missing or empty")
        return value
    
    # Integer getters
    
    def get_int(self, key: str, default: Optional[int] = None) -> Optional[int]:
        """Get integer value from environment."""
        value = self.get_string(key)
        if value is None:
            return default
        try:
            return int(value)
        except ValueError as e:
            logger.error(f"Invalid integer value for '{key}': {value}")
            raise ValueError(f"Environment variable '{key}' must be an integer: {e}")
    
    def get_required_int(self, key: str) -> int:
        """Get required integer value from environment."""
        value = self.get_int(key)
        if value is None:
            raise ValueError(f"Required environment variable '{key}' is missing or not an integer")
        return value
    
    # Boolean getters
    
    def get_bool(self, key: str, default: Optional[bool] = None) -> Optional[bool]:
        """Get boolean value from environment."""
        value = self.get_string(key)
        if value is None:
            return default
        
        value_lower = value.lower().strip()
        if value_lower in ('true', '1', 'yes', 'on'):
            return True
        elif value_lower in ('false', '0', 'no', 'off'):
            return False
        else:
            logger.error(f"Invalid boolean value for '{key}': {value}")
            raise ValueError(f"Environment variable '{key}' must be a boolean (true/false/1/0/yes/no/on/off)")
    
    def get_required_bool(self, key: str) -> bool:
        """Get required boolean value from environment."""
        value = self.get_bool(key)
        if value is None:
            raise ValueError(f"Required environment variable '{key}' is missing or not a boolean")
        return value
    
    # Configuration access methods
    
    # Test User Configuration
    def get_test_user_email(self) -> str:
        """Get test user email address."""
        return self.get_required_string('TEST_USER_EMAIL')
    
    def get_test_user_password(self) -> str:
        """Get test user password."""
        return self.get_required_string('TEST_USER_PASSWORD')
    
    def get_test_user_role(self) -> str:
        """Get test user role (owner/supervisor)."""
        return self.get_string('TEST_USER_ROLE', 'supervisor')
    
    # Role-based credentials for Owner and Supervisor
    def get_owner_email(self) -> str:
        """Get Owner role email address."""
        return self.get_required_string('OWNER_EMAIL')
    
    def get_owner_password(self) -> str:
        """Get Owner role password."""
        return self.get_required_string('OWNER_PASSWORD')
    
    def get_supervisor_email(self) -> str:
        """Get Supervisor role email address."""
        return self.get_required_string('SUPERVISOR_EMAIL')
    
    def get_supervisor_password(self) -> str:
        """Get Supervisor role password."""
        return self.get_required_string('SUPERVISOR_PASSWORD')
    
    def get_role_credentials(self, role: str) -> Dict[str, str]:
        """
        Get credentials for a specific role.
        
        Args:
            role: Role name ('owner' or 'supervisor')
            
        Returns:
            Dict with email and password for the role
        """
        if role.lower() == 'owner':
            return {
                'email': self.get_owner_email(),
                'password': self.get_owner_password()
            }
        elif role.lower() == 'supervisor':
            return {
                'email': self.get_supervisor_email(),
                'password': self.get_supervisor_password()
            }
        else:
            raise ValueError(f"Unknown role: {role}. Supported roles: owner, supervisor")
    
    # Supabase Configuration
    def get_supabase_url(self) -> str:
        """Get Supabase project URL."""
        return self.get_required_string('SUPABASE_URL')
    
    def get_supabase_service_role_key(self) -> str:
        """Get Supabase service role key for admin operations."""
        return self.get_required_string('SUPABASE_SERVICE_ROLE_KEY')
    
    def get_supabase_anon_key(self) -> Optional[str]:
        """Get Supabase anon key for client operations."""
        return self.get_string('SUPABASE_ANON_KEY')
    
    # Android Device Configuration
    def get_android_device_name(self) -> str:
        """Get Android device name/ID."""
        return self.get_required_string('ANDROID_DEVICE_NAME')
    
    def get_app_package(self) -> str:
        """Get Android app package name."""
        return self.get_required_string('APP_PACKAGE')
    
    def get_app_activity(self) -> str:
        """Get Android app main activity."""
        return self.get_required_string('APP_ACTIVITY')
    
    # Appium Configuration
    def get_appium_server_url(self) -> str:
        """Get Appium server URL."""
        return self.get_required_string('APPIUM_SERVER_URL')
    
    def get_element_timeout(self) -> int:
        """Get element wait timeout in seconds."""
        return self.get_int('ELEMENT_TIMEOUT', 30)
    
    def get_app_startup_timeout(self) -> int:
        """Get app startup timeout in seconds."""
        return self.get_int('APP_STARTUP_TIMEOUT', 60)
    
    # Test Configuration
    def get_test_data_prefix(self) -> str:
        """Get prefix for test data to avoid conflicts."""
        return self.get_string('TEST_DATA_PREFIX', 'TEST_')
    
    def get_cleanup_enabled(self) -> bool:
        """Check if test data cleanup is enabled."""
        return self.get_bool('CLEANUP_ENABLED', True)
    
    def get_screenshot_enabled(self) -> bool:
        """Check if screenshot capture is enabled."""
        return self.get_bool('SCREENSHOT_ENABLED', True)
    
    def get_verbose_logging(self) -> bool:
        """Check if verbose logging is enabled."""
        return self.get_bool('VERBOSE_LOGGING', False)
    
    # Database Configuration
    def get_supabase_timeout(self) -> int:
        """Get Supabase API timeout in milliseconds."""
        return self.get_int('SUPABASE_TIMEOUT', 30000)
    
    def get_db_poll_interval(self) -> int:
        """Get database poll interval in milliseconds."""
        return self.get_int('DB_POLL_INTERVAL', 1000)
    
    # Advanced Configuration
    def get_retry_attempts(self) -> int:
        """Get number of retry attempts for flaky operations."""
        return self.get_int('RETRY_ATTEMPTS', 3)
    
    def get_retry_delay(self) -> float:
        """Get delay between retry attempts in seconds."""
        return self.get_int('RETRY_DELAY', 2.0)
    
    def get_parallel_execution(self) -> bool:
        """Check if parallel test execution is enabled."""
        return self.get_bool('PARALLEL_EXECUTION', False)
    
    # Utility methods
    
    def get_all_variables(self) -> Dict[str, Any]:
        """Get all environment variables as a dictionary."""
        return dict(os.environ)
    
    def get_sensitive_variables(self) -> Dict[str, str]:
        """Get sensitive environment variables (for logging purposes)."""
        sensitive_vars = [
            'TEST_USER_EMAIL',
            'SUPABASE_URL',
            'ANDROID_DEVICE_NAME',
            'APP_PACKAGE'
        ]
        
        result = {}
        for var in sensitive_vars:
            value = self.get_string(var)
            if value:
                # Mask sensitive values for logging
                if len(value) > 4:
                    masked = value[:2] + '*' * (len(value) - 4) + value[-2:]
                else:
                    masked = '*' * len(value)
                result[var] = masked
        
        return result
    
    def validate_environment(self) -> bool:
        """Validate that the environment is properly configured for testing."""
        try:
            # Check if device is available
            device_name = self.get_android_device_name()
            logger.info(f"Target device: {device_name}")
            
            # Check if Supabase is accessible
            supabase_url = self.get_supabase_url()
            logger.info(f"Supabase URL: {supabase_url[:50]}..." if len(supabase_url) > 50 else f"Supabase URL: {supabase_url}")
            
            # Check if Appium server is configured
            appium_url = self.get_appium_server_url()
            logger.info(f"Appium server: {appium_url}")
            
            logger.info("Environment validation completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Environment validation failed: {e}")
            return False
    
    def get_capabilities(self) -> Dict[str, Any]:
        """Get Appium capabilities dictionary for driver initialization."""
        return {
            'platformName': 'Android',
            'platformVersion': self.get_string('ANDROID_PLATFORM_VERSION', ''),
            'deviceName': self.get_android_device_name(),
            'appPackage': self.get_app_package(),
            'appActivity': self.get_app_activity(),
            'noReset': self.get_bool('NO_RESET', False),
            'fullReset': self.get_bool('FULL_RESET', False),
            'autoGrantPermissions': self.get_bool('AUTO_GRANT_PERMISSIONS', True),
            'unicodeKeyboard': self.get_bool('UNICODE_KEYBOARD', True),
            'resetKeyboard': self.get_bool('RESET_KEYBOARD', True),
            'newCommandTimeout': self.get_element_timeout(),
            'automationName': self.get_string('AUTOMATION_NAME', 'UiAutomator2'),
            'udid': self.get_string('ANDROID_DEVICE_UDID', ''),
            'systemPort': self.get_int('SYSTEM_PORT', None),
            'chromeDriverPort': self.get_int('CHROME_DRIVER_PORT', None),
        }
    
    def get_logger(self):
        """Get the logger instance for this environment loader."""
        return self.logger

"""
WebDriver factory for creating browser instances.
Handles browser setup and configuration with cross-browser support.
"""
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.firefox.service import Service as FirefoxService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.core.os_manager import ChromeType

from config import config


class DriverFactory:
    """Factory class for creating WebDriver instances with cross-browser support."""
    
    @staticmethod
    def create_driver(browser_name: str = None, env: str = None) -> webdriver.Remote:
        """
        Create and configure a WebDriver instance.
        
        Args:
            browser_name (str, optional): Browser name (chrome, firefox).
                                        Defaults to BROWSER env var or 'chrome'.
            env (str, optional): Environment name (dev, qa, prod).
                               Defaults to ENVIRONMENT env var or 'dev'.
                               
        Returns:
            WebDriver: Configured WebDriver instance
            
        Raises:
            ValueError: If unsupported browser type is provided
            Exception: If WebDriver creation fails
        """
        browser_config = config.get_browser_config(browser_name)
        environment_config = config.get_environment_config(env)
        
        browser = browser_config['name'].lower()
        
        if browser == 'chrome':
            return DriverFactory._create_chrome_driver(browser_config, environment_config)
        elif browser == 'firefox':
            return DriverFactory._create_firefox_driver(browser_config, environment_config)
        else:
            raise ValueError(f"Unsupported browser: {browser}")
    
    @staticmethod
    def _create_chrome_driver(browser_config: dict, environment_config: dict) -> webdriver.Chrome:
        """
        Create Chrome WebDriver instance with specified configuration.
        
        Args:
            browser_config (dict): Browser-specific configuration
            environment_config (dict): Environment-specific configuration
            
        Returns:
            WebDriver: Configured Chrome WebDriver instance
        """
        try:
            # Setup Chrome options
            chrome_options = ChromeOptions()
            
            # GUI mode only - explicitly disable headless
            if not browser_config.get('headless', False):
                chrome_options.add_argument("--no-sandbox")
                chrome_options.add_argument("--disable-dev-shm-usage")
                chrome_options.add_argument("--disable-gpu")
                chrome_options.add_argument(f"--window-size={browser_config.get('window_size', '1920,1080')}")
            
            # Create service with webdriver-manager
            service = ChromeService(ChromeDriverManager(chrome_type=ChromeType.GOOGLE).install())
            
            # Create driver instance
            driver = webdriver.Chrome(service=service, options=chrome_options)
            
            # Set window size if maximize is True
            if browser_config.get('maximize', True):
                driver.maximize_window()
            
            # Set page load timeout
            timeout = environment_config.get('timeout', 10)
            driver.set_page_load_timeout(timeout * 2)
            
            return driver
            
        except Exception as e:
            raise Exception(f"Failed to create Chrome WebDriver: {str(e)}")
    
    @staticmethod
    def _create_firefox_driver(browser_config: dict, environment_config: dict) -> webdriver.Firefox:
        """
        Create Firefox WebDriver instance with specified configuration.
        
        Args:
            browser_config (dict): Browser-specific configuration
            environment_config (dict): Environment-specific configuration
            
        Returns:
            WebDriver: Configured Firefox WebDriver instance
        """
        try:
            # Setup Firefox options
            firefox_options = FirefoxOptions()
            
            # GUI mode only - explicitly disable headless
            if not browser_config.get('headless', False):
                firefox_options.add_argument("--width=1920")
                firefox_options.add_argument("--height=1080")
            
            # Create service with webdriver-manager
            service = FirefoxService(GeckoDriverManager().install())
            
            # Create driver instance
            driver = webdriver.Firefox(service=service, options=firefox_options)
            
            # Set window size if maximize is True
            if browser_config.get('maximize', True):
                driver.maximize_window()
            
            # Set page load timeout
            timeout = environment_config.get('timeout', 10)
            driver.set_page_load_timeout(timeout * 2)
            
            return driver
            
        except Exception as e:
            raise Exception(f"Failed to create Firefox WebDriver: {str(e)}")

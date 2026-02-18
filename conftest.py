"""
Pytest configuration and fixtures for Selenium automation framework.
"""
import pytest
import logging
from typing import Generator

from utils.driver_factory import DriverFactory
from config import config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def pytest_addoption(parser):
    """Add custom command line options."""
    parser.addoption(
        "--browser",
        action="store",
        default="chrome",
        help="Browser to run tests on: chrome or firefox"
    )
    parser.addoption(
        "--env",
        action="store",
        default="dev",
        help="Environment to run tests on: dev, qa, or prod"
    )
    parser.addoption(
        "--retry",
        action="store",
        type=int,
        default=2,
        help="Number of retries for failed tests"
    )


@pytest.fixture(scope="session")
def browser_name(request) -> str:
    """Get browser name from command line option."""
    return request.config.getoption("--browser")


@pytest.fixture(scope="session")
def environment(request) -> str:
    """Get environment from command line option."""
    return request.config.getoption("--env")


@pytest.fixture(scope="session")
def retry_count(request) -> int:
    """Get retry count from command line option."""
    return request.config.getoption("--retry")


@pytest.fixture(scope="session")
def driver_config(browser_name: str, environment: str) -> dict:
    """Global driver configuration with environment support."""
    try:
        browser_config = config.get_browser_config(browser_name)
        env_config = config.get_environment_config(environment)
        
        return {
            'browser': browser_config['name'],
            'headless': browser_config.get('headless', False),
            'maximize': browser_config.get('maximize', True),
            'timeout': env_config.get('timeout', 10),
            'base_url': env_config.get('base_url', 'https://example.com')
        }
    except Exception as e:
        logger.error(f"Failed to load configuration: {e}")
        pytest.fail(f"Configuration error: {e}")


@pytest.fixture(scope="function")
def driver(driver_config: dict) -> Generator:
    """
    WebDriver fixture that provides a browser instance for each test.
    
    Args:
        driver_config: Configuration dictionary for the driver
        
    Yields:
        WebDriver: Configured WebDriver instance
    """
    driver_instance = None
    try:
        logger.info(f"Creating WebDriver for {driver_config['browser']}")
        driver_instance = DriverFactory.create_driver(
            browser_name=driver_config['browser'],
            env=None  # Let DriverFactory use config internally
        )
        yield driver_instance
    except Exception as e:
        logger.error(f"Failed to create WebDriver: {str(e)}")
        pytest.fail(f"Failed to create WebDriver: {str(e)}")
    finally:
        if driver_instance:
            try:
                logger.info("Quitting WebDriver")
                driver_instance.quit()
            except Exception as e:
                logger.warning(f"Failed to quit driver: {str(e)}")


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment(environment: str, retry_count: int):
    """Setup test environment before running tests."""
    logger.info("="*60)
    logger.info(f"Starting Selenium Test Suite")
    logger.info(f"Environment: {environment}")
    logger.info(f"Retry count: {retry_count}")
    logger.info("="*60)
    
    # Create required directories
    import os
    directories = ["reports", "logs"]
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            logger.info(f"Created directory: {directory}")
    
    yield
    
    logger.info("="*60)
    logger.info("Test Suite Completed")
    logger.info("="*60)


# Pytest markers
def pytest_configure(config):
    """Configure custom pytest markers."""
    config.addinivalue_line(
        "markers", "smoke: mark test as part of smoke suite"
    )
    config.addinivalue_line(
        "markers", "regression: mark test as part of regression suite"
    )
    config.addinivalue_line(
        "markers", "sanity: mark test as part of sanity suite"
    )
    config.addinivalue_line(
        "markers", "login: mark test as login related"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
    config.addinivalue_line(
        "markers", "cross_browser: mark test for cross-browser testing"
    )


# Retry mechanism for flaky tests
def pytest_runtest_makereport(item, call):
    """Add retry mechanism for failed tests."""
    if call.when == "call":
        if call.excinfo is not None:
            # Test failed, check if we should retry
            retry_count = item.config.getoption("--retry")
            if hasattr(item, "_retry_count"):
                item._retry_count += 1
            else:
                item._retry_count = 1
            
            if item._retry_count <= retry_count:
                logger.warning(f"Test {item.name} failed (attempt {item._retry_count}), retrying...")
                return None  # This will cause pytest to retry the test

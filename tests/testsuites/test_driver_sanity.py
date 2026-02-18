"""
Driver Sanity Test

Verifies that the production-grade Appium driver initialization
works correctly before running the full test suite.
"""

import logging
import os
import pytest
from dotenv import load_dotenv

logger = logging.getLogger(__name__)


def test_driver_creation():
    """
    Sanity test to verify Appium driver can be created successfully.
    """
    from utils.driver_factory import create_driver, validate_driver_capabilities

    logger.info("🧪 Running Appium driver sanity test...")

    driver = None
    try:
        # Create driver
        driver = create_driver()
        assert driver is not None, "❌ Driver creation failed (driver is None)"

        # Validate capabilities
        assert validate_driver_capabilities(driver), \
            "❌ Driver capabilities validation failed"

        # Basic interaction check (non-blocking)
        try:
            package = driver.current_package
            logger.info(f"✅ Driver connected to package: {package}")
        except Exception as e:
            logger.warning(
                f"⚠️ Unable to fetch current package (non-critical): {e}"
            )

        logger.info("✅ Driver sanity test passed")

    finally:
        if driver:
            driver.quit()
            logger.info("🧹 Driver session closed")


def test_environment_variables():
    """
    Verify all required environment variables are loaded and valid.
    """
    load_dotenv()

    required_vars = [
        "APPIUM_SERVER_URL",
        "ANDROID_PLATFORM_NAME",
        "ANDROID_DEVICE_NAME",
        "APP_PACKAGE",
        "APP_ACTIVITY",
    ]

    missing_vars = []

    for var in required_vars:
        value = os.getenv(var)
        if not value:
            missing_vars.append(var)
        else:
            logger.info(f"✅ {var} = {value}")

    assert not missing_vars, \
        f"❌ Missing or empty environment variables: {missing_vars}"

    logger.info("✅ Environment variable validation passed")

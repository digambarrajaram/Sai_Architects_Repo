"""
Production-Grade Appium Driver Factory

This module provides a robust, future-proof way to create Appium WebDriver instances
using the latest W3C-compliant UiAutomator2Options approach.
"""

import os
import logging

from appium import webdriver
from appium.options.android import UiAutomator2Options

logger = logging.getLogger(__name__)


def create_driver():
    """
    Create an Appium WebDriver instance using W3C-compliant UiAutomator2Options.
    
    This is the production-grade approach that works with Appium Python Client 3.x+
    and Appium Server 2.x/3.x.
    
    Returns:
        WebDriver instance or None if creation fails
    """
    try:
        # Create UiAutomator2Options for W3C compliance
        options = UiAutomator2Options()

        # Set required capabilities
        options.platform_name = os.getenv("ANDROID_PLATFORM_NAME", "Android")
        options.device_name = os.getenv("ANDROID_DEVICE_NAME", "Android Device")
        options.udid = os.getenv("ANDROID_DEVICE_UDID", None)  # Optional, auto-detected if not provided

        # Set app-specific capabilities
        options.app_package = os.getenv("APP_PACKAGE", "com.anonymous.sai_app")
        options.app_activity = os.getenv("APP_ACTIVITY", ".MainActivity")

        # Set automation and behavior options
        options.automation_name = "UiAutomator2"
        options.no_reset = True
        options.full_reset = False
        options.auto_grant_permissions = True
        options.new_command_timeout = 300  # 5 minutes
        
        # Add UiAutomator2-specific timeouts to prevent crashes
        options.set_capability("uiautomator2ServerInstallTimeout", 60000)
        options.set_capability("uiautomator2ServerLaunchTimeout", 60000)
        options.set_capability("disableWindowAnimation", True)
        options.set_capability("ignoreHiddenApiPolicyError", True)

        # Get Appium server URL (Appium 2.x compatible)
        appium_server_url = os.getenv("APPIUM_SERVER_URL", "http://127.0.0.1:4723")

        logger.info(f"Creating Appium driver with options: {options}")
        logger.info(f"Appium server URL: {appium_server_url}")

        # Create WebDriver instance
        driver = webdriver.Remote(
            command_executor=appium_server_url,
            options=options
        )

        logger.info("✅ Appium driver initialized successfully")
        return driver

    except Exception as e:
        logger.error(f"❌ Failed to initialize Appium driver: {e}")
        logger.error(f"Driver creation error details: {type(e).__name__}: {str(e)}")
        return None


def validate_driver_capabilities(driver) -> bool:
    """
    Validate that the driver was created with the expected capabilities.
    
    Args:
        driver: WebDriver instance
        
    Returns:
        bool: True if validation passes
    """
    try:
        if driver is None:
            logger.error("Driver validation failed: driver is None")
            return False
        
        # Get current capabilities
        capabilities = driver.capabilities
        
        # Validate required capabilities
        required_caps = [
            'platformName',
            'deviceName', 
            'appPackage',
            'appActivity',
            'automationName'
        ]
        
        for cap in required_caps:
            if cap not in capabilities:
                logger.error(f"Missing required capability: {cap}")
                return False
        
        logger.info("✅ Driver capabilities validation passed")
        return True
        
    except Exception as e:
        logger.error(f"Driver validation failed: {e}")
        return False
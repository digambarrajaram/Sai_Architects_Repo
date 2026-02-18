"""
Device Manager Utility for Appium Tests

Provides functions to:
- Detect connected Android devices via ADB
- Get device information
- Verify USB debugging is enabled
"""

import subprocess
import re
from typing import Optional, List
from loguru import logger


def run_adb_command(args: List[str]) -> subprocess.CompletedProcess:
    """
    Execute an ADB command and return the result.
    
    Args:
        args: List of ADB arguments (e.g., ["devices", "-l"])
    
    Returns:
        subprocess.CompletedProcess object
    """
    cmd = ["adb"] + args
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30
        )
        return result
    except FileNotFoundError:
        raise RuntimeError("ADB not found. Please install Android SDK and add to PATH")
    except subprocess.TimeoutExpired:
        raise RuntimeError("ADB command timed out")


def get_connected_devices() -> List[dict]:
    """
    Get list of connected Android devices.
    
    Returns:
        List of dictionaries with device info:
        [{'serial': 'ABC123XYZ', 'state': 'device', 'product': '...', ...}]
    """
    result = run_adb_command(["devices", "-l"])
    
    devices = []
    lines = result.stdout.strip().split('\n')
    
    # Skip header line
    for line in lines[1:]:
        if line.strip():
            parts = line.split()
            if len(parts) >= 2:
                device = {
                    'serial': parts[0],
                    'state': parts[1],
                }
                # Parse additional info (product:model:device)
                for part in parts[2:]:
                    if ':' in part:
                        key, value = part.split(':', 1)
                        device[key] = value
                devices.append(device)
    
    return devices


def get_first_device_serial() -> Optional[str]:
    """
    Get the serial number of the first connected device.
    
    Returns:
        Device serial string or None if no device connected
    """
    devices = get_connected_devices()
    if devices:
        return devices[0]['serial']
    return None


def is_device_connected(device_serial: str) -> bool:
    """
    Check if a specific device is connected and online.
    
    Args:
        device_serial: The device serial number to check
    
    Returns:
        True if device is connected and in 'device' state
    """
    devices = get_connected_devices()
    for device in devices:
        if device['serial'] == device_serial and device['state'] == 'device':
            return True
    return False


def get_device_info(device_serial: str) -> dict:
    """
    Get detailed information about a connected device.
    
    Args:
        device_serial: The device serial number
    
    Returns:
        Dictionary with device information
    """
    info = {}
    
    # Get device model
    result = run_adb_command(["-s", device_serial, "shell", "getprop", "ro.product.model"])
    if result.returncode == 0:
        info['model'] = result.stdout.strip()
    
    # Get Android version
    result = run_adb_command(["-s", device_serial, "shell", "getprop", "ro.build.version.release"])
    if result.returncode == 0:
        info['android_version'] = result.stdout.strip()
    
    # Get manufacturer
    result = run_adb_command(["-s", device_serial, "shell", "getprop", "ro.product.manufacturer"])
    if result.returncode == 0:
        info['manufacturer'] = result.stdout.strip()
    
    return info


def verify_device_ready(device_serial: str) -> tuple:
    """
    Verify device is ready for testing.
    
    Args:
        device_serial: Device serial number
    
    Returns:
        (success: bool, message: str)
    """
    # Check device is connected
    if not is_device_connected(device_serial):
        return False, f"Device {device_serial} is not connected or not authorized"
    
    # Get device info
    info = get_device_info(device_serial)
    
    logger.info(f"Device connected: {info.get('model', 'Unknown')}")
    logger.info(f"Android version: {info.get('android_version', 'Unknown')}")
    
    return True, "Device is ready"


def unlock_device(device_serial: str) -> bool:
    """
    Attempt to wake and unlock the device.
    Note: This may not work on all devices due to security features.
    
    Args:
        device_serial: Device serial number
    
    Returns:
        True if successful
    """
    # Wake device
    run_adb_command(["-s", device_serial, "shell", "input", "keyevent", "KEYCODE_WAKEUP"])
    
    # Swipe up to unlock (if pattern/PIN is not set)
    run_adb_command([
        "-s", device_serial, "shell", "input", "swipe", 
        "500", "1000", "500", "500", "1000"
    ])
    
    return True


# =============================================================================
# USAGE EXAMPLES
# =============================================================================
#
# # List all connected devices
# devices = get_connected_devices()
# print(f"Found {len(devices)} device(s)")
#
# # Get first device
# serial = get_first_device_serial()
# if serial:
#     info = get_device_info(serial)
#     print(f"Testing on: {info['model']}")
#
# # Verify device is ready
# success, message = verify_device_ready(serial)
# if not success:
#     raise Exception(message)
#
# =============================================================================


class DeviceManager:
    """Device manager class for pytest fixtures and test configuration."""
    
    def __init__(self, env_loader):
        """Initialize device manager with environment loader."""
        self.env_loader = env_loader
        self.device_serial = None
        self.device_info = {}
    
    def verify_device_ready(self) -> None:
        """Verify that a device is connected and ready for testing."""
        # Get first connected device
        self.device_serial = get_first_device_serial()
        if not self.device_serial:
            raise RuntimeError("No Android device connected. Please connect a device and ensure USB debugging is enabled.")
        
        # Verify device is ready
        success, message = verify_device_ready(self.device_serial)
        if not success:
            raise RuntimeError(f"Device not ready: {message}")
        
        # Get device information
        self.device_info = get_device_info(self.device_serial)
        logger.info(f"Device ready: {self.device_info.get('model', 'Unknown')} ({self.device_serial})")
        return True
    
    def get_device_name(self) -> str:
        """Get device name for logging."""
        return self.device_info.get('model', 'Unknown Device')
    
    def get_appium_capabilities(self) -> dict:
        """Get Appium capabilities for the connected device."""
        capabilities = {
            'platformName': 'Android',
            'platformVersion': self.device_info.get('android_version', ''),
            'deviceName': self.device_info.get('model', 'Android Device'),
            'udid': self.device_serial,
            'appPackage': self.env_loader.get_app_package(),
            'appActivity': self.env_loader.get_app_activity(),
            'noReset': True,
            'fullReset': False,
            'autoGrantPermissions': True,
            'automationName': 'UiAutomator2'
        }
        return capabilities
    
    def unlock_device(self) -> bool:
        """Attempt to unlock the device."""
        if self.device_serial:
            return unlock_device(self.device_serial)
        return False
    
    def _is_app_installed(self, app_package: str) -> bool:
        """
        Check if the app is installed on the device.
        
        Args:
            app_package: The app package name to check
            
        Returns:
            True if app is installed, False otherwise
        """
        if not self.device_serial:
            return False
        
        try:
            result = run_adb_command([
                "-s", self.device_serial, "shell", "pm", "list", "packages"
            ])
            
            if result.returncode == 0:
                return app_package in result.stdout
            return False
        except Exception:
            return False

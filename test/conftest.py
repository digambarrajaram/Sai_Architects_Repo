#!/usr/bin/env python3
"""
CIVMANAGER - Pytest Configuration
"""

import pytest
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


def pytest_configure(config):
    """Configure pytest options"""
    config.addinivalue_line(
        "markers", "smoke: mark test as smoke test"
    )
    config.addinivalue_line(
        "markers", "regression: mark test as regression test"
    )


@pytest.fixture(scope="session")
def browser():
    """Browser fixture for all tests"""
    options = Options()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-notifications")
    
    # Headless mode for CI
    if os.getenv("HEADLESS", "false").lower() == "true":
        options.add_argument("--headless=new")
    
    driver = webdriver.Chrome(options=options)
    yield driver
    driver.quit()


@pytest.fixture(scope="session")
def app_url():
    """Application URL fixture"""
    return os.getenv("APP_URL", "http://localhost:8081")


@pytest.fixture
def owner_login(browser, app_url):
    """Login as owner and return to projects list"""
    browser.get(app_url)
    
    username_input = browser.find_element("css selector", "[data-testid='username-input']")
    username_input.clear()
    username_input.send_keys("james_owner")
    
    login_button = browser.find_element("css selector", "[data-testid='login-button']")
    login_button.click()
    
    # Wait for projects list
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.common.by import By
    
    WebDriverWait(browser, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='projects-title']"))
    )
    
    yield browser
    
    # Cleanup - logout if needed
    try:
        avatar_btn = browser.find_element("css selector", "[data-testid='avatar-btn']")
        avatar_btn.click()
    except Exception:
        pass


@pytest.fixture
def supervisor_login(browser, app_url):
    """Login as supervisor and return to projects list"""
    browser.get(app_url)
    
    username_input = browser.find_element("css selector", "[data-testid='username-input']")
    username_input.clear()
    username_input.send_keys("tom_supervisor")
    
    login_button = browser.find_element("css selector", "[data-testid='login-button']")
    login_button.click()
    
    # Wait for projects list
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.common.by import By
    
    WebDriverWait(browser, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='projects-title']"))
    )
    
    yield browser

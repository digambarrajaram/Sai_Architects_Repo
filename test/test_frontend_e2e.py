#!/usr/bin/env python3
"""
CIVMANAGER – FRONTEND ONLY E2E TEST (NO BACKEND)

✔ White screen detection
✔ UI render validation
✔ Project-centric navigation
✔ Role-based UI enforcement
✔ Advanced Owner Navigation (Dashboard, Audit, Reports, Team)
✔ Expense Entry Flow
✔ React Native Web safe
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time

BASE_URL = "http://localhost:8081"
WAIT = 15


# ================= DRIVER SETUP =================

def setup_driver():
    options = Options()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-notifications")
    # Uncomment below for headless mode
    # options.add_argument("--headless")
    driver = webdriver.Chrome(options=options)
    return driver


# ================= SAFE WAIT HELPERS =================

def wait_for_element(driver, xpath, description, timeout=WAIT):
    try:
        return WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.XPATH, xpath))
        )
    except TimeoutException:
        raise AssertionError(f"❌ Element not found: {description} (XPath: {xpath})")

def wait_any(driver, xpaths, description, timeout=WAIT):
    """
    Wait until ANY of the provided xpaths is present.
    """
    for xpath in xpaths:
        try:
            return WebDriverWait(driver, timeout).until(
                EC.presence_of_element_located((By.XPATH, xpath))
            )
        except TimeoutException:
            continue
    raise AssertionError(f"❌ UI not rendered: {description}")


def assert_not_visible(driver, text):
    assert text not in driver.page_source, f"❌ '{text}' should NOT be visible"

def click_element(driver, xpath, description):
    el = wait_for_element(driver, xpath, description)
    try:
        # Standard click
        el.click()
    except Exception:
        # JS click fallback for mobile-web/hidden elements
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", el)
        driver.execute_script("arguments[0].click();", el)

def send_keys(driver, xpath, keys, description):
    el = wait_for_element(driver, xpath, description)
    el.clear()
    el.send_keys(keys)


# ================= COMMON ACTIONS =================

def login(driver, username):
    driver.get(BASE_URL)
    # Handle possible delay in loading
    time.sleep(2)
    
    send_keys(driver, "//*[@data-testid='username-input'] | //input", username, "Username input")
    click_element(driver, "//*[@data-testid='login-button'] | //button", "Login button")
    
    # Verify login success
    wait_for_element(driver, "//*[contains(text(),'Project')] | //*[@testID='projects-title']", "Project list screen")

def logout(driver):
    # Go to Profile/Settings
    click_element(driver, "//*[@data-testid='tab-Settings'] | //*[@testID='avatar-btn']", "Settings/Profile tab")
    
    # Click Logout
    click_element(driver, "//*[contains(text(),'Log Out')] | //button[contains(.,'Log Out')]", "Logout button")
    
    # Verify back to login
    wait_for_element(driver, "//*[@data-testid='username-input'] | //input", "Login screen")


# ================= FLOWS =================

def test_expense_entry_flow(driver, role_prefix):
    print(f"--- Testing Expense Entry Flow ({role_prefix}) ---")
    
    # Open first project
    click_element(driver, "//*[@data-testid='project-card-CIV-2023-089'] | //*[contains(text(),'CIV')]", "Project card")
    
    # Click Add Expense
    click_element(driver, "//*[@data-testid='add-expense-fab'] | //*[contains(text(),'Add Expense')]", "Add Expense FAB")
    
    # Fill Amount
    send_keys(driver, "//*[@data-testid='amount-input']", "150.50", "Amount input")
    
    # Submit
    click_element(driver, "//*[@data-testid='submit-expense-btn'] | //*[contains(text(),'Submit Expense')]", "Submit button")
    
    # Should be back in Project Detail
    wait_for_element(driver, "//*[contains(text(),'Project Detail')]", "Project Detail screen after submit")
    print("[PASS] Expense Entry Flow Passed")


def test_owner_advanced_navigation(driver):
    print("--- Testing Owner Advanced Navigation ---")
    
    # Navigate to Project Dashboard from Project Detail
    click_element(driver, "//*[@data-testid='dashboard-nav-btn']", "Dashboard Nav Button")
    wait_for_element(driver, "//*[contains(text(),'Financial Performance')]", "Owner Dashboard")
    print("[PASS] Navigated to Dashboard")
    
    # Test Team/User Management from Dashboard
    click_element(driver, "//*[@data-testid='tab-Team']", "Team Tab")
    wait_for_element(driver, "//*[contains(text(),'Manage Team')] | //*[contains(text(),'Active Users')]", "User Management Screen")
    print("[PASS] Navigated to User Management")
    
    # Go back to Project List via Tab
    click_element(driver, "//*[@data-testid='tab-Projects']", "Projects Tab")
    wait_for_element(driver, "//*[@data-testid='projects-title']", "Project List")
    
    # Go back to Project Detail
    click_element(driver, "//*[@data-testid='project-card-CIV-2023-089']", "Project card")
    
    # Verify Owner-only data in Project Detail
    wait_for_element(driver, "//*[contains(text(),'Project Detail')]", "Project Detail")
    assert "BUDGET" in driver.page_source.upper()
    assert "NET P/L" in driver.page_source.upper()
    print("[PASS] Owner-only data verified in Project Detail")

    # Test Audit Logs from Project Detail
    click_element(driver, "//*[@data-testid='audit-logs-nav-btn']", "Audit Logs Nav Button")
    wait_for_element(driver, "//*[contains(text(),'Audit Logs')]", "Audit Logs Screen")
    print("[PASS] Navigated to Audit Logs")
    
    # Back to Detail
    click_element(driver, "//*[@data-testid='back-btn']", "Back button")
    
    # Test Reports from Project Detail
    click_element(driver, "//*[@data-testid='reports-nav-btn']", "Reports Nav Button")
    wait_for_element(driver, "//*[contains(text(),'Export Data')]", "Reports/Export Screen")
    print("[PASS] Navigated to Reports & Export")
    
    # Back to Detail
    click_element(driver, "//*[@data-testid='back-btn']", "Back button")
    wait_for_element(driver, "//*[contains(text(),'Project Detail')]", "Project Detail")
    click_element(driver, "//*[@data-testid='back-btn']", "Back to Project List")
    wait_for_element(driver, "//*[@data-testid='projects-title']", "Project List")


def test_owner_flow(driver):
    print("\n[START] STARTING OWNER FLOW TEST")
    login(driver, "james_owner")
    
    # Check Visibility in Project List
    assert "BUDGET" in driver.page_source.upper()
    assert "SPENT" in driver.page_source.upper()
    print("[PASS] Owner visibility verified in Project List")
    
    # Test Expense Entry
    test_expense_entry_flow(driver, "Owner")
    
    # Test Advanced Navigation
    test_owner_advanced_navigation(driver)
    
    logout(driver)
    print("[PASS] OWNER FLOW TEST PASSED")


def test_supervisor_flow(driver):
    print("\n[START] STARTING SUPERVISOR FLOW TEST")
    login(driver, "tom_supervisor")
    
    # Check Restricted Visibility in Project List
    assert_not_visible(driver, "Total Spent")
    assert_not_visible(driver, "Budget")
    
    # Open Project
    click_element(driver, "//*[@data-testid='project-card-CIV-2023-089']", "Project card")
    
    # Check Restricted Visibility in Project Detail
    wait_for_element(driver, "//*[contains(text(),'Project Detail')]", "Project Detail")
    assert_not_visible(driver, "TOTAL BUDGET")
    assert_not_visible(driver, "NET P/L")
    
    # Test Expense Entry
    test_expense_entry_flow(driver, "Supervisor")
    
    logout(driver)
    print("[PASS] SUPERVISOR FLOW TEST PASSED")


# ================= TEARDOWN =================

def teardown(driver):
    driver.quit()


# ================= MAIN =================

if __name__ == "__main__":
    driver = setup_driver()
    try:
        test_owner_flow(driver)
        test_supervisor_flow(driver)
        print("\n[SUCCESS] ALL FRONTEND E2E TESTS PASSED SUCCESSFULLY")
    except Exception as e:
        print(f"\n[FAIL] TEST FAILED: {e}")
        # Optional: save screenshot
        driver.save_screenshot("test_failure.png")
        raise e
    finally:
        teardown(driver)

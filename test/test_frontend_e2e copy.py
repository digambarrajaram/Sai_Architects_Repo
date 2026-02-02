#!/usr/bin/env python3
"""
CIVMANAGER – FRONTEND ONLY E2E TEST (PRODUCTION-GRADE)

✔ Explicit white screen detection
✔ UI render validation
✔ Project-centric navigation
✔ Role-based UI enforcement (Owner / Supervisor)
✔ Owner advanced navigation (Dashboard, Audit, Reports, Team)
✔ Expense entry flow (inside project only)
✔ React Native Web safe
✔ CI-ready (no sleep, no brittle selectors)
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

BASE_URL = "http://localhost:8081"
WAIT = 15


# ================= DRIVER SETUP =================

def setup_driver():
    options = Options()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-notifications")
    # options.add_argument("--headless=new")  # Enable in CI
    return webdriver.Chrome(options=options)


# ================= WAIT HELPERS =================

def wait_for_element(driver, xpath, description, timeout=WAIT):
    try:
        return WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.XPATH, xpath))
        )
    except TimeoutException:
        raise AssertionError(f"❌ Element not found: {description}")

def wait_any(driver, xpaths, description, timeout=WAIT):
    try:
        WebDriverWait(driver, timeout).until(
            lambda d: any(d.find_elements(By.XPATH, xp) for xp in xpaths)
        )
    except TimeoutException:
        raise AssertionError(f"❌ UI not rendered: {description}")

def click_element(driver, xpath, description):
    el = wait_for_element(driver, xpath, description)
    driver.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
    driver.execute_script("arguments[0].click();", el)

def send_keys(driver, xpath, value, description):
    el = wait_for_element(driver, xpath, description)
    el.clear()
    el.send_keys(value)

def assert_not_visible(driver, text):
    assert text.upper() not in driver.page_source.upper(), \
        f"❌ '{text}' should NOT be visible"


# ================= WHITE SCREEN CHECK =================

def assert_no_white_screen(driver):
    body = driver.find_element(By.TAG_NAME, "body")
    assert body.text.strip() != "", "❌ White screen detected (empty body)"


# ================= COMMON ACTIONS =================

def login(driver, username):
    driver.get(BASE_URL)

    wait_for_element(
        driver,
        "//*[@data-testid='username-input'] | //input",
        "Username input"
    )
    assert_no_white_screen(driver)

    send_keys(
        driver,
        "//*[@data-testid='username-input'] | //input",
        username,
        "Username"
    )
    click_element(
        driver,
        "//*[@data-testid='login-button'] | //button",
        "Login"
    )

    wait_for_element(
        driver,
        "//*[@data-testid='projects-title'] | //*[contains(text(),'Project')]",
        "Project List"
    )
    assert_no_white_screen(driver)

def logout(driver):
    click_element(
        driver,
        "//*[@data-testid='tab-Settings'] | //*[@data-testid='avatar-btn']",
        "Settings"
    )
    click_element(
        driver,
        "//*[contains(text(),'Log Out')] | //*[@data-testid='logout-btn']",
        "Logout"
    )
    wait_for_element(
        driver,
        "//*[@data-testid='username-input'] | //input",
        "Login screen"
    )


# ================= PROJECT HELPERS =================

def open_first_project(driver):
    click_element(
        driver,
        "//*[@data-testid='project-card'] | //*[contains(@testid,'project')]",
        "First project"
    )
    wait_for_element(
        driver,
        "//*[@data-testid='project-detail'] | //*[contains(text(),'Project Detail')]",
        "Project Detail"
    )
    assert_no_white_screen(driver)


# ================= FLOWS =================

def test_expense_entry(driver):
    click_element(
        driver,
        "//*[@data-testid='add-expense-btn'] | //*[contains(text(),'Add Expense')]",
        "Add Expense"
    )

    wait_for_element(
        driver,
        "//*[@data-testid='expense-form'] | //*[contains(text(),'Amount')]",
        "Expense Form"
    )

    send_keys(
        driver,
        "//*[@data-testid='amount-input'] | //input",
        "150.50",
        "Amount"
    )

    click_element(
        driver,
        "//*[@data-testid='submit-expense-btn'] | //*[contains(text(),'Submit')]",
        "Submit Expense"
    )

    wait_for_element(
        driver,
        "//*[@data-testid='project-detail'] | //*[contains(text(),'Project Detail')]",
        "Project Detail after expense"
    )

    print("[PASS] Expense entry flow")


def test_owner_advanced_navigation(driver):
    click_element(
        driver,
        "//*[@data-testid='nav-dashboard'] | //*[contains(text(),'Dashboard')]",
        "Dashboard"
    )
    wait_any(
        driver,
        [
            "//*[@data-testid='financial-dashboard']",
            "//*[contains(text(),'Financial')]",
        ],
        "Owner Dashboard"
    )

    click_element(
        driver,
        "//*[@data-testid='nav-team'] | //*[contains(text(),'Team')]",
        "Team"
    )
    wait_any(
        driver,
        [
            "//*[@data-testid='team-management']",
            "//*[contains(text(),'Users')]",
        ],
        "Team Management"
    )

    click_element(
        driver,
        "//*[@data-testid='nav-projects'] | //*[contains(text(),'Projects')]",
        "Projects"
    )
    open_first_project(driver)

    # Owner financial visibility (ONLY here)
    wait_any(
        driver,
        [
            "//*[@data-testid='budget-value']",
            "//*[contains(text(),'Budget')]",
        ],
        "Owner Budget"
    )

    wait_any(
        driver,
        [
            "//*[@data-testid='net-pl-value']",
            "//*[contains(text(),'P/L')]",
            "//*[contains(text(),'Profit')]",
        ],
        "Owner Profit/Loss"
    )

    click_element(
        driver,
        "//*[@data-testid='nav-audit'] | //*[contains(text(),'Audit')]",
        "Audit Logs"
    )
    wait_any(
        driver,
        [
            "//*[@data-testid='audit-logs']",
            "//*[contains(text(),'Audit Logs')]",
        ],
        "Audit Logs"
    )

    click_element(
        driver,
        "//*[@data-testid='nav-reports'] | //*[contains(text(),'Report')]",
        "Reports"
    )
    wait_any(
        driver,
        [
            "//*[@data-testid='export-reports']",
            "//*[contains(text(),'Export')]",
        ],
        "Reports"
    )

    print("[PASS] Owner advanced navigation")


# ================= ROLE TESTS =================

def owner_flow():
    driver = setup_driver()
    try:
        print("\n[START] OWNER FLOW")
        login(driver, "james_owner")

        open_first_project(driver)

        test_expense_entry(driver)
        test_owner_advanced_navigation(driver)

        logout(driver)
        print("[PASS] OWNER FLOW COMPLETE")
    finally:
        driver.quit()


def supervisor_flow():
    driver = setup_driver()
    try:
        print("\n[START] SUPERVISOR FLOW")
        login(driver, "tom_supervisor")

        assert_not_visible(driver, "Budget")
        assert_not_visible(driver, "Profit")
        assert_not_visible(driver, "P/L")

        open_first_project(driver)

        assert_not_visible(driver, "Budget")
        assert_not_visible(driver, "Profit")
        assert_not_visible(driver, "P/L")

        test_expense_entry(driver)

        logout(driver)
        print("[PASS] SUPERVISOR FLOW COMPLETE")
    finally:
        driver.quit()


# ================= MAIN =================

if __name__ == "__main__":
    try:
        owner_flow()
        supervisor_flow()
        print("\n[SUCCESS] ALL FRONTEND E2E TESTS PASSED")
    except Exception as e:
        print(f"\n[FAIL] TEST FAILED: {e}")
        raise

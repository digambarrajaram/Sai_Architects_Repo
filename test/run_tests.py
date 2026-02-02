#!/usr/bin/env python3
"""
CIVMANAGER - TEST RUNNER
Runs all test suites and generates final report
"""

import sys
import os

# Add test directory to path
sys.path.insert(0, os.path.dirname(__file__))

from test_auth_flow import run_auth_tests
from test_project_flow import run_project_tests
from test_expense_flow import run_expense_tests
from test_navigation_flow import run_navigation_tests
from test_role_visibility import run_role_visibility_tests


def run_all_tests():
    """Run all test suites and generate final report"""
    
    print("\n" + "=" * 70)
    print("CIVMANAGER - SELENIUM TEST SUITE")
    print("=" * 70)
    print(f"\nEnvironment: {'Headless' if os.getenv('HEADLESS', 'false').lower() == 'true' else 'UI Mode'}")
    print(f"App URL: {os.getenv('APP_URL', 'http://localhost:8081')}")
    
    all_results = []
    
    # Run each test suite
    test_suites = [
        ("AUTH FLOW TESTS", run_auth_tests),
        ("PROJECT FLOW TESTS", run_project_tests),
        ("EXPENSE FLOW TESTS", run_expense_tests),
        ("NAVIGATION FLOW TESTS", run_navigation_tests),
        ("ROLE VISIBILITY TESTS", run_role_visibility_tests),
    ]
    
    for suite_name, test_func in test_suites:
        print(f"\n{'=' * 70}")
        print(f"RUNNING: {suite_name}")
        print("=" * 70)
        try:
            success = test_func()
            all_results.append((suite_name, "PASS" if success else "FAIL", None))
        except Exception as e:
            all_results.append((suite_name, "ERROR", str(e)))
    
    # Final Summary
    print("\n" + "=" * 70)
    print("FINAL TEST SUMMARY")
    print("=" * 70)
    
    total_passed = 0
    total_failed = 0
    total_errors = 0
    
    for suite_name, status, error in all_results:
        if status == "PASS":
            total_passed += 1
            symbol = "✓"
        elif status == "FAIL":
            total_failed += 1
            symbol = "✗"
        else:
            total_errors += 1
            symbol = "⚠"
        print(f"  {symbol} {suite_name}: {status}")
        if error:
            print(f"    Error: {error}")
    
    print(f"\n{'=' * 70}")
    print(f"TOTAL SUITES: {len(all_results)}")
    print(f"  PASSED: {total_passed}")
    print(f"  FAILED: {total_failed}")
    print(f"  ERRORS: {total_errors}")
    print("=" * 70)
    
    if total_failed == 0 and total_errors == 0:
        print("\n✓ ALL TESTS PASSED!")
        return True
    else:
        print(f"\n✗ SOME TESTS FAILED ({total_failed} failed, {total_errors} errors)")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)

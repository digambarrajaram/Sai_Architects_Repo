#!/usr/bin/env python3
"""
Debug script to analyze Android app element structure.
Run this to see exactly what elements are available in your login screen.
"""

import os
import sys
import time
from appium import webdriver
from appium.options.android import UiAutomator2Options

def analyze_login_screen():
    """Analyze the login screen elements to understand the app structure."""
    
    # Set up Android capabilities
    options = UiAutomator2Options()
    options.platform_name = "Android"
    options.automation_name = "UiAutomator2"
    options.device_name = "Android"
    options.app = "android/app/build/outputs/apk/debug/app-debug.apk"
    options.app_package = "com.anonymous.sai_app"
    options.app_activity = ".MainActivity"
    options.no_reset = True
    options.auto_grant_permissions = True
    options.unicode_keyboard = True
    options.reset_keyboard = True
    
    try:
        print("🚀 Starting Appium driver...")
        driver = webdriver.Remote("http://localhost:4723", options=options)
        print("✅ Driver started successfully")
        
        # Wait for app to load
        time.sleep(5)
        
        print("\n🔍 Analyzing login screen elements...")
        
        # Get page source to see all elements
        page_source = driver.page_source
        print(f"📄 Page source length: {len(page_source)} characters")
        
        # Look for specific element types
        print("\n📋 ELEMENT ANALYSIS:")
        
        # Find EditText elements (input fields)
        from selenium.webdriver.common.by import By
        edit_texts = driver.find_elements(By.CLASS_NAME, "android.widget.EditText")
        print(f"📝 EditText fields found: {len(edit_texts)}")
        
        for i, element in enumerate(edit_texts):
            try:
                text = element.get_attribute('text') or element.get_attribute('content-desc') or element.get_attribute('resource-id') or "No text"
                print(f"   Field {i+1}: {text}")
            except Exception as e:
                print(f"   Field {i+1}: Error getting info - {e}")
        
        # Find Button elements
        buttons = driver.find_elements(By.CLASS_NAME, "android.widget.Button")
        print(f"🔘 Buttons found: {len(buttons)}")
        
        for i, element in enumerate(buttons):
            try:
                text = element.get_attribute('text') or element.get_attribute('content-desc') or element.get_attribute('resource-id') or "No text"
                print(f"   Button {i+1}: {text}")
            except Exception as e:
                print(f"   Button {i+1}: Error getting info - {e}")
        
        # Look for TextView elements (labels)
        text_views = driver.find_elements(By.CLASS_NAME, "android.widget.TextView")
        print(f"🏷️ TextViews found: {len(text_views)}")
        
        for i, element in enumerate(text_views[:10]):  # Show first 10
            try:
                text = element.get_attribute('text') or element.get_attribute('content-desc') or element.get_attribute('resource-id') or "No text"
                print(f"   Label {i+1}: {text}")
            except Exception as e:
                print(f"   Label {i+1}: Error getting info - {e}")
        
        # Look for specific text patterns
        print("\n🔍 SEARCHING FOR SPECIFIC TEXT:")
        
        search_terms = ["email", "password", "login", "Email", "Password", "Login"]
        for term in search_terms:
            try:
                elements = driver.find_elements(By.XPATH, f"//*[contains(translate(@text, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{term.lower()}')]")
                if elements:
                    print(f"   ✅ Found '{term}': {len(elements)} elements")
                    for i, element in enumerate(elements[:3]):  # Show first 3
                        try:
                            full_text = element.get_attribute('text') or element.get_attribute('content-desc') or element.get_attribute('resource-id') or "No text"
                            print(f"      Element {i+1}: {full_text}")
                        except Exception as e:
                            print(f"      Element {i+1}: Error getting info - {e}")
                else:
                    print(f"   ❌ No elements found for '{term}'")
            except Exception as e:
                print(f"   ❌ Error searching for '{term}': {e}")
        
        # Save page source to file for detailed analysis
        with open("debug_page_source.xml", "w", encoding="utf-8") as f:
            f.write(page_source)
        print(f"\n💾 Page source saved to debug_page_source.xml")
        
        print("\n🎯 RECOMMENDED LOCATORS:")
        print("Based on this analysis, here are the best locators for your app:")
        
        # Suggest locators based on findings
        if edit_texts:
            print("Email field options:")
            for i, element in enumerate(edit_texts[:2]):  # First 2 fields usually email and password
                try:
                    text = element.get_attribute('text') or ""
                    content_desc = element.get_attribute('content-desc') or ""
                    resource_id = element.get_attribute('resource-id') or ""
                    
                    if text:
                        print(f"   By.XPATH: '//*[@text=\"{text}\"]'")
                    if content_desc:
                        print(f"   By.XPATH: '//*[@content-desc=\"{content_desc}\"]'")
                    if resource_id:
                        print(f"   By.XPATH: '//*[@resource-id=\"{resource_id}\"]'")
                    print(f"   By.CLASS_NAME: 'android.widget.EditText' (index {i})")
                except Exception as e:
                    print(f"   Error getting locator info: {e}")
        
        driver.quit()
        print("\n✅ Analysis complete!")
        
    except Exception as e:
        print(f"❌ Error during analysis: {e}")
        print("Make sure:")
        print("1. Appium server is running on http://localhost:4723")
        print("2. Android device is connected and detected")
        print("3. App APK is available at the specified path")
        print("4. App is not already running (or set no_reset=false)")

if __name__ == "__main__":
    analyze_login_screen()
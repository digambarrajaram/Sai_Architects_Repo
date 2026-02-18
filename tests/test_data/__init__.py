"""
Test data management module for the Selenium automation framework.
Provides data-driven testing capabilities with external test data.
"""
import json
import os
from typing import List, Dict, Any, Optional


class TestDataLoader:
    """Loads and manages test data from external sources."""
    
    def __init__(self, data_file: str = "tests/test_data/test_data.json"):
        """
        Initialize test data loader.
        
        Args:
            data_file (str): Path to test data JSON file
        """
        self.data_file = data_file
        self._data = self._load_data()
    
    def _load_data(self) -> Dict[str, Any]:
        """Load test data from JSON file."""
        try:
            with open(self.data_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"Test data file not found: {self.data_file}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in test data file: {e}")
    
    def get_valid_users(self) -> List[Dict[str, Any]]:
        """Get list of valid user test data."""
        return self._data.get('valid_users', [])
    
    def get_invalid_users(self) -> List[Dict[str, Any]]:
        """Get list of invalid user test data."""
        return self._data.get('invalid_users', [])
    
    def get_edge_cases(self) -> List[Dict[str, Any]]:
        """Get list of edge case test data."""
        return self._data.get('edge_cases', [])
    
    def get_form_validations(self) -> List[Dict[str, Any]]:
        """Get list of form validation test data."""
        return self._data.get('form_validations', [])
    
    def get_special_characters(self) -> List[Dict[str, Any]]:
        """Get list of special character test data."""
        return self._data.get('special_characters', [])
    
    def get_all_test_data(self, category: str) -> List[Dict[str, Any]]:
        """
        Get test data by category.
        
        Args:
            category (str): Category name (valid_users, invalid_users, etc.)
            
        Returns:
            List[Dict[str, Any]]: List of test data dictionaries
        """
        if category not in self._data:
            raise ValueError(f"Unknown test data category: {category}")
        return self._data[category]


# Global test data loader instance
test_data_loader = TestDataLoader()


def get_test_data(category: str) -> List[Dict[str, Any]]:
    """
    Get test data by category for use in pytest.mark.parametrize.
    
    Args:
        category (str): Category name
        
    Returns:
        List[Dict[str, Any]]: List of test data dictionaries
    """
    return test_data_loader.get_all_test_data(category)


def get_valid_user_data() -> List[Dict[str, Any]]:
    """Get valid user test data."""
    return test_data_loader.get_valid_users()


def get_invalid_user_data() -> List[Dict[str, Any]]:
    """Get invalid user test data."""
    return test_data_loader.get_invalid_users()


def get_edge_case_data() -> List[Dict[str, Any]]:
    """Get edge case test data."""
    return test_data_loader.get_edge_cases()


def get_form_validation_data() -> List[Dict[str, Any]]:
    """Get form validation test data."""
    return test_data_loader.get_form_validations()


def get_special_character_data() -> List[Dict[str, Any]]:
    """Get special character test data."""
    return test_data_loader.get_special_characters()
"""
Configuration management module for the Selenium automation framework.
Handles environment-specific configurations and test data.
"""
import json
import os
from typing import Dict, Any, Optional


class Config:
    """Configuration manager for framework settings."""
    
    def __init__(self, config_file: str = "config/config.json"):
        """
        Initialize configuration manager.
        
        Args:
            config_file (str): Path to configuration file
        """
        self.config_file = config_file
        self._config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from JSON file."""
        try:
            with open(self.config_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"Configuration file not found: {self.config_file}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in configuration file: {e}")
    
    def get_environment_config(self, env: str = None) -> Dict[str, Any]:
        """
        Get environment-specific configuration.
        
        Args:
            env (str, optional): Environment name (dev, qa, prod). 
                               Defaults to ENVIRONMENT env var or 'dev'.
                               
        Returns:
            Dict[str, Any]: Environment configuration
        """
        if env is None:
            env = os.getenv('ENVIRONMENT', 'dev')
        
        if env not in self._config['environments']:
            raise ValueError(f"Unknown environment: {env}")
        
        return self._config['environments'][env]
    
    def get_browser_config(self, browser_name: str = None) -> Dict[str, Any]:
        """
        Get browser-specific configuration.
        
        Args:
            browser_name (str, optional): Browser name (chrome, firefox).
                                        Defaults to BROWSER env var or 'chrome'.
                                        
        Returns:
            Dict[str, Any]: Browser configuration
        """
        if browser_name is None:
            browser_name = os.getenv('BROWSER', 'chrome')
        
        if browser_name not in self._config['browsers']:
            raise ValueError(f"Unsupported browser: {browser_name}")
        
        return self._config['browsers'][browser_name]
    
    def get_test_data(self, data_key: str) -> Dict[str, Any]:
        """
        Get test data by key.
        
        Args:
            data_key (str): Key for test data (valid_user, invalid_user, etc.)
            
        Returns:
            Dict[str, Any]: Test data
        """
        if data_key not in self._config['test_data']:
            raise ValueError(f"Unknown test data key: {data_key}")
        
        return self._config['test_data'][data_key]
    
    def get_execution_config(self) -> Dict[str, Any]:
        """Get execution configuration."""
        return self._config['execution']
    
    def get_base_url(self, env: str = None) -> str:
        """Get base URL for environment."""
        return self.get_environment_config(env)['base_url']
    
    def get_timeout(self, env: str = None) -> int:
        """Get timeout for environment."""
        return self.get_environment_config(env)['timeout']


# Global configuration instance
config = Config()
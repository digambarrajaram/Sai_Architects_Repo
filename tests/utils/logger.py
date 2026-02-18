"""
Logging Configuration Utility

Provides centralized logging configuration for the test suite with structured logging,
different log levels, and multiple output formats.
"""

import logging
import os
import sys
from datetime import datetime
from typing import Optional

# Import loguru for enhanced logging
from loguru import logger as loguru_logger


def setup_logging(name: str = "e2e_tests", level: str = "INFO") -> logging.Logger:
    """
    Set up structured logging for the test suite.
    
    Args:
        name: Logger name
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        
    Returns:
        Configured logger instance
    """
    # Remove default loguru handlers
    loguru_logger.remove()
    
    # Create logs directory if it doesn't exist
    logs_dir = "logs"
    os.makedirs(logs_dir, exist_ok=True)
    
    # Generate timestamp for log files
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Configure console handler with color
    loguru_logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=level,
        colorize=True
    )
    
    # Configure file handler for detailed logs
    log_file = os.path.join(logs_dir, f"e2e_tests_{timestamp}.log")
    loguru_logger.add(
        log_file,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="DEBUG",
        rotation="10 MB",
        retention="7 days",
        compression="zip"
    )
    
    # Configure error file handler for errors only
    error_file = os.path.join(logs_dir, f"e2e_errors_{timestamp}.log")
    loguru_logger.add(
        error_file,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="ERROR",
        rotation="1 MB",
        retention="30 days"
    )
    
    # Create and return a standard logger that uses loguru
    class LoguruAdapter(logging.Logger):
        def __init__(self, name, level=logging.NOTSET):
            super().__init__(name, level)
            self._loguru_logger = loguru_logger
        
        def _log(self, level, msg, args, exc_info=None, extra=None, stack_info=False, stacklevel=1):
            # Map standard logging levels to loguru levels
            level_map = {
                logging.DEBUG: "DEBUG",
                logging.INFO: "INFO", 
                logging.WARNING: "WARNING",
                logging.ERROR: "ERROR",
                logging.CRITICAL: "CRITICAL"
            }
            
            loguru_level = level_map.get(level, "INFO")
            self._loguru_logger.opt(depth=6, exception=exc_info).log(loguru_level, msg, *args)
    
    # Replace the standard logger class
    logging.setLoggerClass(LoguruAdapter)
    
    # Get and configure the logger
    test_logger = logging.getLogger(name)
    test_logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    
    return test_logger


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """
    Get a configured logger instance.
    
    Args:
        name: Optional logger name (defaults to calling module name)
        
    Returns:
        Logger instance
    """
    if name is None:
        import inspect
        frame = inspect.currentframe().f_back
        module = inspect.getmodule(frame)
        name = module.__name__ if module else "unknown"
    
    return logging.getLogger(name)


class TestLogger:
    """Enhanced test logger with test-specific functionality."""
    
    def __init__(self, name: str = "TestLogger"):
        self.logger = get_logger(name)
        self.test_start_time = None
        self.test_name = None
    
    def start_test(self, test_name: str):
        """Log test start with timing information."""
        self.test_name = test_name
        self.test_start_time = datetime.now()
        self.logger.info(f"🧪 Starting test: {test_name}")
        self.logger.info(f"⏱️  Test started at: {self.test_start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    def end_test(self, status: str = "PASSED"):
        """Log test completion with timing information."""
        if self.test_start_time:
            duration = datetime.now() - self.test_start_time
            self.logger.info(f"✅ Test {status}: {self.test_name}")
            self.logger.info(f"⏱️  Test duration: {duration.total_seconds():.2f} seconds")
        else:
            self.logger.warning("Test end called without start")
    
    def log_step(self, step_description: str, status: str = "INFO"):
        """Log individual test steps."""
        status_icon = {
            "INFO": "📝",
            "SUCCESS": "✅", 
            "WARNING": "⚠️",
            "ERROR": "❌",
            "DEBUG": "🔍"
        }.get(status.upper(), "📝")
        
        self.logger.info(f"{status_icon} Step: {step_description}")
    
    def log_checkpoint(self, checkpoint_name: str, data: Optional[dict] = None):
        """Log test checkpoints with optional data."""
        if data:
            self.logger.info(f"📍 Checkpoint: {checkpoint_name}")
            for key, value in data.items():
                self.logger.debug(f"   {key}: {value}")
        else:
            self.logger.info(f"📍 Checkpoint: {checkpoint_name}")
    
    def log_database_operation(self, operation: str, table: str, data: Optional[dict] = None):
        """Log database operations with context."""
        if data:
            self.logger.info(f"🗄️  Database {operation} on {table}: {data}")
        else:
            self.logger.info(f"🗄️  Database {operation} on {table}")
    
    def log_ui_action(self, action: str, element: str, result: str = "SUCCESS"):
        """Log UI actions with context."""
        icon = "✅" if result.upper() == "SUCCESS" else "❌"
        self.logger.info(f"{icon} UI Action: {action} on element '{element}' - {result}")
    
    def log_api_call(self, method: str, url: str, status_code: Optional[int] = None, response_time: Optional[float] = None):
        """Log API calls with timing and status."""
        if status_code and response_time:
            self.logger.info(f"🌐 API {method} {url} - Status: {status_code}, Time: {response_time:.2f}s")
        elif status_code:
            self.logger.info(f"🌐 API {method} {url} - Status: {status_code}")
        else:
            self.logger.info(f"🌐 API {method} {url}")
    
    def log_performance_metric(self, metric_name: str, value: float, unit: str = "ms"):
        """Log performance metrics."""
        self.logger.info(f"📊 Performance: {metric_name} = {value:.2f} {unit}")
    
    def log_error_details(self, error: Exception, context: Optional[str] = None):
        """Log detailed error information."""
        self.logger.error(f"❌ Error: {type(error).__name__}: {str(error)}")
        if context:
            self.logger.error(f"📍 Context: {context}")
        self.logger.error(f"🔍 Error details: {error.__traceback__}")


# Global test logger instance
test_logger = TestLogger("E2ETests")


def log_test_function(func):
    """Decorator to automatically log test function execution."""
    def wrapper(*args, **kwargs):
        test_name = func.__name__
        test_logger.start_test(test_name)
        try:
            result = func(*args, **kwargs)
            test_logger.end_test("PASSED")
            return result
        except Exception as e:
            test_logger.end_test("FAILED")
            test_logger.log_error_details(e, f"Function: {test_name}")
            raise
    return wrapper


# Configure root logger
root_logger = setup_logging("root", "INFO")


# Example usage:
if __name__ == "__main__":
    # Basic logging
    logger = get_logger("example")
    logger.info("This is an info message")
    logger.error("This is an error message")
    
    # Test-specific logging
    test_logger.start_test("example_test")
    test_logger.log_step("Navigate to login page", "SUCCESS")
    test_logger.log_checkpoint("Login page loaded", {"url": "https://example.com/login"})
    test_logger.end_test("PASSED")
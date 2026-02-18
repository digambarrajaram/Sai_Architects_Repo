"""
Mock Authentication for Testing

Provides mock authentication functionality for testing without requiring real credentials.
This allows testing the authentication flow and data operations without actual user accounts.
"""

from typing import Dict, Any, Optional
from loguru import logger


class MockAuthManager:
    """
    Mock authentication manager for testing purposes.
    """
    
    def __init__(self):
        self.mock_users = {
            "demo.user@example.com": {
                "password": "DemoPassword123!",
                "role": "demo",
                "user_id": "demo-user-123",
                "name": "Demo User"
            },
            "owner@example.com": {
                "password": "OwnerPass123!",
                "role": "owner",
                "user_id": "owner-user-456",
                "name": "Project Owner"
            },
            "supervisor@example.com": {
                "password": "SuperPass123!",
                "role": "supervisor",
                "user_id": "supervisor-user-789",
                "name": "Project Supervisor"
            },
            "worker@example.com": {
                "password": "WorkerPass123!",
                "role": "worker",
                "user_id": "worker-user-101",
                "name": "Field Worker"
            }
        }
        self.current_user = None
    
    def authenticate(self, email: str, password: str) -> Dict[str, Any]:
        """
        Mock authentication that simulates Supabase auth response.
        """
        logger.info(f"Mock authentication attempt for: {email}")
        
        if email in self.mock_users:
            user = self.mock_users[email]
            if user["password"] == password:
                self.current_user = user
                logger.info(f"Mock authentication successful for: {email}")
                return {
                    "success": True,
                    "user": user,
                    "message": "Authentication successful"
                }
            else:
                logger.warning(f"Mock authentication failed - wrong password for: {email}")
                return {
                    "success": False,
                    "error": "Invalid password",
                    "message": "Authentication failed"
                }
        else:
            logger.warning(f"Mock authentication failed - user not found: {email}")
            return {
                "success": False,
                "error": "User not found",
                "message": "Authentication failed"
            }
    
    def get_current_user(self) -> Optional[Dict[str, Any]]:
        """Get current authenticated user."""
        return self.current_user
    
    def logout(self) -> None:
        """Mock logout."""
        logger.info("Mock logout called")
        self.current_user = None
    
    def is_authenticated(self) -> bool:
        """Check if user is authenticated."""
        return self.current_user is not None


class MockSupabaseClient:
    """
    Mock Supabase client for testing without real database access.
    """
    
    def __init__(self):
        self.auth = MockAuthManager()
        self.mock_projects = [
            {
                "id": "project-001",
                "name": "Highway Expansion Project",
                "status": "active",
                "due_date": "2024-12-31",
                "budget": 5000000,
                "created_by": "owner-user-456",
                "created_at": "2024-01-10T10:00:00Z"
            },
            {
                "id": "project-002",
                "name": "Bridge Construction",
                "status": "active",
                "due_date": "2025-06-30",
                "budget": 3200000,
                "created_by": "owner-user-456",
                "created_at": "2024-02-20T09:00:00Z"
            },
            {
                "id": "project-003",
                "name": "Metro Survey Project",
                "status": "planning",
                "due_date": "2024-03-31",
                "budget": 1200000,
                "created_by": "supervisor-user-789",
                "created_at": "2024-05-15T08:00:00Z"
            }
        ]
        self.mock_expenses = [
            {
                "id": "expense-001",
                "project_id": "project-001",
                "amount": 120000,
                "category": "Materials",
                "expense_date": "2024-01-05",
                "created_by": "worker-user-101",

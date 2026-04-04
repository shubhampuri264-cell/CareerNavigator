"""
Pytest configuration for Career Navigator backend tests.

Run all tests:
    pytest tests/ -v

Run scoring tests only:
    pytest tests/test_scoring.py -v
"""

import sys
import os

# Ensure the backend root is on the path so imports work without installation
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

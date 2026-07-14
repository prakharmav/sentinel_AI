import unittest
import sys
import os

# Set python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

# Load test files explicitly
import unit.test_rag as test_rag
import unit.test_sql_agent as test_sql_agent
import unit.test_production as test_production
import unit.test_rag_pipeline as test_rag_pipeline
import unit.test_websocket_chat as test_websocket_chat
import unit.test_analytics_engine as test_analytics_engine
import unit.test_ml_service as test_ml_service
import unit.test_starter as test_starter
import unit.test_copilot as test_copilot
import integration.test_api as test_api

# Compile suite
loader = unittest.TestLoader()
suite = unittest.TestSuite()

suite.addTests(loader.loadTestsFromModule(test_rag))
suite.addTests(loader.loadTestsFromModule(test_sql_agent))
suite.addTests(loader.loadTestsFromModule(test_production))
suite.addTests(loader.loadTestsFromModule(test_rag_pipeline))
suite.addTests(loader.loadTestsFromModule(test_websocket_chat))
suite.addTests(loader.loadTestsFromModule(test_analytics_engine))
suite.addTests(loader.loadTestsFromModule(test_ml_service))
suite.addTests(loader.loadTestsFromModule(test_starter))
suite.addTests(loader.loadTestsFromModule(test_copilot))
suite.addTests(loader.loadTestsFromModule(test_api))

# Execute
runner = unittest.TextTestRunner(verbosity=2)
result = runner.run(suite)

# Exit with code 1 if any failure occurs
if not result.wasSuccessful():
    sys.exit(1)

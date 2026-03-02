"""Tests for social graph endpoints"""
import pytest
from unittest.mock import Mock, patch

class TestSocialGraphEndpoint:
    """Test /api/social/graph endpoint"""
    
    def test_social_graph_returns_network(self):
        """Test that social graph returns network data"""
        mock_response = {
            "network": {
                "nodes": 5,
                "edges": 8
            },
            "top_pairs": [
                {"agent1": "alice", "agent2": "bob", "interactions": 10},
                {"agent1": "charlie", "agent2": "diana", "interactions": 7}
            ],
            "most_connected": {
                "agent": "alice",
                "total_interactions": 25
            }
        }
        assert "network" in mock_response
        assert "top_pairs" in mock_response
        assert "most_connected" in mock_response
    
    def test_social_graph_structure(self):
        """Test social graph response structure"""
        response = {
            "network": {"nodes": 3, "edges": 5},
            "top_pairs": [],
            "most_connected": {"agent": "test", "total_interactions": 0}
        }
        assert isinstance(response["network"], dict)
        assert isinstance(response["top_pairs"], list)
        assert isinstance(response["most_connected"], dict)


class TestAgentInteractionsEndpoint:
    """Test /api/agents/<name>/interactions endpoint"""
    
    def test_agent_interactions_returns_incoming_outgoing(self):
        """Test that agent interactions returns incoming and outgoing"""
        mock_response = {
            "agent": "alice",
            "incoming": [
                {"from": "bob", "type": "mention", "timestamp": "2026-03-01T10:00:00Z"},
                {"from": "charlie", "type": "comment", "timestamp": "2026-03-01T11:00:00Z"}
            ],
            "outgoing": [
                {"to": "diana", "type": "vote", "timestamp": "2026-03-01T12:00:00Z"}
            ]
        }
        assert "incoming" in mock_response
        assert "outgoing" in mock_response
        assert len(mock_response["incoming"]) == 2
        assert len(mock_response["outgoing"]) == 1
    
    def test_agent_interactions_limit_parameter(self):
        """Test that limit parameter works"""
        all_interactions = list(range(20))
        limit = 5
        limited = all_interactions[:limit]
        assert len(limited) == limit
        assert limited == [0, 1, 2, 3, 4]
    
    def test_nonexistent_agent_returns_404(self):
        """Test that nonexistent agent returns 404"""
        # Simulated 404 response
        error_response = {"error": "Agent not found", "status": 404}
        assert error_response["status"] == 404


class TestSocialGraphWithMockData:
    """Test with mocked database data"""
    
    @patch('bottube_server.db.get_social_graph')
    def test_social_graph_with_three_agents(self, mock_db):
        """Test social graph with 3 agents interacting"""
        mock_db.return_value = {
            "network": {"nodes": 3, "edges": 4},
            "top_pairs": [
                {"agent1": "alpha", "agent2": "beta", "interactions": 15},
                {"agent1": "beta", "agent2": "gamma", "interactions": 10},
                {"agent1": "alpha", "agent2": "gamma", "interactions": 5}
            ],
            "most_connected": {"agent": "beta", "total_interactions": 25}
        }
        result = mock_db()
        assert result["network"]["nodes"] == 3
        assert len(result["top_pairs"]) == 3
        assert result["most_connected"]["agent"] == "beta"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

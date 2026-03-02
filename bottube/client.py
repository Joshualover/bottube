"""BoTTube API Client"""
import requests
from typing import Optional, List, Dict, Any

class BoTTubeClient:
    """Python client for BoTTube API"""
    
    def __init__(self, api_key: str, base_url: str = "https://bottube.ai"):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        })
    
    def upload(self, file_path: str, title: str, tags: Optional[List[str]] = None, 
               description: str = "") -> Dict[str, Any]:
        """Upload a video to BoTTube"""
        with open(file_path, 'rb') as f:
            files = {'video': f}
            data = {'title': title, 'description': description}
            if tags:
                data['tags'] = ','.join(tags)
            response = self.session.post(f"{self.base_url}/api/upload", 
                                        files=files, data=data)
            response.raise_for_status()
            return response.json()
    
    def list_videos(self, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        """List videos"""
        params = {'limit': limit, 'offset': offset}
        response = self.session.get(f"{self.base_url}/api/videos", params=params)
        response.raise_for_status()
        return response.json()
    
    def search(self, query: str, sort: str = "recent", limit: int = 20) -> List[Dict[str, Any]]:
        """Search videos"""
        params = {'q': query, 'sort': sort, 'limit': limit}
        response = self.session.get(f"{self.base_url}/api/search", params=params)
        response.raise_for_status()
        return response.json()
    
    def comment(self, video_id: str, content: str) -> Dict[str, Any]:
        """Add a comment to a video"""
        data = {'content': content}
        response = self.session.post(f"{self.base_url}/api/videos/{video_id}/comments", json=data)
        response.raise_for_status()
        return response.json()
    
    def vote(self, video_id: str, vote_type: str = "up") -> Dict[str, Any]:
        """Vote on a video (up/down)"""
        data = {'vote': vote_type}
        response = self.session.post(f"{self.base_url}/api/videos/{video_id}/vote", json=data)
        response.raise_for_status()
        return response.json()
    
    def get_profile(self) -> Dict[str, Any]:
        """Get current user profile"""
        response = self.session.get(f"{self.base_url}/api/profile")
        response.raise_for_status()
        return response.json()
    
    def get_analytics(self) -> Dict[str, Any]:
        """Get user analytics"""
        response = self.session.get(f"{self.base_url}/api/analytics")
        response.raise_for_status()
        return response.json()

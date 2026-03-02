# BoTTube Python SDK

Python client library for the BoTTube API.

## Installation

```bash
pip install -e .
```

## Usage

```python
from bottube import BoTTubeClient

client = BoTTubeClient(api_key="your_api_key")

# Upload a video
result = client.upload("video.mp4", title="My Video", tags=["demo", "tutorial"])

# List videos
videos = client.list_videos(limit=20)

# Search videos
results = client.search("python tutorial", sort="recent")

# Comment on a video
comment = client.comment(video_id="abc123", content="Great video!")

# Vote on a video
vote = client.vote(video_id="abc123", vote_type="up")

# Get profile
profile = client.get_profile()

# Get analytics
analytics = client.get_analytics()
```

## API Reference

- `upload(file_path, title, tags, description)` - Upload a video
- `list_videos(limit, offset)` - List all videos
- `search(query, sort, limit)` - Search videos
- `comment(video_id, content)` - Add a comment
- `vote(video_id, vote_type)` - Vote on a video
- `get_profile()` - Get user profile
- `get_analytics()` - Get user analytics

## License

MIT

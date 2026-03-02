/**
 * BoTTube JavaScript SDK - Client library for the BoTTube AI Video Platform API
 * @module bottube-sdk
 */

const axios = require('axios');
const fs = require('fs').promises;
const FormData = require('form-data');

class BoTTubeClient {
  /**
   * Create a BoTTube client
   * @param {Object} options - Configuration options
   * @param {string} options.apiKey - BoTTube API key
   * @param {string} [options.baseUrl=https://bottube.ai] - Base URL
   */
  constructor({ apiKey, baseUrl = 'https://bottube.ai' } = {}) {
    if (!apiKey) {
      throw new Error('API key is required. Pass apiKey option or set BOTTTUBE_API_KEY env var.');
    }
    
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'X-API-Key': apiKey,
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
  }
  
  /**
   * Upload a video to BoTTube
   * @param {string} filePath - Path to video file
   * @param {Object} metadata - Video metadata
   * @param {string} metadata.title - Video title
   * @param {string} [metadata.description] - Video description
   * @param {string} [metadata.category] - Video category
   * @param {string[]} [metadata.tags] - Video tags
   * @returns {Promise<Object>} Upload result with video_id
   */
  async upload(filePath, { title, description, category, tags } = {}) {
    const formData = new FormData();
    
    const fileStream = await fs.readFile(filePath);
    const fileName = filePath.split('/').pop();
    
    formData.append('file', fileStream, {
      filename: fileName,
      contentType: 'video/mp4',
    });
    
    formData.append('title', title);
    if (description) formData.append('description', description);
    if (category) formData.append('category', category);
    if (tags && Array.isArray(tags)) {
      formData.append('tags', tags.join(','));
    }
    
    const response = await this.client.post('/api/upload', formData, {
      headers: formData.getHeaders(),
    });
    
    return response.data;
  }
  
  /**
   * Get video details
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} Video details
   */
  async getVideo(videoId) {
    const response = await this.client.get(`/api/videos/${videoId}`);
    return response.data;
  }
  
  /**
   * List videos
   * @param {Object} [options] - Query options
   * @param {number} [options.limit=20] - Number of videos (1-100)
   * @param {number} [options.offset=0] - Offset for pagination
   * @returns {Promise<Object>} List of videos
   */
  async listVideos({ limit = 20, offset = 0 } = {}) {
    const response = await this.client.get('/api/videos', {
      params: {
        limit: Math.min(Math.max(1, limit), 100),
        offset: Math.max(0, offset),
      },
    });
    return response.data;
  }
  
  /**
   * Search for videos
   * @param {string} query - Search query
   * @param {Object} [options] - Search options
   * @param {number} [options.limit=20] - Number of results
   * @param {number} [options.offset=0] - Offset
   * @param {string} [options.sort] - Sort order (e.g., "recent", "popular")
   * @returns {Promise<Object>} Search results
   */
  async search(query, { limit = 20, offset = 0, sort } = {}) {
    const response = await this.client.get('/api/search', {
      params: {
        q: query,
        limit: Math.min(Math.max(1, limit), 100),
        offset: Math.max(0, offset),
        ...(sort && { sort }),
      },
    });
    return response.data;
  }
  
  /**
   * Vote on a video
   * @param {string} videoId - Video ID
   * @param {number} vote - +1 for upvote, -1 for downvote
   * @returns {Promise<Object>} Result
   */
  async vote(videoId, vote) {
    if (![1, -1].includes(vote)) {
      throw new Error('Vote must be 1 (upvote) or -1 (downvote)');
    }
    
    const response = await this.client.post(`/api/videos/${videoId}/vote`, { vote });
    return response.data;
  }
  
  /**
   * Add a comment to a video
   * @param {string} videoId - Video ID
   * @param {string} content - Comment text
   * @returns {Promise<Object>} Result
   */
  async comment(videoId, content) {
    const response = await this.client.post(`/api/videos/${videoId}/comments`, {
      text: content,
    });
    return response.data;
  }
  
  /**
   * Get agent profile
   * @param {string} agentName - Agent name
   * @returns {Promise<Object>} Agent profile
   */
  async getAgent(agentName) {
    const response = await this.client.get(`/api/agents/${agentName}`);
    return response.data;
  }
  
  /**
   * List all agents
   * @returns {Promise<Object>} List of agents
   */
  async listAgents() {
    const response = await this.client.get('/api/agents');
    return response.data;
  }
  
  /**
   * Get analytics for an agent or video
   * @param {Object} options - Analytics options
   * @param {string} [options.agentName] - Agent name
   * @param {string} [options.videoId] - Video ID
   * @param {number} [options.days=30] - Number of days (1-90)
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalytics({ agentName, videoId, days = 30 } = {}) {
    if (!agentName && !videoId) {
      throw new Error('Either agentName or videoId must be provided');
    }
    
    const clampedDays = Math.max(1, Math.min(90, days));
    
    if (agentName) {
      const response = await this.client.get(`/api/agents/${agentName}/analytics`, {
        params: { days: clampedDays },
      });
      return response.data;
    } else {
      const response = await this.client.get(`/api/videos/${videoId}/analytics`, {
        params: { days: clampedDays },
      });
      return response.data;
    }
  }
  
  /**
   * Get platform statistics
   * @returns {Promise<Object>} Platform stats
   */
  async getStats() {
    const response = await this.client.get('/api/stats');
    return response.data;
  }
}

module.exports = { BoTTubeClient };

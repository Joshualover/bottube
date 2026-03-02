const { BoTTubeClient } = require('./index');
const MockAdapter = require('axios-mock-adapter');
const axios = require('axios');

describe('BoTTubeClient', () => {
  let mock;
  let client;
  
  beforeEach(() => {
    mock = new MockAdapter(axios);
    client = new BoTTubeClient({ apiKey: 'test_key' });
  });
  
  afterEach(() => {
    mock.reset();
  });
  
  describe('constructor', () => {
    test('should throw error without API key', () => {
      expect(() => new BoTTubeClient()).toThrow('API key is required');
    });
    
    test('should accept custom base URL', () => {
      const customClient = new BoTTubeClient({
        apiKey: 'key',
        baseUrl: 'http://localhost:8000'
      });
      expect(customClient.client.defaults.baseURL).toBe('http://localhost:8000');
    });
  });
  
  describe('upload', () => {
    test('should upload video successfully', async () => {
      mock.onPost('/api/upload').reply(200, { ok: true, video_id: 'abc123' });
      
      // Mock file read
      const fs = require('fs').promises;
      const originalReadFile = fs.readFile;
      fs.readFile = jest.fn().mockResolvedValue(Buffer.from('fake video data'));
      
      const result = await client.upload('/path/to/video.mp4', {
        title: 'Test Video',
        tags: ['test']
      });
      
      expect(result.ok).toBe(true);
      expect(result.video_id).toBe('abc123');
      
      fs.readFile = originalReadFile;
    });
  });
  
  describe('getVideo', () => {
    test('should get video details', async () => {
      mock.onGet('/api/videos/abc123').reply(200, {
        video_id: 'abc123',
        title: 'Test Video',
        agent_name: 'test-agent'
      });
      
      const video = await client.getVideo('abc123');
      expect(video.title).toBe('Test Video');
    });
  });
  
  describe('listVideos', () => {
    test('should list videos with pagination', async () => {
      mock.onGet('/api/videos').reply(200, {
        videos: [{ video_id: '1' }, { video_id: '2' }]
      });
      
      const result = await client.listVideos({ limit: 10, offset: 0 });
      expect(result.videos.length).toBe(2);
    });
    
    test('should clamp limit to valid range', async () => {
      mock.onGet('/api/videos').reply(200, { videos: [] });
      
      await client.listVideos({ limit: 200 });
      const config = mock.history.get[0].params;
      expect(config.limit).toBe(100);
      
      await client.listVideos({ limit: 0 });
      const config2 = mock.history.get[1].params;
      expect(config2.limit).toBe(1);
    });
  });
  
  describe('search', () => {
    test('should search videos', async () => {
      mock.onGet('/api/search').reply(200, {
        videos: [{ title: 'Result 1' }]
      });
      
      const result = await client.search('python', { sort: 'recent' });
      expect(result.videos.length).toBe(1);
    });
  });
  
  describe('vote', () => {
    test('should upvote video', async () => {
      mock.onPost('/api/videos/abc123/vote').reply(200, { ok: true });
      
      const result = await client.vote('abc123', 1);
      expect(result.ok).toBe(true);
    });
    
    test('should downvote video', async () => {
      mock.onPost('/api/videos/abc123/vote').reply(200, { ok: true });
      
      const result = await client.vote('abc123', -1);
      expect(result.ok).toBe(true);
    });
    
    test('should throw error for invalid vote value', async () => {
      await expect(client.vote('abc123', 0)).rejects.toThrow('Vote must be');
    });
  });
  
  describe('comment', () => {
    test('should add comment', async () => {
      mock.onPost('/api/videos/abc123/comments').reply(200, { ok: true });
      
      const result = await client.comment('abc123', 'Great video!');
      expect(result.ok).toBe(true);
    });
  });
  
  describe('getAgent', () => {
    test('should get agent profile', async () => {
      mock.onGet('/api/agents/test-agent').reply(200, {
        agent_name: 'test-agent',
        display_name: 'Test Agent'
      });
      
      const agent = await client.getAgent('test-agent');
      expect(agent.display_name).toBe('Test Agent');
    });
  });
  
  describe('listAgents', () => {
    test('should list all agents', async () => {
      mock.onGet('/api/agents').reply(200, {
        agents: [{ agent_name: 'a1' }, { agent_name: 'a2' }]
      });
      
      const result = await client.listAgents();
      expect(result.agents.length).toBe(2);
    });
  });
  
  describe('getAnalytics', () => {
    test('should get agent analytics', async () => {
      mock.onGet('/api/agents/test-agent/analytics').reply(200, {
        totals: { views: 1000 },
        daily_views: [10, 20, 30]
      });
      
      const analytics = await client.getAnalytics({ agentName: 'test-agent', days: 30 });
      expect(analytics.totals.views).toBe(1000);
    });
    
    test('should get video analytics', async () => {
      mock.onGet('/api/videos/abc123/analytics').reply(200, {
        totals: { views: 500 }
      });
      
      const analytics = await client.getAnalytics({ videoId: 'abc123', days: 7 });
      expect(analytics.totals.views).toBe(500);
    });
    
    test('should throw error without agentName or videoId', async () => {
      await expect(client.getAnalytics({ days: 30 })).rejects.toThrow('Either agentName or videoId');
    });
    
    test('should clamp days parameter', async () => {
      mock.onGet().reply(200, {});
      
      await client.getAnalytics({ agentName: 'test', days: -5 });
      expect(mock.history.get[mock.history.get.length - 1].params.days).toBe(1);
      
      await client.getAnalytics({ agentName: 'test', days: 100 });
      expect(mock.history.get[mock.history.get.length - 1].params.days).toBe(90);
    });
  });
  
  describe('getStats', () => {
    test('should get platform stats', async () => {
      mock.onGet('/api/stats').reply(200, {
        total_videos: 1000,
        total_agents: 50
      });
      
      const stats = await client.getStats();
      expect(stats.total_videos).toBe(1000);
    });
  });
});

const Playlist = require('../models/Playlist');
const axios = require('axios');

const createPlaylist = async (req, res) => {
  try {
    const { playlistUrl, videosPerDay = 5, sourceType = 'youtube', title, totalVideos, trackerTitle } = req.body;
    const userId = req.user._id;

    if (sourceType === 'youtube') {
      if (!playlistUrl) {
        return res.status(400).json({ message: 'Playlist URL is required for YouTube sources' });
      }

      const playlistId = extractPlaylistId(playlistUrl);
      if (!playlistId) {
        return res.status(400).json({ message: 'Invalid YouTube playlist URL' });
      }

      const existingPlaylist = await Playlist.findOne({ userId, playlistId });
      if (existingPlaylist) {
        return res.status(400).json({ message: 'Playlist already exists for this user' });
      }

      let playlistData;
      try {
        playlistData = await fetchPlaylistFromYouTube(playlistId);
      } catch (ytError) {
        const statusCode = ytError.statusCode || 400;
        const errorMessage = ytError.message || 'Failed to fetch playlist from YouTube';
        return res.status(statusCode).json({ message: errorMessage });
      }

      const videosWithDays = groupVideosByDay(playlistData.videos, videosPerDay);
      const finalTrackerTitle = trackerTitle || playlistData.title;

      const playlist = await Playlist.create({
        userId,
        playlistId,
        title: playlistData.title,
        trackerTitle: finalTrackerTitle,
        sourceType: 'youtube',
        videos: videosWithDays,
        videosPerDay,
        totalVideos: playlistData.videos.length,
        availableVideos: playlistData.videos.filter(v => !v.isPrivate).length,
        privateVideos: playlistData.videos.filter(v => v.isPrivate).length,
      });

      res.status(201).json(playlist);
    } else if (sourceType === 'manual') {
      if (!title || !totalVideos) {
        return res.status(400).json({ message: 'Title and total videos are required for manual sources' });
      }

      if (totalVideos <= 0 || totalVideos > 1000) {
        return res.status(400).json({ message: 'Total videos must be between 1 and 1000' });
      }

      const finalTrackerTitle = trackerTitle || title;

      const playlist = await Playlist.create({
        userId,
        title,
        trackerTitle: finalTrackerTitle,
        sourceType: 'manual',
        videosPerDay,
        manualTotalVideos: totalVideos,
        totalVideos: totalVideos,
        availableVideos: totalVideos,
        privateVideos: 0,
        videos: [],
      });

      res.status(201).json(playlist);
    } else {
      return res.status(400).json({ message: 'Invalid source type' });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Playlist already exists for this user' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserPlaylists = async (req, res) => {
  try {
    const userId = req.user._id;
    const playlists = await Playlist.find({ userId }).sort({ createdAt: -1 });
    
    const updatedPlaylists = await Promise.all(playlists.map(async (playlist) => {
      if (!playlist.trackerTitle) {
        const defaultTitle = playlist.title || `Playlist ${playlist._id.toString().slice(-6)}`;
        playlist.trackerTitle = defaultTitle;
        await playlist.save();
      }
      return playlist;
    }));
    
    res.json(updatedPlaylists);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateVideoProgress = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { videoId, completed, videoIndex } = req.body;
    const userId = req.user._id;

    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'Completed status is required' });
    }

    const playlist = await Playlist.findOne({ _id: playlistId, userId });
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.sourceType === 'manual') {
      if (typeof videoIndex !== 'number' || videoIndex < 0 || videoIndex >= playlist.manualTotalVideos) {
        return res.status(400).json({ message: 'Invalid video index for manual playlist' });
      }

      if (completed) {
        const existingIndex = playlist.completedVideos.findIndex(cv => cv.videoIndex === videoIndex);
        if (existingIndex === -1) {
          playlist.completedVideos.push({
            videoIndex,
            completedAt: new Date()
          });
        }
      } else {
        playlist.completedVideos = playlist.completedVideos.filter(cv => cv.videoIndex !== videoIndex);
      }

      await playlist.save();
      res.json(playlist);
    } else {
      if (!videoId) {
        return res.status(400).json({ message: 'Video ID is required for YouTube playlists' });
      }

      const video = playlist.videos.find(v => v.videoId === videoId);
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      video.completed = completed;
      video.completionDate = completed ? new Date() : null;

      await playlist.save();
      res.json(playlist);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateManualPlaylistTotal = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { totalVideos } = req.body;
    const userId = req.user._id;

    if (typeof totalVideos !== 'number' || totalVideos <= 0 || totalVideos > 1000) {
      return res.status(400).json({ message: 'Total videos must be a number between 1 and 1000' });
    }

    const playlist = await Playlist.findOne({ _id: playlistId, userId });
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.sourceType !== 'manual') {
      return res.status(400).json({ message: 'Can only update total videos for manual playlists' });
    }

    playlist.completedVideos = playlist.completedVideos.filter(cv => cv.videoIndex < totalVideos);
    
    playlist.manualTotalVideos = totalVideos;
    playlist.totalVideos = totalVideos;
    playlist.availableVideos = totalVideos;

    await playlist.save();
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user._id;

    const playlist = await Playlist.findOneAndDelete({ _id: playlistId, userId });
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const extractPlaylistId = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      const playlistId = urlObj.searchParams.get('list');
      return playlistId;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const fetchPlaylistFromYouTube = async (playlistId) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    const error = new Error('YouTube API key not configured');
    error.statusCode = 500;
    throw error;
  }

  try {
    const videos = [];
    let nextPageToken = null;
    let pageCount = 0;
    const maxPages = 10;

    do {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          part: 'snippet',
          playlistId: playlistId,
          maxResults: 50,
          key: apiKey,
          pageToken: nextPageToken,
        },
      });

      const items = response.data.items || [];
      const mapped = items
        .map((item, index) => {
          const snippet = item.snippet;
          const videoId = snippet?.resourceId?.videoId;
          const title = snippet?.title || 'Untitled';
          const thumbnail = snippet?.thumbnails?.medium?.url || snippet?.thumbnails?.default?.url || '';

          if (!videoId) {
            return null;
          }

          const isPrivate = title === 'Private video' || title === 'Deleted video' || title === 'Unavailable video';

          return {
            videoId,
            title,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnail,
            isPrivate,
            originalIndex: videos.length + index,
          };
        })
        .filter(Boolean);

      videos.push(...mapped);
      nextPageToken = response.data.nextPageToken;
      pageCount++;

      if (nextPageToken && pageCount < maxPages) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } while (nextPageToken && pageCount < maxPages);

    const playlistTitle = videos.length > 0 ? `Playlist (${videos.length} videos)` : 'Untitled Playlist';

    return {
      title: playlistTitle,
      videos,
    };
  } catch (error) {
    let message = 'Failed to fetch playlist from YouTube';
    const statusCode = error.response?.status || 400;
    const ytMessage = error.response?.data?.error?.message;
    const ytReason = error.response?.data?.error?.errors?.[0]?.reason;
    if (ytMessage) message = ytMessage;
    if (ytReason === 'quotaExceeded') message = 'YouTube API quota exceeded. Try again later.';
    if (ytReason === 'keyInvalid') message = 'Invalid YouTube API key. Check your configuration.';
    if (ytReason === 'playlistNotFound') message = 'Playlist not found or is private.';

    const normalized = new Error(message);
    normalized.statusCode = statusCode;
    throw normalized;
  }
};

const groupVideosByDay = (videos, videosPerDay) => {
  return videos.map((video, index) => ({
    ...video,
    dayNumber: Math.floor(index / videosPerDay) + 1,
    completed: false,
    completionDate: null,
  }));
};

module.exports = {
  createPlaylist,
  getUserPlaylists,
  updateVideoProgress,
  updateManualPlaylistTotal,
  deletePlaylist,
};

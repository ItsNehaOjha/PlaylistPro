const Playlist = require('../models/Playlist');
const axios = require('axios');

// @desc    Create new playlist
// @route   POST /api/playlists
// @access  Private
const createPlaylist = async (req, res) => {
  try {
    const { playlistUrl, videosPerDay = 5, sourceType = 'youtube', title, totalVideos, trackerTitle } = req.body;
    const userId = req.user._id;

    if (sourceType === 'youtube') {
      // YouTube playlist flow
      if (!playlistUrl) {
        return res.status(400).json({ message: 'Playlist URL is required for YouTube sources' });
      }

      // Extract playlist ID from URL
      const playlistId = extractPlaylistId(playlistUrl);
      if (!playlistId) {
        return res.status(400).json({ message: 'Invalid YouTube playlist URL' });
      }

      // Check if playlist already exists for this user
      const existingPlaylist = await Playlist.findOne({ userId, playlistId });
      if (existingPlaylist) {
        return res.status(400).json({ message: 'Playlist already exists for this user' });
      }

      // Fetch playlist data from YouTube API
      let playlistData;
      try {
        playlistData = await fetchPlaylistFromYouTube(playlistId);
      } catch (ytError) {
        console.error('YouTube fetch failed:', ytError);
        const statusCode = ytError.statusCode || 400;
        const errorMessage = ytError.message || 'Failed to fetch playlist from YouTube';
        return res.status(statusCode).json({ message: errorMessage });
      }

      // Group videos by day
      const videosWithDays = groupVideosByDay(playlistData.videos, videosPerDay);

      // Use provided trackerTitle or fallback to YouTube title
      const finalTrackerTitle = trackerTitle || playlistData.title;

      // Create playlist document
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
      // Manual playlist flow
      if (!title || !totalVideos) {
        return res.status(400).json({ message: 'Title and total videos are required for manual sources' });
      }

      if (totalVideos <= 0 || totalVideos > 1000) {
        return res.status(400).json({ message: 'Total videos must be between 1 and 1000' });
      }

      // Use provided trackerTitle or fallback to title
      const finalTrackerTitle = trackerTitle || title;

      // Create manual playlist document
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
        videos: [], // No individual video objects for manual sources
      });

      res.status(201).json(playlist);
    } else {
      return res.status(400).json({ message: 'Invalid source type' });
    }
  } catch (error) {
    console.error('Create playlist error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Playlist already exists for this user' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all playlists for user
// @route   GET /api/playlists
// @access  Private
const getUserPlaylists = async (req, res) => {
  try {
    const userId = req.user._id;
    const playlists = await Playlist.find({ userId }).sort({ createdAt: -1 });
    
    // Handle backward compatibility for existing playlists without trackerTitle
    const updatedPlaylists = await Promise.all(playlists.map(async (playlist) => {
      if (!playlist.trackerTitle) {
        // Set default trackerTitle based on existing data
        const defaultTitle = playlist.title || `Playlist ${playlist._id.toString().slice(-6)}`;
        playlist.trackerTitle = defaultTitle;
        await playlist.save();
      }
      return playlist;
    }));
    
    res.json(updatedPlaylists);
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update video progress
// @route   PATCH /api/playlists/:playlistId
// @access  Private
const updateVideoProgress = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { videoId, completed, videoIndex } = req.body;
    const userId = req.user._id;

    console.log('Update video progress request:', { playlistId, videoId, completed, videoIndex, userId });

    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'Completed status is required' });
    }

    // Find playlist by MongoDB _id (not YouTube playlistId)
    const playlist = await Playlist.findOne({ _id: playlistId, userId });
    if (!playlist) {
      console.log('Playlist not found:', { playlistId, userId });
      return res.status(404).json({ message: 'Playlist not found' });
    }

    console.log('Found playlist:', { playlistId: playlist._id, title: playlist.title, sourceType: playlist.sourceType });

    if (playlist.sourceType === 'manual') {
      // Handle manual video completion
      if (typeof videoIndex !== 'number' || videoIndex < 0 || videoIndex >= playlist.manualTotalVideos) {
        return res.status(400).json({ message: 'Invalid video index for manual playlist' });
      }

      if (completed) {
        // Add to completed videos if not already there
        const existingIndex = playlist.completedVideos.findIndex(cv => cv.videoIndex === videoIndex);
        if (existingIndex === -1) {
          playlist.completedVideos.push({
            videoIndex,
            completedAt: new Date()
          });
        }
      } else {
        // Remove from completed videos
        playlist.completedVideos = playlist.completedVideos.filter(cv => cv.videoIndex !== videoIndex);
      }

      await playlist.save();
      console.log('Manual video progress updated successfully');
      res.json(playlist);
    } else {
      // Handle YouTube video completion (existing logic)
      if (!videoId) {
        return res.status(400).json({ message: 'Video ID is required for YouTube playlists' });
      }

      // Find and update the video
      const video = playlist.videos.find(v => v.videoId === videoId);
      if (!video) {
        console.log('Video not found in playlist:', { videoId, availableVideos: playlist.videos.map(v => v.videoId) });
        return res.status(404).json({ message: 'Video not found' });
      }

      console.log('Found video:', { videoId: video.videoId, title: video.title, currentStatus: video.completed, newStatus: completed });

      // Update video completion status
      video.completed = completed;
      video.completionDate = completed ? new Date() : null;

      await playlist.save();
      console.log('YouTube video progress updated successfully');
      res.json(playlist);
    }
  } catch (error) {
    console.error('Update video progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update manual playlist total videos
// @route   PATCH /api/playlists/:playlistId/total
// @access  Private
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

    // Remove completed videos that exceed the new total
    playlist.completedVideos = playlist.completedVideos.filter(cv => cv.videoIndex < totalVideos);
    
    playlist.manualTotalVideos = totalVideos;
    playlist.totalVideos = totalVideos;
    playlist.availableVideos = totalVideos;

    await playlist.save();
    res.json(playlist);
  } catch (error) {
    console.error('Update manual playlist total error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete playlist
// @route   DELETE /api/playlists/:playlistId
// @access  Private
const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user._id;

    // Find playlist by MongoDB _id (not YouTube playlistId)
    const playlist = await Playlist.findOneAndDelete({ _id: playlistId, userId });
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to extract playlist ID from YouTube URL
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

// Helper function to fetch playlist from YouTube API
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
    const maxPages = 10; // Limit to prevent excessive API calls

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
            // Skip rows without a video id (e.g., removed/invalid entries)
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

      // Add small delay between API calls
      if (nextPageToken && pageCount < maxPages) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } while (nextPageToken && pageCount < maxPages);

    // Get playlist title - fallback to generic if unavailable
    const playlistTitle = videos.length > 0 ? `Playlist (${videos.length} videos)` : 'Untitled Playlist';

    return {
      title: playlistTitle,
      videos,
    };
  } catch (error) {
    // Normalize YouTube error messages for the client
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

// Helper function to group videos by day
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

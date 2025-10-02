import React, { useState, useEffect } from 'react';
import {
	Container,
	Typography,
	Box,
	Paper,
	Alert,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from '@mui/material';
import PlaylistInput from '../components/PlaylistInput';
import VideoList from '../components/VideoList';
import ProgressBar from '../components/ProgressBar';

const YT_API_ENDPOINT = 'https://www.googleapis.com/youtube/v3/playlistItems';

// Configuration - easily changeable
const DEFAULT_VIDEOS_PER_DAY = 5;

const extractPlaylistId = (input) => {
	if (!input) return null;
	try {
		// If user pasted just an ID
		if (!input.startsWith('http')) {
			return input.trim();
		}

		const url = new URL(input);
		const listParam = url.searchParams.get('list');
		if (listParam) return listParam;

		// Fallback regex for non-standard cases
		const match = input.match(/(?:[?&]list=)([^&#]+)/);
		if (match && match[1]) return match[1];
	} catch (_) {
		// If not a valid URL, attempt to treat as ID
		if (/^[a-zA-Z0-9_-]+$/.test(input)) return input;
	}
	return null;
};

const fetchPlaylistItems = async (playlistId, apiKey) => {
	let items = [];
	let nextPageToken = undefined;
	let pageCount = 0;
	const maxPages = 10; // Safety limit to prevent infinite loops

	console.log(`Starting to fetch playlist: ${playlistId}`);

	while (pageCount < maxPages) {
		pageCount++;
		console.log(`Fetching page ${pageCount}...`);
		
		const params = new URLSearchParams({
			part: 'snippet',
			maxResults: '50', // Maximum allowed by YouTube API
			playlistId,
			key: apiKey,
		});
		if (nextPageToken) params.set('pageToken', nextPageToken);

		try {
			const resp = await fetch(`${YT_API_ENDPOINT}?${params.toString()}`);
			if (!resp.ok) {
				const errBody = await resp.text();
				console.error(`API Error on page ${pageCount}:`, resp.status, errBody);
				throw new Error(`YouTube API error (${resp.status}): ${errBody}`);
			}
			
			const data = await resp.json();
			console.log(`Page ${pageCount} response:`, {
				itemsCount: data.items?.length || 0,
				totalResults: data.pageInfo?.totalResults || 'unknown',
				hasNextPage: !!data.nextPageToken
			});

			const mapped = (data.items || [])
				.map((it, index) => {
					const snippet = it.snippet;
					const videoId = snippet?.resourceId?.videoId;
					const title = snippet?.title || 'Untitled';
					const thumbnail = snippet?.thumbnails?.medium?.url || snippet?.thumbnails?.default?.url || '';
					
					if (!videoId) {
						console.warn(`Skipping item ${index} - no videoId:`, snippet);
						return null;
					}
					
					// Check if video is private or unavailable
					const isPrivate = title === 'Private video' || title === 'Deleted video' || title === 'Unavailable video';
					
					return {
						id: videoId,
						title,
						url: `https://www.youtube.com/watch?v=${videoId}`,
						thumbnail,
						duration: '',
						isPrivate,
						originalIndex: items.length + index, // Track original position
					};
				})
				.filter(Boolean);

			items = items.concat(mapped);
			console.log(`Total items collected so far: ${items.length}`);
			
			nextPageToken = data.nextPageToken;
			if (!nextPageToken) {
				console.log('No more pages to fetch');
				break;
			}
			
			// Small delay to be respectful to the API
			await new Promise(resolve => setTimeout(resolve, 100));
			
		} catch (error) {
			console.error(`Error fetching page ${pageCount}:`, error);
			throw error;
		}
	}

	console.log(`Final playlist fetch complete. Total items: ${items.length}`);
	return items;
};

// Group videos into days
const groupVideosByDay = (videos, videosPerDay) => {
	if (videos.length <= videosPerDay) {
		return [{ day: 1, videos, isExpanded: true }];
	}

	const groups = [];
	for (let i = 0; i < videos.length; i += videosPerDay) {
		const dayNumber = Math.floor(i / videosPerDay) + 1;
		const dayVideos = videos.slice(i, i + videosPerDay);
		groups.push({
			day: dayNumber,
			videos: dayVideos,
			isExpanded: dayNumber === 1, // Only Day 1 expanded by default
		});
	}
	return groups;
};

const PlaylistTracker = () => {
	const [playlistData, setPlaylistData] = useState([]);
	const [completedVideos, setCompletedVideos] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [currentPlaylistUrl, setCurrentPlaylistUrl] = useState('');
	const [fetchStats, setFetchStats] = useState(null);
	const [videosPerDay, setVideosPerDay] = useState(DEFAULT_VIDEOS_PER_DAY);
	const [dayGroups, setDayGroups] = useState([]);

	// Load completed videos from localStorage on component mount
	useEffect(() => {
		const saved = localStorage.getItem('completedVideos');
		if (saved) {
			setCompletedVideos(JSON.parse(saved));
		}
	}, []);

	// Save completed videos to localStorage whenever they change
	useEffect(() => {
		localStorage.setItem('completedVideos', JSON.stringify(completedVideos));
	}, [completedVideos]);

	// Update day groups when playlist data or videosPerDay changes
	useEffect(() => {
		if (playlistData.length > 0) {
			const groups = groupVideosByDay(playlistData, videosPerDay);
			setDayGroups(groups);
		}
	}, [playlistData, videosPerDay]);

	const handlePlaylistFetch = async (playlistUrl) => {
		setIsLoading(true);
		setErrorMessage('');
		setCurrentPlaylistUrl(playlistUrl);
		setFetchStats(null);
		setDayGroups([]);

		const apiKey = import.meta.env.REACT_APP_YOUTUBE_API_KEY; // Fix environment variable name
		if (!apiKey) {
			setIsLoading(false);
			setErrorMessage('YouTube API key is missing. Please set REACT_APP_YOUTUBE_API_KEY in your frontend .env file and restart the dev server.');
			return;
		}

		const playlistId = extractPlaylistId(playlistUrl);
		if (!playlistId) {
			setIsLoading(false);
			setErrorMessage('Invalid playlist URL. Please provide a valid YouTube playlist link.');
			return;
		}

		try {
			console.log(`Fetching playlist with ID: ${playlistId}`);
			const items = await fetchPlaylistItems(playlistId, apiKey);
			
			if (items.length === 0) {
				setErrorMessage('No videos found in this playlist or it may be private.');
			} else {
				// Calculate stats
				const privateVideos = items.filter(item => item.isPrivate).length;
				const availableVideos = items.filter(item => !item.isPrivate).length;
				
				setFetchStats({
					total: items.length,
					available: availableVideos,
					private: privateVideos,
					playlistId
				});
				
				console.log(`Playlist stats:`, { total: items.length, available: availableVideos, private: privateVideos });
			}
			
			setPlaylistData(items);
		} catch (err) {
			console.error('Playlist fetch error:', err);
			setErrorMessage(`Failed to fetch playlist: ${err.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleVideoToggle = (videoId) => {
		setCompletedVideos((prev) => ({
			...prev,
			[videoId]: !prev[videoId],
		}));
	};

	const toggleDayExpansion = (dayNumber) => {
		setDayGroups(prev => 
			prev.map(group => 
				group.day === dayNumber 
					? { ...group, isExpanded: !group.isExpanded }
					: group
			)
		);
	};

	const handleCheckAllInDay = (dayVideos) => {
		// Get all available (non-private) video IDs from this day
		const availableVideoIds = dayVideos
			.filter(video => !video.isPrivate)
			.map(video => video.id);

		// Mark all available videos as completed
		setCompletedVideos(prev => {
			const updated = { ...prev };
			availableVideoIds.forEach(videoId => {
				updated[videoId] = true;
			});
			return updated;
		});
	};

	const handleUncheckAllInDay = (dayVideos) => {
		// Get all available (non-private) video IDs from this day
		const availableVideoIds = dayVideos
			.filter(video => !video.isPrivate)
			.map(video => video.id);

		// Mark all available videos as not completed
		setCompletedVideos(prev => {
			const updated = { ...prev };
			availableVideoIds.forEach(videoId => {
				updated[videoId] = false;
			});
			return updated;
		});
	};

	// Calculate completion statistics
	const totalVideos = playlistData.filter(v => !v.isPrivate).length;
	const completedCount = Object.entries(completedVideos)
		.filter(([vid, done]) => done && playlistData.some((v) => v.id === vid && !v.isPrivate)).length;
	
	const completedDays = dayGroups.filter(group => 
		group.videos.filter(v => !v.isPrivate).every(v => completedVideos[v.id])
	).length;
	
	const totalDays = dayGroups.length;
	const progressPercentage = totalVideos > 0 ? (completedCount / totalVideos) * 100 : 0;

	return (
		<Container maxWidth="lg">
			<Box sx={{ mb: 4 }}>
				<Typography
					variant="h3"
					component="h1"
					gutterBottom
					sx={{ color: 'text.primary', transition: 'color 0.3s ease-in-out' }}
				>
					Playlist Tracker
				</Typography>
				<Typography
					variant="h6"
					color="text.secondary"
					paragraph
					sx={{ transition: 'color 0.3s ease-in-out' }}
				>
					Track your YouTube playlist progress and mark videos as completed
				</Typography>
			</Box>

			<PlaylistInput onFetchPlaylist={handlePlaylistFetch} isLoading={isLoading} />

			{errorMessage && (
				<Alert severity="error" sx={{ mt: 2, mb: 2 }}>
					{errorMessage}
				</Alert>
			)}

			{fetchStats && (
				<Alert severity="info" sx={{ mt: 2, mb: 2 }}>
					<strong>Playlist Info:</strong> Found {fetchStats.total} total videos 
					({fetchStats.available} available, {fetchStats.private} private/unavailable)
					<br />
					<strong>Playlist ID:</strong> {fetchStats.playlistId}
				</Alert>
			)}

			{dayGroups.length > 0 && (
				<>
					{/* Summary Section */}
					<Paper sx={{ p: 3, mb: 3, backgroundColor: 'background.paper', transition: 'all 0.3s ease-in-out' }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', mb: 2,padding: '10px' }}>
							<Typography variant="h6" color="text.primary">
								Study Progress Summary
							</Typography>
							<FormControl size="small" sx={{ minWidth: 120 }}>
								<InputLabel>Videos/Day</InputLabel>
								<Select
									value={videosPerDay}
									label="Videos/Day"
									onChange={(e) => setVideosPerDay(e.target.value)}
								>
									<MenuItem value={3}>3 videos</MenuItem>
									<MenuItem value={5}>5 videos</MenuItem>
									<MenuItem value={7}>7 videos</MenuItem>
									<MenuItem value={10}>10 videos</MenuItem>
								</Select>
							</FormControl>
						</Box>
						
						<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'space-evenly', alignItems: 'center', mb: 2,padding: '10px' }}>
							<Box>
								<Typography variant="h4" color="primary.main" fontWeight="bold">
									{completedCount} / {totalVideos}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Videos Completed
								</Typography>
							</Box>
							
							<Box>
								<Typography variant="h4" color="success.main" fontWeight="bold">
									{completedDays} / {totalDays}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Days Completed
								</Typography>
							</Box>
							
							<Box>
								<Typography variant="h4" color="info.main" fontWeight="bold">
									{Math.round(progressPercentage)}%
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Overall Progress
								</Typography>
							</Box>
						</Box>
					</Paper>

					{/* Progress Bar */}
					<Box sx={{ mb: 3 }}>
						<ProgressBar progress={progressPercentage} completed={completedCount} total={totalVideos} />
					</Box>

					{/* Day Groups */}
					{dayGroups.map((group) => {
						const dayCompletedVideos = group.videos.filter(v => !v.isPrivate && completedVideos[v.id]).length;
						const dayTotalVideos = group.videos.filter(v => !v.isPrivate).length;
						const isDayCompleted = dayTotalVideos > 0 && dayCompletedVideos === dayTotalVideos;
						const hasAvailableVideos = dayTotalVideos > 0;
						
						return (
							<Paper 
								key={group.day}
								sx={{ 
									mb: 2, 
									backgroundColor: 'background.paper',
									transition: 'all 0.3s ease-in-out',
									border: isDayCompleted ? 2 : 1,
									borderColor: isDayCompleted ? 'success.main' : 'divider',
								}}
							>
								<Box 
									sx={{ 
										p: 2, 
										cursor: 'pointer',
										backgroundColor: isDayCompleted ? 'success.light' : 'transparent',
										'&:hover': {
											backgroundColor: isDayCompleted ? 'success.light' : 'action.hover',
										},
										transition: 'background-color 0.3s ease-in-out',
									}}
									onClick={() => toggleDayExpansion(group.day)}
								>
									<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<Typography variant="h6" color="text.primary" fontWeight="bold">
												Day {group.day}
											</Typography>
											{isDayCompleted && (
												<Typography variant="h6" color="success.main">
													✅
												</Typography>
											)}
											<Typography variant="body2" color="text.secondary">
												({dayCompletedVideos}/{dayTotalVideos} videos completed)
											</Typography>
										</Box>
										
										<Typography variant="body2" color="text.secondary">
											{group.isExpanded ? '▼' : '▶'}
										</Typography>
									</Box>
								</Box>
								
								{group.isExpanded && (
									<Box sx={{ p: 2, pt: 0 }}>
										{/* Check All/Uncheck All Buttons */}
										{hasAvailableVideos && (
											<Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
												<Button
													variant="outlined"
													color="success"
													size="small"
													onClick={() => handleCheckAllInDay(group.videos)}
													disabled={isDayCompleted}
													sx={{
														transition: 'all 0.3s ease-in-out',
														'&:hover': {
															transform: 'translateY(-2px)',
															boxShadow: 2,
														}
													}}
												>
													{isDayCompleted ? 'All Completed' : 'Check All in Day'}
												</Button>
												
												{dayCompletedVideos > 0 && (
													<Button
														variant="outlined"
														color="warning"
														size="small"
														onClick={() => handleUncheckAllInDay(group.videos)}
														sx={{
															transition: 'all 0.3s ease-in-out',
															'&:hover': {
																transform: 'translateY(-2px)',
																boxShadow: 2,
															}
														}}
													>
														Uncheck All in Day
													</Button>
												)}
											</Box>
										)}
										
										<VideoList
											videos={group.videos}
											completedVideos={completedVideos}
											onVideoToggle={handleVideoToggle}
											showDayHeader={false}
										/>
									</Box>
								)}
							</Paper>
						);
					})}
				</>
			)}
		</Container>
	);
};

export default PlaylistTracker;

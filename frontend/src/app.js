import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useLocation
} from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  TextField,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Grid,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Container,
  Avatar,
  Divider,
  CardActions,
  Stack,
  Fade,
  Grow,
  Zoom,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Slider,
  Collapse
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Upload as UploadIcon,
  Assessment as AssessmentIcon,
  Work as WorkIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  Rocket as RocketIcon,
  Add as AddIcon,
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  Calculate as CalculateIcon,
  Speed as SpeedIcon,
  InsertDriveFile as InsertDriveFileIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Article as ArticleIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  AppRegistration as AppRegistrationIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import axios from 'axios';


// ==================== API CONFIGURATION ====================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== THEME ====================

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#ff69b4', light: '#ff9acb', dark: '#ff1493' },
    secondary: { main: '#ff6b6b', light: '#ff8787', dark: '#fa5252' },
    success: { main: '#51cf66', light: '#69db7e', dark: '#37b24d' },
    warning: { main: '#ff922b', light: '#ffa94d', dark: '#f76707' },
    error: { main: '#ff6b6b', light: '#ff8787', dark: '#fa5252' },
    background: { default: '#fff5f8', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", "Poppins", "Roboto", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 12, padding: '8px 20px' }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 20, boxShadow: '0 4px 24px rgba(255,105,180,0.08)', transition: 'all 0.3s ease' }
      }
    },
  },
});

// ==================== AUTH CONTEXT ====================

const AuthContext = React.createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.get('/auth/profile')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const res = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    localStorage.setItem('access_token', res.data.access_token);
    const profile = await api.get('/auth/profile');
    setUser(profile.data);
    return profile.data;
  };

  const signup = async (userData) => {
    const res = await api.post('/auth/signup', userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// ==================== CUSTOM DROP ZONE ====================

const FileDropZone = ({ onFileChange, file }) => {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  }, [onFileChange]);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleInputChange = (e) => {
    if (e.target.files[0]) onFileChange(e.target.files[0]);
  };

  return (
    <Box
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => document.getElementById('resume-file-input').click()}
      sx={{
        border: `2px dashed ${dragging ? '#ff1493' : '#ff69b4'}`,
        borderRadius: 3,
        p: 5,
        textAlign: 'center',
        cursor: 'pointer',
        bgcolor: dragging ? alpha('#ff69b4', 0.08) : alpha('#ff69b4', 0.03),
        transition: 'all 0.2s ease',
        '&:hover': { bgcolor: alpha('#ff69b4', 0.06), borderColor: '#ff1493' }
      }}
    >
      <input
        id="resume-file-input"
        type="file"
        accept=".pdf,.docx"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />
      {file ? (
        <Box>
          <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
          <Typography variant="h6" color="success.main">{file.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {(file.size / 1024 / 1024).toFixed(2)} MB — Click to change
          </Typography>
        </Box>
      ) : (
        <Box>
          <CloudUploadIcon sx={{ fontSize: 56, color: '#ff69b4', mb: 1 }} />
          <Typography variant="h6" gutterBottom>Drag & drop your resume here</Typography>
          <Typography variant="body2" color="text.secondary">or click to browse</Typography>
          <Box display="flex" justifyContent="center" gap={1} mt={2}>
            <Chip icon={<PictureAsPdfIcon />} label="PDF" size="small" sx={{ bgcolor: alpha('#ff69b4', 0.1) }} />
            <Chip icon={<ArticleIcon />} label="DOCX" size="small" sx={{ bgcolor: alpha('#ff69b4', 0.1) }} />
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>Max 10MB</Typography>
        </Box>
      )}
    </Box>
  );
};

// ==================== ADVANCED ATS ANALYSIS COMPONENT ====================

// ==================== ADVANCED ATS ANALYSIS COMPONENT (FIXED FOR YOUR BACKEND) ====================

const AdvancedATSAnalysis = ({ resumeId, refreshKey, onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showWeights, setShowWeights] = useState(false);
  const [weights, setWeights] = useState({
    experience: 30,
    skills: 25,
    education: 15,
    keywords: 20,
    formatting: 10
  });
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [scoreHistory, setScoreHistory] = useState([]);

  const fetchAnalysis = async () => {
    if (!resumeId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching analysis for resume ID:', resumeId);

      // Use the correct endpoint - /api/analyze/advanced-ats
      const response = await api.post('/analyze/advanced-ats', {
        resume_id: parseInt(resumeId)
      });

      console.log('Analysis response:', response.data);
      setAnalysis(response.data);
      if (onAnalysisComplete) onAnalysisComplete(response.data);
    } catch (error) {
      console.error('Analysis failed:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.detail || error.message || 'Analysis failed. Please try again.');
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchScoreHistory = async () => {
    try {
      const response = await api.get(`/score-history/${resumeId}`);
      setScoreHistory(response.data || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  useEffect(() => {
    if (resumeId) {
      console.log('Resume ID changed or refresh triggered:', resumeId, refreshKey);
      fetchAnalysis();
      fetchScoreHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, refreshKey]);

  const updateWeights = async () => {
    await fetchAnalysis();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Needs Work';
    return 'Poor';
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#ff69b4' }} />
          <Typography variant="body2" color="text.secondary" mt={2}>
            Analyzing your resume...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <ErrorIcon sx={{ fontSize: 64, color: '#f44336', mb: 2 }} />
          <Typography variant="h6" gutterBottom color="error">Analysis Error</Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={fetchAnalysis}
            sx={{ mt: 3 }}
            startIcon={<RefreshIcon />}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <PsychologyIcon sx={{ fontSize: 64, color: alpha('#ff69b4', 0.3), mb: 2 }} />
          <Typography variant="h6" gutterBottom>No Analysis Yet</Typography>
          <Typography variant="body2" color="text.secondary">
            Select a resume and click "Refresh Analysis" to get detailed insights
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for visualizations
  const radarData = Object.entries(analysis.score_breakdown || {}).map(([key, value]) => ({
    category: key.charAt(0).toUpperCase() + key.slice(1),
    score: value,
    fullMark: 100
  }));

  const historyData = (scoreHistory || []).map(h => ({
    date: new Date(h.date).toLocaleDateString(),
    score: h.total_score
  }));

  return (
    <Box>
      {/* Main Score Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4} textAlign="center">
              <Box position="relative" display="inline-flex">
                <CircularProgress
                  variant="determinate"
                  value={analysis.ats_score || 0}
                  size={150}
                  thickness={4}
                  sx={{ color: 'white' }}
                />
                <Box position="absolute" top="50%" left="50%" textAlign="center" sx={{ transform: 'translate(-50%, -50%)' }}>
                  <Typography variant="h2" fontWeight="bold">
                    {Math.round(analysis.ats_score || 0)}
                  </Typography>
                  <Typography variant="caption">/100</Typography>
                </Box>
              </Box>
              <Typography variant="h6" mt={1}>{getScoreLabel(analysis.ats_score || 0)}</Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" opacity={0.8}>Percentile Rank</Typography>
                  <Typography variant="h5">{analysis.percentile_rank || 65}%</Typography>
                  <Typography variant="caption" opacity={0.8}>
                    {analysis.percentile_label || 'Above Average'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" opacity={0.8}>Confidence Interval</Typography>
                  <Typography variant="h5">{analysis.confidence_interval || '±5'}</Typography>
                  <Typography variant="caption" opacity={0.8}>
                    Range: {analysis.score_range || '68-78'}
                  </Typography>
                </Grid>
                {analysis.score_change !== null && analysis.score_change !== undefined && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {analysis.score_change > 0 ? (
                        <TrendingUpIcon sx={{ color: '#4caf50' }} />
                      ) : analysis.score_change < 0 ? (
                        <TrendingDownIcon sx={{ color: '#f44336' }} />
                      ) : null}
                      <Typography variant="body2">
                        {analysis.score_change > 0 ? '+' : ''}{analysis.score_change} points from previous analysis
                      </Typography>
                      {analysis.previous_score && (
                        <Typography variant="caption" opacity={0.8}>
                          (Previous: {Math.round(analysis.previous_score)})
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Score Breakdown Cards */}
      <Typography variant="h6" gutterBottom>Detailed Score Breakdown</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(analysis.score_breakdown || {}).map(([category, score]) => (
          <Grid item xs={12} sm={6} md={4} key={category}>
            <Card
              sx={{
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' }
              }}
              onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6" textTransform="capitalize">
                    {category.replace(/_/g, ' ')}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: getScoreColor(score) }}>
                    {Math.round(score)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={score}
                  sx={{ height: 8, borderRadius: 4, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: getScoreColor(score) } }}
                />
                <Typography variant="caption" color="text.secondary" mt={1} display="block">
                  Weight: {weights[category]}%
                </Typography>
                <ExpandMoreIcon
                  sx={{
                    mt: 1,
                    transform: expandedCategory === category ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s'
                  }}
                />

                <Collapse in={expandedCategory === category}>
                  <Box mt={2}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" gutterBottom>Details:</Typography>
                    {analysis.score_details && analysis.score_details[category] && Object.entries(analysis.score_details[category]).map(([key, value]) => (
                      <Box key={key} display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" color="text.secondary" textTransform="capitalize">
                          {key.replace(/_/g, ' ')}:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Visual Dashboard */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Score Breakdown Visualization</Typography>
              {radarData.map((item) => (
                <Box key={item.category} sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">{item.category}</Typography>
                    <Typography variant="body2" fontWeight="bold">{Math.round(item.score)}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.score}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getScoreColor(item.score),
                        borderRadius: 5
                      }
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Score Progress</Typography>
              {historyData.length > 0 ? (
                <Box>
                  {historyData.slice(-5).map((item, idx) => (
                    <Box key={idx} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="body2">{item.date}</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={item.score}
                          sx={{ width: 150, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" fontWeight="bold">{Math.round(item.score)}%</Typography>
                      </Box>
                    </Box>
                  ))}
                  <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={2}>
                    Showing last {Math.min(5, historyData.length)} analyses
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  No score history yet. Make changes to your resume and re-analyze to see progress!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Weight Adjustment */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Score Weights Configuration</Typography>
            <IconButton onClick={() => setShowWeights(!showWeights)}>
              <SettingsIcon />
            </IconButton>
          </Box>

          <Collapse in={showWeights}>
            <Grid container spacing={3}>
              {Object.entries(weights).map(([category, weight]) => (
                <Grid item xs={12} sm={6} md={4} key={category}>
                  <Typography gutterBottom textTransform="capitalize">
                    {category} ({weight}%)
                  </Typography>
                  <Slider
                    value={weight}
                    onChange={(e, newValue) => setWeights({ ...weights, [category]: newValue })}
                    min={0}
                    max={100}
                    step={5}
                    valueLabelDisplay="auto"
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Alert severity="info">
                  Note: Weight adjustments require backend support to take effect.
                </Alert>
                <Button
                  variant="contained"
                  onClick={updateWeights}
                  sx={{ mt: 2 }}
                >
                  Refresh Analysis
                </Button>
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      {/* Strengths */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>💪 Strengths</Typography>
              {(analysis.strengths || []).map((strength, idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
                  <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                  <Typography variant="body2">{strength}</Typography>
                </Box>
              ))}
              {(!analysis.strengths || analysis.strengths.length === 0) && (
                <Typography color="text.secondary">No strengths identified</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>⚠️ Areas for Improvement</Typography>
              {(analysis.weaknesses || []).map((weakness, idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
                  <WarningIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                  <Typography variant="body2">{weakness}</Typography>
                </Box>
              ))}
              {(!analysis.weaknesses || analysis.weaknesses.length === 0) && (
                <Typography color="text.secondary">No weaknesses identified</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>💡 Actionable Suggestions</Typography>
              <Grid container spacing={1}>
                {(analysis.suggestions || []).map((suggestion, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingUpIcon sx={{ color: '#2196f3', fontSize: 20 }} />
                      <Typography variant="body2">{suggestion}</Typography>
                    </Box>
                  </Grid>
                ))}
                {(!analysis.suggestions || analysis.suggestions.length === 0) && (
                  <Typography color="text.secondary">No suggestions available</Typography>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Gap Analysis */}
        {analysis.gap_analysis && Object.keys(analysis.gap_analysis).length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>📊 Gap Analysis</Typography>
                <Grid container spacing={2}>
                  {Object.entries(analysis.gap_analysis).map(([category, gaps]) => {
                    if (!gaps || gaps.length === 0) return null;
                    return (
                      <Grid item xs={12} md={6} key={category}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          {category.replace(/_/g, ' ').toUpperCase()}:
                        </Typography>
                        <Box component="ul" sx={{ m: 0, pl: 2 }}>
                          {gaps.map((gap, idx) => (
                            <Typography component="li" variant="body2" key={idx}>
                              {gap}
                            </Typography>
                          ))}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Improvement Plan */}
        {analysis.improvement_plan && Object.keys(analysis.improvement_plan).length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>📈 Improvement Plan</Typography>
                <Grid container spacing={2}>
                  {Object.entries(analysis.improvement_plan).map(([phase, items]) => {
                    if (!items || items.length === 0) return null;
                    return (
                      <Grid item xs={12} md={4} key={phase}>
                        <Typography variant="subtitle2" color="secondary" gutterBottom>
                          {phase.replace(/_/g, ' ').toUpperCase()}:
                        </Typography>
                        <Box component="ul" sx={{ m: 0, pl: 2 }}>
                          {items.map((item, idx) => (
                            <Typography component="li" variant="body2" key={idx}>
                              {item}
                            </Typography>
                          ))}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

// ==================== HOME ====================

const HomePage = () => {
  const navigate = useNavigate();
  const features = [
    { icon: <PsychologyIcon />, title: 'AI-Powered Analysis', description: 'Intelligent insights powered by Gemini AI', color: '#ff69b4' },
    { icon: <SpeedIcon />, title: 'Instant Results', description: 'Full analysis in under 10 seconds', color: '#ff6b6b' },
    { icon: <CalculateIcon />, title: 'ATS Score', description: 'Know exactly where you stand', color: '#ff922b' },
    { icon: <WorkIcon />, title: 'Job Matching', description: 'Match your resume to any job', color: '#51cf66' },
  ];

  return (
    <Box>
      <Box sx={{ background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)', color: 'white', pt: 12, pb: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Grow in timeout={800}>
                <Box>
                  <Chip
                    icon={<AutoAwesomeIcon />}
                    label="AI-Powered Resume Analysis"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 3, fontWeight: 600 }}
                  />
                  <Typography variant="h3" gutterBottom fontWeight={800}>
                    Land Your Dream Job with AI
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                    Beat ATS systems with intelligent resume analysis, gap detection, and job matching
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained" size="large"
                      onClick={() => navigate('/signup')}
                      sx={{ bgcolor: 'white', color: '#ff69b4', px: 4, '&:hover': { bgcolor: '#fff0f5' } }}
                      startIcon={<RocketIcon />}
                    >
                      Get Started Free
                    </Button>
                    <Button
                      variant="outlined" size="large"
                      onClick={() => navigate('/login')}
                      sx={{ borderColor: 'white', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                      Sign In
                    </Button>
                  </Stack>
                </Box>
              </Grow>
            </Grid>
            <Grid item xs={12} md={6}>
              <Zoom in timeout={1000}>
                <Box textAlign="center">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/1055/1055687.png"
                    alt="Resume"
                    style={{ width: '75%', maxWidth: 280, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))' }}
                  />
                </Box>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight={700}>Everything You Need</Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
          From upload to job offer — we guide you every step of the way
        </Typography>
        <Grid container spacing={4}>
          {features.map((f, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ textAlign: 'center', p: 4, height: '100%', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(255,105,180,0.15)' } }}>
                <Box sx={{ bgcolor: alpha(f.color, 0.1), borderRadius: '50%', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {React.cloneElement(f.icon, { sx: { fontSize: 36, color: f.color } })}
                </Box>
                <Typography variant="h6" gutterBottom>{f.title}</Typography>
                <Typography variant="body2" color="text.secondary">{f.description}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ background: 'linear-gradient(135deg, #fff0f5 0%, #fff5f8 100%)', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom fontWeight={700}>Ready to Transform Your Resume?</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Join thousands who already boosted their ATS scores</Typography>
          <Button
            variant="contained" size="large"
            onClick={() => navigate('/signup')}
            sx={{ px: 6, py: 1.5 }}
            startIcon={<AutoAwesomeIcon />}
          >
            Start Free — No Credit Card
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

// ==================== LAYOUT ====================

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const drawerWidth = 260;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Upload Resume', icon: <UploadIcon />, path: '/upload' },
    { text: 'ATS Analysis', icon: <AssessmentIcon />, path: '/analyze' },
    { text: 'Job Matcher', icon: <WorkIcon />, path: '/match' },
    { text: 'History', icon: <HistoryIcon />, path: '/history' },
  ];

  const drawerContent = (
    <Box>
      <Toolbar sx={{ gap: 1 }}>
        <AnalyticsIcon sx={{ color: '#ff69b4' }} />
        <Typography variant="h6" fontWeight={700} sx={{ color: '#ff69b4' }}>ResumeAI</Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            button key={item.text}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            sx={{
              borderRadius: 2, mb: 0.5,
              '&:hover': { bgcolor: alpha('#ff69b4', 0.08) },
              cursor: 'pointer'
            }}
          >
            <ListItemIcon sx={{ color: '#ff69b4', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: 1201, background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)', boxShadow: '0 2px 20px rgba(255,20,147,0.3)' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <AnalyticsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
            ResumeAI
          </Typography>
          <Chip
            avatar={<Avatar sx={{ bgcolor: 'white', color: '#ff69b4', width: 28, height: 28, fontSize: 13 }}>{user?.username?.[0]?.toUpperCase()}</Avatar>}
            label={user?.username}
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', mr: 1 }}
            variant="outlined"
          />
          <IconButton color="inherit" onClick={logout} title="Logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' }, width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, mt: 8, borderRight: '1px solid #fce4ec' } }}
        open
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1, p: 3,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          mt: 8, backgroundColor: '#fff5f8', minHeight: '100vh'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

// ==================== DASHBOARD ====================

const DashboardPage = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, totalMatches: 0 });
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [resumesRes, historyRes] = await Promise.all([
        api.get('/resume/list'),
        api.get('/analysis/history')
      ]);
      setResumes(resumesRes.data);
      const ats = historyRes.data.filter(a => a.analysis_type === 'ats_score');
      const avgScore = ats.length ? Math.round(ats.reduce((s, a) => s + (a.ats_score || 0), 0) / ats.length) : 0;
      const matches = historyRes.data.filter(a => a.analysis_type === 'job_match').length;
      setStats({ total: resumesRes.data.length, avgScore, totalMatches: matches });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/resume/${id}`);
      setResumes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress sx={{ color: '#ff69b4' }} /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Welcome Back! 👋</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Here's an overview of your resume activity</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Resumes', value: stats.total, icon: <DescriptionIcon sx={{ fontSize: 40, color: '#ff69b4' }} />, color: '#ff69b4' },
          { label: 'Avg ATS Score', value: `${stats.avgScore}%`, icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#51cf66' }} />, color: '#51cf66' },
          { label: 'Job Matches', value: stats.totalMatches, icon: <WorkIcon sx={{ fontSize: 40, color: '#ff922b' }} />, color: '#ff922b' },
        ].map((stat, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Card sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">{stat.label}</Typography>
                  <Typography variant="h3" fontWeight={700}>{stat.value}</Typography>
                </Box>
                <Box sx={{ bgcolor: alpha(stat.color, 0.1), borderRadius: 2, p: 1.5 }}>
                  {stat.icon}
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">My Resumes</Typography>
          <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/upload">Upload Resume</Button>
        </Box>

        {resumes.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 10 }}>
            <InsertDriveFileIcon sx={{ fontSize: 80, color: alpha('#ff69b4', 0.3), mb: 2 }} />
            <Typography variant="h6" gutterBottom>No resumes yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Upload your first resume to get started</Typography>
            <Button variant="contained" component={Link} to="/upload" startIcon={<CloudUploadIcon />}>Upload Resume</Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {resumes.map((resume) => (
              <Grid item xs={12} sm={6} md={4} key={resume.id}>
                <Card sx={{ '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 30px rgba(255,105,180,0.15)' } }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: '#ff69b4', width: 44, height: 44 }}>
                        {resume.name?.[0] || <DescriptionIcon />}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" noWrap fontWeight={600}>{resume.name || 'Unnamed Resume'}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">{resume.filename}</Typography>
                        {resume.email && <Typography variant="caption" color="text.secondary">{resume.email}</Typography>}
                      </Box>
                    </Box>

                    {resume.skills?.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>SKILLS DETECTED</Typography>
                        <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                          {resume.skills.slice(0, 4).map(s => (
                            <Chip key={s} label={s} size="small" sx={{ bgcolor: alpha('#ff69b4', 0.1), fontSize: 11 }} />
                          ))}
                          {resume.skills.length > 4 && (
                            <Chip label={`+${resume.skills.length - 4}`} size="small" sx={{ bgcolor: '#f5f5f5', fontSize: 11 }} />
                          )}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ px: 2, py: 1 }}>
                    <Button size="small" startIcon={<AssessmentIcon />} component={Link} to={`/analyze?resume=${resume.id}`} sx={{ color: '#ff69b4' }}>
                      Analyze
                    </Button>
                    <Button size="small" startIcon={<WorkIcon />} component={Link} to={`/match?resume=${resume.id}`} sx={{ color: '#ff922b' }}>
                      Match Job
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton
                      size="small" color="error"
                      onClick={() => handleDelete(resume.id)}
                      disabled={deleting === resume.id}
                    >
                      {deleting === resume.id ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

// ==================== UPLOAD ====================

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file) { setError('Please select a file first'); return; }
    setError('');
    setResult(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Upload failed. Please check your file and try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Upload Resume</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload a PDF or DOCX resume to start analyzing
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3 }}>
            <FileDropZone file={file} onFileChange={(f) => { setFile(f); setResult(null); setError(''); }} />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained" fullWidth onClick={handleUpload}
                disabled={!file || uploading}
                startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />}
                size="large"
              >
                {uploading ? 'Uploading & Parsing...' : 'Upload Resume'}
              </Button>
              {file && (
                <Button variant="outlined" onClick={() => { setFile(null); setResult(null); setError(''); }}>
                  Clear
                </Button>
              )}
            </Box>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            {result && (
              <Fade in>
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography fontWeight={600}>✅ Resume uploaded successfully!</Typography>
                  {result.name && <Typography variant="body2">Name: {result.name}</Typography>}
                  {result.email && <Typography variant="body2">Email: {result.email}</Typography>}
                  {result.skills?.length > 0 && (
                    <Typography variant="body2">Skills detected: {result.skills.slice(0, 5).join(', ')}{result.skills.length > 5 ? ` +${result.skills.length - 5} more` : ''}</Typography>
                  )}
                  {result.char_count && <Typography variant="body2">Characters extracted: {result.char_count.toLocaleString()}</Typography>}
                </Alert>
              </Fade>
            )}

            {result && (
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button variant="contained" component={Link} to={`/analyze?resume=${result.id}`} startIcon={<AssessmentIcon />}>
                  Analyze Now
                </Button>
                <Button variant="outlined" component={Link} to="/dashboard" startIcon={<DashboardIcon />}>
                  Go to Dashboard
                </Button>
              </Box>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, bgcolor: '#fff0f5', mb: 3 }}>
            <Typography variant="h6" gutterBottom>Supported Formats</Typography>
            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <Chip icon={<PictureAsPdfIcon />} label="PDF" sx={{ bgcolor: alpha('#ff69b4', 0.15) }} />
              <Chip icon={<ArticleIcon />} label="DOCX" sx={{ bgcolor: alpha('#ff69b4', 0.15) }} />
            </Box>
            <Typography variant="body2" color="text.secondary">Max file size: 10MB</Typography>
            <Typography variant="body2" color="text.secondary">Use text-based PDFs for best results</Typography>
          </Card>

          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>What happens after upload?</Typography>
            <Stack spacing={2}>
              {[
                { icon: <SearchIcon sx={{ color: '#ff69b4' }} />, text: 'Text extracted from your resume' },
                { icon: <PsychologyIcon sx={{ color: '#ff69b4' }} />, text: 'Skills, experience & education detected' },
                { icon: <AssessmentIcon sx={{ color: '#ff69b4' }} />, text: 'Ready for ATS analysis & job matching' },
              ].map((step, i) => (
                <Box key={i} display="flex" alignItems="center" gap={2}>
                  {step.icon}
                  <Typography variant="body2">{step.text}</Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// ==================== ATS ANALYSIS PAGE ====================

const ATSAnalysisPage = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const location = useLocation();

  useEffect(() => {
    fetchResumes();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('resume');
    if (id) setSelectedResume(id);
  }, [location.search]);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resume/list');
      setResumes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyze = () => {
    if (!selectedResume) {
      setError('Please select a resume first');
      return;
    }
    setAnalyzing(true);
    setError('');
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setAnalyzing(false), 500);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>ATS Analysis</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Analyze how well your resume performs against ATS systems
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, position: 'sticky', top: 80 }}>
            <Typography variant="h6" gutterBottom>Select Resume</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Choose a resume</InputLabel>
              <Select
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
                label="Choose a resume"
              >
                {resumes.map(r => (
                  <MenuItem key={r.id} value={String(r.id)}>
                    {r.name || r.filename}
                  </MenuItem>
                ))}
              </Select>
              {resumes.length === 0 && (
                <FormHelperText>No resumes uploaded yet</FormHelperText>
              )}
            </FormControl>

            <Button
              variant="contained"
              fullWidth
              onClick={handleAnalyze}
              disabled={!selectedResume || analyzing}
              size="large"
              startIcon={analyzing ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
            >
              {analyzing ? 'Refreshing...' : 'Refresh Analysis'}
            </Button>

            {resumes.length === 0 && (
              <Button variant="outlined" fullWidth component={Link} to="/upload" sx={{ mt: 2 }}>
                Upload a Resume First
              </Button>
            )}

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            <Box sx={{ mt: 3, p: 2, bgcolor: '#fff0f5', borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>✨ Advanced Features</Typography>
              <Typography variant="body2" color="text.secondary">
                • Detailed score breakdown<br/>
                • Customizable score weights<br/>
                • Historical score tracking<br/>
                • Gap analysis<br/>
                • AI-powered suggestions<br/>
                • Improvement plan
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {selectedResume ? (
            <AdvancedATSAnalysis
              resumeId={selectedResume}
              refreshKey={refreshKey}
              onAnalysisComplete={(data) => {
                console.log('Analysis complete:', data);
              }}
            />
          ) : (
            <Card sx={{ textAlign: 'center', py: 10 }}>
              <PsychologyIcon sx={{ fontSize: 80, color: alpha('#ff69b4', 0.3), mb: 2 }} />
              <Typography variant="h6" gutterBottom>No resume selected</Typography>
              <Typography variant="body2" color="text.secondary">
                Select a resume from the left to start analysis
              </Typography>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

// ==================== JOB MATCHER ====================

const JobMatcherPage = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [match, setMatch] = useState(null);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const location = useLocation();

  useEffect(() => { fetchResumes(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('resume');
    if (id) setSelectedResume(id);
  }, [location.search]);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resume/list');
      setResumes(res.data);
    } catch (err) { console.error(err); }
  };

  const handleMatch = async () => {
    if (!selectedResume || !jobDescription.trim()) return;
    setMatching(true);
    setError('');
    try {
      const res = await api.post('/analyze/match-job', {
        resume_id: parseInt(selectedResume),
        job_description: jobDescription
      });
      setMatch(res.data);
      setOpenDialog(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Job matching failed. Please try again.');
    } finally {
      setMatching(false);
    }
  };

  const getMatchColor = (pct) => {
    if (pct >= 80) return '#51cf66';
    if (pct >= 60) return '#ff922b';
    return '#ff6b6b';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Job Matcher</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Paste a job description and see how well your resume matches
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Select Resume</Typography>
            <FormControl fullWidth>
              <InputLabel>Choose a resume</InputLabel>
              <Select
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
                label="Choose a resume"
              >
                {resumes.map(r => (
                  <MenuItem key={r.id} value={String(r.id)}>
                    {r.name || r.filename}
                  </MenuItem>
                ))}
              </Select>
              {resumes.length === 0 && <FormHelperText>No resumes uploaded yet</FormHelperText>}
            </FormControl>

            {resumes.length === 0 && (
              <Button variant="outlined" fullWidth component={Link} to="/upload" sx={{ mt: 2 }}>
                Upload a Resume First
              </Button>
            )}

            <Box sx={{ mt: 3, p: 2, bgcolor: '#fff0f5', borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>How it works</Typography>
              <Typography variant="body2" color="text.secondary">
                Paste the full job description below. Our AI compares your skills and experience against the role requirements and gives you a detailed match report.
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Job Description</Typography>
            <TextField
              fullWidth multiline rows={10}
              placeholder="Paste the full job description here, including responsibilities, requirements, and qualifications..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              sx={{ mb: 3 }}
              inputProps={{ style: { fontSize: 14 } }}
            />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Button
              variant="contained" fullWidth
              onClick={handleMatch}
              disabled={!selectedResume || !jobDescription.trim() || matching}
              size="large"
              startIcon={matching ? <CircularProgress size={18} color="inherit" /> : <WorkIcon />}
            >
              {matching ? 'Matching...' : 'Match Resume with Job'}
            </Button>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight={700}>Match Results</Typography>
            {match && (
              <Box textAlign="center">
                <Typography variant="h2" fontWeight={800} sx={{ color: getMatchColor(match.match_percentage), lineHeight: 1 }}>
                  {Math.round(match.match_percentage)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">Match Score</Typography>
              </Box>
            )}
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {match && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={match.match_percentage}
                  sx={{ height: 10, borderRadius: 5, bgcolor: '#f5f5f5', '& .MuiLinearProgress-bar': { bgcolor: getMatchColor(match.match_percentage), borderRadius: 5 } }}
                />
              </Box>

              {match.role_fit_summary && (
                <Box sx={{ mb: 3, p: 2, bgcolor: '#fff0f5', borderRadius: 2, borderLeft: '4px solid #ff69b4' }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>Role Fit Summary</Typography>
                  <Typography variant="body2">{match.role_fit_summary}</Typography>
                </Box>
              )}

              <Grid container spacing={3}>
                {match.matched_skills?.length > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      ✅ Matched Skills ({match.matched_skills.length})
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.8}>
                      {match.matched_skills.map((s, i) => (
                        <Chip key={i} label={s} size="small" color="success" />
                      ))}
                    </Box>
                  </Grid>
                )}

                {match.missing_skills?.length > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      ❌ Missing Skills ({match.missing_skills.length})
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.8}>
                      {match.missing_skills.map((s, i) => (
                        <Chip key={i} label={s} size="small" color="error" />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>

              {match.improvement_tips?.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>💡 Improvement Tips</Typography>
                  <List disablePadding>
                    {match.improvement_tips.map((t, i) => (
                      <ListItem key={i} sx={{ px: 0, py: 0.6 }}>
                        <AutoAwesomeIcon sx={{ mr: 1.5, color: '#ff69b4', fontSize: 18, flexShrink: 0 }} />
                        <Typography variant="body2">{t}</Typography>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined">Close</Button>
          <Button variant="contained" component={Link} to="/history" onClick={() => setOpenDialog(false)}>
            View History
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ==================== HISTORY ====================

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/analysis/history');
      setHistory(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = filter === 'all' ? history : history.filter(i => i.analysis_type === filter);

  const getScore = (item) => {
    if (item.analysis_type === 'ats_score') return item.ats_score;
    return item.match_percentage;
  };

  const getScoreColor = (score) => {
    if (!score) return '#9e9e9e';
    if (score >= 80) return '#51cf66';
    if (score >= 60) return '#ff922b';
    return '#ff6b6b';
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress sx={{ color: '#ff69b4' }} /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Analysis History</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Review all your past resume analyses
      </Typography>

      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(e, v) => v && setFilter(v)}
          sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, px: 3 }, '& .Mui-selected': { bgcolor: alpha('#ff69b4', 0.1) + ' !important', color: '#ff1493 !important' } }}
        >
          <ToggleButton value="all">All ({history.length})</ToggleButton>
          <ToggleButton value="ats_score">ATS Scores ({history.filter(i => i.analysis_type === 'ats_score').length})</ToggleButton>
          <ToggleButton value="job_match">Job Matches ({history.filter(i => i.analysis_type === 'job_match').length})</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {filtered.length === 0 ? (
        <Paper sx={{ textAlign: 'center', py: 10, borderRadius: 3 }}>
          <HistoryIcon sx={{ fontSize: 80, color: alpha('#ff69b4', 0.3), mb: 2 }} />
          <Typography variant="h6" gutterBottom>No history yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Analyze a resume or match it with a job to see results here
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" component={Link} to="/analyze" startIcon={<AssessmentIcon />}>ATS Analysis</Button>
            <Button variant="outlined" component={Link} to="/match" startIcon={<WorkIcon />}>Job Match</Button>
          </Stack>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((item) => {
            const score = getScore(item);
            const isAts = item.analysis_type === 'ats_score';
            return (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card sx={{ p: 2.5, '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(255,105,180,0.12)' } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" noWrap fontWeight={600}>{item.resume_name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={isAts ? 'ATS Score' : 'Job Match'}
                          size="small"
                          icon={isAts ? <AssessmentIcon /> : <WorkIcon />}
                          sx={{ bgcolor: alpha('#ff69b4', 0.1), color: '#ff1493', fontWeight: 600 }}
                        />
                      </Box>
                    </Box>
                    <Box textAlign="center" sx={{ ml: 2, flexShrink: 0 }}>
                      <Typography variant="h3" fontWeight={800} sx={{ color: getScoreColor(score), lineHeight: 1 }}>
                        {score ? Math.round(score) : '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">%</Typography>
                    </Box>
                  </Box>

                  {score && (
                    <LinearProgress
                      variant="determinate"
                      value={score}
                      sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: '#f5f5f5', '& .MuiLinearProgress-bar': { bgcolor: getScoreColor(score), borderRadius: 3 } }}
                    />
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

// ==================== LOGIN ====================

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)' }}>
      <Container maxWidth="sm">
        <Card sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Avatar sx={{ bgcolor: '#ff69b4', width: 64, height: 64, margin: '0 auto', mb: 2 }}>
              <AnalyticsIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h4" fontWeight={700}>Welcome Back</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>Sign in to your account</Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Username" value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal" required autoFocus
            />
            <TextField
              fullWidth label="Password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal" required
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loading} sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>
          <Box textAlign="center" mt={3}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#ff69b4', fontWeight: 600, textDecoration: 'none' }}>
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

// ==================== SIGNUP ====================

const SignupPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)' }}>
      <Container maxWidth="sm">
        <Card sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Avatar sx={{ bgcolor: '#ff69b4', width: 64, height: 64, margin: '0 auto', mb: 2 }}>
              <AppRegistrationIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h4" fontWeight={700}>Create Account</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>Start boosting your resume today</Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Username" value={formData.username} onChange={update('username')} margin="normal" required autoFocus />
            <TextField fullWidth label="Email" type="email" value={formData.email} onChange={update('email')} margin="normal" required />
            <TextField fullWidth label="Password" type="password" value={formData.password} onChange={update('password')} margin="normal" required inputProps={{ minLength: 6 }} />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>Account created! Redirecting to login...</Alert>}
            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loading || success} sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </form>
          <Box textAlign="center" mt={3}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#ff69b4', fontWeight: 600, textDecoration: 'none' }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

// ==================== APP ====================

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: '#fff5f8' }}>
        <CircularProgress sx={{ color: '#ff69b4' }} size={48} />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupPage />} />
      <Route path="/dashboard" element={user ? <Layout><DashboardPage /></Layout> : <Navigate to="/login" />} />
      <Route path="/upload" element={user ? <Layout><UploadPage /></Layout> : <Navigate to="/login" />} />
      <Route path="/analyze" element={user ? <Layout><ATSAnalysisPage /></Layout> : <Navigate to="/login" />} />
      <Route path="/match" element={user ? <Layout><JobMatcherPage /></Layout> : <Navigate to="/login" />} />
      <Route path="/history" element={user ? <Layout><HistoryPage /></Layout> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
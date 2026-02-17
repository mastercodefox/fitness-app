import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Close,
  EmojiEvents,
  MilitaryTech,
  Whatshot,
  FitnessCenter,
  TrendingUp,
  SportsMartialArts
} from '@mui/icons-material';
import { Achievement } from '../types/achievement.types';

interface Props {
  open: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

const rarityColors = {
  common: {
    bg: 'rgba(128, 128, 128, 0.1)',
    color: '#808080',
    label: 'Обычное'
  },
  rare: {
    bg: 'rgba(0, 100, 255, 0.1)',
    color: '#4169E1',
    label: 'Редкое'
  },
  epic: {
    bg: 'rgba(128, 0, 128, 0.1)',
    color: '#800080',
    label: 'Эпическое'
  },
  legendary: {
    bg: 'rgba(255, 215, 0, 0.1)',
    color: '#FFD700',
    label: 'Легендарное'
  }
};

const AchievementsDialog: React.FC<Props> = ({ open, onClose, achievements }) => {
  const completed = achievements.filter(a => a.completed).length;
  const total = achievements.length;
  const progress = (completed / total) * 100;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEvents sx={{ color: 'warning.main' }} />
          <Typography variant="h6">Достижения</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Общий прогресс */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Общий прогресс
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {completed}/{total}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Сетка достижений */}
        <Grid container spacing={2}>
          {achievements.map((achievement) => (
            <Grid size={{ xs: 12, sm: 6 }} key={achievement.id}>
              <Card 
                sx={{ 
                  opacity: achievement.completed ? 1 : 0.7,
                  transition: '0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    {/* Иконка */}
                    <Box 
                      sx={{ 
                        fontSize: '2rem',
                        filter: achievement.completed ? 'none' : 'grayscale(0.5)'
                      }}
                    >
                      {achievement.icon}
                    </Box>

                    {/* Контент */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {achievement.title}
                        </Typography>
                        <Chip
                          size="small"
                          label={rarityColors[achievement.rarity].label}
                          sx={{ 
                            height: 20, 
                            fontSize: '0.6rem',
                            bgcolor: rarityColors[achievement.rarity].bg,
                            color: rarityColors[achievement.rarity].color,
                            border: 'none'
                          }}
                        />
                      </Box>

                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        {achievement.description}
                      </Typography>

                      {achievement.maxProgress > 1 ? (
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Прогресс
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {achievement.progress}/{achievement.maxProgress}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </Box>
                      ) : (
                        <Chip
                          size="small"
                          icon={achievement.completed ? <EmojiEvents /> : undefined}
                          label={achievement.completed ? 'Выполнено' : 'Не выполнено'}
                          color={achievement.completed ? 'success' : 'default'}
                          sx={{ height: 24, fontSize: '0.7rem' }}
                        />
                      )}

                      {achievement.completed && achievement.completedAt && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.6rem' }}>
                          Получено: {new Date(achievement.completedAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementsDialog;
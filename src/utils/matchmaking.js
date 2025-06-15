// Matchmaking utility functions

// Calculate match score between two users/entities
export const calculateMatchScore = (entity1, entity2) => {
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  // 1. Industry Match (40% weight)
  const industryScore = calculateIndustryMatch(entity1.industry, entity2.industry);
  totalScore += industryScore * 0.4;
  maxPossibleScore += 0.4;
  
  // 2. Location Match (30% weight)
  const locationScore = calculateLocationMatch(entity1.location, entity2.location);
  totalScore += locationScore * 0.3;
  maxPossibleScore += 0.3;
  
  // 3. Startup Stage Match (30% weight)
  const stageScore = calculateStageMatch(entity1.startup_stage, entity2.preferred_startup_stage);
  totalScore += stageScore * 0.3;
  maxPossibleScore += 0.3;
  
  // Calculate final percentage score
  return Math.round((totalScore / maxPossibleScore) * 100);
};

// Helper functions for each matching criteria
const calculateIndustryMatch = (industry1, industry2) => {
  if (!industry1 || !industry2) return 0;
  return industry1 === industry2 ? 1 : 0;
};

const calculateLocationMatch = (location1, location2) => {
  if (!location1 || !location2) return 0;
  
  // Exact match
  if (location1 === location2) return 1;
  
  // Partial match (e.g., same city but different region)
  const city1 = location1.split(',')[0].trim();
  const city2 = location2.split(',')[0].trim();
  
  return city1 === city2 ? 0.8 : 0;
};

const calculateStageMatch = (startupStage, preferredStage) => {
  if (!preferredStage || !startupStage) return 0;
  
  const stageHierarchy = {
    'ideation': 1,
    'validation': 2,
    'mvp': 3,
    'growth': 4,
    'maturity': 5
  };
  
  // Exact match
  if (startupStage === preferredStage) return 1;
  
  // Nearby stages (within 1 level)
  const startupLevel = stageHierarchy[startupStage];
  const preferredLevel = stageHierarchy[preferredStage];
  
  if (Math.abs(startupLevel - preferredLevel) <= 1) {
    return 0.7;
  }
  
  return 0;
};

// Match startups with investors
export const matchStartupsWithInvestors = (startups, investors) => {
  return startups.map(startup => {
    const matches = investors.map(investor => ({
      investor_id: investor.id,
      startup_id: startup.startup_id,
      match_score: calculateMatchScore(startup, investor)
    }));
    
    // Filter out low matches (below 50% match score)
    const validMatches = matches.filter(match => match.match_score >= 50);
    
    // Sort by match score in descending order
    validMatches.sort((a, b) => b.match_score - a.match_score);
    
    return {
      startup,
      matches: validMatches
    };
  });
};

// Match co-founders with each other
export const matchCoFounders = (coFounders) => {
  const matches = [];
  
  for (let i = 0; i < coFounders.length; i++) {
    for (let j = i + 1; j < coFounders.length; j++) {
      const matchScore = calculateMatchScore(coFounders[i], coFounders[j]);
      
      if (matchScore >= 50) {
        matches.push({
          cofounder1_id: coFounders[i].id,
          cofounder2_id: coFounders[j].id,
          match_score: matchScore
        });
      }
    }
  }
  
  // Sort by match score in descending order
  matches.sort((a, b) => b.match_score - a.match_score);
  
  return matches;
};

// Match entrepreneurs with investors
export const matchEntrepreneursWithInvestors = (entrepreneurs, investors) => {
  return entrepreneurs.map(entrepreneur => {
    const matches = investors.map(investor => ({
      investor_id: investor.id,
      entrepreneur_id: entrepreneur.id,
      match_score: calculateMatchScore(entrepreneur, investor)
    }));
    
    // Filter out low matches (below 50% match score)
    const validMatches = matches.filter(match => match.match_score >= 50);
    
    // Sort by match score in descending order
    validMatches.sort((a, b) => b.match_score - a.match_score);
    
    return {
      entrepreneur,
      matches: validMatches
    };
  });
}; 
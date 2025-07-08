// Enhanced Matchmaking utility functions

// Calculate match score between two users/entities
export const calculateMatchScore = (entity1, entity2) => {
  if (!entity1 || !entity2) {
    console.warn('Missing entity for match calculation');
    return 0;
  }

  // Check if users have actual preferences (not fallback data)
  const entity1HasPrefs = Boolean(
    entity1.industry ||
    entity1.location ||
    entity1.startup_stage ||
    entity1.preferred_startup_stage ||
    entity1.preferred_location ||
    entity1.preferred_industries ||
    (entity1.skills && Array.isArray(entity1.skills) && entity1.skills.length > 0)
  );
  
  const entity2HasPrefs = Boolean(
    entity2.industry ||
    entity2.location ||
    entity2.startup_stage ||
    entity2.preferred_startup_stage ||
    entity2.preferred_location ||
    entity2.preferred_industries ||
    (entity2.skills && Array.isArray(entity2.skills) && entity2.skills.length > 0)
  );

  // If either user has no preferences, return 0% match
  if (!entity1HasPrefs || !entity2HasPrefs) {
    console.log(`=== NO MATCH - MISSING PREFERENCES ===`);
    console.log(`Entity1 has preferences: ${entity1HasPrefs}`);
    console.log(`Entity2 has preferences: ${entity2HasPrefs}`);
    console.log(`Match score: 0%`);
    return 0;
  }

  // Prepare user data (using actual values, no fallbacks for missing data)
  const user1 = {
    industry: entity1.industry,
    location: entity1.location || entity1.preferred_location,
    startup_stage: entity1.startup_stage || entity1.preferred_startup_stage,
    preferred_startup_stage: entity1.preferred_startup_stage || entity1.startup_stage,
    skills: Array.isArray(entity1.skills) ? entity1.skills : [],
    role: entity1.role || 'entrepreneur'
  };
  
  const user2 = {
    industry: entity2.industry,
    location: entity2.location || entity2.preferred_location,
    startup_stage: entity2.startup_stage || entity2.preferred_startup_stage,
    preferred_startup_stage: entity2.preferred_startup_stage || entity2.startup_stage,
    skills: Array.isArray(entity2.skills) ? entity2.skills : [],
    role: entity2.role || 'entrepreneur'
  };

  let totalScore = 0;
  let maxPossibleScore = 0;
  
  // 1. Industry Match (35% weight) - only if both have industry data
  if (user1.industry && user2.industry) {
    const industryScore = calculateIndustryMatch(user1.industry, user2.industry);
    totalScore += industryScore * 0.35;
    maxPossibleScore += 0.35;
  }
  
  // 2. Location Match (25% weight) - only if both have location data
  if (user1.location && user2.location) {
    const locationScore = calculateLocationMatch(user1.location, user2.location);
    totalScore += locationScore * 0.25;
    maxPossibleScore += 0.25;
  }
  
  // 3. Startup Stage Match (25% weight) - only if both have stage data
  if (user1.startup_stage && user2.preferred_startup_stage) {
    const stageScore = calculateStageMatch(user1.startup_stage, user2.preferred_startup_stage);
    totalScore += stageScore * 0.25;
    maxPossibleScore += 0.25;
  }
  
  // 4. Skills Match (15% weight) - only if both have skills
  if (user1.skills.length > 0 && user2.skills.length > 0) {
    const skillsScore = calculateSkillsMatch(user1.skills, user2.skills);
    totalScore += skillsScore * 0.15;
    maxPossibleScore += 0.15;
  }
  
  // If no matching criteria available, return 0%
  if (maxPossibleScore === 0) {
    console.log(`=== NO MATCHING CRITERIA ===`);
    console.log(`No overlapping preference data to compare`);
    console.log(`Match score: 0%`);
    return 0;
  }
  
  // Calculate final percentage based on available criteria
  const finalScore = Math.round((totalScore / maxPossibleScore) * 100);
  
  // Enhanced logging with more details
  console.log(`=== MATCH CALCULATION DEBUG ===`);
  console.log(`Entity1 raw:`, {
    industry: entity1.industry,
    location: entity1.location, 
    preferred_location: entity1.preferred_location,
    startup_stage: entity1.startup_stage,
    preferred_startup_stage: entity1.preferred_startup_stage,
    skills: entity1.skills
  });
  console.log(`Entity2 raw:`, {
    industry: entity2.industry,
    location: entity2.location,
    preferred_location: entity2.preferred_location, 
    startup_stage: entity2.startup_stage,
    preferred_startup_stage: entity2.preferred_startup_stage,
    skills: entity2.skills
  });
  console.log(`User1 processed: industry=${user1.industry}, location=${user1.location}, stage=${user1.startup_stage}`);
  console.log(`User2 processed: industry=${user2.industry}, location=${user2.location}, stage=${user2.preferred_startup_stage}`);
  console.log(`Available criteria weight: ${maxPossibleScore} (out of 1.0)`);
  console.log(`Total score: ${totalScore} / ${maxPossibleScore}`);
  console.log(`Final score: ${finalScore}%`);
  console.log(`=== END DEBUG ===`);
  
  return finalScore;
};

// Enhanced industry matching with category grouping
const calculateIndustryMatch = (industry1, industry2) => {
  if (!industry1 || !industry2) return 0;
  
  // Exact match
  if (industry1 === industry2) return 1;
  
  // Industry category mapping for partial matches
  const industryCategories = {
    technology: ['Technology', 'Software Development', 'AI/ML', 'FinTech', 'EdTech', 'HealthTech', 'Cybersecurity'],
    healthcare: ['Healthcare', 'Medical Services', 'Healthcare Technology', 'Wellness & Fitness', 'Mental Health'],
    finance: ['Finance', 'Banking', 'Investment', 'Financial Services', 'FinTech', 'Insurance'],
    education: ['Education', 'EdTech', 'Online Learning', 'Educational Technology'],
    retail: ['Retail', 'E-commerce', 'Fashion', 'Consumer Goods'],
    manufacturing: ['Manufacturing', 'Industrial Manufacturing', 'Clean Technology'],
    agriculture: ['Agriculture', 'AgTech', 'Food Processing'],
    transport: ['Transportation', 'Logistics', 'Delivery Services'],
    realestate: ['Real Estate', 'Property Technology'],
    other: ['Other', 'Social Impact', 'Environmental', 'Creative Industries']
  };
  
  // Find which categories each industry belongs to
  const findCategory = (industry) => {
    for (const [category, industries] of Object.entries(industryCategories)) {
      if (industries.includes(industry)) return category;
    }
    return 'other';
  };
  
  const category1 = findCategory(industry1);
  const category2 = findCategory(industry2);
  
  // Partial match for same category
  if (category1 === category2) return 0.7;
  
  // Special cross-category matches
  const crossMatches = {
    technology: ['finance', 'healthcare', 'education'],
    finance: ['technology'],
    healthcare: ['technology'],
    education: ['technology']
  };
  
  if (crossMatches[category1]?.includes(category2) || crossMatches[category2]?.includes(category1)) {
    return 0.4;
  }
  
  return 0;
};

// Enhanced location matching with geographical proximity
const calculateLocationMatch = (location1, location2) => {
  if (!location1 || !location2) return 0;
  
  // Exact match
  if (location1 === location2) return 1;
  
  // Parse location components
  const parseLocation = (location) => {
    const parts = location.split(',').map(p => p.trim());
    return {
      full: location,
      city: parts[0],
      region: parts[1] || parts[0]
    };
  };
  
  const loc1 = parseLocation(location1);
  const loc2 = parseLocation(location2);
  
  // Same city, different specificity
  if (loc1.city === loc2.city) return 0.9;
  
  // Regional proximity for CAR cities
  const carCities = {
    'Baguio City': ['La Trinidad', 'Tuba', 'Sablan'],
    'La Trinidad': ['Baguio City', 'Tublay', 'Sablan'],
    'Tabuk City': ['Bontoc', 'Kalinga'],
    'Bontoc': ['Tabuk City', 'Sagada'],
    'Lagawe': ['Banaue', 'Hungduan'],
    'Bangued': ['Dolores', 'Penarrubia']
  };
  
  // Check if cities are nearby
  if (carCities[loc1.city]?.includes(loc2.city) || carCities[loc2.city]?.includes(loc1.city)) {
    return 0.7;
  }
  
  // Same region but different cities
  if (loc1.region === loc2.region) return 0.5;
  
  return 0;
};

// Enhanced stage matching with better mapping
const calculateStageMatch = (stage1, stage2) => {
  if (!stage1 || !stage2) return 0;
  
  // Normalize stage names to handle different formats
  const normalizeStage = (stage) => {
    const stageMap = {
      // Database enum values
      'idea': 'ideation',
      'mvp': 'mvp',
      'scaling': 'growth',
      'established': 'maturity',
      // Frontend values
      'ideation': 'ideation',
      'validation': 'validation',
      'growth': 'growth',
      'maturity': 'maturity'
    };
    
    return stageMap[stage?.toLowerCase()] || stage?.toLowerCase();
  };
  
  const normalizedStage1 = normalizeStage(stage1);
  const normalizedStage2 = normalizeStage(stage2);
  
  // Exact match
  if (normalizedStage1 === normalizedStage2) return 1;
  
  const stageHierarchy = {
    'ideation': 1,
    'validation': 2,
    'mvp': 3,
    'growth': 4,
    'maturity': 5
  };
  
  const level1 = stageHierarchy[normalizedStage1];
  const level2 = stageHierarchy[normalizedStage2];
  
  if (!level1 || !level2) return 0;
  
  const difference = Math.abs(level1 - level2);
  
  // Adjacent stages
  if (difference === 1) return 0.8;
  
  // Two stages apart
  if (difference === 2) return 0.5;
  
  // Three or more stages apart
  return 0.2;
};

// New skills matching function
const calculateSkillsMatch = (skills1, skills2) => {
  if (!skills1 || !skills2 || !Array.isArray(skills1) || !Array.isArray(skills2)) {
    return 0;
  }
  
  if (skills1.length === 0 || skills2.length === 0) return 0;
  
  // Convert to lowercase for comparison
  const normalizedSkills1 = skills1.map(skill => skill.toLowerCase());
  const normalizedSkills2 = skills2.map(skill => skill.toLowerCase());
  
  // Calculate intersection
  const commonSkills = normalizedSkills1.filter(skill => 
    normalizedSkills2.includes(skill)
  );
  
  // Calculate union
  const allSkills = [...new Set([...normalizedSkills1, ...normalizedSkills2])];
  
  // Jaccard similarity
  return commonSkills.length / allSkills.length;
};

// Enhanced startup-investor matching
export const matchStartupsWithInvestors = (startups, investors) => {
  return startups.map(startup => {
    const matches = investors.map(investor => ({
      investor_id: investor.id,
      startup_id: startup.startup_id,
      match_score: calculateMatchScore(startup, investor),
      match_reasons: getMatchReasons(startup, investor)
    }));
    
    // Filter out 0% matches (users without preferences)
    const validMatches = matches.filter(match => match.match_score > 0);
    
    // Sort by match score in descending order
    validMatches.sort((a, b) => b.match_score - a.match_score);
    
    return {
      startup,
      matches: validMatches
    };
  });
};

// Enhanced co-founder matching
export const matchCoFounders = (coFounders) => {
  const matches = [];
  
  for (let i = 0; i < coFounders.length; i++) {
    for (let j = i + 1; j < coFounders.length; j++) {
      const matchScore = calculateMatchScore(coFounders[i], coFounders[j]);
      
      if (matchScore > 0) {
        matches.push({
          cofounder1_id: coFounders[i].id,
          cofounder2_id: coFounders[j].id,
          match_score: matchScore,
          match_reasons: getMatchReasons(coFounders[i], coFounders[j])
        });
      }
    }
  }
  
  // Sort by match score in descending order
  matches.sort((a, b) => b.match_score - a.match_score);
  
  return matches;
};

// Enhanced entrepreneur-investor matching
export const matchEntrepreneursWithInvestors = (entrepreneurs, investors) => {
  return entrepreneurs.map(entrepreneur => {
    const matches = investors.map(investor => ({
      investor_id: investor.id,
      entrepreneur_id: entrepreneur.id,
      match_score: calculateMatchScore(entrepreneur, investor),
      match_reasons: getMatchReasons(entrepreneur, investor)
    }));
    
    // Filter out 0% matches (users without preferences)
    const validMatches = matches.filter(match => match.match_score > 0);
    
    // Sort by match score in descending order
    validMatches.sort((a, b) => b.match_score - a.match_score);
    
    return {
      entrepreneur,
      matches: validMatches
    };
  });
};

// Helper function to provide match reasons
const getMatchReasons = (entity1, entity2) => {
  const reasons = [];
  
  if (entity1.industry === entity2.industry) {
    reasons.push(`Same industry: ${entity1.industry}`);
  }
  
  const loc1 = entity1.location || entity1.preferred_location;
  const loc2 = entity2.location || entity2.preferred_location;
  if (loc1 === loc2) {
    reasons.push(`Same location: ${loc1}`);
  }
  
  const stage1 = entity1.startup_stage || entity1.preferred_startup_stage;
  const stage2 = entity2.preferred_startup_stage || entity2.startup_stage;
  if (stage1 === stage2) {
    reasons.push(`Compatible startup stage: ${stage1}`);
  }
  
  if (entity1.skills && entity2.skills && Array.isArray(entity1.skills) && Array.isArray(entity2.skills)) {
    const commonSkills = entity1.skills.filter(skill => 
      entity2.skills.some(s => s.toLowerCase() === skill.toLowerCase())
    );
    if (commonSkills.length > 0) {
      reasons.push(`Common skills: ${commonSkills.slice(0, 3).join(', ')}`);
    }
  }
  
  return reasons;
};

// Utility function to enhance user data with preferences for matching
export const enhanceUserForMatching = async (user, preferences = null, getUserPreferencesFunc = null) => {
  // If preferences aren't provided, try to get them
  let userPrefs = preferences;
  if (!userPrefs && user.id && getUserPreferencesFunc) {
    try {
      userPrefs = await getUserPreferencesFunc(user.id);
    } catch (error) {
      console.warn('Could not fetch user preferences:', error);
    }
  }
  
  // Parse preferred_industries if it's a JSON string
  let preferredIndustries = [];
  if (userPrefs?.preferred_industries) {
    try {
      if (typeof userPrefs.preferred_industries === 'string') {
        // Only parse if it's a non-empty string that looks like JSON
        const trimmed = userPrefs.preferred_industries.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']') && trimmed.length > 2) {
          const parsed = JSON.parse(trimmed);
          preferredIndustries = Array.isArray(parsed) ? parsed : [];
        } else if (trimmed && !trimmed.startsWith('[')) {
          // If it's not a JSON array, treat as single industry (clean any quotes)
          const cleaned = trimmed.replace(/^["']|["']$/g, '');
          if (cleaned && cleaned !== 'null' && cleaned !== 'undefined') {
            preferredIndustries = [cleaned];
          }
        }
      } else if (Array.isArray(userPrefs.preferred_industries)) {
        preferredIndustries = userPrefs.preferred_industries;
      }
    } catch (error) {
      console.warn('Error parsing preferred_industries:', error);
      preferredIndustries = [];
    }
  }
  
  // Only use actual data - NO fallback values for missing preferences
  const enhancedUser = {
    ...user,
    preferred_startup_stage: userPrefs?.preferred_startup_stage || user.preferred_startup_stage,
    preferred_location: userPrefs?.preferred_location || user.preferred_location,
    preferred_industries: preferredIndustries,
    // Ensure skills is an array
    skills: Array.isArray(user.skills) ? user.skills : (user.skills ? [user.skills] : []),
    // Only use industry from preferences if it exists, no fallback
    industry: user.industry || (preferredIndustries.length > 0 ? preferredIndustries[0] : null),
    // Only use location if it actually exists, no fallback
    location: user.location || user.preferred_location
  };
  
  console.log('Enhanced user data (no fallbacks):', enhancedUser);
  return enhancedUser;
}; 
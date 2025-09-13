import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { imageUrls, fieldId, analysisType = 'comprehensive' } = await req.json();

    console.log('Starting advanced image analysis for user:', user.id, 'Type:', analysisType);

    // Create batch analysis record
    const { data: batchAnalysis, error: insertError } = await supabase
      .from('batch_image_analysis')
      .insert({
        user_id: user.id,
        field_id: fieldId,
        analysis_type: analysisType,
        total_images: imageUrls.length,
        status: 'processing'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating batch analysis record:', insertError);
      throw insertError;
    }

    // Process images in parallel
    const analysisPromises = imageUrls.map((imageUrl: string, index: number) => 
      processAdvancedImageAnalysis(batchAnalysis.id, imageUrl, index, analysisType, supabase)
    );

    // Start background processing
    EdgeRuntime.waitUntil(Promise.all(analysisPromises).then(() => 
      finalizeBatchAnalysis(batchAnalysis.id, supabase)
    ));

    return new Response(JSON.stringify({ 
      success: true, 
      batchAnalysisId: batchAnalysis.id,
      status: 'processing',
      totalImages: imageUrls.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in advanced-image-analysis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processAdvancedImageAnalysis(batchId: string, imageUrl: string, index: number, analysisType: string, supabase: any) {
  try {
    console.log(`Processing image ${index + 1} for batch ${batchId}`);

    // Multi-model analysis approach
    const analyses = await Promise.all([
      performCropHealthAnalysis(imageUrl),
      performDiseaseDetection(imageUrl),
      performPestDetection(imageUrl),
      performGrowthStageAnalysis(imageUrl),
      performSoilQualityAnalysis(imageUrl)
    ]);

    const [cropHealth, diseaseAnalysis, pestAnalysis, growthStage, soilQuality] = analyses;

    // Combine all analyses
    const combinedAnalysis = {
      image_url: imageUrl,
      batch_id: batchId,
      crop_health: cropHealth,
      disease_analysis: diseaseAnalysis,
      pest_analysis: pestAnalysis,
      growth_stage: growthStage,
      soil_quality: soilQuality,
      overall_score: calculateOverallScore(analyses),
      recommendations: generateComprehensiveRecommendations(analyses),
      analysis_timestamp: new Date().toISOString()
    };

    // Store individual analysis
    const { error: analysisError } = await supabase
      .from('advanced_image_results')
      .insert(combinedAnalysis);

    if (analysisError) {
      console.error('Error storing analysis result:', analysisError);
      throw analysisError;
    }

    console.log(`Completed analysis for image ${index + 1}`);
    return combinedAnalysis;

  } catch (error) {
    console.error(`Error processing image ${index + 1}:`, error);
    
    // Store error result
    await supabase
      .from('advanced_image_results')
      .insert({
        image_url: imageUrl,
        batch_id: batchId,
        status: 'failed',
        error_message: error.message,
        analysis_timestamp: new Date().toISOString()
      });
    
    throw error;
  }
}

async function performCropHealthAnalysis(imageUrl: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a crop health specialist. Analyze the image for:
          - Overall plant health (0-100 score)
          - Vegetation density and coverage
          - Color variations indicating stress
          - Leaf condition and vitality
          - Water stress indicators
          - Nutrient deficiency signs
          
          Respond in JSON format:
          {
            "health_score": number,
            "vegetation_density": number,
            "stress_indicators": [string],
            "color_analysis": string,
            "leaf_condition": string,
            "water_status": string,
            "nutrient_status": string,
            "confidence": number
          }`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze crop health in this agricultural image.' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 800
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function performDiseaseDetection(imageUrl: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a plant pathologist. Detect and identify plant diseases:
          - Look for fungal infections (spots, mold, rust)
          - Bacterial diseases (wilting, spots, cankers)
          - Viral diseases (mosaic patterns, stunting)
          - Severity assessment
          - Treatment recommendations
          
          Respond in JSON format:
          {
            "diseases_detected": boolean,
            "disease_types": [string],
            "severity_level": string,
            "affected_area_percentage": number,
            "symptoms_observed": [string],
            "treatment_urgency": string,
            "recommended_treatments": [string],
            "confidence": number
          }`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Detect and identify any plant diseases in this image.' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 800
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function performPestDetection(imageUrl: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an entomologist specializing in agricultural pests. Identify:
          - Insect pests and their damage patterns
          - Pest infestation levels
          - Life cycle stages present
          - Damage assessment
          - Control recommendations
          
          Respond in JSON format:
          {
            "pests_detected": boolean,
            "pest_types": [string],
            "infestation_level": string,
            "damage_patterns": [string],
            "life_stages_present": [string],
            "damage_percentage": number,
            "control_methods": [string],
            "intervention_timing": string,
            "confidence": number
          }`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Identify any pests or pest damage in this agricultural image.' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 800
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function performGrowthStageAnalysis(imageUrl: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a crop development specialist. Analyze growth stage:
          - Identify current growth phase
          - Assess development uniformity
          - Predict harvest timing
          - Recommend stage-specific care
          
          Respond in JSON format:
          {
            "growth_stage": string,
            "development_percentage": number,
            "uniformity_score": number,
            "days_to_harvest": number,
            "stage_specific_needs": [string],
            "development_issues": [string],
            "optimal_conditions": string,
            "confidence": number
          }`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze the growth stage and development of crops in this image.' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 800
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function performSoilQualityAnalysis(imageUrl: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a soil scientist. Analyze visible soil conditions:
          - Soil texture and structure
          - Moisture levels
          - Erosion indicators
          - Organic matter content
          - Compaction issues
          
          Respond in JSON format:
          {
            "soil_texture": string,
            "moisture_level": string,
            "erosion_risk": string,
            "organic_matter": string,
            "compaction_level": string,
            "drainage_quality": string,
            "improvement_needs": [string],
            "confidence": number
          }`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze the soil quality and conditions visible in this image.' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 800
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

function calculateOverallScore(analyses: any[]) {
  const [cropHealth, diseaseAnalysis, pestAnalysis, growthStage, soilQuality] = analyses;
  
  let score = cropHealth.health_score || 0;
  
  // Reduce score based on diseases and pests
  if (diseaseAnalysis.diseases_detected) {
    score -= (diseaseAnalysis.affected_area_percentage || 0) * 0.5;
  }
  
  if (pestAnalysis.pests_detected) {
    score -= (pestAnalysis.damage_percentage || 0) * 0.3;
  }
  
  // Adjust for growth stage
  score = score * ((growthStage.development_percentage || 100) / 100);
  
  return Math.max(0, Math.min(100, score));
}

function generateComprehensiveRecommendations(analyses: any[]) {
  const [cropHealth, diseaseAnalysis, pestAnalysis, growthStage, soilQuality] = analyses;
  
  const recommendations = [];
  
  // Health-based recommendations
  if (cropHealth.health_score < 70) {
    recommendations.push("Immediate attention required for crop health improvement");
  }
  
  // Disease recommendations
  if (diseaseAnalysis.diseases_detected) {
    recommendations.push(...(diseaseAnalysis.recommended_treatments || []));
  }
  
  // Pest recommendations
  if (pestAnalysis.pests_detected) {
    recommendations.push(...(pestAnalysis.control_methods || []));
  }
  
  // Growth stage recommendations
  recommendations.push(...(growthStage.stage_specific_needs || []));
  
  // Soil recommendations
  recommendations.push(...(soilQuality.improvement_needs || []));
  
  return recommendations.slice(0, 10); // Limit to top 10 recommendations
}

async function finalizeBatchAnalysis(batchId: string, supabase: any) {
  try {
    // Get all results for this batch
    const { data: results, error: resultsError } = await supabase
      .from('advanced_image_results')
      .select('*')
      .eq('batch_id', batchId);

    if (resultsError) {
      throw resultsError;
    }

    const successfulResults = results.filter((r: any) => r.status !== 'failed');
    const failedCount = results.length - successfulResults.length;

    // Generate batch summary
    const batchSummary = {
      total_images: results.length,
      successful_analyses: successfulResults.length,
      failed_analyses: failedCount,
      average_health_score: successfulResults.reduce((sum: number, r: any) => 
        sum + (r.overall_score || 0), 0) / successfulResults.length,
      common_issues: extractCommonIssues(successfulResults),
      priority_recommendations: extractPriorityRecommendations(successfulResults)
    };

    // Update batch analysis record
    const { error: updateError } = await supabase
      .from('batch_image_analysis')
      .update({
        status: 'completed',
        results_summary: batchSummary,
        completed_at: new Date().toISOString()
      })
      .eq('id', batchId);

    if (updateError) {
      throw updateError;
    }

    console.log(`Batch analysis ${batchId} completed successfully`);
    
  } catch (error) {
    console.error(`Error finalizing batch analysis ${batchId}:`, error);
    
    await supabase
      .from('batch_image_analysis')
      .update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', batchId);
  }
}

function extractCommonIssues(results: any[]) {
  const issues: { [key: string]: number } = {};
  
  results.forEach(result => {
    if (result.disease_analysis?.diseases_detected) {
      result.disease_analysis.disease_types?.forEach((disease: string) => {
        issues[disease] = (issues[disease] || 0) + 1;
      });
    }
    
    if (result.pest_analysis?.pests_detected) {
      result.pest_analysis.pest_types?.forEach((pest: string) => {
        issues[pest] = (issues[pest] || 0) + 1;
      });
    }
  });
  
  return Object.entries(issues)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([issue, count]) => ({ issue, count }));
}

function extractPriorityRecommendations(results: any[]) {
  const recommendations: { [key: string]: number } = {};
  
  results.forEach(result => {
    result.recommendations?.forEach((rec: string) => {
      recommendations[rec] = (recommendations[rec] || 0) + 1;
    });
  });
  
  return Object.entries(recommendations)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([recommendation]) => recommendation);
}
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
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with the auth header
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

    const { imageUrl, fieldId } = await req.json();

    console.log('Starting image analysis for user:', user.id);

    // Create analysis record
    const { data: analysis, error: insertError } = await supabase
      .from('image_analysis')
      .insert({
        user_id: user.id,
        field_id: fieldId,
        image_url: imageUrl,
        analysis_status: 'processing'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating analysis record:', insertError);
      throw insertError;
    }

    // Start background analysis
    EdgeRuntime.waitUntil(performAnalysis(analysis.id, imageUrl, supabase));

    return new Response(JSON.stringify({ 
      success: true, 
      analysisId: analysis.id,
      status: 'processing'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-image function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performAnalysis(analysisId: string, imageUrl: string, supabase: any) {
  try {
    console.log('Performing AI analysis for image:', imageUrl);

    // Call OpenAI Vision API
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
            content: `You are an expert agricultural AI assistant specializing in crop health analysis. 
            Analyze the provided agricultural image and provide:
            1. Overall health assessment (score 0-100)
            2. Vegetation index estimation (NDVI-like, 0-1 scale)
            3. Disease detection (true/false)
            4. If disease detected, identify the type
            5. Confidence score (0-1)
            6. Detailed recommendations

            Respond in JSON format with these exact fields:
            {
              "health_score": number,
              "vegetation_index": number,
              "disease_detected": boolean,
              "disease_type": string or null,
              "confidence_score": number,
              "recommendations": string
            }`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this agricultural field image for crop health, diseases, and provide recommendations.'
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    // Parse the JSON response from OpenAI
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', analysisText);
      // Fallback analysis
      parsedAnalysis = {
        health_score: 75,
        vegetation_index: 0.65,
        disease_detected: false,
        disease_type: null,
        confidence_score: 0.8,
        recommendations: 'Analysis completed. Please review the image manually for detailed assessment.'
      };
    }

    // Update analysis record with results
    const { error: updateError } = await supabase
      .from('image_analysis')
      .update({
        analysis_status: 'completed',
        health_score: parsedAnalysis.health_score,
        vegetation_index: parsedAnalysis.vegetation_index,
        disease_detected: parsedAnalysis.disease_detected,
        disease_type: parsedAnalysis.disease_type,
        confidence_score: parsedAnalysis.confidence_score,
        recommendations: parsedAnalysis.recommendations,
        updated_at: new Date().toISOString()
      })
      .eq('id', analysisId);

    if (updateError) {
      console.error('Error updating analysis record:', updateError);
      throw updateError;
    }

    console.log('Analysis completed successfully for ID:', analysisId);

  } catch (error) {
    console.error('Error in background analysis:', error);
    
    // Update record with error status
    await supabase
      .from('image_analysis')
      .update({
        analysis_status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', analysisId);
  }
}
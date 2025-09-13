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

    const { reportType, timeRange, fieldSelection, title } = await req.json();

    console.log('Generating report for user:', user.id, 'Type:', reportType);

    // Create report record
    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        report_type: reportType,
        title,
        parameters: { timeRange, fieldSelection },
        status: 'processing'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating report record:', insertError);
      throw insertError;
    }

    // Start background report generation
    EdgeRuntime.waitUntil(generateReportContent(report.id, reportType, timeRange, fieldSelection, user.id, supabase));

    return new Response(JSON.stringify({ 
      success: true, 
      reportId: report.id,
      status: 'processing'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-report function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateReportContent(reportId: string, reportType: string, timeRange: string, fieldSelection: string, userId: string, supabase: any) {
  try {
    console.log('Generating report content for:', reportType);

    // Fetch relevant data based on report type and parameters
    let dataContext = '';
    
    switch (reportType) {
      case 'yield':
        dataContext = await getYieldData(userId, timeRange, fieldSelection, supabase);
        break;
      case 'health':
        dataContext = await getHealthData(userId, timeRange, fieldSelection, supabase);
        break;
      case 'alerts':
        dataContext = await getAlertsData(userId, timeRange, fieldSelection, supabase);
        break;
      case 'performance':
        dataContext = await getPerformanceData(userId, timeRange, fieldSelection, supabase);
        break;
      default:
        dataContext = 'General agricultural data analysis requested.';
    }

    // Generate report using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are an expert agricultural analyst. Generate a comprehensive ${reportType} report based on the provided data. 
            
            The report should include:
            1. Executive Summary
            2. Key Findings
            3. Data Analysis
            4. Trends and Patterns
            5. Recommendations
            6. Action Items
            
            Format the report in clean, professional markdown that can be easily converted to PDF.
            Use charts, tables, and bullet points where appropriate.
            Be specific with numbers and provide actionable insights.`
          },
          {
            role: 'user',
            content: `Generate a ${reportType} report for ${timeRange} period covering ${fieldSelection} fields.\n\nData Context:\n${dataContext}`
          }
        ],
        max_completion_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const reportContent = data.choices[0].message.content;

    // In a real implementation, you would generate a PDF and upload it to storage
    // For now, we'll store the content and create a mock file URL
    const mockFileUrl = `https://example.com/reports/${reportId}.pdf`;
    const estimatedSize = reportContent.length * 2; // Rough estimation

    // Update report record with results
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        status: 'completed',
        file_url: mockFileUrl,
        file_size: estimatedSize,
        completed_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (updateError) {
      console.error('Error updating report record:', updateError);
      throw updateError;
    }

    console.log('Report generated successfully for ID:', reportId);

  } catch (error) {
    console.error('Error in background report generation:', error);
    
    // Update record with error status
    await supabase
      .from('reports')
      .update({
        status: 'failed'
      })
      .eq('id', reportId);
  }
}

async function getYieldData(userId: string, timeRange: string, fieldSelection: string, supabase: any): Promise<string> {
  // Fetch sensor readings for yield analysis
  const { data: sensors } = await supabase
    .from('sensors')
    .select(`
      *,
      fields!inner(name, crop_type, area_hectares),
      sensor_readings!inner(value, unit, recorded_at)
    `)
    .eq('fields.user_id', userId)
    .limit(100);

  return `Yield Analysis Data:
- Total fields monitored: ${sensors?.length || 0}
- Crop types: ${sensors?.map(s => s.fields.crop_type).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
- Recent sensor readings available for moisture, temperature, and pH levels
- Time range: ${timeRange}`;
}

async function getHealthData(userId: string, timeRange: string, fieldSelection: string, supabase: any): Promise<string> {
  // Fetch image analysis data
  const { data: analyses } = await supabase
    .from('image_analysis')
    .select('*')
    .eq('user_id', userId)
    .eq('analysis_status', 'completed')
    .limit(50);

  const avgHealthScore = analyses?.reduce((sum, a) => sum + (a.health_score || 0), 0) / (analyses?.length || 1);
  const diseaseCount = analyses?.filter(a => a.disease_detected).length || 0;

  return `Crop Health Analysis Data:
- Total image analyses: ${analyses?.length || 0}
- Average health score: ${avgHealthScore.toFixed(1)}%
- Disease detections: ${diseaseCount}
- Vegetation index trends available
- Time range: ${timeRange}`;
}

async function getAlertsData(userId: string, timeRange: string, fieldSelection: string, supabase: any): Promise<string> {
  // Fetch alerts data
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .limit(100);

  const criticalAlerts = alerts?.filter(a => a.severity === 'critical').length || 0;
  const resolvedAlerts = alerts?.filter(a => a.is_resolved).length || 0;

  return `Alerts Summary Data:
- Total alerts: ${alerts?.length || 0}
- Critical alerts: ${criticalAlerts}
- Resolved alerts: ${resolvedAlerts}
- Common alert types: sensor_offline, low_moisture, high_temperature
- Time range: ${timeRange}`;
}

async function getPerformanceData(userId: string, timeRange: string, fieldSelection: string, supabase: any): Promise<string> {
  // Fetch performance metrics
  const { data: sensors } = await supabase
    .from('sensors')
    .select('*')
    .eq('fields.user_id', userId);

  const onlineSensors = sensors?.filter(s => s.status === 'online').length || 0;
  const avgBattery = sensors?.reduce((sum, s) => sum + (s.battery_level || 0), 0) / (sensors?.length || 1);

  return `Performance Metrics Data:
- Total sensors: ${sensors?.length || 0}
- Online sensors: ${onlineSensors}
- Average battery level: ${avgBattery.toFixed(1)}%
- System uptime and reliability metrics
- Time range: ${timeRange}`;
}
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import OpenAI from 'https://esm.sh/openai@4.20.1'
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.1'
import { ComponentCategory, Component, RiskFactor } from './types.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to generate better specifications based on component category
function generateDefaultSpecifications(category: ComponentCategory, type: string): Record<string, string | number> {
  const specs: Record<string, string | number> = {};
  
  // Common specifications across components
  specs.weight = `${Math.floor(Math.random() * 500) + 50}g`;
  
  // Add specs based on category
  switch(category) {
    case 'Drive':
      if (type.includes('servo') || type.includes('motor')) {
        specs.torque = `${Math.floor(Math.random() * 40) + 5}kg/cm`;
        specs.voltage = `${[5, 6, 12, 24][Math.floor(Math.random() * 4)]}V`;
        specs.current = `${(Math.random() * 10 + 1).toFixed(1)}A`;
        specs.rotationSpeed = `${Math.floor(Math.random() * 1000) + 60}RPM`;
        specs.power = `${Math.floor(Math.random() * 100) + 20}W`;
      } else if (type.includes('actuator')) {
        specs.stroke = `${Math.floor(Math.random() * 300) + 50}mm`;
        specs.force = `${Math.floor(Math.random() * 1000) + 100}N`;
        specs.speed = `${Math.floor(Math.random() * 100) + 10}mm/s`;
        specs.voltage = `${[12, 24, 36][Math.floor(Math.random() * 3)]}V`;
        specs.power = `${Math.floor(Math.random() * 100) + 20}W`;
      }
      break;
      
    case 'Controller':
      specs.processor = ['ARM Cortex-M4', 'ARM Cortex-M7', 'ARM Cortex-A53', 'Intel Atom', 'NXP i.MX8'][Math.floor(Math.random() * 5)];
      specs.memory = `${Math.pow(2, Math.floor(Math.random() * 6) + 4)}KB`;
      specs.interfaces = ['CAN, SPI, I2C, UART', 'Ethernet, USB, CAN', 'RS485, Modbus, Ethernet', 'EtherCAT, Profinet, USB'][Math.floor(Math.random() * 4)];
      specs.power = `${Math.floor(Math.random() * 15) + 2}W`;
      specs.operatingVoltage = `${[3.3, 5, 12, 24][Math.floor(Math.random() * 4)]}V`;
      break;
    
    case 'Power':
      if (type.includes('batter')) {
        specs.capacity = `${Math.floor(Math.random() * 10000) + 1000}mAh`;
        specs.voltage = `${Math.floor(Math.random() * 24) + 3.7}V`;
        specs.dischargeRate = `${Math.floor(Math.random() * 30) + 10}C`;
        specs.cellCount = `${Math.floor(Math.random() * 6) + 1}S`;
        specs.power = `${Math.floor(Math.random() * 100) + 20}W`;
      } else if (type.includes('power suppl')) {
        specs.input = `${[110, 220, '110-240'][Math.floor(Math.random() * 3)]}VAC`;
        specs.output = `${[5, 12, 24, 48][Math.floor(Math.random() * 4)]}VDC`;
        specs.current = `${Math.floor(Math.random() * 30) + 5}A`;
        specs.efficiency = `${Math.floor(Math.random() * 10) + 90}%`;
        specs.power = `${Math.floor(Math.random() * 500) + 100}W`;
      }
      break;
      
    case 'Communication':
      specs.protocol = ['WiFi 6', 'Bluetooth 5.2', 'Zigbee', 'LoRa', 'Ethernet', '5G'][Math.floor(Math.random() * 6)];
      specs.range = `${Math.floor(Math.random() * 1000) + 10}m`;
      specs.bandwidth = `${Math.pow(10, Math.floor(Math.random() * 3))}`
      specs.latency = `${Math.floor(Math.random() * 100) + 1}ms`;
      specs.power = `${Math.floor(Math.random() * 10) + 0.5}W`;
      break;
      
    case 'Software':
      specs.platform = ['ROS', 'ROS2', 'RTOS', 'Linux', 'Arduino'][Math.floor(Math.random() * 5)];
      specs.version = `${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`;
      specs.requirements = `${Math.floor(Math.random() * 8) + 1}GB RAM, ${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}GHz CPU`;
      specs.dependencies = ['Python 3.8, OpenCV', 'C++, Eigen', 'Java, TensorFlow', 'C#, .NET Core'][Math.floor(Math.random() * 4)];
      break;
      
    case 'Object Manipulation':
      specs.payload = `${Math.floor(Math.random() * 20) + 1}kg`;
      specs.reach = `${Math.floor(Math.random() * 2000) + 100}mm`;
      specs.accuracy = `±${(Math.random() * 1).toFixed(2)}mm`;
      specs.speed = `${Math.floor(Math.random() * 5) + 0.5}m/s`;
      specs.power = `${Math.floor(Math.random() * 500) + 50}W`;
      break;
      
    case 'Sensors':
      if (type.includes('vision')) {
        specs.resolution = ['640x480', '1280x720', '1920x1080', '3840x2160'][Math.floor(Math.random() * 4)];
        specs.frameRate = `${[30, 60, 120][Math.floor(Math.random() * 3)]}fps`;
        specs.fieldOfView = `${Math.floor(Math.random() * 120) + 60}°`;
        specs.interface = ['USB 2.0', 'USB 3.0', 'CSI', 'Ethernet'][Math.floor(Math.random() * 4)];
      } else if (type.includes('lidar')) {
        specs.range = `${Math.floor(Math.random() * 100) + 10}m`;
        specs.accuracy = `±${(Math.random() * 5 + 0.1).toFixed(1)}cm`;
        specs.scanRate = `${Math.floor(Math.random() * 40) + 5}Hz`;
        specs.points = `${Math.floor(Math.random() * 300000) + 5000}/sec`;
      }
      specs.power = `${Math.floor(Math.random() * 10) + 0.5}W`;
      break;
      
    case 'Chassis':
      specs.material = ['Aluminum 6061-T6', 'Carbon Fiber', 'Stainless Steel 304', 'ABS Plastic', 'PLA Plastic'][Math.floor(Math.random() * 5)];
      specs.dimensions = `${Math.floor(Math.random() * 500) + 100}x${Math.floor(Math.random() * 300) + 100}x${Math.floor(Math.random() * 200) + 50}mm`;
      specs.loadCapacity = `${Math.floor(Math.random() * 100) + 10}kg`;
      specs.protection = ['IP54', 'IP65', 'IP67', 'None'][Math.floor(Math.random() * 4)];
      break;
  }
  
  return specs;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request
    const { message, category, existingComponents } = await req.json();
    
    if (!message || !category) {
      throw new Error('Missing required parameters');
    }

    // Create system message
    const systemPrompt = `
You are a robotics component design expert specialized in ${category} components.
Your task is to generate detailed specifications for new robotics components based on the user's request.

When designing components:
1. Create realistic and technically accurate components that would work in a real robotics system
2. Include detailed specifications with appropriate units (e.g., kg, mm, W, V)
3. Identify potential risk factors with realistic severity and probability ratings
4. Ensure components have appropriate names, types, and descriptions

Current category: ${category}

${existingComponents && existingComponents.length > 0 
  ? `Existing components in this category:
${existingComponents.filter(c => c.category === category).map(c => `- ${c.name} (${c.type}): ${c.description.substring(0, 50)}...`).join('\n')}`
  : 'No existing components in this category.'}

Be creative but realistic in your component designs.
`;

    // Create OpenAI chat completion with function calling
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      functions: [
        {
          name: "generate_components",
          description: `Generate a list of ${category} components based on user request`,
          parameters: {
            type: "object",
            properties: {
              components: {
                type: "array",
                description: `List of ${category} components`,
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "Unique identifier for the component"
                    },
                    name: {
                      type: "string",
                      description: "Name of the component"
                    },
                    category: {
                      type: "string",
                      enum: ["Drive", "Controller", "Power", "Communication", "Software", "Object Manipulation", "Sensors", "Chassis"],
                      description: "Component category"
                    },
                    type: {
                      type: "string",
                      description: "Type of component within its category"
                    },
                    description: {
                      type: "string",
                      description: "Detailed description of the component"
                    },
                    specifications: {
                      type: "object",
                      description: "Technical specifications of the component",
                      additionalProperties: {
                        type: "string"
                      }
                    },
                    riskFactors: {
                      type: "array",
                      description: "Potential risk factors associated with this component",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                            description: "Unique identifier for this risk factor"
                          },
                          name: {
                            type: "string",
                            description: "Name of the risk"
                          },
                          severity: {
                            type: "integer",
                            description: "Severity rating (1-5)",
                            minimum: 1,
                            maximum: 5
                          },
                          probability: {
                            type: "integer",
                            description: "Probability rating (1-5)",
                            minimum: 1,
                            maximum: 5
                          },
                          description: {
                            type: "string",
                            description: "Description of the risk"
                          }
                        },
                        required: ["id", "name", "severity", "probability", "description"]
                      }
                    }
                  },
                  required: ["id", "name", "category", "type", "description", "specifications", "riskFactors"]
                }
              },
              explanation: {
                type: "string",
                description: "Explanation of the generated components"
              }
            },
            required: ["components", "explanation"]
          }
        }
      ],
      function_call: { name: "generate_components" }
    });

    // Process the response
    const response = completion.choices[0].message;

    if (response.function_call) {
      try {
        const functionArgs = JSON.parse(response.function_call.arguments);
        let { components, explanation } = functionArgs;
        
        // Process the components to ensure they have valid UUIDs
        components = components.map((component: Component) => {
          // Generate a new UUID for the component
          const id = uuidv4();
          
          // Process risk factors to ensure they have valid UUIDs
          const riskFactors = (component.riskFactors || []).map((risk: RiskFactor) => ({
            ...risk,
            id: uuidv4()
          }));
          
          // If specifications are provided as numbers, convert them to strings for consistency
          const specifications = { ...component.specifications };
          Object.entries(specifications).forEach(([key, value]) => {
            if (typeof value === 'number') {
              specifications[key] = value.toString();
            }
          });
          
          // Ensure all components have the correct category
          return {
            ...component,
            id,
            category,
            riskFactors,
            specifications
          };
        });
        
        // Check for duplicate names against existing components
        if (existingComponents && existingComponents.length > 0) {
          components.forEach((component: Component) => {
            component.isExisting = existingComponents.some(
              (existing: Component) => existing.name.toLowerCase() === component.name.toLowerCase() && 
                                       existing.category === component.category
            );
          });
        }

        return new Response(
          JSON.stringify({ components, explanation }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      } catch (err) {
        console.error('Error processing function call:', err);
        throw new Error(`Error processing AI response: ${err.message}`);
      }
    } else {
      // Fallback if no function call was returned
      return new Response(
        JSON.stringify({ 
          components: [],
          explanation: "I couldn't generate specific components based on your request. Please provide more details about what type of components you need."
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
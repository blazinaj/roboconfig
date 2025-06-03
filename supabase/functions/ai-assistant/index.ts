import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import OpenAI from 'https://esm.sh/openai@4.20.1'
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.1'

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

// Utility function to validate UUID format
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Ensure component specifications have all required properties
function ensureValidSpecifications(component: any) {
  const defaultSpecs: Record<string, string | number> = {};

  // Set default specifications based on component category
  switch (component.category) {
    case 'Drive':
      defaultSpecs.torque = '25 kg/cm';
      defaultSpecs.voltage = '12V';
      defaultSpecs.current = '5A';
      defaultSpecs.rotationSpeed = '60 RPM';
      defaultSpecs.weight = '250g';
      defaultSpecs.dimensions = '40 x 20 x 40 mm';
      defaultSpecs.power = '60W';
      break;
    case 'Controller':
      defaultSpecs.processor = 'ARM Cortex-M7';
      defaultSpecs.memory = '512KB';
      defaultSpecs.interfaces = 'CAN, SPI, I2C, UART';
      defaultSpecs.operatingVoltage = '5V';
      defaultSpecs.power = '5W';
      defaultSpecs.weight = '120g';
      break;
    case 'Power':
      defaultSpecs.capacity = '5000mAh';
      defaultSpecs.voltage = '11.1V';
      defaultSpecs.current = '10A';
      defaultSpecs.weight = '450g';
      defaultSpecs.dimensions = '100 x 50 x 25 mm';
      defaultSpecs.power = '111W';
      break;
    case 'Communication':
      defaultSpecs.protocol = 'WiFi 6';
      defaultSpecs.range = '100m';
      defaultSpecs.bandwidth = '1Gbps';
      defaultSpecs.latency = '<1ms';
      defaultSpecs.power = '3W';
      defaultSpecs.weight = '80g';
      break;
    case 'Software':
      defaultSpecs.platform = 'ROS2';
      defaultSpecs.version = '1.0.0';
      defaultSpecs.requirements = '4GB RAM, 2.0GHz CPU';
      defaultSpecs.dependencies = 'Python 3.8, OpenCV';
      defaultSpecs.size = '50MB';
      defaultSpecs.weight = '0g';
      break;
    case 'Object Manipulation':
      defaultSpecs.payload = '10kg';
      defaultSpecs.reach = '1000mm';
      defaultSpecs.accuracy = '±0.1mm';
      defaultSpecs.speed = '1m/s';
      defaultSpecs.weight = '850g';
      defaultSpecs.power = '48W';
      break;
    case 'Sensors':
      defaultSpecs.range = '0-100m';
      defaultSpecs.resolution = '1920x1080';
      defaultSpecs.accuracy = '±2cm';
      defaultSpecs.updateRate = '60Hz';
      defaultSpecs.power = '2.5W';
      defaultSpecs.weight = '150g';
      break;
    case 'Chassis':
      defaultSpecs.material = 'Aluminum 6061-T6';
      defaultSpecs.dimensions = '500 x 300 x 200 mm';
      defaultSpecs.weight = '3kg';
      defaultSpecs.loadCapacity = '50kg';
      defaultSpecs.protection = 'IP65';
      break;
  }

  // Merge existing specifications with defaults, prioritizing existing values
  component.specifications = {
    ...defaultSpecs,
    ...(component.specifications || {})
  };

  // Ensure weight and power properties always exist
  if (!component.specifications.weight) {
    component.specifications.weight = defaultSpecs.weight || '200g';
  }
  
  if (!component.specifications.power && !['Chassis', 'Software'].includes(component.category)) {
    component.specifications.power = defaultSpecs.power || '10W';
  }

  return component;
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
    const { messages, machine } = await req.json();
    
    if (!messages || !machine) {
      throw new Error('Missing required parameters');
    }

    // Fetch existing components from the database for reference
    const { data: existingComponents, error: componentsError } = await supabase
      .from('components')
      .select('id, name, category, type, description, specifications');

    if (componentsError) {
      throw new Error(`Error fetching components: ${componentsError.message}`);
    }

    // Generate context for the AI
    const machineContext = `
Current Machine Configuration:
- Name: ${machine.name}
- Type: ${machine.type}
- Description: ${machine.description}
- Status: ${machine.status}
- Components (${machine.components.length}):
${machine.components.map(c => `  - ${c.name} (${c.category}): ${c.description}`).join('\n')}

Maintenance Schedule: ${machine.maintenanceSchedule ? 
  `${machine.maintenanceSchedule.frequency} with ${machine.maintenanceSchedule.tasks?.length || 0} tasks` : 
  'Not configured'}

Available Components in Database:
${existingComponents.slice(0, 20).map(c => `- ${c.name} (${c.category}): ${c.description?.substring(0, 50)}...`).join('\n')}
    `;

    // Create system message
    const systemPrompt = `
You are an expert AI assistant for RoboConfig, a robotics configuration and risk assessment platform.
You help users design, optimize, and troubleshoot their robotic systems.

${machineContext}

When helping users configure machines:
1. ALWAYS prioritize using existing components from the database when applicable
2. Only suggest creating new components when necessary
3. For new components, generate DETAILED and REALISTIC specifications that MUST include:
   - For physical components: weight, dimensions, power requirements
   - For drive components: torque, voltage, current, rotation speed
   - For power components: capacity, voltage, current
   - For controllers: processor, memory, interfaces
   - For sensors: range, resolution, accuracy
4. Consider compatibility between components
5. Include safety considerations and risk assessments
6. Tailor your recommendations to the machine type
7. Generate complete builds with all required component categories

Be specific, technical, and comprehensive in your advice.
`;

    // Create OpenAI chat completion with function calling
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      functions: [
        {
          name: "generate_machine_suggestions",
          description: "Generate suggestions for machine configuration",
          parameters: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "The helpful message explaining the suggestions"
              },
              suggestions: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "A suggested name for the machine (if appropriate)"
                  },
                  type: {
                    type: "string",
                    description: "A suggested type for the machine",
                    enum: ["Industrial Robot", "Collaborative Robot", "Mobile Robot", "Autonomous Vehicle", "Drone", "Custom"]
                  },
                  description: {
                    type: "string",
                    description: "A suggested description for the machine"
                  },
                  status: {
                    type: "string",
                    description: "A suggested status for the machine",
                    enum: ["Active", "Inactive", "Maintenance", "Error", "Offline"]
                  },
                  components: {
                    type: "array",
                    description: "Components to add to the machine. Include EXISTING components when appropriate.",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          description: "The ID of the component (use existing ID if it's an existing component, or generate a UUID for new ones)"
                        },
                        name: {
                          type: "string",
                          description: "Name of the component"
                        },
                        category: {
                          type: "string",
                          description: "Category of the component",
                          enum: ["Drive", "Controller", "Power", "Communication", "Software", "Object Manipulation", "Sensors", "Chassis"]
                        },
                        type: {
                          type: "string", 
                          description: "Type of the component within its category"
                        },
                        description: {
                          type: "string",
                          description: "Description of the component"
                        },
                        specifications: {
                          type: "object",
                          description: "REQUIRED: Detailed specifications of the component as key-value pairs. Must include weight and power consumption for physical components."
                        },
                        riskFactors: {
                          type: "array",
                          description: "Risk factors associated with this component",
                          items: {
                            type: "object",
                            properties: {
                              id: {
                                type: "string",
                                description: "Unique ID for this risk factor (UUID)"
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
                        },
                        isExisting: {
                          type: "boolean",
                          description: "Whether this is an existing component from the database (true) or a new component being suggested (false)"
                        }
                      },
                      required: ["id", "name", "category", "type", "description", "specifications", "isExisting"]
                    }
                  },
                  maintenanceSchedule: {
                    type: "object",
                    properties: {
                      frequency: {
                        type: "string",
                        description: "How often maintenance should be performed",
                        enum: ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"]
                      },
                      tasks: {
                        type: "array",
                        description: "Specific maintenance tasks that should be performed",
                        items: {
                          type: "object",
                          properties: {
                            id: {
                              type: "string",
                              description: "Unique ID for this task (UUID)"
                            },
                            name: {
                              type: "string",
                              description: "Name of the task"
                            },
                            description: {
                              type: "string",
                              description: "Description of what the task involves"
                            },
                            priority: {
                              type: "string",
                              description: "Priority level",
                              enum: ["Low", "Medium", "High", "Critical"]
                            },
                            estimatedDuration: {
                              type: "integer",
                              description: "Estimated time to complete in minutes"
                            },
                            completed: {
                              type: "boolean",
                              description: "Whether the task has been completed",
                              default: false
                            }
                          },
                          required: ["id", "name", "description", "priority", "estimatedDuration"]
                        }
                      }
                    },
                    required: ["frequency"]
                  }
                },
                additionalProperties: true
              }
            },
            required: ["message"]
          }
        }
      ],
      function_call: { name: "generate_machine_suggestions" }
    });

    // Process the response
    const response = completion.choices[0].message;

    if (response.function_call) {
      try {
        const functionArgs = JSON.parse(response.function_call.arguments);
        const { message, suggestions } = functionArgs;

        // Process the suggestions, ensuring components have proper UUIDs and specifications
        if (suggestions?.components) {
          suggestions.components = suggestions.components.map(component => {
            // Always ensure component has a valid UUID format ID
            if (!component.id || !isValidUUID(component.id)) {
              // If it's an existing component, try to find it by name and category
              if (component.isExisting) {
                const existingMatch = existingComponents.find(ec => 
                  ec.name.toLowerCase() === component.name.toLowerCase() && 
                  ec.category === component.category
                );
                
                if (existingMatch) {
                  component.id = existingMatch.id;
                  // Use the existing specifications and merge with any new ones
                  component.specifications = {
                    ...(existingMatch.specifications || {}),
                    ...(component.specifications || {})
                  };
                } else {
                  // If claiming it's existing but we can't find it, mark as new and generate UUID
                  component.id = uuidv4();
                  component.isExisting = false;
                  // Ensure it has proper specifications
                  component = ensureValidSpecifications(component);
                }
              } else {
                // For new components, generate a new UUID and ensure valid specifications
                component.id = uuidv4();
                component = ensureValidSpecifications(component);
              }
            }
            
            // Double-check specifications are valid
            if (!component.specifications || Object.keys(component.specifications).length === 0) {
              component = ensureValidSpecifications(component);
            }
            
            // Always ensure critical properties exist
            if (!component.specifications.weight) {
              component.specifications.weight = component.category === 'Software' ? '0g' : '250g';
            }
            
            if (!component.specifications.power && !['Chassis', 'Software'].includes(component.category)) {
              component.specifications.power = '10W';
            }
            
            // Ensure risk factors have IDs
            if (component.riskFactors) {
              component.riskFactors = component.riskFactors.map(risk => ({
                ...risk,
                id: risk.id && isValidUUID(risk.id) ? risk.id : uuidv4()
              }));
            } else {
              component.riskFactors = [];
            }
            
            return component;
          });
        }
        
        // Ensure maintenance tasks have IDs
        if (suggestions?.maintenanceSchedule?.tasks) {
          suggestions.maintenanceSchedule.tasks = suggestions.maintenanceSchedule.tasks.map(task => ({
            ...task,
            id: task.id && isValidUUID(task.id) ? task.id : uuidv4()
          }));
        }

        return new Response(
          JSON.stringify({ message, suggestions }),
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
          message: response.content || "I couldn't generate specific suggestions for your machine. Could you provide more details about what you're looking for?",
          suggestions: null
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
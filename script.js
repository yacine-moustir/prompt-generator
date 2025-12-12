// Templates as requested (only the 5 selected frameworks)
const templates = [
  // Template 1 - RACE
  // ====================================================================
  {
    name: "RACE Framework : Structured expert answer",
    domain: "Questions requiring expertise and thorough explanation",
    fields: [
      {id:"role", label:"Role (e.g., nutritionist, data analyst, UX designer)", type:"text", placeholder:"nutritionist"},
      {id:"domain_specific", label:"Domain / Area of expertise (short)", type:"text", placeholder:"sports nutrition"},
      {id:"complementary_skill", label:"Complementary skill (short)", type:"text", placeholder:"habit change coaching"},
      {id:"action", label:"Action required (analyze / create / evaluate / recommend)", type:"text", placeholder:"create a detailed plan"},
      {id:"situation", label:"Situation summary", type:"textarea", placeholder:"Describe the situation briefly..."},
      {id:"current_state", label:"Current state", type:"textarea", placeholder:"Current metrics, status or conditions..."},
      {id:"constraints", label:"Constraints (time, budget, tools, other)", type:"textarea", placeholder:"List constraints..."},
      {id:"goal", label:"Goal (specific outcome)", type:"text", placeholder:"Improve conversion by 15%"},
      {id:"tone", label:"Tone & style (e.g., professional, technical)", type:"text", placeholder:"Professional yet approachable"},
      {id:"format", label:"Desired output format (e.g., plan, analysis)", type:"text", placeholder:"Detailed plan with headings"}
    ],
    content: `You are an expert {{role}} with deep experience in {{domain_specific}} and {{complementary_skill}}. Your role is to provide structured, evidence-based guidance that is actionable and tailored to the user's situation.
Your task is to {{action}} based on the following context:
Context provided:

Situation: {{situation}}
Current state: {{current_state}}
Constraints: {{constraints}}
Goal: {{goal}}

Requirements for your response:

Role perspective: Answer strictly from the viewpoint of a {{role}}, using industry-standard practices and terminology where appropriate.
Action delivered: Provide {{format}} that directly addresses the user's needs.
Context awareness: Consider the specific circumstances mentioned, including {{constraints}}.
Explanation included: For each recommendation or point, explain:

- WHY it matters in this context
- HOW it addresses the user's goal
- WHAT the expected outcome is

Output format:
Your response must follow this structure:

Summary (2–3 sentences): Overview of the situation and your approach
Main Response (structured sections with clear headings)
Reasoning (explain the logic behind your recommendations)
Next Steps (actionable items the user can implement immediately)

Tone & Style:
{{tone_or_style}}

Avoid jargon unless specifically requested.
Use examples when helpful.`
  },

  // Template 2 - CARE
  // ====================================================================
  {
    name: "CARE Framework : Immediate practical solution",
    domain: "Problems requiring concrete, implementable solutions",
    fields: [
      {id:"domain", label:"Domain (e.g., operations, marketing)", type:"text", placeholder:"operations"},
      {id:"specific_skill", label:"Specific skill (e.g., process design)", type:"text", placeholder:"process design"},
      {id:"current_situation", label:"Current situation", type:"textarea", placeholder:"Describe the current situation..."},
      {id:"challenge", label:"Main challenge", type:"textarea", placeholder:"What is the core challenge?"},
      {id:"environment", label:"Environment / setting", type:"text", placeholder:"e.g., SMB, remote team"},
      {id:"resources", label:"Available resources", type:"textarea", placeholder:"People, budget, tools..."},
      {id:"timeline", label:"Timeline / deadline", type:"text", placeholder:"e.g., 2 weeks"},
      {id:"problem_main", label:"Problem to solve (short)", type:"text", placeholder:"Reduce onboarding time"},
      {id:"expertise_level", label:"Required user skill level to implement", type:"text", placeholder:"Intermediate"},
      {id:"result_measure", label:"Measurable result expected", type:"text", placeholder:"Reduce time by 30%"},
      {id:"example_details", label:"Example details (real-world example)", type:"textarea", placeholder:"Give a concrete example or case study..."}
    ],
    content: `You are a practical problem-solver specializing in {{domain}} with a track record of delivering real-world, actionable solutions. Your expertise lies in {{specific_skill}} and you excel at translating theory into practice.
Your task is to provide a concrete, implementable solution for the following situation.

CONTEXT:
Current situation: {{current_situation}}
Challenge faced: {{challenge}}
Environment/Setting: {{environment}}
Available resources: {{resources}}
Timeline: {{timeline}}

ACTION REQUIRED:
Create a step-by-step solution that addresses {{problem_main}}. The solution must be:
- Immediately actionable
- Realistic given the constraints listed
- Clear enough for someone with {{expertise_level}} to implement
- Focused on practical outcomes, not theory

RESULT EXPECTED:
The user should be able to achieve {{result_measure}} within {{timeline}}. Success looks like:
- {{result_measure}} achieved
- Clear process ownership
- Measurable improvement in key metrics

EXAMPLE REQUIREMENT:
Include at least one detailed, real-world example showing:
- What the solution looks like in practice
- How someone successfully implemented something similar
- Specific numbers or outcomes (use {{example_details}} if provided)

Output format:
Quick Overview (2–3 sentences)
Step-by-Step Action Plan (numbered steps with clear instructions and time estimates)
Expected Results (what success looks like)
Real Example (case study or illustration)
Troubleshooting Tips (common pitfalls to avoid)

Additional requirements:
Use simple, direct language. Focus on 'how-to' rather than 'why' and provide alternatives if the main approach won't work.`
  },

  // Template 3 - PAIN
  // ====================================================================
  {
    name: "PAIN Framework : Solve urgent problem",
    domain: "Critical issues requiring quick resolution",
    fields: [
      {id:"domain", label:"Domain (e.g., product, ops, marketing)", type:"text", placeholder:"product"},
      {id:"core_issue", label:"Core issue (short)", type:"text", placeholder:"Low activation rate"},
      {id:"impact", label:"Impact / consequences", type:"textarea", placeholder:"Describe consequences..."},
      {id:"attempted_solutions", label:"Attempted solutions so far", type:"textarea", placeholder:"What was tried already?"},
      {id:"why_it_matters", label:"Why it matters / urgency", type:"text", placeholder:"e.g., revenue risk"},
      {id:"success_criteria", label:"Success criteria (how to measure resolution)", type:"textarea", placeholder:"What defines success?"},
      {id:"background", label:"Background / additional context", type:"textarea", placeholder:"History or context..."},
      {id:"constraints", label:"Constraints", type:"textarea", placeholder:"Budget, time, policies..."},
      {id:"stakeholders", label:"Stakeholders involved", type:"text", placeholder:"Who is impacted?"},
      {id:"who_does_what", label:"Who does what (owners)", type:"textarea", placeholder:"Assign roles and responsibilities..."}
    ],
    content: `You are a strategic problem-solver with expertise in {{domain}} and a proven ability to diagnose issues and deliver effective solutions quickly. You specialize in {{core_issue}} and have helped clients overcome similar challenges.

PROBLEM DEFINITION:
The user is facing the following problem:

Core issue: {{core_issue}}
Impact: {{impact}}
Attempted solutions: {{attempted_solutions}}
Why it matters: {{why_it_matters}}
Success criteria: {{success_criteria}}

Additional context:
Background: {{background}}
Constraints: {{constraints}}
Stakeholders: {{stakeholders}}

ACTION NEEDED:
Provide a clear, prioritized action plan to resolve this problem. Your solution must:
- Directly address the root cause, not just symptoms
- Be implementable with the resources/constraints mentioned
- Include quick wins AND long-term solutions
- Specify WHO does WHAT and WHEN (use {{who_does_what}})

INFORMATION TO PROVIDE:
Include key concepts, metrics to track, tools/resources required, and warning signs.

NEXT STEPS:
Immediate actions (within 24–48 hours)
Short-term actions (this week)
Medium-term actions (this month)
Follow-up checkpoint (when to reassess)

Output format:
Problem Breakdown
Recommended Solution
Critical Information
Prioritized Action Plan
Success Indicators

Tone: Direct, solution-focused, empowering.`
  },

  // Template 4 - CREATE
  // ====================================================================
  {
    name: "CREATE Framework : Custom complex project",
    domain: "Projects needing full control, personalization, and detailed output",
    fields: [
      {id:"role_specific", label:"Very specific role (e.g., senior UX researcher)", type:"text", placeholder:"senior UX researcher"},
      {id:"expertise", label:"Expertise areas (comma separated)", type:"text", placeholder:"user research, prototyping"},
      {id:"experience", label:"Experience summary (years/context)", type:"text", placeholder:"7 years in SaaS"},
      {id:"specialty", label:"Specialty (what distinguishes you)", type:"text", placeholder:"mixed-methods research"},
      {id:"approach", label:"Approach / methodology", type:"text", placeholder:"lean research + rapid testing"},
      {id:"values", label:"Guiding values", type:"text", placeholder:"user-centered, data-driven"},
      {id:"primary_objective", label:"Primary objective", type:"text", placeholder:"Create a research plan"},
      {id:"secondary_objectives", label:"Secondary objectives (short)", type:"textarea", placeholder:"List secondary goals..."},
      {id:"audience_usage", label:"Target audience / usage", type:"text", placeholder:"product team, execs"},
      {id:"examples_ref", label:"Examples (short descriptions)", type:"textarea", placeholder:"Example 1: ... Example 2: ..."},
      {id:"emulate_aspects", label:"What to emulate from examples", type:"textarea", placeholder:"Style elements to copy..."},
      {id:"avoid_aspects", label:"What to avoid", type:"textarea", placeholder:"Don't use..."},
      {id:"depth_level", label:"Depth level (beginner/expert)", type:"text", placeholder:"expert-level"},
      {id:"focus_areas", label:"Focus areas", type:"text", placeholder:"e.g., accessibility, onboarding"},
      {id:"tone", label:"Tone (formal/conversational/...)", type:"text", placeholder:"conversational but precise"},
      {id:"type_format", label:"Type / format required (e.g., report, email)", type:"text", placeholder:"Report with sections"},
      {id:"structure_requirements", label:"Structure requirements", type:"textarea", placeholder:"Section 1: ... Section 2: ..."},
      {id:"length_spec", label:"Length specification", type:"text", placeholder:"~800 words"},
      {id:"extras", label:"Extras (data, quotes, visuals)", type:"textarea", placeholder:"Include stats or visuals suggestions..."}
    ],
    content: `CHARACTER / ROLE:
You are a {{role_specific}} with the following profile:
Expertise: {{expertise}}
Experience: {{experience}}
Specialty: {{specialty}}
Approach: {{approach}}
Values: {{values}}

REQUEST:
Your specific task is to {{primary_objective}}.

Primary objective: {{primary_objective}}
Secondary objectives: {{secondary_objectives}}
The deliverable should serve {{audience_usage}} and enable them to act.

EXAMPLES:
Examples provided: {{examples_ref}}
What to emulate: {{emulate_aspects}}
What to avoid: {{avoid_aspects}}

ADJUSTMENTS:
Depth level: {{depth_level}}
Focus areas: {{focus_areas}}
Tone: {{tone}}

TYPE / FORMAT:
Deliver in this format: {{type_format}}
Structure: {{structure_requirements}}
Length: {{length_spec}}
Extras: {{extras}}

Quality standards:
Ensure claims are actionable, specific and avoid vague filler. Output must be directly usable by the intended audience.`
  },

  // Template 5 - ROSES
  // ====================================================================
  {
    name: "ROSES Framework : Strategic planning",
    domain: "High-stakes decisions requiring analysis and structured planning",
    fields: [
      {id:"role", label:"Strategic role (e.g., business consultant)", type:"text", placeholder:"business consultant"},
      {id:"expertise_1", label:"Expertise 1", type:"text", placeholder:"market strategy"},
      {id:"expertise_2", label:"Expertise 2", type:"text", placeholder:"financial modeling"},
      {id:"expertise_3", label:"Expertise 3", type:"text", placeholder:"operations design"},
      {id:"distinctive_force", label:"Distinctive strength", type:"text", placeholder:"data-driven decision making"},
      {id:"objective", label:"Strategic objective (measurable)", type:"text", placeholder:"Increase ARR by 20%"},
      {id:"success_criteria", label:"Success criteria (short)", type:"textarea", placeholder:"List measurable success criteria..."},
      {id:"timeline", label:"Timeline (short/medium/long)", type:"text", placeholder:"12 months"},
      {id:"budget", label:"Budget constraints", type:"text", placeholder:"$50k"},
      {id:"resources", label:"Available resources", type:"textarea", placeholder:"People, tech, partners..."},
      {id:"limitations", label:"Other limitations", type:"textarea", placeholder:"Regulatory, tech..."},
      {id:"current_situation", label:"Current situation & market context", type:"textarea", placeholder:"Describe current state..."},
      {id:"key_challenges", label:"Key challenges", type:"textarea", placeholder:"Challenge 1, 2, 3..."},
      {id:"opportunities", label:"Opportunities identified", type:"textarea", placeholder:"Opportunity 1, 2..."},
      {id:"assumptions", label:"Critical assumptions", type:"textarea", placeholder:"Assumption 1, 2..."},
      {id:"alt_count", label:"Number of alternatives to propose", type:"text", placeholder:"2"}
    ],
    content: `ROLE:
You are a strategic {{role}} with experience in {{expertise_1}}, {{expertise_2}}, and {{expertise_3}}. You are known for {{distinctive_force}}.

OBJECTIVE:
The strategic objective: {{objective}}
Success means:
{{success_criteria}}
Timeline: {{timeline}}
Constraints: Budget {{budget}}, Resources {{resources}}, Other: {{limitations}}

SCENARIO - Current situation:
{{current_situation}}

Key challenges:
{{key_challenges}}

Opportunities:
{{opportunities}}

Critical assumptions:
{{assumptions}}

EXPECTED SOLUTION:
Provide a solution that covers:
- Primary recommendation (your best strategic approach)
- Supporting rationale
- {{alt_count}} alternative approaches with pros/cons
- Risk analysis and mitigation
Format result as:
Executive Summary, Strategic Analysis, Recommended Approach, Implementation Roadmap (phased), Risk Management, Alternatives, Success Metrics.`
  }
];


    // UI elements
    const select = document.getElementById("templateSelect");
    const dynamicFields = document.getElementById("dynamicFields");
    const result = document.getElementById("result");
    const templateDomain = document.getElementById("templateDomain");
    const generateBtn = document.getElementById("generateBtn");
    const copyBtn = document.getElementById("copyBtn");

    // populate select
    templates.forEach((t,i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = `${t.name} (${t.domain})`;
      select.appendChild(opt);
    });

    // helper to create input elements
    function createField(f){
      const wrapper = document.createElement("div");
      wrapper.style.marginBottom = "10px";

      const label = document.createElement("label");
      label.textContent = f.label;
      wrapper.appendChild(label);

      if(f.type === "textarea"){
        const ta = document.createElement("textarea");
        ta.id = f.id;
        ta.rows = 4;
        ta.placeholder = f.placeholder || "";
        ta.style.minHeight = "72px";
        wrapper.appendChild(ta);
      } else {
        const inp = document.createElement("input");
        inp.type = "text";
        inp.id = f.id;
        inp.placeholder = f.placeholder || "";
        wrapper.appendChild(inp);
      }
      return wrapper;
    }

    // render fields for selected template
    function renderFields(index) {
      const dynamicFields = document.getElementById('dynamicFields');
      const templateDomain = document.getElementById('templateDomain');
      
      if (!dynamicFields) return;
      
      dynamicFields.innerHTML = "";
      
      // Update template domain display
      if (templateDomain) {
        if (index >= 0 && templates[index]) {
          templateDomain.textContent = templates[index].domain;
          templateDomain.style.display = 'block';
        } else {
          templateDomain.style.display = 'none';
        }
      }
      
      // If no template selected, don't render fields
      if (index < 0 || !templates[index]) {
        updateActionsVisibility(false);
        return;
      }
      
      const t = templates[index];
      
      // Add fields for the selected template
      t.fields.forEach(field => {
        dynamicFields.appendChild(createField(field));
      });
      
      updateActionsVisibility(true);
    }

    // Show/hide actions based on template selection
    function updateActionsVisibility(show) {
      const actionsBottom = document.querySelector('.actions-bottom');
      const selectMessage = document.querySelector('.select-template-message');
      
      if (show) {
        actionsBottom.classList.remove('hidden');
        if (selectMessage) selectMessage.style.display = 'none';
      } else {
        actionsBottom.classList.add('hidden');
        if (selectMessage) selectMessage.style.display = 'block';
      }
    }
    
    // Initialize the application
    document.addEventListener('DOMContentLoaded', () => {
      const templateSelect = document.getElementById('templateSelect');
      const generateBtn = document.getElementById('generateBtn');
      const copyBtn = document.getElementById('copyBtn');
      const result = document.getElementById('result');

      // Populate template select dropdown
      if (templateSelect) {
        // Clear any existing options first
        templateSelect.innerHTML = '';
        // Add a default empty option
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Select a template...";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        templateSelect.appendChild(defaultOption);
        
        // Add unique templates
        const uniqueTemplates = [];
        const uniqueNames = new Set();
        
        templates.forEach((template, index) => {
          if (!uniqueNames.has(template.name)) {
            uniqueNames.add(template.name);
            uniqueTemplates.push({
              ...template,
              originalIndex: index
            });
          }
        });
        
        uniqueTemplates.forEach(template => {
          const option = document.createElement('option');
          option.value = template.originalIndex;
          option.textContent = template.name;
          templateSelect.appendChild(option);
        });

        // Add change event listener
        templateSelect.addEventListener('change', (e) => {
          const selectedIndex = parseInt(e.target.value);
          if (!isNaN(selectedIndex)) {
            renderFields(selectedIndex);
            updateActionsVisibility(true);
            if (result) {
              result.textContent = "The generated prompt will appear here.";
            }
          } else {
            updateActionsVisibility(false);
            document.getElementById('dynamicFields').innerHTML = 
              '<div class="select-template-message">Please select a template to get started</div>';
          }
        });
        
        // Hide actions initially
        updateActionsVisibility(false);
      }

      // Generate button click handler
      if (generateBtn && templateSelect) {
        generateBtn.addEventListener('click', () => {
          const t = templates[parseInt(templateSelect.value)];
          let prompt = t.content;
          
          // Replace placeholders with field values
          t.fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
              const value = element.value || '';
              const regex = new RegExp(`\\{\\{\\s*${field.id}\\s*\\}\\}`, 'g');
              prompt = prompt.replace(regex, value);
            }
          });
          
          if (result) {
            result.textContent = prompt;
          }
        });
      }

      // Copy button click handler with animation
      if (copyBtn && result) {
        copyBtn.addEventListener('click', async () => {
          const text = result.textContent;
          if (!text || text === 'The generated prompt will appear here.') return;
          
          try {
            await navigator.clipboard.writeText(text);
            
            // Show success feedback
            const span = copyBtn.querySelector('span');
            const originalText = span.textContent;
            
            copyBtn.classList.add('copied');
            span.textContent = 'Copied!';
            
            setTimeout(() => {
              copyBtn.classList.remove('copied');
              span.textContent = originalText;
            }, 2000);
            
          } catch (err) {
            console.error('Failed to copy text: ', err);
            copyBtn.textContent = 'Error copying';
            setTimeout(() => {
              copyBtn.textContent = 'Copy to clipboard';
            }, 2000);
          }
        });
      }

      // Toggle tips section
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tips-toggle')) {
          e.target.classList.toggle('expanded');
          const tips = e.target.nextElementSibling;
          tips.classList.toggle('expanded');
        }
      });

    });

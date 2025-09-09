# Wrap Session Task

Generate high-quality, detailed analysis documentation from valuable sessions and optionally save to Notion.

## Process

### Step 1: Session Analysis

Analyze current session for substantial content by checking:

1. **Technical Depth**: Are there specific technical decisions, implementations, or architectural discussions?
2. **Business Logic**: Were strategic decisions made with clear rationale and business context?
3. **Actionable Outcomes**: Are there concrete next steps, specifications, or deliverables?
4. **Knowledge Value**: Would this content help future decision-making or provide reference value?

### Step 2: Value Assessment

**High Value Sessions (Always Save):**
- Technical architecture decisions with specifications
- Strategic planning with clear rationale and metrics
- Implementation sessions with working code/solutions
- Analysis sessions with specific findings and recommendations
- Problem-solving with detailed solution exploration

### Step 3: Smart Template Selection & Documentation Generation

If session has substantial value, perform intelligent template selection and generate documentation:

#### **Step 3.1: AI Content Analysis for Template Detection**

**As an AI agent, analyze the complete session content and autonomously determine the appropriate template:**

**AI Decision Process:**
1. **Read entire session conversation** to understand context và content type
2. **Identify dominant themes** through natural language understanding
3. **Recognize content patterns** based on discussion topics và objectives  
4. **Make template recommendation** using AI judgment (no manual scoring needed)

**Template Categories AI Should Recognize:**
- **Technical Documentation**: Architecture, systems, implementation, technical specs
- **Business Analysis**: Strategy, market analysis, business planning, competitive analysis  
- **Product Requirements**: Features, user stories, product planning, functionality specs
- **Research Analysis**: Investigation, methodology, findings, comprehensive analysis

**AI Autonomy**: Trust AI to determine context window, assess content significance, và make best template selection without explicit rules or thresholds.

#### **Step 3.2: AI Template Selection Logic**

**Simple AI-driven selection process:**

1. **AI Content Understanding**: Use natural language comprehension để understand session focus
2. **Template Recommendation**: AI suggests most appropriate template based on content analysis
3. **Mixed Content Detection**: If AI detects multiple strong themes → suggest splitting into focused documents
4. **Always Confirm**: Present recommendation to user with reasoning: "I detected [type] content because [reasoning]. Create [template]? (Y/N/Custom)"
5. **AI Flexibility**: No rigid rules - AI makes best judgment call based on content understanding

#### **Step 3.3: Mixed Content Handling**

**When AI detects mixed content themes:**

1. **Identify Multiple Themes**: AI recognizes when session covers multiple distinct areas (e.g., technical + business)
2. **Suggest Document Splitting**: Recommend creating separate focused documents:
   ```
   "I detected both Technical and Business content. Suggest creating:
   1. Technical Architecture Document (focus: system design aspects)  
   2. Business Strategy Document (focus: strategic implications)
   Proceed with split? (Y/N/Single document)"
   ```
3. **User Choice**: Allow user to choose splitting approach or single comprehensive document

#### **Step 3.4: Template Application**

**Apply selected template with AI-generated content:**
- **technical-doc-tmpl.yaml** for technical/architecture content
- **business-analysis-tmpl.yaml** for strategy/business content  
- **prd-tmpl.yaml** for product/requirements content
- **research-analysis-tmpl.yaml** for analysis/investigation content

**AI Content Generation**: Use template structure but let AI generate contextually appropriate content following prose writing standards.

### Step 4: Document Classification

**Auto-detect classification based on multi-factor analysis:**

1. **Agent Role Factor**:
   - ll-ba → Business domain
   - ll-cto → Technical domain  
   - ll-pm → Product domain
   - ll-po → Product domain

2. **Session Content Analysis**:
   - Keywords: architecture, system, brainstorming, analysis, implementation
   - Cross-agent mentions: Multiple agents referenced → Cross-References
   - Technical vs Business vs Product focus

3. **Project Context Detection**:
   - Scan for project names (AIMI, ProjectX, etc.)
   - If no specific project → Meta/System level

**Classification Algorithm:**
```
IF multiple_agents_mentioned OR system_design:
  → /Cross-References/[Domain]/
ELIF specific_project_detected:
  → /[Project]/[Agent_Domain]/[Content_Type]/
ELSE:
  → /Meta/[Agent_Domain]/[Content_Type]/
```

### Step 4.5: Smart Classification with Hierarchy Config

**Execute intelligent classification using hierarchy configuration:**

1. **Load Hierarchy Config**:
   - Read `.core/data/hierarchy-config.yaml`
   - Get current project structures and thresholds
   - Load agent-specific tagging rules

2. **Generate Smart Tags**:
   - **Agent tags**: Based on executing agent (ll-ba, ll-cto, etc.)
   - **Project tags**: Detect project mentions in conversation
   - **Content tags**: Identify content type and key concepts
   - **Cross-reference tags**: When multiple agents mentioned

3. **Apply Path Templates**:
   ```yaml
   IF cross_agent_content OR system_design:
     → path_templates.cross_reference
   ELIF specific_project_detected:
     → path_templates.project_specific  
   ELSE:
     → path_templates.meta_content
   ```

4. **Threshold Check & Organizer Trigger**:
   - Count pages in target project/domain
   - If threshold reached → suggest ll-organizer review
   - Update hierarchy config with new page count

5. **Present Classification Results**:
   ```
   Suggested path: [Generated Path]
   Smart tags: [Generated Tags]
   Threshold status: [X/threshold pages]
   [If threshold reached: "⚠️ Consider running /organize-notion for optimization"]
   ```

**Ask user confirmation:**  
"Save to suggested location with these tags? (Y/N/Custom)"

### Step 5: User Confirmation

Present session value assessment and suggested classification path for user approval.

### Step 6: Notion Export with Hierarchy Integration

If user confirms:

1. **Generate markdown file** from current session content
2. **Execute hierarchy-aware export**:
   ```bash
   cd .core/scripts && npm run dev -- --markdown ../../temp-session.md --title "Session Title" --path "[Classification Path]" && npm run hierarchy && cd ../..
   ```
3. **Post-Export Threshold Check**:
   - Hierarchy manager updates page counts
   - Check if any thresholds triggered
   - If triggered → present organizer suggestion to user:
   ```
   ⚠️ THRESHOLD REACHED: [Details]
   Consider running /organize-notion for workspace optimization?
   ```
4. **Confirm successful save** with:
   - Notion page URL  
   - Final classification path
   - Smart tags applied
   - Current threshold status

## Quality Standards

**Every saved document must include:**
- **Specific technical details** (not generic descriptions)
- **Clear business rationale** for all decisions
- **Quantifiable metrics** where applicable
- **Actionable next steps** with clear ownership
- **Reference value** for future similar challenges
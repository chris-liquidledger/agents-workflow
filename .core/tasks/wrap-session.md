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

### Step 3: Generate Comprehensive Documentation

If session has substantial value, create detailed analysis following this structure:

#### **Document Header**
```markdown
# [Specific Session Topic] - [Session Type] Analysis

**Date:** [Date]
**Type:** [Technical Architecture/Strategic Planning/Implementation/Analysis]
**Duration:** [Duration]
**Key Focus:** [Primary business/technical objective]
```

#### **Executive Summary**
- **Problem Statement:** What specific challenge was addressed?
- **Solution Approach:** How was it approached and why?
- **Key Decisions Made:** List critical decisions with rationale
- **Business Impact:** Expected outcomes and value creation
- **Success Metrics:** How success will be measured

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
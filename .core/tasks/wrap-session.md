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

### Step 4: User Confirmation

Present session value assessment and ask for permission to save.

### Step 5: Notion Export

If user confirms:

1. **Generate markdown file** from current session content
2. **Create temporary markdown file** in root directory
3. **Execute Notion export script**:
   ```bash
   cd .core/scripts && npm run dev -- --markdown ../../temp-session.md --title "Session Title" && cd ../..
   ```
4. **Confirm successful save** with Notion page URL

## Quality Standards

**Every saved document must include:**
- **Specific technical details** (not generic descriptions)
- **Clear business rationale** for all decisions
- **Quantifiable metrics** where applicable
- **Actionable next steps** with clear ownership
- **Reference value** for future similar challenges
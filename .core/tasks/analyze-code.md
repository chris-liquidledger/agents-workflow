docOutputLocation: docs/code-analysis-results.md
template: '.core/templates/code-analysis-tmpl.yaml'

---

# Analyze Code Task

Perform comprehensive code analysis of specified codebase using systematic methodology to generate actionable insights.

## Process

### Step 1: Codebase Discovery & Big Picture Understanding

**Ask 2 context questions:**

1. What codebase path should be analyzed? (repository or specific directory)
2. What is the main purpose/goal of this analysis? (architecture understanding, technical debt assessment, onboarding preparation, etc.)

**Initial Discovery:**
1. **Repository Structure Scan**: Use Read and LS tools to understand directory organization
2. **Technology Stack Detection**: Identify languages, frameworks, build systems, dependencies
3. **Entry Point Identification**: Find main files, configuration files, documentation
4. **Scale Assessment**: Understand codebase size and complexity level

### Step 2: Deep Dive Analysis - Systematic Breakdown

Following user's methodology: "Hiểu bức tranh toàn cảnh trước, sau đó đi vào detail từng phần, phân tích kỹ từng phần đó, mổ xẻ nó ra hết mức"

**Component-by-Component Analysis:**
1. **Core Architecture Components**: Identify and analyze main system components
2. **Data Flow Analysis**: Trace how data moves through the system  
3. **Dependency Relationships**: Map inter-component dependencies
4. **Pattern Recognition**: Identify design patterns, conventions, and anti-patterns
5. **Critical Path Analysis**: Find the most important execution paths

**Deep Dive Technique:**
- Read key files completely, not just scan
- Understand not just WHAT but WHY code is structured certain ways
- Trace execution flows from entry points
- Identify business logic vs infrastructure code

### Step 3: Connect the Dots - Synthesis

"Sau đó lại lắp ghép lại, connect the dots"

**Integration Analysis:**
1. **System Integration Points**: How components interact and communicate
2. **Architectural Patterns**: Overall system design approach
3. **Business Feature Mapping**: Connect code structure to business functionality
4. **Quality Assessment**: Code quality, maintainability, technical debt evaluation

### Step 4: Validate Against Big Picture

"Rồi so sánh lại với bức tranh toàn cảnh xem có hợp lý không"

**Validation Steps:**
1. **Consistency Check**: Does detailed analysis match initial big picture understanding?
2. **Completeness Verification**: Are all major components and flows accounted for?
3. **Logic Validation**: Do the architectural decisions make sense for the use case?
4. **Gap Identification**: What's missing or unclear that needs further investigation?

### Step 5: Logical Presentation

"Sau đó hãy nghĩ cách diễn đạt mọi vấn đề 1 cách logic chặt chẽ nhất quán nhất"

**Structure Output Using Template:**
1. **Executive Summary**: High-level findings for stakeholders
2. **Architecture Overview**: System design with visual diagrams
3. **Component Analysis**: Detailed breakdown of major components
4. **Technical Assessment**: Quality, debt, and improvement opportunities  
5. **Business Impact**: How code structure affects business goals
6. **Actionable Recommendations**: Prioritized improvement suggestions

### Step 6: Export and Integration

**Document Generation:**
1. **Apply Template**: Use code-analysis-tmpl.yaml với all variables filled từ analysis
2. **Generate Markdown**: Create comprehensive analysis document
3. **Review & Validate**: Ensure all sections complete và accurate

**Notion Export:**
1. **Run Export Script**: 
   ```bash
   cd .core/scripts && npm run dev -- --markdown "../../docs/code-analysis-results.md" --title "Code Analysis: {{codebase_name}}" --path "technical/code-analysis"
   ```
2. **Verify Upload**: Confirm document uploaded to Notion với proper hierarchy
3. **Update Session Index**: Auto-tracking của analysis session với metadata
4. **Cleanup**: Remove temporary files after successful export

## Key Principles for Code Analysis

### Analysis Methodology
- **Start Broad, Go Deep**: Always establish context before diving into specifics
- **Question Everything**: Don't assume you understand without verification
- **Follow the Flow**: Trace actual execution paths, not just static structure
- **Business Context**: Always connect technical findings to business impact
- **Practical Insights**: Focus on actionable findings, not just observations

### Quality Standards
- **Accuracy**: Verify understanding by cross-referencing multiple sources
- **Completeness**: Cover all major aspects of the system
- **Clarity**: Present findings in accessible language
- **Actionability**: Provide specific, implementable recommendations

### Documentation Requirements
- **Reproducibility**: Others should be able to follow your analysis approach
- **Evidence-Based**: Support conclusions with specific code references
- **Visual Aids**: Use diagrams to illustrate complex relationships
- **Prioritization**: Rank findings by importance and impact

## Advanced Analysis Techniques

### Static Analysis Integration
- **Dependency Mapping**: Chart component relationships
- **Complexity Assessment**: Identify high-complexity areas
- **Pattern Detection**: Find recurring architectural decisions
- **Security Scanning**: Identify potential security concerns

### Dynamic Understanding
- **Execution Flow Tracing**: Follow critical user journeys through code
- **Performance Implications**: Identify potential bottlenecks
- **Error Handling Analysis**: Understand failure modes and recovery
- **Configuration Impact**: Assess how configuration affects behavior

### Business-Technical Bridge
- **Feature-Code Mapping**: Connect user features to implementation
- **Risk Assessment**: Identify areas where code issues impact business
- **Scalability Analysis**: Understand growth limitations and opportunities
- **Maintenance Burden**: Assess ongoing development overhead
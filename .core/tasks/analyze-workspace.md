# Analyze Workspace Task

Analyze current Notion workspace structure and provide optimization recommendations.

## Process

### Step 1: Load Current State

1. **Read Hierarchy Config**:
   - Load `.core/data/hierarchy-config.yaml`
   - Get current project structures, page counts, and thresholds
   - Review last update timestamp and agent activities

2. **Run Workspace Analysis**:
   ```bash
   cd .core/scripts && npm run hierarchy && cd ../..
   ```

### Step 2: Pattern Analysis

**Analyze current patterns:**

1. **Content Clustering**:
   - Which projects have the most content?
   - Are pages properly distributed across domains?
   - Any content concentration that suggests need for subdomains?

2. **Cross-Agent Collaboration**:
   - Which agents are creating cross-references?
   - Are there collaboration patterns that suggest new Cross-References categories?
   - Any agent workflows that need specific organization?

3. **Threshold Status**:
   - Which projects/domains are approaching thresholds?
   - Any immediate reorganization triggers?
   - Projected timeline for next threshold reaches?

### Step 3: Optimization Recommendations

**Generate specific recommendations:**

1. **Immediate Actions** (if thresholds triggered):
   - Create specific subdomains for high-content areas
   - Move scattered content into proper project structures
   - Establish new Cross-References categories

2. **Preventive Optimizations**:
   - Suggest structure improvements before thresholds reached
   - Recommend new tagging strategies for better organization
   - Propose workflow adjustments for agents

3. **Strategic Planning**:
   - Anticipate future agent roles and prepare structure
   - Plan for project growth and expansion
   - Consider workspace scalability improvements

### Step 4: Present Analysis Report

**Deliver comprehensive analysis with:**

- **Current State Summary**: Page counts, structure status, recent activity
- **Pattern Insights**: Content clustering, collaboration patterns, growth trends  
- **Threshold Status**: Current vs limits, projected timeline to next triggers
- **Optimization Recommendations**: Immediate actions, preventive measures, strategic planning
- **Implementation Priority**: Which recommendations should be executed first

### Step 5: User Decision

Ask user to select which recommendations to implement:

1. **Execute immediately** - Run specific reorganization commands
2. **Schedule for later** - Note recommendations for future execution  
3. **Modify approach** - Adjust recommendations based on user feedback
4. **Update thresholds** - Change trigger points if current ones aren't optimal

## Key Principles

- **Always show evidence** - Support recommendations with specific metrics
- **Respect existing workflows** - Don't disrupt successful agent patterns
- **Offer incremental options** - Allow gradual implementation of changes
- **Maintain workspace integrity** - Ensure no content is lost or broken
- **Consider user productivity** - Optimize for findability and agent efficiency
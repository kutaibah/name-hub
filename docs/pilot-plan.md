# Canton Names - Pilot Plan

## Overview

This document outlines the plan for moving Canton Names from hackathon MVP to a small-scale pilot deployment with one integrating application.

## Pilot Goals

1. Validate the registration flow with real Canton Network transactions
2. Test the `CnsRecipientInput` component in a production context
3. Gather user feedback on the UX
4. Identify integration challenges

## Prerequisites

Before pilot deployment:

### Technical Requirements

- [ ] Complete @canton-network/dapp-sdk wallet integration
- [ ] Configure for target network (DevNet initially)
- [ ] Set up server-side API routes for authenticated calls
- [ ] Implement session management (secure, not localStorage)
- [ ] Add error tracking/monitoring

### Infrastructure Requirements

- [ ] Hosting environment (Vercel, similar)
- [ ] Environment variable management
- [ ] CI/CD pipeline for deployment
- [ ] Logging and monitoring

### Documentation Requirements

- [ ] Integration guide for partner app
- [ ] API documentation for `CnsRecipientInput`
- [ ] Troubleshooting guide
- [ ] Support contact information

## Pilot Structure

### Phase 1: Internal Testing (1-2 weeks)

**Participants**: Internal team members only

**Goals**:
- Verify end-to-end registration flow
- Test wallet connection with various providers
- Identify and fix critical bugs
- Document edge cases

**Success Criteria**:
- 10+ successful registrations
- No blocking bugs in core flow
- Registration completes in < 5 minutes

### Phase 2: Partner Integration (2-3 weeks)

**Partner App**: Select one Canton application for integration

**Ideal Partner Characteristics**:
- Active development team
- Existing Canton wallet users
- Use case for recipient selection
- Willingness to provide feedback

**Integration Scope**:
1. Embed `CnsRecipientInput` component
2. Use for recipient selection in transfers
3. Link to Canton Names for registration

**Deliverables**:
- Integration code example
- Shared component documentation
- Weekly sync meetings

### Phase 3: Limited User Testing (2-3 weeks)

**Participants**: 20-50 invited users

**Recruitment**:
- Partner app users
- Canton Network community members
- Previous hackathon participants

**Goals**:
- Real-world usage patterns
- Performance under load
- User feedback collection

**Feedback Mechanisms**:
- In-app feedback form
- User interviews (5-10)
- Analytics on flow completion

## Success Metrics

### Quantitative

| Metric | Target |
|--------|--------|
| Registration completion rate | > 80% |
| Average registration time | < 3 minutes |
| Name resolution latency | < 500ms |
| Error rate | < 5% |

### Qualitative

- Users understand "unverified" meaning
- Registration steps feel intuitive
- Component integrates smoothly
- Documentation is sufficient

## Risk Mitigation

### Technical Risks

| Risk | Mitigation |
|------|------------|
| Wallet connection failures | Graceful error handling, fallback instructions |
| API rate limits | Implement caching, request throttling |
| Network delays | Loading states, timeout handling |
| Registration stuck | Recovery flow, manual reconciliation |

### User Experience Risks

| Risk | Mitigation |
|------|------------|
| Confusion about fees | Clear fee display before confirmation |
| Lost during wallet step | Step-by-step instructions, help link |
| Name taken during flow | Re-check availability before submit |

## Post-Pilot Evaluation

### Questions to Answer

1. Is the registration flow understandable?
2. Does the `CnsRecipientInput` component meet integration needs?
3. What features are missing for production use?
4. What documentation improvements are needed?

### Decision Points

Based on pilot results, decide:

1. **Proceed to public launch** if:
   - > 80% completion rate
   - Positive user feedback
   - Successful partner integration
   - No critical blockers

2. **Iterate before launch** if:
   - Specific UX issues identified
   - Integration difficulties documented
   - Performance improvements needed

3. **Pivot approach** if:
   - Fundamental flow problems
   - Partner integration infeasible
   - User feedback strongly negative

## Timeline Summary

| Phase | Duration | Milestone |
|-------|----------|-----------|
| Internal Testing | 2 weeks | Core flow validated |
| Partner Integration | 3 weeks | Component embedded |
| User Testing | 3 weeks | Feedback collected |
| Evaluation | 1 week | Go/no-go decision |
| **Total** | **9 weeks** | Ready for wider release |

## Resource Requirements

### Development

- 1 full-stack developer (part-time during pilot)
- Partner app developer support
- QA/testing assistance

### Infrastructure

- Hosting: ~$50/month
- Monitoring: ~$30/month
- Error tracking: ~$20/month

### User Testing

- Incentives for participants: ~$500
- Interview scheduling/tools: ~$100

## Next Steps

1. Complete wallet SDK integration
2. Deploy to staging environment
3. Identify potential partner application
4. Create integration documentation
5. Begin Phase 1 internal testing

export class MatchingProblemType {
  constructor(ordinal, displayName, endpoint, insightEndpoint) {
    this.ordinal = ordinal;
    this.displayName = displayName;
    this.endpoint = endpoint;
    this.insightEndpoint = insightEndpoint;
  }

  ordinal() {
    return this.ordinal;
  }

  displayName() {
    return this.displayName;
  }

  endpoint() {
    return this.endpoint;
  }

  insightEndpoint() {
    return this.insightEndpoint;
  }
}

export const MATCHING_PROBLEM_TYPES = Object.freeze({
  OTO: new MatchingProblemType(
      1,
      'One to One',
      '/api/stable-matching-oto-solver',
      '/api/oto-matching-problem-result-insights',
  ),
  OTM: new MatchingProblemType(
      2,
      'One to Many',
      '/api/stable-matching-oto-solver',
      '/api/otm-matching-problem-result-insights',
  ),
  MTM: new MatchingProblemType(
      3,
      'Many to Many',
      '/api/stable-matching-solver',
      '/api/matching-problem-result-insights',
  )
  ,
  RBO: new MatchingProblemType(
      4,
      'Many to Many RBO',
      '/api/stable-matching-rbo-solver',
      '/api/rbo-matching-problem-result-insights',
  )
  ,
  M3S: new MatchingProblemType(
      5,
      '3 Sets',
      //TODO: Replace with actual endpoints when implemented
      '/api/stable-matching-solver',
      '/api/matching-problem-result-insights',
  )
  ,
  MMS: new MatchingProblemType(
      6,
      'Multiple Sets',
      //TODO: Replace with actual endpoints when implemented
      '/api/stable-matching-solver',
      '/api/matching-problem-result-insights',
  ),
});
// To parse this data:
//
//   import { Convert, JobDetails } from "./file";
//
//   const jobDetails = Convert.toJobDetails(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface JobDetails {
  passed: boolean
  payload: Payload
}

export interface Payload {
  opening: PayloadOpening
  jobDetails: PayloadJobDetails
  teams: Teams
}

export interface PayloadJobDetails {
  context: Context
  jobDetails: JobDetailsJobDetails
}

export interface Context {
  MIN_RATE: number
  HOURS_PER_WEEK: number
  MAX_WEEKLY_RATE: number
  DEFAULT_MILESTONES_MAX: number
  engagementDurationsList: Duration[]
  qt: Qt
  ff: Ff
  mode: string
  ENTERPRISE_COMPLIANCE_MILESTONES_TOTAL_MAX: number
  ENTERPRISE_COMPLIANCE_MILESTONES_MAX: number
  phoneVerificationNeeded: boolean
  idVerificationNeeded: boolean
  idvRequiredByOpening: boolean
  upgradeSubscriptionLink: string
  isEnterpriseClient: boolean
}

export interface Duration {
  uid: string
  rid: number
  label: string
  weeks: number
  ctime: Date
  mtime: Date
  replacedByUid: null
}

export interface Ff {
  TRTN2800EducationalAwareness: boolean
  TRTN970ProposalTemplates: boolean
  UPL49EnableTalentProposalGeneration: boolean
  TONB3345ShowHighlightedSection: boolean
}

export interface Qt {
  TRTN2800_EducationalAwareness: string
  TRTN970_ProposalTemplates: string
  UPL406TalentProposalConsultant: string
  TONB3345_ShowHighlightedSectionByPerson: string
}

export interface JobDetailsJobDetails {
  opening: JobDetailsOpening
  buyer: Buyer
  similarJobs: any[]
  currentUserInfo: CurrentUserInfo
  diagnosticInfo: DiagnosticInfo
}

export interface Buyer {
  info: BuyerInfo
  workHistory: WorkHistory[]
  cssTier: number
  isPaymentMethodVerified: boolean
  isEnterprise: null
}

export interface BuyerInfo {
  company: Company
  location: Location
  jobs: Jobs
  stats: Stats
  logo: null
  avgHourlyJobsRate: HourlyRate
}

export interface HourlyRate {
  currencyCode: string
  amount: number
}

export interface Company {
  name: string
  id: string
  description: null
  summary: null
  url: string
  isCompanyVisibleInProfile: boolean
  contractDate: Date
  isEDCReplicated: boolean
  companyRid: null
  companyUid: string
  profile: Profile
}

export interface Profile {
  size: string
  industry: string
  visible: boolean
  l3Occupations: any[]
}

export interface Jobs {
  postedCount: number
  filledCount: number
  openCount: number
  openJobs: any[]
}

export interface Location {
  country: string
  city: null
  state: null
  countryTimezone: string
  worldRegion: null
  offsetFromUtcMillis: number
}

export interface Stats {
  feedbackCount: number
  hoursCount: number
  totalCharges: HourlyRate
  totalAssignments: number
  activeAssignmentsCount: number
  score: number
  totalJobsWithHires: number
}

export interface WorkHistory {
  jobInfo: JobInfoClass
  startDate: Date
  endDate: Date | null
  status: number | null
  contractorInfo: ContractorInfo
  totalHours: number
  feedback: null
  feedbackToClient: FeedbackToClient | null
  totalCharge: number
  rate: HourlyRate
  isEDCReplicated: boolean
  isPtcJob: boolean
  isPtcPrivate: boolean
}

export interface ContractorInfo {
  contractorName: string
  ciphertext: string
  accessType: number
}

export interface FeedbackToClient {
  comment: string
  score: number
  commentAccess: number
  response_for_client_feedback: null
  response_for_freelancer_feedback: null
  feedback_suppressed: number
}

export interface JobInfoClass {
  type: number
  title: string
  ciphertext: null | string
  access: number
  recno: null
  uid: null | string
}

export interface CurrentUserInfo {
  owner: boolean
  freelancerInfo: FreelancerInfo
}

export interface FreelancerInfo {
  qualificationsMatches: QualificationsMatches
  applied: null
  hired: null
  contract: null
  profileState: number
  hourlyRate: HourlyRate
  devProfileCiphertext: string
  application: null
  pendingInvite: null
}

export interface QualificationsMatches {
  totalQualifications: number
  totalMatches: number
  matches: Match[]
}

export interface Match {
  qualification: number
  qualified: boolean
  clientPreferred: string
  freelancerValue: string
  freelancerValueLabel: string
  clientPreferredLabel: null | string
}

export interface DiagnosticInfo {
  failedServiceCalls: null
}

export interface JobDetailsOpening {
  job: Job
  qualifications: PurpleQualifications
  questions: any[]
  isJobClosedByCss: null
}

export interface Job {
  info: JobInfo
  description: string
  status: number
  postedOn: Date
  startDate: null
  deliveryDate: null
  workload: string
  companyRecno: number
  duration: string
  budget: HourlyRate
  visibility: number
  clientActivity: ClientActivity
  contractorTier: number
  segmentationData: JobSegmentationDatum[]
  categoryGroup: CategoryGroupClass
  category: CategoryGroupClass
  maxBudget: null
  attachments: null
  openingUid: string
  sourcingTime: Date
  publishTime: Date
  durationLabel: null
  durationIdV3: null
  extendedBudgetInfo: ExtendedBudgetInfo
  engagementDuration: Duration
  sandsData: SandsData
  annotations: Annotations
}

export interface Annotations {
  tags: string[]
  customFields: CustomFields
}

export interface CustomFields {
  siteSource: string
  publishTime: Date
  sourcingUpdateCount: string
  sourcingUpdateForbidden: string
  type: string
  sourcingTime: Date
  optInDescriptionAIv2: string
  generatedInputsAIv2: string
  jpgV2Prompt: string
  browser: string
  device: string
  retriesAIv2: string
  startTimeJobPostFlowAIv2: string
  flowType: string
  generatedDescriptionHistoryAIV2: string
}

export interface CategoryGroupClass {
  name: string
  urlSlug: string
}

export interface ClientActivity {
  lastBuyerActivity: Date
  numberOfPositionsToHire: number
  totalApplicants: number
  totalInvitedToInterview: number
  totalHired: number
  unansweredInvites: number
  invitationsSent: number
}

export interface ExtendedBudgetInfo {
  hourlyBudgetType: number
  hourlyBudgetMin: number
  hourlyBudgetMax: number
}

export interface JobInfo {
  type: number
  title: string
  ciphertext: string
  access: number
  recno: null
  createdOn: Date
  isPtcPrivate: boolean
  uid: string
  premium: boolean
  hideBudget: boolean
  notSureFreelancersToHire: boolean
  notSureProjectDuration: boolean
  notSureExperienceLevel: boolean
  notSureLocationPreference: boolean
}

export interface SandsData {
  occupation: SandsDataOccupation
  ontologySkills: null
  additionalSkills: SandsDataAdditionalSkill[]
  occupations: SandsDataOccupation[]
}

export interface SandsDataAdditionalSkill {
  attributeUid: null | string
  attributeGroupUid: null
  freeText: null | string
  ontologyId: null | string
  prefLabel: null | string
}

export interface SandsDataOccupation {
  uid: string
  freeText: null
  ontologyId: string
  prefLabel: string
}

export interface JobSegmentationDatum {
  name: string
  value: string
  label: string
  type: string
  sortOrder: number
  typeUid: string
  customValue: null
  skill: null
}

export interface PurpleQualifications {
  type: number
  location: null
  minOdeskHours: number
  groupRecno: null
  shouldHavePortfolio: boolean
  tests: null
  minHoursWeek: number
  group: null
  prefEnglishSkill: number
  minJobSuccessScore: number
  risingTalent: boolean
  locationCheckRequired: boolean
  countries: null
  regions: null
  states: null
  timezones: null
  localMarket: boolean
  onSiteType: null
  locations: null
  localDescription: null
  localFlexibilityDescription: null
  earnings: null
  languages: null
}

export interface PayloadOpening {
  occupation: OpeningOccupation
  currentUserInfo: CurrentUserInfo
  qtAllocations: null
  sponsored: null
  clientSuspended: boolean
  flSuspended: boolean
  buyer: null
  isPremium: boolean
  isTopRated: boolean
  isHipo: boolean
  job: null
  opening: OpeningOpening
  qualifications: FluffyQualifications
  questions: Questions
  segmentationData: SegmentationData
  qualificationsLoaded: boolean
  questionsLoaded: boolean
  segmentationDataLoaded: boolean
  openingExtra: OpeningExtra
  openingExtraLoaded: boolean
  attachments: Attachments
  attachmentsLoaded: boolean
  createdBy: null
  organization: Organization
  createdByLoaded: boolean
  organizationLoaded: boolean
  ptcInfo: null
  ptcInfoLoaded: boolean
  category: GroupClass
  group: GroupClass
  categoryLoaded: boolean
  groupLoaded: boolean
  sandsJobPost: SandsJobPost
  sandsJobPostLoaded: boolean
  annotations: null
  annotationsLoaded: boolean
}

export interface Attachments {
  attachments: any[]
}

export interface GroupClass {
  uid: string
  name: string
  slug: null | string
  categories?: null
}

export interface OpeningOccupation {
  uid: string
  ontologyId: string
  type: number[]
  prefLabel: string
  altLabel: null
  narrower: string[]
  broader: string[]
  entityStatus: number
  narrowerUids: string[]
  broaderUids: string[]
  replacedBy: null
  replacedByUid: null
  scopeNote: string
  splitInto: null
  splitIntoUids: null
  mergedInto: null
  mergedIntoUid: null
  externalLink: string[]
  exactMatch: null
  exactMatchUids: null
  closeMatch: null
  closeMatchUids: null
  relatedMatch: string[]
  relatedMatchUids: string[]
  hasDeliverable: null
  p1keyword: null
  p2keyword: null
  p3keyword: null
  p4keyword: null
  p5keyword: null
  relatedSkill: null
  requires: string[]
  taxonomyLevel: number[]
  seeAlso: null
  hasDeliverableUids: null
  requiresUids: string[]
  published: boolean
  primaryBroader: string
  primaryBroaderUid: string
  supply: number
  demand: number
  createdTs: Date
  modifiedTs: Date
}

export interface OpeningOpening {
  uid: string
  title: string
  description: string
  version: number
  engagementType: number
  duration: Duration
  status: number
  type: number
  amount: null
  coverLetterRequired: boolean
  organizationUid: string
  companyUid: string
  access: number
  contractorTier: number
  freelancersToHire: number
  ctime: Date
  mtime: Date
  hidden: boolean
  categoryUid: string
  groupUid: string
  createdByUid: string
  ciphertext: string
  endDate: null
  startDate: null
  ghostPost: boolean
  siteSource: string
  maxAmount: null
  keepOpenOnHire: boolean
  draftOpeningUid: string
  freelancerMilestonesAllowed: boolean
  createdByFirstName: null
  createdByLastName: null
  companyName: null
  publishTime: Date
  sourcingTime: Date
  sourcingUpdateForbidden: boolean
  sourcingUpdateCount: number
  premium: boolean
  legacyCiphertext: string
  hideBudget: boolean
  notSureFreelancersToHire: boolean
  notSureProjectDuration: boolean
  notSureExperienceLevel: boolean
  notSureLocationPreference: boolean
  reasonRid: null
  legacyRid: number
  hourlyBudgetType: number
  hourlyBudgetMin: number
  hourlyBudgetMax: number
  weeklyRetainerBudget: null
  deletedReason: null
  autoReviewStatus: number
  autoReviewTs: Date
  filledDate: null
  changedByUid: string
  manualReviewStatus: null
  lastOboAgentUserUID: null
  lastOboAgentActionTs: null
  closeTime: null
  job: Job
}

export interface OpeningExtra {
  uid: string
  organizationUid: string
  companyUid: string
  directHire: boolean
  invitePost: boolean
  clientTlv: null
}

export interface Organization {
  uid: string
  parentUid: null
  legacyId: null | string
  rid: null | string
  legacyParentRid: null
  legacyType: number
  name: string
  photoUrl: null | string
  type: number
  contactRid: null
  creationDate?: Date
  active: boolean
  hidden: boolean
  description: null | string
  contact?: any[]
  topLevelOrgUid: string
  timezoneName: null | string
}

export interface FluffyQualifications {
  openingUid: string
  englishSkill: number
  oDeskHours: null
  testRid: null
  locationRegionRid: null
  freelancerType: null
  ctime: Date
  mtime: Date
  jobSuccessScore: null
  englishProficiency: number
  risingTalent: null
  countries: null
  locationCheckRequired: boolean
  regions: null
  states: null
  timezones: null
  earnings: null
  localMarket: boolean
  onSiteType: null
  locations: null
  localDescription: null
  localFlexibilityDescription: null
  languages: null
}

export interface Questions {
  questions: any[]
}

export interface SandsJobPost {
  jobPostUid: string
  occupationUid: string
  skills: any[]
  status: number
  freetextOccupation: null
  tags: null
  additionalSkills: SandsJobPostAdditionalSkill[]
}

export interface SandsJobPostAdditionalSkill {
  skillUid: null | string
  freeText: null | string
  isLegacyConvertedSkill: boolean
}

export interface SegmentationData {
  segmentationData: SegmentationDataSegmentationDatum[]
}

export interface SegmentationDataSegmentationDatum {
  segmentationValueUid: string
  customValue: null
  ctime: Date
  mtime: Date
  segmentationValue: SegmentationValue
}

export interface SegmentationValue {
  uid: string
  rid: number
  type: Type
  label: string
  rname: string
  skillUid: null
  sortOrder: number
  ctime: Date
  mtime: Date
  skill: null
}

export interface Type {
  uid: string
  name: string
  ctime: Date
  mtime: Date
  rname: string
}

export interface Teams {
  combined: Combined[]
  freelancer: Freelancer
}

export interface Combined {
  name: string
  contractors: Freelancer[]
  parent: null
  parentOrgName: null
  canUseACs: null
  canApplyAsAgency: boolean
  jobProposalDisabled: boolean
  uid: string
  parentUid: null
  legacyId: string
  rid: string
  legacyParentRid: null
  legacyType: number
  photoUrl: string
  type: number
  contactRid: null
  active: boolean
  hidden: boolean
  description: null
  topLevelOrgUid: string
  timezoneName: string
}

export interface Freelancer {
  uid: string
  person: Person
  organization: Organization
  activationStatus: number
  owner: boolean
  invitationRid: null
  contractRid: null
  personUid: string
  orgUid: string
  eac: boolean | null
  affiliateContractor: boolean | null
  staffType: number
  colleague: boolean
  isDefault: boolean
}

export interface Person {
  uid: string
  legacyId: string
  rid: string
  personName: PersonName
  photoUrl: string
  creationDate: Date
  isProvider: null
  updatedOn: Date
  active: boolean
  dateOfBirth: null
}

export interface PersonName {
  lastName: string
  firstName: string
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toJobDetails(json: string): JobDetails {
    return cast(JSON.parse(json), r('JobDetails'))
  }

  public static jobDetailsToJson(value: JobDetails): string {
    return JSON.stringify(uncast(value, r('JobDetails')), null, 2)
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
  const prettyTyp = prettyTypeName(typ)
  const parentText = parent ? ` on ${parent}` : ''
  const keyText = key ? ` for key "${key}"` : ''
  throw Error(
    `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`
  )
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`
    } else {
      return `one of [${typ
        .map((a) => {
          return prettyTypeName(a)
        })
        .join(', ')}]`
    }
  } else if (typeof typ === 'object' && typ.literal !== undefined) {
    return typ.literal
  } else {
    return typeof typ
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {}
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }))
    typ.jsonToJS = map
  }
  return typ.jsonToJS
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {}
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }))
    typ.jsToJSON = map
  }
  return typ.jsToJSON
}

function transform(
  val: any,
  typ: any,
  getProps: any,
  key: any = '',
  parent: any = ''
): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val
    return invalidValue(typ, val, key, parent)
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length
    for (let i = 0; i < l; i++) {
      const typ = typs[i]
      try {
        return transform(val, typ, getProps)
      } catch (_) {}
    }
    return invalidValue(typs, val, key, parent)
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val
    return invalidValue(
      cases.map((a) => {
        return l(a)
      }),
      val,
      key,
      parent
    )
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l('array'), val, key, parent)
    return val.map((el) => transform(el, typ, getProps))
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null
    }
    const d = new Date(val)
    if (isNaN(d.valueOf())) {
      return invalidValue(l('Date'), val, key, parent)
    }
    return d
  }

  function transformObject(
    props: { [k: string]: any },
    additional: any,
    val: any
  ): any {
    if (val === null || typeof val !== 'object' || Array.isArray(val)) {
      return invalidValue(l(ref || 'object'), val, key, parent)
    }
    const result: any = {}
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key]
      const v = Object.prototype.hasOwnProperty.call(val, key)
        ? val[key]
        : undefined
      result[prop.key] = transform(v, prop.typ, getProps, key, ref)
    })
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref)
      }
    })
    return result
  }

  if (typ === 'any') return val
  if (typ === null) {
    if (val === null) return val
    return invalidValue(typ, val, key, parent)
  }
  if (typ === false) return invalidValue(typ, val, key, parent)
  let ref: any = undefined
  while (typeof typ === 'object' && typ.ref !== undefined) {
    ref = typ.ref
    typ = typeMap[typ.ref]
  }
  if (Array.isArray(typ)) return transformEnum(typ, val)
  if (typeof typ === 'object') {
    return typ.hasOwnProperty('unionMembers')
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty('arrayItems')
        ? transformArray(typ.arrayItems, val)
        : typ.hasOwnProperty('props')
          ? transformObject(getProps(typ), typ.additional, val)
          : invalidValue(typ, val, key, parent)
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== 'number') return transformDate(val)
  return transformPrimitive(typ, val)
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps)
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps)
}

function l(typ: any) {
  return { literal: typ }
}

function a(typ: any) {
  return { arrayItems: typ }
}

function u(...typs: any[]) {
  return { unionMembers: typs }
}

function o(props: any[], additional: any) {
  return { props, additional }
}

function m(additional: any) {
  return { props: [], additional }
}

function r(name: string) {
  return { ref: name }
}

const typeMap: any = {
  JobDetails: o(
    [
      { json: 'passed', js: 'passed', typ: true },
      { json: 'payload', js: 'payload', typ: r('Payload') },
    ],
    false
  ),
  Payload: o(
    [
      { json: 'opening', js: 'opening', typ: r('PayloadOpening') },
      { json: 'jobDetails', js: 'jobDetails', typ: r('PayloadJobDetails') },
      { json: 'teams', js: 'teams', typ: r('Teams') },
    ],
    false
  ),
  PayloadJobDetails: o(
    [
      { json: 'context', js: 'context', typ: r('Context') },
      { json: 'jobDetails', js: 'jobDetails', typ: r('JobDetailsJobDetails') },
    ],
    false
  ),
  Context: o(
    [
      { json: 'MIN_RATE', js: 'MIN_RATE', typ: 0 },
      { json: 'HOURS_PER_WEEK', js: 'HOURS_PER_WEEK', typ: 0 },
      { json: 'MAX_WEEKLY_RATE', js: 'MAX_WEEKLY_RATE', typ: 0 },
      { json: 'DEFAULT_MILESTONES_MAX', js: 'DEFAULT_MILESTONES_MAX', typ: 0 },
      {
        json: 'engagementDurationsList',
        js: 'engagementDurationsList',
        typ: a(r('Duration')),
      },
      { json: 'qt', js: 'qt', typ: r('Qt') },
      { json: 'ff', js: 'ff', typ: r('Ff') },
      { json: 'mode', js: 'mode', typ: '' },
      {
        json: 'ENTERPRISE_COMPLIANCE_MILESTONES_TOTAL_MAX',
        js: 'ENTERPRISE_COMPLIANCE_MILESTONES_TOTAL_MAX',
        typ: 0,
      },
      {
        json: 'ENTERPRISE_COMPLIANCE_MILESTONES_MAX',
        js: 'ENTERPRISE_COMPLIANCE_MILESTONES_MAX',
        typ: 0,
      },
      {
        json: 'phoneVerificationNeeded',
        js: 'phoneVerificationNeeded',
        typ: true,
      },
      { json: 'idVerificationNeeded', js: 'idVerificationNeeded', typ: true },
      { json: 'idvRequiredByOpening', js: 'idvRequiredByOpening', typ: true },
      {
        json: 'upgradeSubscriptionLink',
        js: 'upgradeSubscriptionLink',
        typ: '',
      },
      { json: 'isEnterpriseClient', js: 'isEnterpriseClient', typ: true },
    ],
    false
  ),
  Duration: o(
    [
      { json: 'uid', js: 'uid', typ: '' },
      { json: 'rid', js: 'rid', typ: 0 },
      { json: 'label', js: 'label', typ: '' },
      { json: 'weeks', js: 'weeks', typ: 0 },
      { json: 'ctime', js: 'ctime', typ: Date },
      { json: 'mtime', js: 'mtime', typ: Date },
      { json: 'replacedByUid', js: 'replacedByUid', typ: null },
    ],
    false
  ),
  Ff: o(
    [
      {
        json: 'TRTN2800EducationalAwareness',
        js: 'TRTN2800EducationalAwareness',
        typ: true,
      },
      {
        json: 'TRTN970ProposalTemplates',
        js: 'TRTN970ProposalTemplates',
        typ: true,
      },
      {
        json: 'UPL49EnableTalentProposalGeneration',
        js: 'UPL49EnableTalentProposalGeneration',
        typ: true,
      },
      {
        json: 'TONB3345ShowHighlightedSection',
        js: 'TONB3345ShowHighlightedSection',
        typ: true,
      },
    ],
    false
  ),
  Qt: o(
    [
      {
        json: 'TRTN2800_EducationalAwareness',
        js: 'TRTN2800_EducationalAwareness',
        typ: '',
      },
      {
        json: 'TRTN970_ProposalTemplates',
        js: 'TRTN970_ProposalTemplates',
        typ: '',
      },
      {
        json: 'UPL406TalentProposalConsultant',
        js: 'UPL406TalentProposalConsultant',
        typ: '',
      },
      {
        json: 'TONB3345_ShowHighlightedSectionByPerson',
        js: 'TONB3345_ShowHighlightedSectionByPerson',
        typ: '',
      },
    ],
    false
  ),
  JobDetailsJobDetails: o(
    [
      { json: 'opening', js: 'opening', typ: r('JobDetailsOpening') },
      { json: 'buyer', js: 'buyer', typ: r('Buyer') },
      { json: 'similarJobs', js: 'similarJobs', typ: a('any') },
      {
        json: 'currentUserInfo',
        js: 'currentUserInfo',
        typ: r('CurrentUserInfo'),
      },
      {
        json: 'diagnosticInfo',
        js: 'diagnosticInfo',
        typ: r('DiagnosticInfo'),
      },
    ],
    false
  ),
  Buyer: o(
    [
      { json: 'info', js: 'info', typ: r('BuyerInfo') },
      { json: 'workHistory', js: 'workHistory', typ: a(r('WorkHistory')) },
      { json: 'cssTier', js: 'cssTier', typ: 0 },
      {
        json: 'isPaymentMethodVerified',
        js: 'isPaymentMethodVerified',
        typ: true,
      },
      { json: 'isEnterprise', js: 'isEnterprise', typ: null },
    ],
    false
  ),
  BuyerInfo: o(
    [
      { json: 'company', js: 'company', typ: r('Company') },
      { json: 'location', js: 'location', typ: r('Location') },
      { json: 'jobs', js: 'jobs', typ: r('Jobs') },
      { json: 'stats', js: 'stats', typ: r('Stats') },
      { json: 'logo', js: 'logo', typ: null },
      {
        json: 'avgHourlyJobsRate',
        js: 'avgHourlyJobsRate',
        typ: r('HourlyRate'),
      },
    ],
    false
  ),
  HourlyRate: o(
    [
      { json: 'currencyCode', js: 'currencyCode', typ: '' },
      { json: 'amount', js: 'amount', typ: 3.14 },
    ],
    false
  ),
  Company: o(
    [
      { json: 'name', js: 'name', typ: '' },
      { json: 'id', js: 'id', typ: '' },
      { json: 'description', js: 'description', typ: null },
      { json: 'summary', js: 'summary', typ: null },
      { json: 'url', js: 'url', typ: '' },
      {
        json: 'isCompanyVisibleInProfile',
        js: 'isCompanyVisibleInProfile',
        typ: true,
      },
      { json: 'contractDate', js: 'contractDate', typ: Date },
      { json: 'isEDCReplicated', js: 'isEDCReplicated', typ: true },
      { json: 'companyRid', js: 'companyRid', typ: null },
      { json: 'companyUid', js: 'companyUid', typ: '' },
      { json: 'profile', js: 'profile', typ: r('Profile') },
    ],
    false
  ),
  Profile: o(
    [
      { json: 'size', js: 'size', typ: '' },
      { json: 'industry', js: 'industry', typ: '' },
      { json: 'visible', js: 'visible', typ: true },
      { json: 'l3Occupations', js: 'l3Occupations', typ: a('any') },
    ],
    false
  ),
  Jobs: o(
    [
      { json: 'postedCount', js: 'postedCount', typ: 0 },
      { json: 'filledCount', js: 'filledCount', typ: 0 },
      { json: 'openCount', js: 'openCount', typ: 0 },
      { json: 'openJobs', js: 'openJobs', typ: a('any') },
    ],
    false
  ),
  Location: o(
    [
      { json: 'country', js: 'country', typ: '' },
      { json: 'city', js: 'city', typ: null },
      { json: 'state', js: 'state', typ: null },
      { json: 'countryTimezone', js: 'countryTimezone', typ: '' },
      { json: 'worldRegion', js: 'worldRegion', typ: null },
      { json: 'offsetFromUtcMillis', js: 'offsetFromUtcMillis', typ: 0 },
    ],
    false
  ),
  Stats: o(
    [
      { json: 'feedbackCount', js: 'feedbackCount', typ: 0 },
      { json: 'hoursCount', js: 'hoursCount', typ: 0 },
      { json: 'totalCharges', js: 'totalCharges', typ: r('HourlyRate') },
      { json: 'totalAssignments', js: 'totalAssignments', typ: 0 },
      { json: 'activeAssignmentsCount', js: 'activeAssignmentsCount', typ: 0 },
      { json: 'score', js: 'score', typ: 0 },
      { json: 'totalJobsWithHires', js: 'totalJobsWithHires', typ: 0 },
    ],
    false
  ),
  WorkHistory: o(
    [
      { json: 'jobInfo', js: 'jobInfo', typ: r('JobInfoClass') },
      { json: 'startDate', js: 'startDate', typ: Date },
      { json: 'endDate', js: 'endDate', typ: u(Date, null) },
      { json: 'status', js: 'status', typ: u(0, null) },
      {
        json: 'contractorInfo',
        js: 'contractorInfo',
        typ: r('ContractorInfo'),
      },
      { json: 'totalHours', js: 'totalHours', typ: 3.14 },
      { json: 'feedback', js: 'feedback', typ: null },
      {
        json: 'feedbackToClient',
        js: 'feedbackToClient',
        typ: u(r('FeedbackToClient'), null),
      },
      { json: 'totalCharge', js: 'totalCharge', typ: 3.14 },
      { json: 'rate', js: 'rate', typ: r('HourlyRate') },
      { json: 'isEDCReplicated', js: 'isEDCReplicated', typ: true },
      { json: 'isPtcJob', js: 'isPtcJob', typ: true },
      { json: 'isPtcPrivate', js: 'isPtcPrivate', typ: true },
    ],
    false
  ),
  ContractorInfo: o(
    [
      { json: 'contractorName', js: 'contractorName', typ: '' },
      { json: 'ciphertext', js: 'ciphertext', typ: '' },
      { json: 'accessType', js: 'accessType', typ: 0 },
    ],
    false
  ),
  FeedbackToClient: o(
    [
      { json: 'comment', js: 'comment', typ: '' },
      { json: 'score', js: 'score', typ: 0 },
      { json: 'commentAccess', js: 'commentAccess', typ: 0 },
      {
        json: 'response_for_client_feedback',
        js: 'response_for_client_feedback',
        typ: null,
      },
      {
        json: 'response_for_freelancer_feedback',
        js: 'response_for_freelancer_feedback',
        typ: null,
      },
      { json: 'feedback_suppressed', js: 'feedback_suppressed', typ: 0 },
    ],
    false
  ),
  JobInfoClass: o(
    [
      { json: 'type', js: 'type', typ: 0 },
      { json: 'title', js: 'title', typ: '' },
      { json: 'ciphertext', js: 'ciphertext', typ: u(null, '') },
      { json: 'access', js: 'access', typ: 0 },
      { json: 'recno', js: 'recno', typ: null },
      { json: 'uid', js: 'uid', typ: u(null, '') },
    ],
    false
  ),
  CurrentUserInfo: o(
    [
      { json: 'owner', js: 'owner', typ: true },
      {
        json: 'freelancerInfo',
        js: 'freelancerInfo',
        typ: r('FreelancerInfo'),
      },
    ],
    false
  ),
  FreelancerInfo: o(
    [
      {
        json: 'qualificationsMatches',
        js: 'qualificationsMatches',
        typ: r('QualificationsMatches'),
      },
      { json: 'applied', js: 'applied', typ: null },
      { json: 'hired', js: 'hired', typ: null },
      { json: 'contract', js: 'contract', typ: null },
      { json: 'profileState', js: 'profileState', typ: 0 },
      { json: 'hourlyRate', js: 'hourlyRate', typ: r('HourlyRate') },
      { json: 'devProfileCiphertext', js: 'devProfileCiphertext', typ: '' },
      { json: 'application', js: 'application', typ: null },
      { json: 'pendingInvite', js: 'pendingInvite', typ: null },
    ],
    false
  ),
  QualificationsMatches: o(
    [
      { json: 'totalQualifications', js: 'totalQualifications', typ: 0 },
      { json: 'totalMatches', js: 'totalMatches', typ: 0 },
      { json: 'matches', js: 'matches', typ: a(r('Match')) },
    ],
    false
  ),
  Match: o(
    [
      { json: 'qualification', js: 'qualification', typ: 0 },
      { json: 'qualified', js: 'qualified', typ: true },
      { json: 'clientPreferred', js: 'clientPreferred', typ: '' },
      { json: 'freelancerValue', js: 'freelancerValue', typ: '' },
      { json: 'freelancerValueLabel', js: 'freelancerValueLabel', typ: '' },
      {
        json: 'clientPreferredLabel',
        js: 'clientPreferredLabel',
        typ: u(null, ''),
      },
    ],
    false
  ),
  DiagnosticInfo: o(
    [{ json: 'failedServiceCalls', js: 'failedServiceCalls', typ: null }],
    false
  ),
  JobDetailsOpening: o(
    [
      { json: 'job', js: 'job', typ: r('Job') },
      {
        json: 'qualifications',
        js: 'qualifications',
        typ: r('PurpleQualifications'),
      },
      { json: 'questions', js: 'questions', typ: a('any') },
      { json: 'isJobClosedByCss', js: 'isJobClosedByCss', typ: null },
    ],
    false
  ),
  Job: o(
    [
      { json: 'info', js: 'info', typ: r('JobInfo') },
      { json: 'description', js: 'description', typ: '' },
      { json: 'status', js: 'status', typ: 0 },
      { json: 'postedOn', js: 'postedOn', typ: Date },
      { json: 'startDate', js: 'startDate', typ: null },
      { json: 'deliveryDate', js: 'deliveryDate', typ: null },
      { json: 'workload', js: 'workload', typ: '' },
      { json: 'companyRecno', js: 'companyRecno', typ: 0 },
      { json: 'duration', js: 'duration', typ: '' },
      { json: 'budget', js: 'budget', typ: r('HourlyRate') },
      { json: 'visibility', js: 'visibility', typ: 0 },
      {
        json: 'clientActivity',
        js: 'clientActivity',
        typ: r('ClientActivity'),
      },
      { json: 'contractorTier', js: 'contractorTier', typ: 0 },
      {
        json: 'segmentationData',
        js: 'segmentationData',
        typ: a(r('JobSegmentationDatum')),
      },
      {
        json: 'categoryGroup',
        js: 'categoryGroup',
        typ: r('CategoryGroupClass'),
      },
      { json: 'category', js: 'category', typ: r('CategoryGroupClass') },
      { json: 'maxBudget', js: 'maxBudget', typ: null },
      { json: 'attachments', js: 'attachments', typ: null },
      { json: 'openingUid', js: 'openingUid', typ: '' },
      { json: 'sourcingTime', js: 'sourcingTime', typ: Date },
      { json: 'publishTime', js: 'publishTime', typ: Date },
      { json: 'durationLabel', js: 'durationLabel', typ: null },
      { json: 'durationIdV3', js: 'durationIdV3', typ: null },
      {
        json: 'extendedBudgetInfo',
        js: 'extendedBudgetInfo',
        typ: r('ExtendedBudgetInfo'),
      },
      {
        json: 'engagementDuration',
        js: 'engagementDuration',
        typ: r('Duration'),
      },
      { json: 'sandsData', js: 'sandsData', typ: r('SandsData') },
      { json: 'annotations', js: 'annotations', typ: r('Annotations') },
    ],
    false
  ),
  Annotations: o(
    [
      { json: 'tags', js: 'tags', typ: a('') },
      { json: 'customFields', js: 'customFields', typ: r('CustomFields') },
    ],
    false
  ),
  CustomFields: o(
    [
      { json: 'siteSource', js: 'siteSource', typ: '' },
      { json: 'publishTime', js: 'publishTime', typ: Date },
      { json: 'sourcingUpdateCount', js: 'sourcingUpdateCount', typ: '' },
      {
        json: 'sourcingUpdateForbidden',
        js: 'sourcingUpdateForbidden',
        typ: '',
      },
      { json: 'type', js: 'type', typ: '' },
      { json: 'sourcingTime', js: 'sourcingTime', typ: Date },
      { json: 'optInDescriptionAIv2', js: 'optInDescriptionAIv2', typ: '' },
      { json: 'generatedInputsAIv2', js: 'generatedInputsAIv2', typ: '' },
      { json: 'jpgV2Prompt', js: 'jpgV2Prompt', typ: '' },
      { json: 'browser', js: 'browser', typ: '' },
      { json: 'device', js: 'device', typ: '' },
      { json: 'retriesAIv2', js: 'retriesAIv2', typ: '' },
      {
        json: 'startTimeJobPostFlowAIv2',
        js: 'startTimeJobPostFlowAIv2',
        typ: '',
      },
      { json: 'flowType', js: 'flowType', typ: '' },
      {
        json: 'generatedDescriptionHistoryAIV2',
        js: 'generatedDescriptionHistoryAIV2',
        typ: '',
      },
    ],
    false
  ),
  CategoryGroupClass: o(
    [
      { json: 'name', js: 'name', typ: '' },
      { json: 'urlSlug', js: 'urlSlug', typ: '' },
    ],
    false
  ),
  ClientActivity: o(
    [
      { json: 'lastBuyerActivity', js: 'lastBuyerActivity', typ: Date },
      {
        json: 'numberOfPositionsToHire',
        js: 'numberOfPositionsToHire',
        typ: 0,
      },
      { json: 'totalApplicants', js: 'totalApplicants', typ: 0 },
      {
        json: 'totalInvitedToInterview',
        js: 'totalInvitedToInterview',
        typ: 0,
      },
      { json: 'totalHired', js: 'totalHired', typ: 0 },
      { json: 'unansweredInvites', js: 'unansweredInvites', typ: 0 },
      { json: 'invitationsSent', js: 'invitationsSent', typ: 0 },
    ],
    false
  ),
  ExtendedBudgetInfo: o(
    [
      { json: 'hourlyBudgetType', js: 'hourlyBudgetType', typ: 0 },
      { json: 'hourlyBudgetMin', js: 'hourlyBudgetMin', typ: 0 },
      { json: 'hourlyBudgetMax', js: 'hourlyBudgetMax', typ: 0 },
    ],
    false
  ),
  JobInfo: o(
    [
      { json: 'type', js: 'type', typ: 0 },
      { json: 'title', js: 'title', typ: '' },
      { json: 'ciphertext', js: 'ciphertext', typ: '' },
      { json: 'access', js: 'access', typ: 0 },
      { json: 'recno', js: 'recno', typ: null },
      { json: 'createdOn', js: 'createdOn', typ: Date },
      { json: 'isPtcPrivate', js: 'isPtcPrivate', typ: true },
      { json: 'uid', js: 'uid', typ: '' },
      { json: 'premium', js: 'premium', typ: true },
      { json: 'hideBudget', js: 'hideBudget', typ: true },
      {
        json: 'notSureFreelancersToHire',
        js: 'notSureFreelancersToHire',
        typ: true,
      },
      {
        json: 'notSureProjectDuration',
        js: 'notSureProjectDuration',
        typ: true,
      },
      {
        json: 'notSureExperienceLevel',
        js: 'notSureExperienceLevel',
        typ: true,
      },
      {
        json: 'notSureLocationPreference',
        js: 'notSureLocationPreference',
        typ: true,
      },
    ],
    false
  ),
  SandsData: o(
    [
      { json: 'occupation', js: 'occupation', typ: r('SandsDataOccupation') },
      { json: 'ontologySkills', js: 'ontologySkills', typ: null },
      {
        json: 'additionalSkills',
        js: 'additionalSkills',
        typ: a(r('SandsDataAdditionalSkill')),
      },
      {
        json: 'occupations',
        js: 'occupations',
        typ: a(r('SandsDataOccupation')),
      },
    ],
    false
  ),
  SandsDataAdditionalSkill: o(
    [
      { json: 'attributeUid', js: 'attributeUid', typ: u(null, '') },
      { json: 'attributeGroupUid', js: 'attributeGroupUid', typ: null },
      { json: 'freeText', js: 'freeText', typ: u(null, '') },
      { json: 'ontologyId', js: 'ontologyId', typ: u(null, '') },
      { json: 'prefLabel', js: 'prefLabel', typ: u(null, '') },
    ],
    false
  ),
  SandsDataOccupation: o(
    [
      { json: 'uid', js: 'uid', typ: '' },
      { json: 'freeText', js: 'freeText', typ: null },
      { json: 'ontologyId', js: 'ontologyId', typ: '' },
      { json: 'prefLabel', js: 'prefLabel', typ: '' },
    ],
    false
  ),
  JobSegmentationDatum: o(
    [
      { json: 'name', js: 'name', typ: '' },
      { json: 'value', js: 'value', typ: '' },
      { json: 'label', js: 'label', typ: '' },
      { json: 'type', js: 'type', typ: '' },
      { json: 'sortOrder', js: 'sortOrder', typ: 0 },
      { json: 'typeUid', js: 'typeUid', typ: '' },
      { json: 'customValue', js: 'customValue', typ: null },
      { json: 'skill', js: 'skill', typ: null },
    ],
    false
  ),
  PurpleQualifications: o(
    [
      { json: 'type', js: 'type', typ: 0 },
      { json: 'location', js: 'location', typ: null },
      { json: 'minOdeskHours', js: 'minOdeskHours', typ: 0 },
      { json: 'groupRecno', js: 'groupRecno', typ: null },
      { json: 'shouldHavePortfolio', js: 'shouldHavePortfolio', typ: true },
      { json: 'tests', js: 'tests', typ: null },
      { json: 'minHoursWeek', js: 'minHoursWeek', typ: 0 },
      { json: 'group', js: 'group', typ: null },
      { json: 'prefEnglishSkill', js: 'prefEnglishSkill', typ: 0 },
      { json: 'minJobSuccessScore', js: 'minJobSuccessScore', typ: 0 },
      { json: 'risingTalent', js: 'risingTalent', typ: true },
      { json: 'locationCheckRequired', js: 'locationCheckRequired', typ: true },
      { json: 'countries', js: 'countries', typ: null },
      { json: 'regions', js: 'regions', typ: null },
      { json: 'states', js: 'states', typ: null },
      { json: 'timezones', js: 'timezones', typ: null },
      { json: 'localMarket', js: 'localMarket', typ: true },
      { json: 'onSiteType', js: 'onSiteType', typ: null },
      { json: 'locations', js: 'locations', typ: null },
      { json: 'localDescription', js: 'localDescription', typ: null },
      {
        json: 'localFlexibilityDescription',
        js: 'localFlexibilityDescription',
        typ: null,
      },
      { json: 'earnings', js: 'earnings', typ: null },
      { json: 'languages', js: 'languages', typ: null },
    ],
    false
  ),
  PayloadOpening: o(
    [
      { json: 'occupation', js: 'occupation', typ: r('OpeningOccupation') },
      {
        json: 'currentUserInfo',
        js: 'currentUserInfo',
        typ: r('CurrentUserInfo'),
      },
      { json: 'qtAllocations', js: 'qtAllocations', typ: null },
      { json: 'sponsored', js: 'sponsored', typ: null },
      { json: 'clientSuspended', js: 'clientSuspended', typ: true },
      { json: 'flSuspended', js: 'flSuspended', typ: true },
      { json: 'buyer', js: 'buyer', typ: null },
      { json: 'isPremium', js: 'isPremium', typ: true },
      { json: 'isTopRated', js: 'isTopRated', typ: true },
      { json: 'isHipo', js: 'isHipo', typ: true },
      { json: 'job', js: 'job', typ: null },
      { json: 'opening', js: 'opening', typ: r('OpeningOpening') },
      {
        json: 'qualifications',
        js: 'qualifications',
        typ: r('FluffyQualifications'),
      },
      { json: 'questions', js: 'questions', typ: r('Questions') },
      {
        json: 'segmentationData',
        js: 'segmentationData',
        typ: r('SegmentationData'),
      },
      { json: 'qualificationsLoaded', js: 'qualificationsLoaded', typ: true },
      { json: 'questionsLoaded', js: 'questionsLoaded', typ: true },
      {
        json: 'segmentationDataLoaded',
        js: 'segmentationDataLoaded',
        typ: true,
      },
      { json: 'openingExtra', js: 'openingExtra', typ: r('OpeningExtra') },
      { json: 'openingExtraLoaded', js: 'openingExtraLoaded', typ: true },
      { json: 'attachments', js: 'attachments', typ: r('Attachments') },
      { json: 'attachmentsLoaded', js: 'attachmentsLoaded', typ: true },
      { json: 'createdBy', js: 'createdBy', typ: null },
      { json: 'organization', js: 'organization', typ: r('Organization') },
      { json: 'createdByLoaded', js: 'createdByLoaded', typ: true },
      { json: 'organizationLoaded', js: 'organizationLoaded', typ: true },
      { json: 'ptcInfo', js: 'ptcInfo', typ: null },
      { json: 'ptcInfoLoaded', js: 'ptcInfoLoaded', typ: true },
      { json: 'category', js: 'category', typ: r('GroupClass') },
      { json: 'group', js: 'group', typ: r('GroupClass') },
      { json: 'categoryLoaded', js: 'categoryLoaded', typ: true },
      { json: 'groupLoaded', js: 'groupLoaded', typ: true },
      { json: 'sandsJobPost', js: 'sandsJobPost', typ: r('SandsJobPost') },
      { json: 'sandsJobPostLoaded', js: 'sandsJobPostLoaded', typ: true },
      { json: 'annotations', js: 'annotations', typ: null },
      { json: 'annotationsLoaded', js: 'annotationsLoaded', typ: true },
    ],
    false
  ),
  Attachments: o(
    [{ json: 'attachments', js: 'attachments', typ: a('any') }],
    false
  ),
  GroupClass: o(
    [
      { json: 'uid', js: 'uid', typ: '' },
      { json: 'name', js: 'name', typ: '' },
      { json: 'slug', js: 'slug', typ: u(null, '') },
      { json: 'categories', js: 'categories', typ: u(undefined, null) },
    ],
    false
  ),
  OpeningOccupation: o(
    [
      { json: 'uid', js: 'uid', typ: '' },
      { json: 'ontologyId', js: 'ontologyId', typ: '' },
      { json: 'type', js: 'type', typ: a(0) },
      { json: 'prefLabel', js: 'prefLabel', typ: '' },
      { json: 'altLabel', js: 'altLabel', typ: null },
      { json: 'narrower', js: 'narrower', typ: a('') },
      { json: 'broader', js: 'broader', typ: a('') },
      { json: 'entityStatus', js: 'entityStatus', typ: 0 },
      { json: 'narrowerUids', js: 'narrowerUids', typ: a('') },
      { json: 'broaderUids', js: 'broaderUids', typ: a('') },
      { json: 'replacedBy', js: 'replacedBy', typ: null },
      { json: 'replacedByUid', js: 'replacedByUid', typ: null },
      { json: 'scopeNote', js: 'scopeNote', typ: '' },
      { json: 'splitInto', js: 'splitInto', typ: null },
      { json: 'splitIntoUids', js: 'splitIntoUids', typ: null },
      { json: 'mergedInto', js: 'mergedInto', typ: null },
      { json: 'mergedIntoUid', js: 'mergedIntoUid', typ: null },
      { json: 'externalLink', js: 'externalLink', typ: a('') },
      { json: 'exactMatch', js: 'exactMatch', typ: null },
      { json: 'exactMatchUids', js: 'exactMatchUids', typ: null },
      { json: 'closeMatch', js: 'closeMatch', typ: null },
      { json: 'closeMatchUids', js: 'closeMatchUids', typ: null },
      { json: 'relatedMatch', js: 'relatedMatch', typ: a('') },
      { json: 'relatedMatchUids', js: 'relatedMatchUids', typ: a('') },
      { json: 'hasDeliverable', js: 'hasDeliverable', typ: null },
      { json: 'p1keyword', js: 'p1keyword', typ: null },
      { json: 'p2keyword', js: 'p2keyword', typ: null },
      { json: 'p3keyword', js: 'p3keyword', typ: null },
      { json: 'p4keyword', js: 'p4keyword', typ: null },
      { json: 'p5keyword', js: 'p5keyword', typ: null },
      { json: 'relatedSkill', js: 'relatedSkill', typ: null },
      { json: 'requires', js: 'requires', typ: a('') },
      { json: 'taxonomyLevel', js: 'taxonomyLevel', typ: a(0) },
      { json: 'seeAlso', js: 'seeAlso', typ: null },
      { json: 'hasDeliverableUids', js: 'hasDeliverableUids', typ: null },
      { json: 'requiresUids', js: 'requiresUids', typ: a('') },
      { json: 'published', js: 'published', typ: true },
      { json: 'primaryBroader', js: 'primaryBroader', typ: '' },
      { json: 'primaryBroaderUid', js: 'primaryBroaderUid', typ: '' },
      { json: 'supply', js: 'supply', typ: 0 },
      { json: 'demand', js: 'demand', typ: 0 },
      { json: 'createdTs', js: 'createdTs', typ: Date },
      { json: 'modifiedTs', js: 'modifiedTs', typ: Date },
    ],
    false
  ),
  OpeningOpening: o(
    [
      { json: 'uid', js: 'uid', typ: '' },
      { json: 'title', js: 'title', typ: '' },
      { json: 'description', js: 'description', typ: '' },
      { json: 'version', js: 'version', typ: 0 },
      { json: 'engagementType', js: 'engagementType', typ: 0 },
      { json: 'duration', js: 'duration', typ: r('Duration') },
      { json: 'status', js: 'status', typ: 0 },
      { json: 'type', js: 'type', typ: 0 },
      { json: 'amount', js: 'amount', typ: null },
      { json: 'coverLetterRequired', js: 'coverLetterRequired', typ: true },
      { json: 'organizationUid', js: 'organizationUid', typ: '' },
      { json: 'companyUid', js: 'companyUid', typ: '' },
      { json: 'access', js: 'access', typ: 0 },
      { json: 'contractorTier', js: 'contractorTier', typ: 0 },
      { json: 'freelancersToHire', js: 'freelancersToHire', typ: 0 },
      { json: 'ctime', js: 'ctime', typ: Date },
      { json: 'mtime', js: 'mtime', typ: Date },
      { json: 'hidden', js: 'hidden', typ: true },
      { json: 'categoryUid', js: 'categoryUid', typ: '' },
      { json: 'groupUid', js: 'groupUid', typ: '' },
      { json: 'createdByUid', js: 'createdByUid', typ: '' },
      { json: 'ciphertext', js: 'ciphertext', typ: '' },
      { json: 'endDate', js: 'endDate', typ: null },
      { json: 'startDate', js: 'startDate', typ: null },
      { json: 'ghostPost', js: 'ghostPost', typ: true },
      { json: 'siteSource', js: 'siteSource', typ: '' },
      { json: 'maxAmount', js: 'maxAmount', typ: null },
      { json: 'keepOpenOnHire', js: 'keepOpenOnHire', typ: true },
      { json: 'draftOpeningUid', js: 'draftOpeningUid', typ: '' },
      {
        json: 'freelancerMilestonesAllowed',
        js: 'freelancerMilestonesAllowed',
        typ: true,
      },
      { json: 'createdByFirstName', js: 'createdByFirstName', typ: null },
      { json: 'createdByLastName', js: 'createdByLastName', typ: null },
      { json: 'companyName', js: 'companyName', typ: null },
      { json: 'publishTime', js: 'publishTime', typ: Date },
      { json: 'sourcingTime', js: 'sourcingTime', typ: Date },
      {
        json: 'sourcingUpdateForbidden',
        js: 'sourcingUpdateForbidden',
        typ: true,
      },
      { json: 'sourcingUpdateCount', js: 'sourcingUpdateCount', typ: 0 },
      { json: 'premium', js: 'premium', typ: true },
      { json: 'legacyCiphertext', js: 'legacyCiphertext', typ: '' },
      { json: 'hideBudget', js: 'hideBudget', typ: true },
      {
        json: 'notSureFreelancersToHire',
        js: 'notSureFreelancersToHire',
        typ: true,
      },
      {
        json: 'notSureProjectDuration',
        js: 'notSureProjectDuration',
        typ: true,
      },
      {
        json: 'notSureExperienceLevel',
        js: 'notSureExperienceLevel',
        typ: true,
      },
      {
        json: 'notSureLocationPreference',
        js: 'notSureLocationPreference',
        typ: true,
      },
      { json: 'reasonRid', js: 'reasonRid', typ: null },
      { json: 'legacyRid', js: 'legacyRid', typ: 0 },
      { json: 'hourlyBudgetType', js: 'hourlyBudgetType', typ: 0 },
      { json: 'hourlyBudgetMin', js: 'hourlyBudgetMin', typ: 0 },
      { json: 'hourlyBudgetMax', js: 'hourlyBudgetMax', typ: 0 },
      { json: 'weeklyRetainerBudget', js: 'weeklyRetainerBudget', typ: null },
      { json: 'deletedReason', js: 'deletedReason', typ: null },
      { json: 'autoReviewStatus', js: 'autoReviewStatus', typ: 0 },
      { json: 'autoReviewTs', js: 'autoReviewTs', typ: Date },
      { json: 'filledDate', js: 'filledDate', typ: null },
      { json: 'changedByUid', js: 'changedByUid', typ: '' },
      { json: 'manualReviewStatus', js: 'manualReviewStatus', typ: null },
      { json: 'lastOboAgentUserUID', js: 'lastOboAgentUserUID', typ: null },
      { json: 'lastOboAgentActionTs', js: 'lastOboAgentActionTs', typ: null },
      { json: 'closeTime', js: 'closeTime', typ: null },
      { json: 'job', js: 'job', typ: r('Job') },
    ],
    false
  ),
  OpeningExtra: o(
    [
      { json: 'uid', js: 'uid', typ: '' },
      { json: 'organizationUid', js: 'organizationUid', typ: '' },
      { json: 'companyUid', js: 'companyUid', typ: '' },
      { json: 'directHire', js: 'directHire', typ: true },
      { json: 'invitePost', js: 'invitePost', typ: true },
      { json: 'clientTlv', js: 'clientTlv', typ: null },
    ],
    false
  ),
  Organization: o(
    [
      { json: 'uid', js: 'uid', typ: '' },
      { json: 'parentUid', js: 'parentUid', typ: null },
      { json: 'legacyId', js: 'legacyId', typ: u(null, '') },
      { json: 'rid', js: 'rid', typ: u(null, '') },
      { json: 'legacyParentRid', js: 'legacyParentRid', typ: null },
      { json: 'legacyType', js: 'legacyType', typ: 0 },
      { json: 'name', js: 'name', typ: '' },
      { json: 'photoUrl', js: 'photoUrl', typ: u(null, '') },
      { json: 'type', js: 'type', typ: 0 },
      { json: 'contactRid', js: 'contactRid', typ: null },
      { json: 'creationDate', js: 'creationDate', typ: u(undefined, Date) },
      { json: 'active', js: 'active', typ: true },
      { json: 'hidden', js: 'hidden', typ: true },
      { json: 'description', js: 'description', typ: u(null, '') },
      { json: 'contact', js: 'contact', typ: u(undefined, a('any')) },
      { json: 'topLevelOrgUid', js: 'topLevelOrgUid', typ: '' },
      { json: 'timezoneName', js: 'timezoneName', typ: u(null, '') },
    ],
    false
  ),
  FluffyQualifications: o(
    [
      { json: 'openingUid', js: 'openingUid', typ: '' },
      { json: 'englishSkill', js: 'englishSkill', typ: 0 },
      { json: 'oDeskHours', js: 'oDeskHours', typ: null },
      { json: 'testRid', js: 'testRid', typ: null },
      { json: 'locationRegionRid', js: 'locationRegionRid', typ: null },
      { json: 'freelancerType', js: 'freelancerType', typ: null },
      { json: 'ctime', js: 'ctime', typ: Date },
      { json: 'mtime', js: 'mtime', typ: Date },
      { json: 'jobSuccessScore', js: 'jobSuccessScore', typ: null },
      { json: 'englishProficiency', js: 'englishProficiency', typ: 0 },
      { json: 'risingTalent', js: 'risingTalent', typ: null },
      { json: 'countries', js: 'countries', typ: null },
      { json: 'locationCheckRequired', js: 'locationCheckRequired', typ: true },
      { json: 'regions', js: 'regions', typ: null },
      { json: 'states', js: 'states', typ: null },
      { json: 'timezones', js: 'timezones', typ: null },
      { json: 'earnings', js: 'earnings', typ: null },
      { json: 'localMarket', js: 'localMarket', typ: true },
      { json: 'onSiteType', js: 'onSiteType', typ: null },
      { json: 'locations', js: 'locations', typ: null },
      { json: 'localDescription', js: 'localDescription', typ: null },
      {
        json: 'localFlexibilityDescription',
        js: 'localFlexibilityDescription',
        typ: null,
      },
      { json: 'languages', js: 'languages', typ: null },
    ],
    false
  ),
  Questions: o([{ json: 'questions', js: 'questions', typ: a('any') }], false),
  SandsJobPost: o(
    [
      { json: 'jobPostUid', js: 'jobPostUid', typ: '' },
      { json: 'occupationUid', js: 'occupationUid', typ: '' },
      { json: 'skills', js: 'skills', typ: a('any') },
      { json: 'status', js: 'status', typ: 0 },
      { json: 'freetextOccupation', js: 'freetextOccupation', typ: null },
      { json: 'tags', js: 'tags', typ: null },
      {
        json: 'additionalSkills',
        js: 'additionalSkills',
        typ: a(r('SandsJobPostAdditionalSkill')),
      },
    ],
    false
  ),
  SandsJobPostAdditionalSkill: o(
    [
      { json: 'skillUid', js: 'skillUid', typ: u(null, '') },
      { json: 'freeText', js: 'freeText', typ: u(null, '') },
      {
        json: 'isLegacyConvertedSkill',
        js: 'isLegacyConvertedSkill',
        typ: true,
      },
    ],
    false
  ),
  SegmentationData: o(
    [
      {
        json: 'segmentationData',
        js: 'segmentationData',
        typ: a(r('SegmentationDataSegmentationDatum')),
      },
    ],
    false
  ),
  SegmentationDataSegmentationDatum: o(
    [
      { json: 'segmentationValueUid', js: 'segmentationValueUid', typ: '' },
      { json: 'customValue', js: 'customValue', typ: null },
      { json: 'ctime', js: 'ctime', typ: Date },
      { json: 'mtime', js: 'mtime', typ: Date },
      {
        json: 'segmentationValue',
        js: 'segmentationValue',
        typ: r('SegmentationValue'),
      },
    ],
    false
  ),
  SegmentationValue: o(
    [
      { json: 'uid', js: 'uid', typ: '' },
      { json: 'rid', js: 'rid', typ: 0 },
      { json: 'type', js: 'type', typ: r('Type') },
      { json: 'label', js: 'label', typ: '' },
      { json: 'rname', js: 'rname', typ: '' },
      { json: 'skillUid', js: 'skillUid', typ: null },
      { json: 'sortOrder', js: 'sortOrder', typ: 0 },
      { json: 'ctime', js: 'ctime', typ: Date },
      { json: 'mtime', js: 'mtime', typ: Date },
      { json: 'skill', js: 'skill', typ: null },
    ],
    false
  ),
  Type: o(
    [
      { json: 'uid', js: 'uid', typ: '' },
      { json: 'name', js: 'name', typ: '' },
      { json: 'ctime', js: 'ctime', typ: Date },
      { json: 'mtime', js: 'mtime', typ: Date },
      { json: 'rname', js: 'rname', typ: '' },
    ],
    false
  ),
  Teams: o(
    [
      { json: 'combined', js: 'combined', typ: a(r('Combined')) },
      { json: 'freelancer', js: 'freelancer', typ: r('Freelancer') },
    ],
    false
  ),
  Combined: o(
    [
      { json: 'name', js: 'name', typ: '' },
      { json: 'contractors', js: 'contractors', typ: a(r('Freelancer')) },
      { json: 'parent', js: 'parent', typ: null },
      { json: 'parentOrgName', js: 'parentOrgName', typ: null },
      { json: 'canUseACs', js: 'canUseACs', typ: null },
      { json: 'canApplyAsAgency', js: 'canApplyAsAgency', typ: true },
      { json: 'jobProposalDisabled', js: 'jobProposalDisabled', typ: true },
      { json: 'uid', js: 'uid', typ: '' },
      { json: 'parentUid', js: 'parentUid', typ: null },
      { json: 'legacyId', js: 'legacyId', typ: '' },
      { json: 'rid', js: 'rid', typ: '' },
      { json: 'legacyParentRid', js: 'legacyParentRid', typ: null },
      { json: 'legacyType', js: 'legacyType', typ: 0 },
      { json: 'photoUrl', js: 'photoUrl', typ: '' },
      { json: 'type', js: 'type', typ: 0 },
      { json: 'contactRid', js: 'contactRid', typ: null },
      { json: 'active', js: 'active', typ: true },
      { json: 'hidden', js: 'hidden', typ: true },
      { json: 'description', js: 'description', typ: null },
      { json: 'topLevelOrgUid', js: 'topLevelOrgUid', typ: '' },
      { json: 'timezoneName', js: 'timezoneName', typ: '' },
    ],
    false
  ),
  Freelancer: o(
    [
      { json: 'uid', js: 'uid', typ: '' },
      { json: 'person', js: 'person', typ: r('Person') },
      { json: 'organization', js: 'organization', typ: r('Organization') },
      { json: 'activationStatus', js: 'activationStatus', typ: 0 },
      { json: 'owner', js: 'owner', typ: true },
      { json: 'invitationRid', js: 'invitationRid', typ: null },
      { json: 'contractRid', js: 'contractRid', typ: null },
      { json: 'personUid', js: 'personUid', typ: '' },
      { json: 'orgUid', js: 'orgUid', typ: '' },
      { json: 'eac', js: 'eac', typ: u(true, null) },
      {
        json: 'affiliateContractor',
        js: 'affiliateContractor',
        typ: u(true, null),
      },
      { json: 'staffType', js: 'staffType', typ: 0 },
      { json: 'colleague', js: 'colleague', typ: true },
      { json: 'isDefault', js: 'isDefault', typ: true },
    ],
    false
  ),
  Person: o(
    [
      { json: 'uid', js: 'uid', typ: '' },
      { json: 'legacyId', js: 'legacyId', typ: '' },
      { json: 'rid', js: 'rid', typ: '' },
      { json: 'personName', js: 'personName', typ: r('PersonName') },
      { json: 'photoUrl', js: 'photoUrl', typ: '' },
      { json: 'creationDate', js: 'creationDate', typ: Date },
      { json: 'isProvider', js: 'isProvider', typ: null },
      { json: 'updatedOn', js: 'updatedOn', typ: Date },
      { json: 'active', js: 'active', typ: true },
      { json: 'dateOfBirth', js: 'dateOfBirth', typ: null },
    ],
    false
  ),
  PersonName: o(
    [
      { json: 'lastName', js: 'lastName', typ: '' },
      { json: 'firstName', js: 'firstName', typ: '' },
    ],
    false
  ),
}
